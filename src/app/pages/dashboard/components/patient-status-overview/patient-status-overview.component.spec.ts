import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientStatusOverviewComponent } from './patient-status-overview.component';

describe('PatientStatusOverviewComponent', () => {
  let component: PatientStatusOverviewComponent;
  let fixture: ComponentFixture<PatientStatusOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientStatusOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientStatusOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
