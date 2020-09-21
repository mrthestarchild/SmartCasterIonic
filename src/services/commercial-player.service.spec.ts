import { TestBed } from '@angular/core/testing';

import { CommercialPlayerService } from './commercial-player.service';

describe('CommercialPlayerService', () => {
  let service: CommercialPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommercialPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
