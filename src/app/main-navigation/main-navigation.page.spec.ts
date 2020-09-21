import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MainNavigationPage } from './main-navigation.page';

describe('MainNavigationPage', () => {
  let component: MainNavigationPage;
  let fixture: ComponentFixture<MainNavigationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainNavigationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MainNavigationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
