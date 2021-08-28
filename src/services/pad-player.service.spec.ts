import { TestBed } from '@angular/core/testing';

import { PadPlayerService } from './pad-player.service';

describe('PadPlayerService', () => {
  let service: PadPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PadPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
