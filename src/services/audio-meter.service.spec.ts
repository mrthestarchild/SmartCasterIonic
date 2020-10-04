import { TestBed } from '@angular/core/testing';

import { AudioMeterService } from './audio-meter.service';

describe('AudioMeterService', () => {
  let service: AudioMeterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioMeterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
