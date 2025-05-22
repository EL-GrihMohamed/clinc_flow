// src/app/pages/dashboard/components/patient-activities/patient-activities.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';

interface PatientActivity {
  id: string;
  type: 'registration' | 'visit' | 'status-change' | 'insurance' | 'appointment' | 'discharge';
  patientName: string;
  patientId: string;
  description: string;
  timestamp: Date;
  details?: any;
  priority: 'low' | 'medium' | 'high';
  status?: string;
  doctorName?: string;
}

@Component({
  selector: 'app-patient-activities',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    MenuModule,
    SkeletonModule,
    BadgeModule,
    AvatarModule,
    TimelineModule,
    CardModule
  ],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h3 class="text-900 font-medium text-xl mb-0">Recent Patient Activities</h3>
        <div class="flex align-items-center gap-2">
          <p-button 
            icon="pi pi-filter" 
            label="Filter"
            severity="secondary"
            [text]="true"
            size="small"
            (click)="toggleFilter()">
          </p-button>
          <p-button 
            icon="pi pi-refresh" 
            [loading]="isLoading" 
            (click)="refreshActivities()"
            severity="secondary"
            size="small"
            [text]="true"
            pTooltip="Refresh activities">
          </p-button>
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

      <!-- Activity Summary -->
      <div class="grid mb-4">
        <div class="col-6 md:col-3">
          <div class="text-center p-2 border-round" style="background: var(--green-50);">
            <div class="font-bold text-xl text-green-600">{{ getActivityCount('registration') }}</div>
            <div class="text-500 text-sm">New Registrations</div>
          </div>
        </div>
        <div class="col-6 md:col-3">
          <div class="text-center p-2 border-round" style="background: var(--blue-50);">
            <div class="font-bold text-xl text-blue-600">{{ getActivityCount('visit') }}</div>
            <div class="text-500 text-sm">Recent Visits</div>
          </div>
        </div>
        <div class="col-6 md:col-3">
          <div class="text-center p-2 border-round" style="background: var(--orange-50);">
            <div class="font-bold text-xl text-orange-600">{{ getActivityCount('status-change') }}</div>
            <div class="text-500 text-sm">Status Changes</div>
          </div>
        </div>
        <div class="col-6 md:col-3">
          <div class="text-center p-2 border-round" style="background: var(--purple-50);">
            <div class="font-bold text-xl text-purple-600">{{ getActivityCount('insurance') }}</div>
            <div class="text-500 text-sm">Insurance Updates</div>
          </div>
        </div>
      </div>

      <!-- Activities Timeline -->
      <div *ngIf="!isLoading; else loadingTemplate">
        <p-timeline 
          [value]="recentActivities" 
          layout="vertical" 
          align="left"
          styleClass="customized-timeline">
          
          <ng-template pTemplate="content" let-activity>
            <div class="activity-card p-3 border-round border-1 border-300 ml-3 mb-3"
                 [class.priority-high]="activity.priority === 'high'">
              
              <div class="flex justify-content-between align-items-start mb-2">
                <div class="flex align-items-center gap-3 flex-1">
                  <div class="flex align-items-center justify-content-center border-round" 
                       [style.background]="getActivityIconBackground(activity.type)"
                       style="width: 2.5rem; height: 2.5rem;">
                    <i [class]="getActivityIcon(activity.type)" 
                       [style.color]="getActivityIconColor(activity.type)"></i>
                  </div>
                  
                  <div class="flex-1">
                    <div class="flex align-items-center gap-2 mb-1">
                      <span class="font-medium text-900">{{ activity.patientName }}</span>
                      <p-tag 
                        [value]="activity.type.replace('-', ' ') | titlecase" 
                        [severity]="getActivitySeverity(activity.type)"
                        class="text-xs">
                      </p-tag>
                      <p-tag 
                        *ngIf="activity.priority === 'high'"
                        value="HIGH" 
                        severity="danger"
                        class="text-xs">
                      </p-tag>
                    </div>
                    
                    <p class="text-600 mb-2 text-sm">{{ activity.description }}</p>
                    
                    <div class="flex align-items-center gap-3 text-500 text-xs">
                      <span>
                        <i class="pi pi-user mr-1"></i>
                        ID: {{ activity.patientId }}
                      </span>
                      <span *ngIf="activity.doctorName">
                        <i class="pi pi-user-md mr-1"></i>
                        {{ activity.doctorName }}
                      </span>
                      <span>
                        <i class="pi pi-clock mr-1"></i>
                        {{ activity.timestamp | date:'short' }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p-button 
                  icon="pi pi-eye" 
                  severity="secondary"
                  [text]="true"
                  size="small"
                  (click)="viewActivityDetails(activity)"
                  pTooltip="View details">
                </p-button>
              </div>

              <!-- Additional Details for certain activity types -->
              <div *ngIf="activity.details && (activity.type === 'visit' || activity.type === 'appointment')" 
                   class="mt-2 p-2 border-round" 
                   style="background: var(--surface-50);">
                <div class="text-xs text-600">
                  <span *ngIf="activity.details.appointmentTime">
                    <i class="pi pi-calendar mr-1"></i>
                    {{ activity.details.appointmentTime }}
                  </span>
                  <span *ngIf="activity.details.room" class="ml-3">
                    <i class="pi pi-home mr-1"></i>
                    {{ activity.details.room }}
                  </span>
                  <span *ngIf="activity.details.visitType" class="ml-3">
                    <i class="pi pi-tag mr-1"></i>
                    {{ activity.details.visitType }}
                  </span>
                </div>
              </div>
            </div>
          </ng-template>

          <ng-template pTemplate="marker" let-activity>
            <div class="flex align-items-center justify-content-center border-round" 
                 [style.background]="getActivityIconColor(activity.type)"
                 style="width: 1rem; height: 1rem; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            </div>
          </ng-template>
        </p-timeline>

        <!-- Load More Button -->
        <div class="text-center mt-4" *ngIf="hasMoreActivities">
          <p-button 
            label="Load More Activities" 
            icon="pi pi-angle-down"
            severity="secondary"
            [text]="true"
            (click)="loadMoreActivities()"
            [loading]="loadingMore">
          </p-button>
        </div>

        <!-- No Activities Message -->
        <div *ngIf="recentActivities.length === 0" class="text-center p-4">
          <i class="pi pi-info-circle text-4xl text-400 mb-3"></i>
          <p class="text-600">No recent activities found</p>
        </div>
      </div>

      <!-- Loading Template -->
      <ng-template #loadingTemplate>
        <div class="flex flex-column gap-3">
          <div *ngFor="let item of [1,2,3,4,5]" class="flex align-items-start gap-3">
            <p-skeleton size="1rem" shape="circle"></p-skeleton>
            <div class="flex-1 ml-3">
              <div class="p-3 border-round border-1 border-300">
                <div class="flex align-items-center gap-3 mb-2">
                  <p-skeleton size="2.5rem" shape="circle"></p-skeleton>
                  <div class="flex-1">
                    <p-skeleton height="1rem" class="mb-2" width="40%"></p-skeleton>
                    <p-skeleton height="0.8rem" width="80%"></p-skeleton>
                  </div>
                </div>
                <p-skeleton height="0.6rem" width="60%"></p-skeleton>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .activity-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .activity-card:hover {
      background: var(--surface-hover);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .activity-card.priority-high {
      border-left: 4px solid var(--red-500) !important;
    }
    
    :host ::ng-deep .customized-timeline .p-timeline-event-connector {
      background: var(--surface-border);
    }
    
    :host ::ng-deep .customized-timeline .p-timeline-event-marker {
      border: none;
      padding: 0;
    }
    
    :host ::ng-deep .customized-timeline .p-timeline-event-content {
      padding-left: 1rem;
    }
  `]
})
export class PatientActivitiesComponent implements OnInit {
  recentActivities: PatientActivity[] = [];
  isLoading = true;
  loadingMore = false;
  hasMoreActivities = true;
  
  menuItems = [
    { label: 'View All Activities', icon: 'pi pi-eye' },
    { label: 'Export Activities', icon: 'pi pi-download' },
    { label: 'Filter Options', icon: 'pi pi-filter' },
    { label: 'Settings', icon: 'pi pi-cog' }
  ];

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    this.isLoading = true;
    
    // Mock data - replace with actual service call
    setTimeout(() => {
      this.recentActivities = [
        {
          id: '1',
          type: 'registration',
          patientName: 'Alice Johnson',
          patientId: 'P001240',
          description: 'New patient registered in the system',
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          priority: 'medium'
        },
        {
          id: '2',
          type: 'visit',
          patientName: 'Bob Wilson',
          patientId: 'P001239',
          description: 'Completed routine checkup visit',
          timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
          priority: 'low',
          doctorName: 'Dr. Smith',
          details: {
            appointmentTime: '09:30 AM',
            room: 'Room 105',
            visitType: 'Routine Checkup'
          }
        },
        {
          id: '3',
          type: 'status-change',
          patientName: 'Carol Martinez',
          patientId: 'P001238',
          description: 'Patient status changed from Scheduled to In-Treatment',
          timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          priority: 'high',
          doctorName: 'Dr. Brown'
        },
        {
          id: '4',
          type: 'insurance',
          patientName: 'David Chen',
          patientId: 'P001237',
          description: 'Insurance information updated and verified',
          timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          priority: 'low'
        },
        {
          id: '5',
          type: 'appointment',
          patientName: 'Eva Rodriguez',
          patientId: 'P001236',
          description: 'New appointment scheduled for surgery consultation',
          timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
          priority: 'high',
          doctorName: 'Dr. Taylor',
          details: {
            appointmentTime: '2:00 PM Tomorrow',
            room: 'Room 203',
            visitType: 'Surgery Consultation'
          }
        },
        {
          id: '6',
          type: 'discharge',
          patientName: 'Frank Thompson',
          patientId: 'P001235',
          description: 'Patient successfully discharged after treatment completion',
          timestamp: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
          priority: 'medium',
          doctorName: 'Dr. Anderson'
        }
      ];
      
      this.isLoading = false;
    }, 1000);
  }

  refreshActivities() {
    this.loadActivities();
  }

  loadMoreActivities() {
    this.loadingMore = true;
    
    // Simulate loading more activities
    setTimeout(() => {
      // Add more mock activities
      const moreActivities: PatientActivity[] = [
        {
          id: '7',
          type: 'registration',
          patientName: 'Grace Kim',
          patientId: 'P001234',
          description: 'Emergency registration completed',
          timestamp: new Date(Date.now() - 180 * 60 * 1000), // 3 hours ago
          priority: 'high'
        }
      ];
      
      this.recentActivities = [...this.recentActivities, ...moreActivities];
      this.loadingMore = false;
      this.hasMoreActivities = false; // No more activities to load
    }, 1000);
  }

  getActivityCount(type: string): number {
    return this.recentActivities.filter(activity => activity.type === type).length;
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'registration': 'pi pi-user-plus',
      'visit': 'pi pi-calendar-check',
      'status-change': 'pi pi-refresh',
      'insurance': 'pi pi-shield',
      'appointment': 'pi pi-calendar',
      'discharge': 'pi pi-sign-out'
    };
    return iconMap[type] || 'pi pi-info-circle';
  }

  getActivityIconColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'registration': '#10B981',
      'visit': '#3B82F6',
      'status-change': '#F59E0B',
      'insurance': '#8B5CF6',
      'appointment': '#06B6D4',
      'discharge': '#EF4444'
    };
    return colorMap[type] || '#6B7280';
  }

  getActivityIconBackground(type: string): string {
    const colorMap: { [key: string]: string } = {
      'registration': '#10B98120',
      'visit': '#3B82F620',
      'status-change': '#F59E0B20',
      'insurance': '#8B5CF620',
      'appointment': '#06B6D420',
      'discharge': '#EF444420'
    };
    return colorMap[type] || '#6B728020';
  }

  getActivitySeverity(type: string): string {
    const severityMap: { [key: string]: string } = {
      'registration': 'success',
      'visit': 'info',
      'status-change': 'warning',
      'insurance': 'help',
      'appointment': 'info',
      'discharge': 'danger'
    };
    return severityMap[type] || 'info';
  }

  viewActivityDetails(activity: PatientActivity) {
    console.log('View activity details:', activity);
    // Add navigation to detailed view or open modal
  }

  toggleFilter() {
    console.log('Toggle filter');
    // Implement filter functionality
  }
}