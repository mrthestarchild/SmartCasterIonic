import { TestBed } from '@angular/core/testing';
import { UserAccountService } from './account.service';


describe('AccountService', () => {
  let service: UserAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
