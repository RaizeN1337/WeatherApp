import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { BaseChartDirective } from 'ng2-charts';
import {Chart, ChartConfiguration, ChartOptions, registerables} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    BaseChartDirective,
  ]
})

export class WeatherComponent implements OnInit, AfterViewInit {
  weatherData: any[] = [];
  displayedColumns: string[] = ['datetime', 'temperature', 'humidity', 'surface_pressure', 'weather_state'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource(this.weatherData);
  temperature: number = 0;
  humidity: number = 0;
  heatIndex: number | null = null;
  temperatureUnit: string = 'C';
  heatIndexHistory: Array<{ temperature: number, humidity: number, index: number, unit: string }> = [];
  availableDates: string[] = [];
  selectedFromDate: Date | null = null;
  selectedToDate: Date | null = null

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Temperature based on date and time',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(255,0,0,0.3)'
      }
    ],
  }

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'dd/MM/yyyy HH:mm',
          }
        },
        title: {
          display: true,
          text: 'Date/Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    }
  };

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  constructor() { }

  ngOnInit(): void {
    this.fetchWeatherData();
    this.loadHeatIndexHistory();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  fetchWeatherData(): void {
    const params = {
      latitude: 51.5085,
      longitude: -0.1257,
      hourly: ['temperature_2m', 'relative_humidity_2m', 'weather_code', 'surface_pressure'],
      past_days: 7
    };
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${params.latitude}&longitude=${params.longitude}&hourly=${params.hourly.join(',')}&past_days=${params.past_days}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const hourlyData = data.hourly;
        if (hourlyData && hourlyData.time) {
          this.weatherData = hourlyData.time.map((time: string, index: number) => ({
            datetime: new Date(time),
            temperature: hourlyData.temperature_2m[index],
            humidity: hourlyData.relative_humidity_2m[index],
            surface_pressure: hourlyData.surface_pressure[index],
            weather_state: this.getWeatherState(hourlyData.weather_code[index])
          }));
          this.dataSource.data = this.weatherData;

          this.lineChartData.labels = this.weatherData.map(data => data.datetime.toISOString());
          this.lineChartData.datasets[0].data = this.weatherData.map(data => data.temperature);
          this.chart?.update();
          this.updateAvailableDates();
        }
      })
      .catch(error => console.error('Error fetching weather data:', error));
  }

  getWeatherState(code: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
    };
    return weatherCodes[code] || 'Unknown';
  }

  calculateHeatIndex(): void {
    let T = this.temperature;
    const RH = this.humidity;

    if (this.temperatureUnit === 'F') {
      T = (T - 32) * 5 / 9;
    }

    if (T >= 26.7) {
      this.heatIndex = -8.784695 + 1.61139411 * T + 2.338549 * RH - 0.14611605 * T * RH
        + -0.012308094 * T * T - 0.016424827 * RH * RH
        + 0.002211732 * T * T * RH + 0.00072546 * T * RH * RH
        - 0.000003582 * T * T * RH * RH;

      if (this.temperatureUnit === 'F') {
        this.heatIndex = this.heatIndex * 9 / 5 + 32;
      }

      this.saveHeatIndexHistory(this.temperature, this.humidity, this.heatIndex, this.temperatureUnit);
    } else {
      this.heatIndex = null;
    }
  }

  saveHeatIndexHistory(temperature: number, humidity: number, index: number | null, unit: string): void {
    if (index !== null) {
      this.heatIndexHistory.unshift({temperature, humidity, index, unit});
      if (this.heatIndexHistory.length > 5) {
        this.heatIndexHistory.pop();
      }
      localStorage.setItem('heatIndexHistory', JSON.stringify(this.heatIndexHistory));
    }
  }

  loadHeatIndexHistory(): void {
    const savedHistory = localStorage.getItem('heatIndexHistory');
    if (savedHistory) {
      this.heatIndexHistory = JSON.parse(savedHistory);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filterNum = parseFloat(filter);

      const temperatureMatch = data.temperature === filterNum;
      const humidityMatch = data.humidity === filterNum;
      const surfacePressureMatch = data.surface_pressure === filterNum;
      const weatherStateMatch = data.weather_state.toLowerCase().includes(filter);

      return temperatureMatch || humidityMatch || surfacePressureMatch || weatherStateMatch;
    };

    this.dataSource.filter = filterValue;
    const filteredData = this.dataSource.filteredData;
    this.lineChartData.labels = filteredData.map(data => data.datetime.toISOString());
    this.lineChartData.datasets[0].data = filteredData.map(data => data.temperature);
    this.chart?.update();
  }

  applyDateRangeFilter(): void {
    const fromDate = this.selectedFromDate ? new Date(this.selectedFromDate).setHours(0, 0, 0, 0) : -Infinity;
    const toDate = this.selectedToDate ? new Date(this.selectedToDate).setHours(23, 59, 59, 999) : Infinity;

    const filteredData = this.weatherData.filter(data => {
      const date = new Date(data.datetime).getTime();
      return date >= fromDate && date <= toDate;
    });

    this.dataSource.data = filteredData;
    this.lineChartData.labels = filteredData.map(data => data.datetime.toISOString());
    this.lineChartData.datasets[0].data = filteredData.map(data => data.temperature);
    this.chart?.update();
  }

  updateAvailableDates(): void {
    this.availableDates = Array.from(new Set(this.weatherData.map(data => new Date(data.datetime).toDateString())));
    this.availableDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

}
