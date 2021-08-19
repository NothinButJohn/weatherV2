import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'
import { WeatherService } from '../weather.service';




@Component({
  selector: 'app-weather-main',
  templateUrl: './weather-main.component.html',
  styleUrls: ['./weather-main.component.scss']
})
export class WeatherMainComponent implements OnInit {

  locationQueryFormControl = new FormControl('');
  autocompleteLocationResult$: Observable<any>;
  weatherData$: Observable<any>;

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
    let queryFormValue$: Observable<any> = this.locationQueryFormControl.valueChanges
    // this.autocompleteLocationResult$ =
    queryFormValue$.pipe(
      map((queryValue)  =>  {
          let result = this.weatherService.getPlacePredictions(queryValue);
          // console.log(result)
          result.then((val) => {
            return this.autocompleteLocationResult$ = new Observable(sub => {
              sub.next(val),
              sub.error(),
              sub.complete()
            })
          })
          return result;
      })
    ).subscribe()
  }

  /**
   * OnSelecting a location uses the placeId to get the coordinates of the location
   * from the Google Geocoding api
   * Coordinates used to get the weather data from OpenWeatherMap api
   * @param placeId - placeId of the selected location
   */
  onLocationSelect(placeId: string){
    console.log("selected: ", placeId)
    // let selectedValue = this.locationQueryFormControl.val
     let np = this.weatherService.getLatLonGeocoder(placeId).then((coordinates) => {
      console.log(coordinates)
      return this.weatherService.getDataOpenWeatherMapAPI(coordinates.lat, coordinates.lng).pipe(
        map(x => {
          console.log(x)
        })).subscribe()
    })

  }

}

