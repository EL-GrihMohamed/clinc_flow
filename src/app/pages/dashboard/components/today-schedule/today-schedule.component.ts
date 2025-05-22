// src/app/pages/dashboard/components/today-schedule/today-schedule.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { BadgeModule } from 'primeng/badge';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: 'available' | 'busy' | 'unavailable';
  avatar?: string;
}

interface Room {
  id: string;
  name: string;
  type: string;
  status: 'occupied' | 'available' | 'maintenance';
  currentPatient?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  room?: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
  location: string;
}

@Component({
  selector: 'app-today-schedule',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    MenuModule,
    SkeletonModule,
    BadgeModule
  ],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h3 class="text-900 font-medium text-xl mb-0">Today's Schedule</h3>
        <div class="flex align-items-center gap-2">
          <p-button 
            icon="pi pi-plus" 
            label="New Appointment"
            size="small"
            (click)="addAppointment()">
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

      <!-- Summary Stats -->
      <div class="grid mb-4">
        <div class="col-6 md:col-3">
          <div class="text-center p-2 border-round" style="background: var(--blue-50);">
            <div class="font-bold text-xl text-blue-600">{{ getTotalAppointments() }}</div>
            <div class="text-500 text-sm">Total Today</div>
          </div>
        </div>
        <div class="col-6 md:col-3">
          <div class="text-center p-2 border-round" style="background: var(--green-50);">
            <div class="font-bold text-xl text-green-600">{{ getCompletedAppointments() }}</div>
            <div class="text-500 text-sm">Completed</div>
          </div>
        </div>
        <div class="col-6 md:col-3">
          <div class="text-center p-2 border-round" style="background: var(--orange-50);">
            <div class="font-bold text-xl text-orange-600">{{ getInProgressAppointments() }}</div>
            <div class="text-500 text-sm">In Progress</div>
          </div>
        </div>
        <div class="col-6 md:col-3">
          <div class="text-center p-2 border-round" style="background: var(--purple-50);">
            <div class="font-bold text-xl text-purple-600">{{ getPendingAppointments() }}</div>
            <div class="text-500 text-sm">Pending</div>
          </div>
        </div>
      </div>

      <!-- Main Content Tabs -->
      <div class="flex mb-4">
        <button 
          *ngFor="let tab of tabs" 
          class="tab-button px-3 py-2 border-none bg-transparent cursor-pointer"
          [class.active]="activeTab === tab.key"
          (click)="setActiveTab(tab.key)">
          <i [class]="tab.icon" class="mr-2"></i>
          {{ tab.label }}
          <p-badge *ngIf="tab.count > 0" [value]="tab.count" severity="info" class="ml-2"></p-badge>
        </button>
      </div>

      <!-- Appointments Tab -->
      <div *ngIf="activeTab === 'appointments'">
        <div class="flex flex-column gap-3" *ngIf="!isLoading; else loadingTemplate">
          <div 
            *ngFor="let appointment of appointments" 
            class="appointment-item p-3 border-round border-1 border-300"
            [class.priority-high]="appointment.priority === 'high' || appointment.priority === 'emergency'">
            
            <div class="flex justify-content-between align-items-start">
              <div class="flex align-items-center gap-3 flex-1">
                <div class="flex align-items-center justify-content-center border-round bg-primary-50" 
                     style="width: 3rem; height: 3rem;">
                  <i class="pi pi-user text-primary text-xl"></i>
                </div>
                
                <div class="flex-1">
                  <div class="font-medium text-900 mb-1">{{ appointment.patientName }}</div>
                  <div class="text-500 text-sm mb-2">ID: {{ appointment.patientId }} • Dr. {{ appointment.doctorName }}</div>
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-clock text-400"></i>
                    <span class="text-600 text-sm">{{ appointment.time }} ({{ appointment.duration }}min)</span>
                    <span *ngIf="appointment.room" class="text-400">•</span>
                    <span *ngIf="appointment.room" class="text-600 text-sm">{{ appointment.room }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex align-items-center gap-2">
                <p-tag 
                  [value]="appointment.type" 
                  severity="info" 
                  class="text-xs">
                </p-tag>
                <p-tag 
                  [value]="appointment.status" 
                  [severity]="getStatusSeverity(appointment.status)"
                  class="text-xs">
                </p-tag>
                <p-tag 
                  *ngIf="appointment.priority === 'high' || appointment.priority === 'emergency'"
                  [value]="appointment.priority.toUpperCase()" 
                  severity="danger"
                  class="text-xs">
                </p-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Doctors Tab -->
      <div *ngIf="activeTab === 'doctors'">
        <div class="grid">
          <div class="col-12 md:col-6 lg:col-4" *ngFor="let doctor of doctors">
            <div class="doctor-card p-3 border-round border-1 border-300">
              <div class="flex align-items-center gap-3 mb-3">
                <div class="flex align-items-center justify-content-center border-round bg-blue-50" 
                     style="width: 2.5rem; height: 2.5rem;">
                  <i class="pi pi-user-md text-blue-600"></i>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-900">{{ doctor.name }}</div>
                  <div class="text-500 text-sm">{{ doctor.specialty }}</div>
                </div>
                <p-tag 
                  [value]="doctor.status" 
                  [severity]="getDoctorStatusSeverity(doctor.status)"
                  class="text-xs">
                </p-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rooms Tab -->
      <div *ngIf="activeTab === 'rooms'">
        <div class="grid">
          <div class="col-12 md:col-6 lg:col-4" *ngFor="let room of rooms">
            <div class="room-card p-3 border-round border-1 border-300">
              <div class="flex justify-content-between align-items-start mb-2">
                <div>
                  <div class="font-medium text-900">{{ room.name }}</div>
                  <div class="text-500 text-sm">{{ room.type }}</div>
                </div>
                <p-tag 
                  [value]="room.status" 
                  [severity]="getRoomStatusSeverity(room.status)"
                  class="text-xs">
                </p-tag>
              </div>
              <div *ngIf="room.currentPatient" class="text-600 text-sm">
                <i class="pi pi-user mr-1"></i>
                {{ room.currentPatient }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipment Tab -->
      <div *ngIf="activeTab === 'equipment'">
        <div class="grid">
          <div class="col-12 md:col-6" *ngFor="let equipment of criticalEquipment">
            <div class="equipment-card p-3 border-round border-1 border-300">
              <div class="flex justify-content-between align-items-start">
                <div class="flex-1">
                  <div class="font-medium text-900">{{ equipment.name }}</div>
                  <div class="text-500 text-sm mb-1">{{ equipment.type }}</div>
                  <div class="text-600 text-sm">
                    <i class="pi pi-map-marker mr-1"></i>
                    {{ equipment.location }}
                  </div>
                </div>
                <p-tag 
                  [value]="equipment.status" 
                  [severity]="getEquipmentStatusSeverity(equipment.status)"
                  class="text-xs">
                </p-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Template -->
      <ng-template #loadingTemplate>
        <div class="flex flex-column gap-3">
          <div *ngFor="let item of [1,2,3,4,5]" class="p-3 border-round border-1 border-300">
            <div class="flex align-items-center gap-3">
              <p-skeleton size="3rem" shape="circle"></p-skeleton>
              <div class="flex-1">
                <p-skeleton height="1rem" class="mb-2" width="60%"></p-skeleton>
                <p-skeleton height="0.8rem" width="80%"></p-skeleton>
              </div>
              <p-skeleton height="1.5rem" width="4rem"></p-skeleton>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .appointment-item {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .appointment-item:hover {
      background: var(--surface-hover);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .appointment-item.priority-high {
      border-left: 4px solid var(--red-500) !important;
    }
    
    .tab-button {
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }
    
    .tab-button.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }
    
    .tab-button:hover {
      background: var(--surface-hover);
    }
    
    .doctor-card, .room-card, .equipment-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .doctor-card:hover, .room-card:hover, .equipment-card:hover {
      background: var(--surface-hover);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class TodayScheduleComponent implements OnInit {
  activeTab = 'appointments';
  isLoading = false;
  
  tabs = [
    { key: 'appointments', label: 'Appointments', icon: 'pi pi-calendar', count: 0 },
    { key: 'doctors', label: 'Doctors', icon: 'pi pi-user-md', count: 0 },
    { key: 'rooms', label: 'Rooms', icon: 'pi pi-home', count: 0 },
    { key: 'equipment', label: 'Equipment', icon: 'pi pi-cog', count: 0 }
  ];

  menuItems = [
    { label: 'View All Appointments', icon: 'pi pi-eye' },
    { label: 'Export Schedule', icon: 'pi pi-download' },
    { label: 'Print Schedule', icon: 'pi pi-print' },
    { label: 'Settings', icon: 'pi pi-cog' }
  ];

  appointments: Appointment[] = [
    {
      id: '1',
      patientName: 'John Smith',
      patientId: 'P001234',
      doctorName: 'Dr. Wilson',
      time: '09:00 AM',
      duration: 30,
      type: 'Consultation',
      status: 'in-progress',
      room: 'Room 101',
      priority: 'medium'
    },
    {
      id: '2',
      patientName: 'Emily Johnson',
      patientId: 'P001235',
      doctorName: 'Dr. Brown',
      time: '09:30 AM',
      duration: 45,
      type: 'Surgery Prep',
      status: 'scheduled',
      room: 'Room 203',
      priority: 'high'
    },
    {
      id: '3',
      patientName: 'Michael Davis',
      patientId: 'P001236',
      doctorName: 'Dr. Anderson',
      time: '10:00 AM',
      duration: 30,
      type: 'Follow-up',
      status: 'completed',
      room: 'Room 105',
      priority: 'low'
    },
    {
      id: '4',
      patientName: 'Sarah Wilson',
      patientId: 'P001237',
      doctorName: 'Dr. Taylor',
      time: '10:30 AM',
      duration: 60,
      type: 'Emergency',
      status: 'scheduled',
      room: 'ER-1',
      priority: 'emergency'
    }
  ];

  doctors: Doctor[] = [
    { id: '1', name: 'Dr. Wilson', specialty: 'Cardiology', status: 'busy' },
    { id: '2', name: 'Dr. Brown', specialty: 'Surgery', status: 'available' },
    { id: '3', name: 'Dr. Anderson', specialty: 'Internal Medicine', status: 'available' },
    { id: '4', name: 'Dr. Taylor', specialty: 'Emergency Medicine', status: 'busy' },
    { id: '5', name: 'Dr. Clark', specialty: 'Pediatrics', status: 'unavailable' }
  ];

  rooms: Room[] = [
    { id: '1', name: 'Room 101', type: 'Consultation', status: 'occupied', currentPatient: 'John Smith' },
    { id: '2', name: 'Room 102', type: 'Consultation', status: 'available' },
    { id: '3', name: 'Room 203', type: 'Surgery', status: 'available' },
    { id: '4', name: 'Room 105', type: 'Examination', status: 'maintenance' },
    { id: '5', name: 'ER-1', type: 'Emergency', status: 'available' },
    { id: '6', name: 'ER-2', type: 'Emergency', status: 'occupied', currentPatient: 'Emergency Patient' }
  ];

  criticalEquipment: Equipment[] = [
    { id: '1', name: 'MRI Scanner', type: 'Imaging', status: 'available', location: 'Radiology Wing' },
    { id: '2', name: 'CT Scanner', type: 'Imaging', status: 'in-use', location: 'Radiology Wing' },
    { id: '3', name: 'Ventilator #1', type: 'Life Support', status: 'available', location: 'ICU' },
    { id: '4', name: 'Ventilator #2', type: 'Life Support', status: 'in-use', location: 'ICU' },
    { id: '5', name: 'Defibrillator', type: 'Emergency', status: 'maintenance', location: 'ER' }
  ];

  ngOnInit() {
    this.updateTabCounts();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  updateTabCounts() {
    this.tabs[0].count = this.appointments.length;
    this.tabs[1].count = this.doctors.filter(d => d.status === 'available').length;
    this.tabs[2].count = this.rooms.filter(r => r.status === 'available').length;
    this.tabs[3].count = this.criticalEquipment.filter(e => e.status === 'available').length;
  }

  getTotalAppointments(): number {
    return this.appointments.length;
  }

  getCompletedAppointments(): number {
    return this.appointments.filter(a => a.status === 'completed').length;
  }

  getInProgressAppointments(): number {
    return this.appointments.filter(a => a.status === 'in-progress').length;
  }

  getPendingAppointments(): number {
    return this.appointments.filter(a => a.status === 'scheduled').length;
  }

  getStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'scheduled': 'info',
      'in-progress': 'warning',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return severityMap[status] || 'info';
  }

  getDoctorStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'available': 'success',
      'busy': 'warning',
      'unavailable': 'danger'
    };
    return severityMap[status] || 'info';
  }

  getRoomStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'available': 'success',
      'occupied': 'warning',
      'maintenance': 'danger'
    };
    return severityMap[status] || 'info';
  }

  getEquipmentStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'available': 'success',
      'in-use': 'warning',
      'maintenance': 'danger',
      'offline': 'danger'
    };
    return severityMap[status] || 'info';
  }

  addAppointment() {
    console.log('Add new appointment');
    // Add navigation logic to appointment creation form
  }
}