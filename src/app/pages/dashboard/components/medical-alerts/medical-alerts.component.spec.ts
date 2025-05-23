import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalAlertsComponent } from './medical-alerts.component';

describe('MedicalAlertsComponent', () => {
  let component: MedicalAlertsComponent;
  let fixture: ComponentFixture<MedicalAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalAlertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
