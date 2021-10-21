import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators'
import {} from 'google.maps'
@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  openWeatherAPIkey = '0d3c85d44caec6a146dac4eb25c14e73'; // openWeatherMapAPIkey

  constructor(private http: HttpClient) {

  }

  getPlacePredictions(query: string) {
    console.log(query)
    let qar: google.maps.places.AutocompletionRequest = {input: query}
    let acs = new google.maps.places.AutocompleteService().getPlacePredictions(qar, )
      .then((values) => {
        let predictionArray: autofillLocationResult[] = [];
        values.predictions.forEach((prediction) => {
          let obj: autofillLocationResult = {
            description: prediction.description,
            placeId: prediction.place_id
          }
          predictionArray.push(obj);
        })
        return predictionArray
      })
    let result = acs;
    console.log(result)
    return result;
  }

  getLatLonGeocoder(placeId: string){
    let geocodeReq = {placeId: placeId}
    let ggr = new google.maps.Geocoder().geocode(geocodeReq)
    .then((response) => {
      console.log("[weather.service] getLatLonGeocoder() response: ", response);
      let coordinates = {
        lat: response.results[0].geometry.location.lat(),
        lng: response.results[0].geometry.location.lng(),
        formattedAddress: response.results[0].formatted_address
      }
      return coordinates;

    })
    return ggr;
  }

  /**
   * One call api to openweather api
   * current weather, hourly for 48hrs
   * daily for 7days, historical prev. 5days
   * excluding minutely, alerts
   * units: standard, metric, imperial
   * @param lat - latitude
   * @param lon - longitude
   */
  getDataOpenWeatherMapAPI(lat:number, lon: number){
    return this.http.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${this.openWeatherAPIkey}&units=imperial`).pipe(
      map((response: any) => {
        // let current = response.current
        // let description = response.weather[0].description
        // let hourly = [...response.hourly]
        // let daily = [...response.daily]
        // let fr = {
        //   current,
        //   description,
        //   hourly,
        //   daily,
        // }
        console.log("[weather.service] getDataOpenWeatherMapAPI", response)
        return response;
      })
    )

  }







}


export interface autofillLocationResult {
  description: string;
  placeId: string;
}

// export interface GeocoderRequest {
//   address: string;
//   location: LatLng;
//   placeId: string;
//   bounds: LatLngBounds;
//   componentRestrictions: GeocoderComponentRestrictions;
//   region: string;
//  }
