import {AfterViewInit, Component, OnInit, Renderer2} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable, of, Subscription} from 'rxjs';
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
  selectedLocation$: Observable<any> = new Observable<any>();
  queryFormValue$: Observable<any> = this.locationQueryFormControl.valueChanges;
  qfvSub: Subscription;
  constructor(private weatherService: WeatherService, private http: HttpClient, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.processLocationQuery();
  }

  /**
   * Query weather.service for autofill values from GooglePlaces api
   * emit through observable to fill the autocomplete
   * Use locationQueryFormControl on text input to acquire valueChanges
   */
  processLocationQuery(){

    // this.autocompleteLocationResult$
    this.qfvSub = this.queryFormValue$.pipe(
      map((queryValue)  =>  {
        let result = this.weatherService.getPlacePredictions(queryValue);
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
    ).subscribe((x: any) => {
      const autocomplete: any = document.getElementById('mat-autocomplete-0');
      console.log('auto', autocomplete);
      this.renderer.addClass(autocomplete, 'mat-autocomplete-panel-alter');
    });

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
      this.selectedLocation$ = of(coordinates.formattedAddress);
      this.locationQueryFormControl.reset();
      // this.qfvSub.unsubscribe();
      // this.queryFormValue$ = this.locationQueryFormControl.valueChanges;
      // this.processLocationQuery();
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
            // console.log("hourly data", hourData);
            let hour = new Date(hourData.dt * 1000);
            hourlyData.push({hour: hour.getHours(), temp: Math.floor(hourData.temp), description: hourData.weather[0].description, icon: this.weatherIcon(hourData.weather[0].description)});
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
