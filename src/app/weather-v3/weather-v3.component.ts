import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { WeatherService } from '../weather.service';
import {HttpClient} from '@angular/common/http';

interface WeatherData {
  current;
  daily;
  hourly;
  lat;
  lon;
  timezone;
  timezone_offset;
  hours;
  dailyFormatted;

}


@Component({
  selector: 'app-weather-v3',
  templateUrl: './weather-v3.component.html',
  styleUrls: ['./weather-v3.component.scss']
})
export class WeatherV3Component implements OnInit {
  locationQueryFormControl = new FormControl('');
  autocompleteLocationResult$: Observable<any>;
  weatherData$: Observable<WeatherData>;
  constructor(private weatherService: WeatherService, private http: HttpClient) { }

  ngOnInit(): void {
    this.processLocationQuery();
  }

  /**
   * Query weather.service for autofill values from GooglePlaces api
   * emit through observable to fill the autocomplete
   * Use locationQueryFormControl on text input to acquire valueChanges
   */
  processLocationQuery(){
    const queryFormValue$: Observable<any> = this.locationQueryFormControl.valueChanges;
    // this.autocompleteLocationResult$
    queryFormValue$.pipe(
      map((queryValue)  =>  {
        const result = this.weatherService.getPlacePredictions(queryValue);
        // console.log(result)
        result.then((val) => {
          return this.autocompleteLocationResult$ = new Observable(sub => {
            sub.next(val),
              sub.error(),
              sub.complete();
          });
        });
        return result;
      })
    ).subscribe();
  }

  /**
   * OnSelecting a location uses the placeId to get the coordinates of the location
   * from the Google Geocoding api
   * Coordinates used to get the weather data from OpenWeatherMap api
   * @param placeId - placeId of the selected location
   */
  onLocationSelect(placeId: string){
    console.log("selected: ", placeId);
    // let selectedValue = this.locationQueryFormControl.val
    this.weatherService.getLatLonGeocoder(placeId).then((coordinates) => {
      console.log(coordinates);
      this.weatherData$ = this.weatherService.getDataOpenWeatherMapAPI(coordinates.lat, coordinates.lng).pipe(
        map(x => {
          const hourlyData: any[] = [];
          const dailyData: any[] = [];
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

          x.daily.forEach((day: any) => {
            const date = new Date(day.dt * 1000).getDay();
            const icon = this.weatherIcon(day.weather[0].description);
            const dayFormatted: any = {
              min: Math.floor(day.temp.min),
              max: Math.floor(day.temp.max),
              description: day.weather[0].main,
              date: days[date],
              icon
            };
            dailyData.push(dayFormatted);
          });
          x.hourly.forEach(hourData => {
            let hour = new Date(hourData.dt * 1000);
            hourlyData.push({hour: hour.getHours(), temp: Math.floor(hourData.temp)});
          });
          console.log(hourlyData)
          const res: WeatherData = {
            current: x.current,
            daily: x.daily,
            hourly: x.hourly,
            lat: x.lat,
            lon: x.lon,
            timezone: x.timezone,
            timezone_offset: x.timezone_offset,
            hours: hourlyData,
            dailyFormatted: dailyData
          };
          console.log('[onLocationSelect()] response weather data object: ', res, dailyData);
          return res;
        }));
    });

  }

  // tslint:disable-next-line:typedef
  weatherIcon(weather: string){
    if(weather.includes('clear')){
      return '/assets/weatherIcons/ios11-weather-sunny-icon.png'
    }
    else if(weather.includes('rain')){
      return '/assets/weatherIcons/ios11-weather-rain-icon.png'
    }
    else if(weather.includes('thunderstorm')){
      return '/assets/weatherIcons/ios11-weather-thunderstorm-icon.png'
    }
    else if(weather.includes('snow')){
      return '/assets/weatherIcons/ios11-weather-snow-icon.png'
    }
    else if(weather.includes('mist')){
      return '/assets/weatherIcons/ios11-weather-haze-icon.png'
    }
    else if(weather.includes('clouds')){
      return '/assets/weatherIcons/ios11-weather-cloudy-icon.png'
    }
  }

}
