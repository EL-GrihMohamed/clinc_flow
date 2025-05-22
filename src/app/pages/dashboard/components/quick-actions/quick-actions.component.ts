// src/app/pages/dashboard/components/quick-actions/quick-actions.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h3 class="text-900 font-medium text-xl mb-0">Quick Actions</h3>
        <span class="text-500 text-sm">Frequently used actions</span>
      </div>

      <div class="grid">
        <div 
          class="col-12 md:col-6" 
          *ngFor="let action of quickActions">
          
          <div 
            class="action-card p-3 border-round cursor-pointer"
            [class.disabled]="action.disabled"
            (click)="performAction(action)"
            pRipple>
            
            <div class="flex align-items-center gap-3">
              <div 
                class="flex align-items-center justify-content-center border-round"
                [style.background]="action.color + '20'"
                style="width: 3rem; height: 3rem;">
                <i [class]="action.icon" [style.color]="action.color" class="text-xl"></i>
              </div>
              
              <div class="flex-1">
                <div class="font-medium text-900 mb-1">{{ action.title }}</div>
                <div class="text-500 text-sm">{{ action.description }}</div>
              </div>
              
              <i class="pi pi-chevron-right text-400"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Emergency Section -->
      <div class="mt-4 p-3 border-round" style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); border: 1px solid #FECACA;">
        <div class="flex align-items-center gap-3">
          <div class="flex align-items-center justify-content-center border-round" style="background: #DC2626; width: 2.5rem; height: 2.5rem;">
            <i class="pi pi-exclamation-triangle text-white"></i>
          </div>
          <div class="flex-1">
            <div class="font-medium text-900 mb-1">Emergency Registration</div>
            <div class="text-600 text-sm">Fast-track patient registration for emergency cases</div>
          </div>
          <p-button 
            label="Emergency" 
            severity="danger" 
            size="small"
            (click)="performAction({action: 'emergency'})">
          </p-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .action-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      transition: all 0.3s ease;
    }
    
    .action-card:hover:not(.disabled) {
      background: var(--surface-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color);
    }
    
    .action-card.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .action-card.disabled:hover {
      transform: none;
      box-shadow: none;
    }
  `]
})
export class QuickActionsComponent {
  quickActions: QuickAction[] = [
    {
      title: 'Register New Patient',
      description: 'Add a new patient to the system',
      icon: 'pi pi-user-plus',
      color: '#10B981',
      action: 'register-patient'
    },
    {
      title: 'Scan QR Code',
      description: 'Scan patient QR for visit check-in',
      icon: 'pi pi-qrcode',
      color: '#3B82F6',
      action: 'scan-qr'
    },
    {
      title: 'View Today\'s Schedule',
      description: 'Check appointments and visits',
      icon: 'pi pi-calendar',
      color: '#8B5CF6',
      action: 'view-schedule'
    },
    {
      title: 'Generate Reports',
      description: 'Create and download reports',
      icon: 'pi pi-file-pdf',
      color: '#F59E0B',
      action: 'generate-reports'
    },
    {
      title: 'Patient Search',
      description: 'Find patient records quickly',
      icon: 'pi pi-search',
      color: '#06B6D4',
      action: 'search-patient'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: 'pi pi-cog',
      color: '#6B7280',
      action: 'system-settings'
    }
  ];

  performAction(action: any) {
    if (action.disabled) return;
    
    console.log('Performing action:', action.action || action);
    
    // Add your navigation logic here
    switch (action.action || action) {
      case 'register-patient':
        // Navigate to patient registration
        break;
      case 'scan-qr':
        // Open QR scanner
        break;
      case 'view-schedule':
        // Navigate to schedule view
        break;
      case 'generate-reports':
        // Open reports section
        break;
      case 'search-patient':
        // Open patient search
        break;
      case 'system-settings':
        // Navigate to settings
        break;
      case 'emergency':
        // Open emergency registration
        break;
      default:
        console.log('Unknown action:', action);
    }
  }
}