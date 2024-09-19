import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WeatherComponent } from './weather/weather.component';
import { BaseChartDirective } from 'ng2-charts';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    AppComponent,
    WeatherComponent,
    BaseChartDirective
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
