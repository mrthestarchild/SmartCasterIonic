import { TestBed } from '@angular/core/testing';
import { TestObjectsService } from './test-objects.service';


describe('TestObjectsService', () => {
  let service: TestObjectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestObjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
