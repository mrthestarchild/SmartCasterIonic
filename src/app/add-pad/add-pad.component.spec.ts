import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddPadComponent } from './add-pad.component';

describe('AddPadComponent', () => {
  let component: AddPadComponent;
  let fixture: ComponentFixture<AddPadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPadComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddPadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
