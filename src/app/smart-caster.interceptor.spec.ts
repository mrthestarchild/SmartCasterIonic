import { TestBed } from '@angular/core/testing';

import { SmartCasterInterceptor } from 'src/app/smart-caster.interceptor';

describe('SmartCasterInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SmartCasterInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: SmartCasterInterceptor = TestBed.inject(SmartCasterInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
