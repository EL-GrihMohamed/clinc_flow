// src/app/pages/dashboard/components/medical-alerts/medical-alerts.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { Subject, interval, takeUntil } from 'rxjs';

interface MedicalAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'medication' | 'vitals' | 'equipment' | 'patient' | 'system' | 'emergency';
  title: string;
  description: string;
  patientId?: string;
  patientName?: string;
  location?: string;
  timestamp: Date;
  acknowledged: boolean;
  assignedTo?: string;
  priority: number;
  actions?: AlertAction[];
}

interface AlertAction {
  label: string;
  action: string;
  severity?: 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast';
  icon?: string;
}

@Component({
  selector: 'app-medical-alerts',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule
  ],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <div class="flex align-items-center gap-3">
          <h3 class="text-900 font-medium text-xl mb-0">Medical Alerts</h3>
          <p-badge 
            *ngIf="getUnacknowledgedCount() > 0"
            [value]="getUnacknowledgedCount()" 
            severity="danger"
            class="pulse-animation">
          </p-badge>
        </div>
        <div class="flex align-items-center gap-2">
          <div class="flex align-items-center gap-2">
            <button 
              *ngFor="let filter of alertFilters" 
              class="filter-button px-2 py-1 border-none bg-transparent cursor-pointer text-sm border-round"
              [class.active]="activeFilter === filter.key"
              (click)="setActiveFilter(filter.key)">
              <i [class]="filter.icon" class="mr-1"></i>
              {{ filter.label }}
              <p-badge 
                *ngIf="filter.count > 0" 
                [value]="filter.count" 
                [severity]="filter.severity"
                class="ml-1" 
                size="small">
              </p-badge>
            </button>
          </div>
          <p-button 
            icon="pi pi-check-square" 
            label="Ack All"
            size="small"
            severity="secondary"
            [disabled]="getUnacknowledgedCount() === 0"
            (click)="acknowledgeAll()"
            pTooltip="Acknowledge all alerts">
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

      <!-- Alert Summary -->
      <div class="grid mb-4" *ngIf="alerts.length > 0">
        <div class="col-6 md:col-3" *ngFor="let summary of alertSummary">
          <div class="text-center p-2 border-round" [style.background]="summary.background">
            <div class="font-bold text-xl" [style.color]="summary.color">{{ summary.count }}</div>
            <div class="text-500 text-sm">{{ summary.label }}</div>
          </div>
        </div>
      </div>

      <!-- Alerts List -->
      <div class="flex flex-column gap-3" *ngIf="!isLoading && filteredAlerts.length > 0; else noAlertsTemplate">
        <div 
          *ngFor="let alert of filteredAlerts; trackBy: trackByAlertId" 
          class="alert-item p-3 border-round border-1"
          [class]="getAlertClasses(alert)"
          (click)="selectAlert(alert)">
          
          <div class="flex justify-content-between align-items-start">
            <div class="flex align-items-start gap-3 flex-1">
              <!-- Alert Icon -->
              <div class="flex align-items-center justify-content-center border-round flex-shrink-0" 
                   [style.background]="getAlertIconBackground(alert.type)"
                   [style.color]="getAlertIconColor(alert.type)"
                   style="width: 2.5rem; height: 2.5rem;">
                <i [class]="getAlertIcon(alert.category)" class="text-lg"></i>
              </div>
              
              <!-- Alert Content -->
              <div class="flex-1">
                <div class="flex align-items-center gap-2 mb-2">
                  <div class="font-medium text-900">{{ alert.title }}</div>
                  <p-tag 
                    [value]="alert.type.toUpperCase()" 
                    [severity]="getAlertSeverity(alert.type)"
                    class="text-xs">
                  </p-tag>
                  <p-tag 
                    [value]="alert.category" 
                    severity="info"
                    class="text-xs">
                  </p-tag>
                </div>
                
                <div class="text-600 text-sm mb-2">{{ alert.description }}</div>
                
                <div class="flex align-items-center gap-3 text-xs text-500">
                  <span *ngIf="alert.patientName">
                    <i class="pi pi-user mr-1"></i>
                    {{ alert.patientName }} ({{ alert.patientId }})
                  </span>
                  <span *ngIf="alert.location">
                    <i class="pi pi-map-marker mr-1"></i>
                    {{ alert.location }}
                  </span>
                  <span>
                    <i class="pi pi-clock mr-1"></i>
                    {{ getTimeAgo(alert.timestamp) }}
                  </span>
                  <span *ngIf="alert.assignedTo">
                    <i class="pi pi-user-edit mr-1"></i>
                    {{ alert.assignedTo }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Alert Actions -->
            <div class="flex align-items-center gap-2 flex-shrink-0">
              <p-button 
                *ngIf="!alert.acknowledged"
                icon="pi pi-check" 
                size="small"
                severity="success"
                [text]="true"
                (click)="acknowledgeAlert(alert, $event)"
                pTooltip="Acknowledge alert">
              </p-button>
              
              <p-button 
                *ngFor="let action of alert.actions" 
                [icon]="action.icon || 'pi pi-cog'"
                [label]="action.label"
                size="small"
                [severity]="action.severity || 'secondary'"
                [text]="true"
                (click)="performAlertAction(alert, action, $event)"
                class="text-xs">
              </p-button>
              
              <p-button 
                icon="pi pi-ellipsis-v" 
                size="small"
                severity="secondary"
                [text]="true"
                (click)="showAlertMenu(alert, $event)">
              </p-button>
            </div>
          </div>
          
          <!-- Acknowledged Badge -->
          <div *ngIf="alert.acknowledged" class="flex align-items-center justify-content-end mt-2">
            <p-tag value="ACKNOWLEDGED" severity="success" class="text-xs">
              <i class="pi pi-check mr-1"></i>
              ACKNOWLEDGED
            </p-tag>
          </div>
        </div>
      </div>

      <!-- No Alerts Template -->
      <ng-template #noAlertsTemplate>
        <div *ngIf="!isLoading" class="text-center py-6">
          <div class="flex align-items-center justify-content-center border-round bg-green-50 mx-auto mb-3" 
               style="width: 4rem; height: 4rem;">
            <i class="pi pi-check-circle text-green-500 text-2xl"></i>
          </div>
          <div class="font-medium text-900 mb-2">All Clear!</div>
          <div class="text-500 text-sm">No {{ activeFilter === 'all' ? '' : activeFilter }} alerts at this time.</div>
        </div>
        
        <!-- Loading Skeleton -->
        <div *ngIf="isLoading" class="flex flex-column gap-3">
          <div *ngFor="let item of [1,2,3,4]" class="alert-item p-3 border-round border-1 border-300">
            <div class="flex align-items-start gap-3">
              <p-skeleton size="2.5rem" shape="circle"></p-skeleton>
              <div class="flex-1">
                <p-skeleton height="1rem" class="mb-2" width="70%"></p-skeleton>
                <p-skeleton height="0.8rem" class="mb-2" width="90%"></p-skeleton>
                <p-skeleton height="0.7rem" width="50%"></p-skeleton>
              </div>
              <p-skeleton height="2rem" width="4rem"></p-skeleton>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .alert-item {
      transition: all 0.3s ease;
      cursor: pointer;
      border-color: var(--surface-border);
    }
    
    .alert-item:hover {
      background: var(--surface-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .alert-item.critical {
      border-left: 4px solid var(--red-500);
      background: rgba(239, 68, 68, 0.05);
    }
    
    .alert-item.high {
      border-left: 4px solid var(--orange-500);
      background: rgba(249, 115, 22, 0.05);
    }
    
    .alert-item.medium {
      border-left: 4px solid var(--yellow-500);
      background: rgba(245, 158, 11, 0.05);
    }
    
    .alert-item.low {
      border-left: 4px solid var(--blue-500);
      background: rgba(59, 130, 246, 0.05);
    }
    
    .alert-item.info {
      border-left: 4px solid var(--gray-500);
      background: rgba(107, 114, 128, 0.05);
    }
    
    .alert-item.acknowledged {
      opacity: 0.7;
    }
    
    .filter-button {
      transition: all 0.3s ease;
    }
    
    .filter-button.active {
      background: var(--primary-color) !important;
      color: white;
    }
    
    .filter-button:hover:not(.active) {
      background: var(--surface-hover);
    }
    
    .pulse-animation {
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `]
})
export class MedicalAlertsComponent implements OnInit, OnDestroy {
  alerts: MedicalAlert[] = [];
  filteredAlerts: MedicalAlert[] = [];
  isLoading = true;
  activeFilter = 'all';
  selectedAlert: MedicalAlert | null = null;
  
  private destroy$ = new Subject<void>();

  alertFilters = [
    { key: 'all', label: 'All', icon: 'pi pi-list', count: 0, severity: 'info' as const },
    { key: 'critical', label: 'Critical', icon: 'pi pi-exclamation-triangle', count: 0, severity: 'danger' as const },
    { key: 'high', label: 'High', icon: 'pi pi-exclamation-circle', count: 0, severity: 'warn' as const },
    { key: 'unacknowledged', label: 'New', icon: 'pi pi-bell', count: 0, severity: 'danger' as const }
  ];

  alertSummary = [
    { label: 'Critical', count: 0, color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' },
    { label: 'High Priority', count: 0, color: '#F97316', background: 'rgba(249, 115, 22, 0.1)' },
    { label: 'Active', count: 0, color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Acknowledged', count: 0, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)' }
  ];

  menuItems = [
    { label: 'Mark All as Read', icon: 'pi pi-check' },
    { label: 'Export Alerts', icon: 'pi pi-download' },
    { label: 'Alert Settings', icon: 'pi pi-cog' },
    { separator: true },
    { label: 'Clear Acknowledged', icon: 'pi pi-trash' }
  ];

  ngOnInit() {
    this.loadAlerts();
    this.startRealTimeUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAlerts() {
    this.isLoading = true;
    
    // Simulate loading delay
    setTimeout(() => {
      this.alerts = this.generateMockAlerts();
      this.filterAlerts();
      this.updateCounts();
      this.isLoading = false;
    }, 1000);
  }

  private startRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Add new alert occasionally
        if (Math.random() > 0.7) {
          this.addNewAlert();
        }
      });
  }

  private generateMockAlerts(): MedicalAlert[] {
    return [
      {
        id: '1',
        type: 'critical',
        category: 'emergency',
        title: 'Cardiac Arrest - Room 302',
        description: 'Patient showing signs of cardiac distress, immediate intervention required',
        patientId: 'P001234',
        patientName: 'John Smith',
        location: 'ICU Room 302',
        timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        acknowledged: false,
        priority: 1,
        actions: [
          { label: 'Call Code Blue', action: 'code-blue', severity: 'danger', icon: 'pi pi-phone' },
          { label: 'View Patient', action: 'view-patient', severity: 'info', icon: 'pi pi-eye' }
        ]
      },
      {
        id: '2',
        type: 'high',
        category: 'medication',
        title: 'High-Risk Medication Due',
        description: 'Patient requires insulin injection - 30 minutes overdue',
        patientId: 'P001235',
        patientName: 'Emily Johnson',
        location: 'Ward A, Bed 15',
        timestamp: new Date(Date.now() - 35 * 60000), // 35 minutes ago
        acknowledged: false,
        assignedTo: 'Nurse Williams',
        priority: 2,
        actions: [
          { label: 'Administer', action: 'administer-med', severity: 'success', icon: 'pi pi-check' },
          { label: 'Reschedule', action: 'reschedule', severity: 'warn', icon: 'pi pi-calendar' }
        ]
      },
      {
        id: '3',
        type: 'medium',
        category: 'vitals',
        title: 'Abnormal Blood Pressure',
        description: 'Patient BP reading: 180/110 mmHg - requires monitoring',
        patientId: 'P001236',
        patientName: 'Michael Davis',
        location: 'Ward B, Bed 8',
        timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        acknowledged: true,
        assignedTo: 'Dr. Anderson',
        priority: 3,
        actions: [
          { label: 'Take Reading', action: 'take-vitals', severity: 'info', icon: 'pi pi-heart' },
          { label: 'Notify Doctor', action: 'notify-doctor', severity: 'warn', icon: 'pi pi-send' }
        ]
      },
      {
        id: '4',
        type: 'high',
        category: 'equipment',
        title: 'Ventilator Malfunction',
        description: 'Ventilator #3 showing error codes, backup activated',
        location: 'ICU Bay 2',
        timestamp: new Date(Date.now() - 45 * 60000), // 45 minutes ago
        acknowledged: false,
        assignedTo: 'Maintenance Team',
        priority: 2,
        actions: [
          { label: 'Call Tech', action: 'call-tech', severity: 'danger', icon: 'pi pi-phone' },
          { label: 'Check Backup', action: 'check-backup', severity: 'warn', icon: 'pi pi-cog' }
        ]
      },
      {
        id: '5',
        type: 'low',
        category: 'patient',
        title: 'Discharge Documentation Pending',
        description: 'Patient ready for discharge, awaiting final documentation',
        patientId: 'P001237',
        patientName: 'Sarah Wilson',
        location: 'Ward C, Bed 12',
        timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
        acknowledged: true,
        assignedTo: 'Dr. Taylor',
        priority: 4,
        actions: [
          { label: 'Complete', action: 'complete-discharge', severity: 'success', icon: 'pi pi-check' }
        ]
      },
      {
        id: '6',
        type: 'info',
        category: 'system',
        title: 'Scheduled Maintenance',
        description: 'MRI Scanner maintenance scheduled for 2:00 PM today',
        location: 'Radiology Department',
        timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
        acknowledged: false,
        priority: 5,
        actions: [
          { label: 'Reschedule', action: 'reschedule-maintenance', severity: 'info', icon: 'pi pi-calendar' }
        ]
      }
    ];
  }

  private addNewAlert() {
    const newAlert: MedicalAlert = {
      id: Date.now().toString(),
      type: Math.random() > 0.5 ? 'high' : 'medium',
      category: 'vitals',
      title: 'New Vital Signs Alert',
      description: 'Patient requires immediate attention',
      patientId: 'P00' + Math.floor(Math.random() * 1000),
      patientName: 'Test Patient',
      location: 'Ward ' + ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
      timestamp: new Date(),
      acknowledged: false,
      priority: Math.floor(Math.random() * 3) + 1
    };

    this.alerts.unshift(newAlert);
    this.filterAlerts();
    this.updateCounts();
  }

  setActiveFilter(filter: string) {
    this.activeFilter = filter;
    this.filterAlerts();
  }

  private filterAlerts() {
    switch (this.activeFilter) {
      case 'critical':
        this.filteredAlerts = this.alerts.filter(a => a.type === 'critical');
        break;
      case 'high':
        this.filteredAlerts = this.alerts.filter(a => a.type === 'high');
        break;
      case 'unacknowledged':
        this.filteredAlerts = this.alerts.filter(a => !a.acknowledged);
        break;
      default:
        this.filteredAlerts = [...this.alerts];
    }
    
    // Sort by priority and timestamp
    this.filteredAlerts.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  private updateCounts() {
    this.alertFilters[0].count = this.alerts.length;
    this.alertFilters[1].count = this.alerts.filter(a => a.type === 'critical').length;
    this.alertFilters[2].count = this.alerts.filter(a => a.type === 'high').length;
    this.alertFilters[3].count = this.getUnacknowledgedCount();

    this.alertSummary[0].count = this.alerts.filter(a => a.type === 'critical').length;
    this.alertSummary[1].count = this.alerts.filter(a => a.type === 'high').length;
    this.alertSummary[2].count = this.alerts.filter(a => !a.acknowledged).length;
    this.alertSummary[3].count = this.alerts.filter(a => a.acknowledged).length;
  }

  getUnacknowledgedCount(): number {
    return this.alerts.filter(a => !a.acknowledged).length;
  }

  acknowledgeAlert(alert: MedicalAlert, event: Event) {
    event.stopPropagation();
    alert.acknowledged = true;
    this.filterAlerts();
    this.updateCounts();
    console.log('Alert acknowledged:', alert.id);
  }

  acknowledgeAll() {
    this.alerts.forEach(alert => alert.acknowledged = true);
    this.filterAlerts();
    this.updateCounts();
    console.log('All alerts acknowledged');
  }

  selectAlert(alert: MedicalAlert) {
    this.selectedAlert = alert;
    console.log('Alert selected:', alert);
    // Add navigation or detailed view logic here
  }

  performAlertAction(alert: MedicalAlert, action: AlertAction, event: Event) {
    event.stopPropagation();
    console.log('Performing action:', action.action, 'on alert:', alert.id);
    
    // Add specific action logic here
    switch (action.action) {
      case 'code-blue':
        // Trigger code blue protocol
        break;
      case 'view-patient':
        // Navigate to patient details
        break;
      case 'administer-med':
        // Open medication administration
        break;
      case 'take-vitals':
        // Open vitals recording
        break;
      // Add more action handlers
    }
  }

  showAlertMenu(alert: MedicalAlert, event: Event) {
    event.stopPropagation();
    console.log('Show menu for alert:', alert.id);
  }

  getAlertClasses(alert: MedicalAlert): string {
    let classes = `alert-item ${alert.type}`;
    if (alert.acknowledged) {
      classes += ' acknowledged';
    }
    return classes;
  }

  getAlertIcon(category: string): string {
    const icons = {
      medication: 'pi pi-heart-fill',
      vitals: 'pi pi-heart',
      equipment: 'pi pi-cog',
      patient: 'pi pi-user',
      system: 'pi pi-desktop',
      emergency: 'pi pi-exclamation-triangle'
    };
    return icons[category as keyof typeof icons] || 'pi pi-info-circle';
  }

  getAlertIconBackground(type: string): string {
    const colors = {
      critical: 'rgba(239, 68, 68, 0.1)',
      high: 'rgba(249, 115, 22, 0.1)',
      medium: 'rgba(245, 158, 11, 0.1)',
      low: 'rgba(59, 130, 246, 0.1)',
      info: 'rgba(107, 114, 128, 0.1)'
    };
    return colors[type as keyof typeof colors] || colors.info;
  }

  getAlertIconColor(type: string): string {
    const colors = {
      critical: '#EF4444',
      high: '#F97316',
      medium: '#F59E0B',
      low: '#3B82F6',
      info: '#6B7280'
    };
    return colors[type as keyof typeof colors] || colors.info;
  }

  getAlertSeverity(type: 'critical' | 'high' | 'medium' | 'low' | 'info'): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities = {
      critical: 'danger' as const,
      high: 'warn' as const,
      medium: 'warn' as const,
      low: 'info' as const,
      info: 'info' as const
    };
    return severities[type] || 'info';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  trackByAlertId(index: number, alert: MedicalAlert): string {
    return alert.id;
  }
}