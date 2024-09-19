# RNWeatherApp

The application should have three tabs: 

● Single table with columns ‘Datetime’, ‘Weather State’, ‘Temperature’, ‘Surface Pressure’, ‘Relative Humidity’, etc. weather conditions for London. 
The data will consist of: 
o hourly weather forecast for next few days 
o hourly historical weather conditions (e.g. last 1 week) 

● Line chart displaying relationship between the time (x-axis) and the temperature (y-axis) from the table in the first tab.

● Heat Index Calculator. 
This page should contain these inputs: 
o Temperature (can be entered in both °C and °F) 
o Temperature units selection (switch between °C and °F input) 
o Relative Humidity (%) It should calculate Heat Index (in °C or °F). 
Please note that Heat Index value cannot be calculated for temperatures less than 26.7°C or 80°F

Requirements
● Use of UI framework of your choice (we strongly prefer Angular)
● Use of some design framework (PrimeFaces, Material, Clarity, …)
● Use REST APIs from https://open-meteo.com/en/docs
● Use Heat Index formula from https://www.weather.gov/media/epz/wxcalc/heatIndex.pdf

Bonus points
● Nice looking interface
● Easy to read and well-structured code, using style guide (e.g. https://angular.io/guide/styleguide
for Angular)
● Sortable, searchable table with pagination
● User can pick arbitrary date range for historical weather conditions
● Display history of last 5 results of Heat Index Calculator stored in local storage


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

