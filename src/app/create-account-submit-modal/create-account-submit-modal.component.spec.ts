import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateAccountSubmitModalComponent } from './create-account-submit-modal.component';

describe('CreateAccountSubmitModalComponent', () => {
  let component: CreateAccountSubmitModalComponent;
  let fixture: ComponentFixture<CreateAccountSubmitModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAccountSubmitModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAccountSubmitModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
