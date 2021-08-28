import { TestBed } from '@angular/core/testing';

import { MixerService } from './mixer.service';

describe('MixerService', () => {
  let service: MixerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MixerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
