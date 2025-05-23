import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiSectionComponent } from './kpi-section.component';

describe('KpiSectionComponent', () => {
  let component: KpiSectionComponent;
  let fixture: ComponentFixture<KpiSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
