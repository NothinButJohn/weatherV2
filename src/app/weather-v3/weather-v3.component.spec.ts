import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherV3Component } from './weather-v3.component';

describe('WeatherV3Component', () => {
  let component: WeatherV3Component;
  let fixture: ComponentFixture<WeatherV3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherV3Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherV3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
