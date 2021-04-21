import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChannelOptionsModalComponent } from './channel-options-modal.component';

describe('ChannelOptionsModalComponent', () => {
  let component: ChannelOptionsModalComponent;
  let fixture: ComponentFixture<ChannelOptionsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelOptionsModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChannelOptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
