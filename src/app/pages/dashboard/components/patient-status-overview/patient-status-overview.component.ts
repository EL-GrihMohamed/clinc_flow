// src/app/pages/dashboard/components/patient-status-overview/patient-status-overview.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

interface PatientStatus {
  status: string;
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-patient-status-overview',
  standalone: true,
  imports: [CommonModule, ChartModule, ButtonModule, MenuModule],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h3 class="text-900 font-medium text-xl mb-0">Patient Status Overview</h3>
        <div>
          <p-button 
            icon="pi pi-ellipsis-v" 
            severity="secondary" 
            [text]="true"
            size="small"
            (click)="menu.toggle($event)">
          </p-button>
          <p-menu #menu [popup]="true" [model]="menuItems"></p-menu>
        </div>
      </div>

      <div class="grid">
        <!-- Chart Section -->
        <div class="col-12 md:col-6">
          <p-chart 
            type="doughnut" 
            [data]="chartData" 
            [options]="chartOptions"
            style="height: 250px;">
          </p-chart>
        </div>

        <!-- Status List -->
        <div class="col-12 md:col-6">
          <div class="flex flex-column gap-3">
            <div 
              *ngFor="let status of patientStatuses" 
              class="flex align-items-center justify-content-between p-3 border-round status-item"
              [style.border-left]="'4px solid ' + status.color">
              
              <div class="flex align-items-center gap-3">
                <div 
                  class="flex align-items-center justify-content-center border-round"
                  [style.background]="status.color + '20'"
                  style="width: 2.5rem; height: 2.5rem;">
                  <i [class]="status.icon" [style.color]="status.color"></i>
                </div>
                <div>
                  <div class="font-medium text-900">{{ status.status }}</div>
                  <div class="text-500 text-sm">{{ status.count }} patients</div>
                </div>
              </div>
              
              <div class="text-right">
                <div class="font-bold text-lg" [style.color]="status.color">
                  {{ status.percentage }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid mt-4">
        <div class="col-6 md:col-3" *ngFor="let status of patientStatuses">
          <div class="text-center p-2">
            <div class="font-bold text-xl text-900">{{ status.count }}</div>
            <div class="text-500 text-sm">{{ status.status }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-item {
      background: var(--surface-card);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .status-item:hover {
      background: var(--surface-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class PatientStatusOverviewComponent implements OnInit {
  patientStatuses: PatientStatus[] = [];
  chartData: any;
  chartOptions: any;
  menuItems = [
    { label: 'View Details', icon: 'pi pi-eye' },
    { label: 'Export Data', icon: 'pi pi-download' },
    { label: 'Refresh', icon: 'pi pi-refresh' }
  ];

  ngOnInit() {
    this.initializeData();
    this.setupChart();
  }

  private initializeData() {
    this.patientStatuses = [
      {
        status: 'Active',
        count: 847,
        percentage: 68,
        color: '#10B981',
        icon: 'pi pi-check-circle'
      },
      {
        status: 'Scheduled',
        count: 234,
        percentage: 19,
        color: '#3B82F6',
        icon: 'pi pi-calendar'
      },
      {
        status: 'Discharged',
        count: 123,
        percentage: 10,
        color: '#8B5CF6',
        icon: 'pi pi-sign-out'
      },
      {
        status: 'Emergency',
        count: 43,
        percentage: 3,
        color: '#EF4444',
        icon: 'pi pi-exclamation-triangle'
      }
    ];
  }

  private setupChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    
    this.chartData = {
      labels: this.patientStatuses.map(s => s.status),
      datasets: [
        {
          data: this.patientStatuses.map(s => s.count),
          backgroundColor: this.patientStatuses.map(s => s.color),
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const status = this.patientStatuses[context.dataIndex];
              return `${status.status}: ${status.count} (${status.percentage}%)`;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%'
    };
  }
}