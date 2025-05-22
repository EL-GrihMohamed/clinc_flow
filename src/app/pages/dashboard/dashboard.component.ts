// src/app/pages/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <h2 class="text-900 font-bold text-4xl mb-4">Healthcare Management Dashboard</h2>
          <p class="text-600 mb-0">Welcome to your comprehensive healthcare management hub</p>
        </div>
      </div>
    </div>

    <!-- KPI Section -->
    <app-kpi-section></app-kpi-section>

    <!-- Placeholder for other sections -->
    <div class="grid mt-4">
      <div class="col-12">
        <div class="card">
          <h3 class="text-900 font-medium text-xl mb-3">Other Dashboard Sections</h3>
          <p class="text-600">
            This is where you'll add other dashboard components like:
          </p>
          <ul class="text-600">
            <li>Patient Status Overview Widget</li>
            <li>Today's Schedule Widget</li>
            <li>Recent Patient Activities Widget</li>
            <li>Quick Actions Panel</li>
            <li>Medical Alerts & Notifications</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // Initialize dashboard data
  }
}