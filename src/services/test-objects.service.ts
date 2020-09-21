import { Injectable } from '@angular/core';
import { SpotResponse } from 'src/models/response/spot-response.model';

@Injectable({
  providedIn: 'root'
})
export class TestObjectsService {

  constructor() { }

  GetTestSpots() {
    const spotArray = new Array<SpotResponse>();
    for (let index = 0; index < 20; index++) {
      const spot = new SpotResponse();
      spot.Name = `Spot ${index}`;
      spot.Uri = `file://google.drive.listener.${encodeURI(spot.Name)}`;
      spot.DurationMinutes = +(Math.random() * (5 - 0) + 0).toFixed(2);
      spotArray.push(spot);
    }
    return spotArray;
  }

}
