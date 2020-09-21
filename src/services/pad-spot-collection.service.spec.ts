import { TestBed } from '@angular/core/testing';

import { PadSpotCollectionService } from './pad-spot-collection.service';

describe('PadSpotCollectionService', () => {
  let service: PadSpotCollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PadSpotCollectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
