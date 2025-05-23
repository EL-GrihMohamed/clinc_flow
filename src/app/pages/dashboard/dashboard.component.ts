// src/app/pages/dashboard/dashboard.component.ts

import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { KpiSectionComponent } from './components/kpi-section/kpi-section.component';
import { TodayScheduleComponent } from './components/today-schedule/today-schedule.component';
import { PatientActivitiesComponent } from './components/patient-activities/patient-activities.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { MedicalAlertsComponent } from './components/medical-alerts/medical-alerts.component';
import { PatientStatusOverviewComponent } from './components/patient-status-overview/patient-status-overview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiSectionComponent,
    TodayScheduleComponent,
    PatientActivitiesComponent,
    QuickActionsComponent,
    MedicalAlertsComponent,
    PatientStatusOverviewComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="grid">
      <!-- Header Section -->
      <div class="col-12">
        <div class="card">
          <div class="flex justify-content-between align-items-center">
            <div>
              <h2 class="text-900 font-bold text-4xl mb-2">Healthcare Management Dashboard</h2>
              <p class="text-600 mb-0">Welcome to your comprehensive healthcare management hub</p>
            </div>
            <div class="flex align-items-center gap-2">
              <span class="text-500 text-sm">{{ currentDate | date:'fullDate' }}</span>
              <i class="pi pi-calendar text-primary"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Section -->
      <div class="col-12">
        <app-kpi-section></app-kpi-section>
      </div>

      <!-- Patient Status Overview -->
      <div class="col-12 lg:col-6">
        <app-patient-status-overview></app-patient-status-overview>
      </div>

      <!-- Quick Actions Panel -->
      <div class="col-12 lg:col-6">
        <app-quick-actions></app-quick-actions>
      </div>

      <!-- Today's Schedule -->
      <div class="col-12 lg:col-8">
        <app-today-schedule></app-today-schedule>
      </div>

      <!-- Medical Alerts -->
      <div class="col-12 lg:col-4">
        <app-medical-alerts></app-medical-alerts>
      </div>

      <!-- Recent Patient Activities -->
      <div class="col-12">
        <app-patient-activities></app-patient-activities>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentDate = new Date();

  constructor() { }

  ngOnInit() {
    // Initialize dashboard data
    console.log('Healthcare Dashboard initialized');
  }
}