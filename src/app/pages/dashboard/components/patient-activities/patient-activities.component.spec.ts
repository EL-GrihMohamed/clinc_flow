import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientActivitiesComponent } from './patient-activities.component';

describe('PatientActivitiesComponent', () => {
  let component: PatientActivitiesComponent;
  let fixture: ComponentFixture<PatientActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientActivitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
