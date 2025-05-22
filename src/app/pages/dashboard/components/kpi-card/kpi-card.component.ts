// src/app/pages/dashboard/components/kpi-card/kpi-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPICard } from '../../../../core/models/kpi.model';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-12 md:col-6 lg:col-3">
      <div class="card mb-0 hover-card" [ngClass]="getCardClass()" (click)="onCardClick()">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">{{ kpiCard.title }}</span>
            <div class="text-900 font-medium text-xl">{{ kpiCard.value }}</div>
          </div>
          <div class="flex align-items-center justify-content-center border-round icon-container" 
               [style.background]="getIconBackground()" 
               style="width:2.5rem;height:2.5rem">
            <i [class]="kpiCard.icon" [style.color]="getIconColor()"></i>
          </div>
        </div>
        
        <div class="flex align-items-center" *ngIf="kpiCard.subtitle">
          <span class="text-500 text-sm">{{ kpiCard.subtitle }}</span>
        </div>
        
        <div class="flex align-items-center mt-2" *ngIf="kpiCard.trend">
          <i class="pi" 
             [ngClass]="kpiCard.trend.direction === 'up' ? 'pi-arrow-up text-green-500' : 'pi-arrow-down text-red-500'">
          </i>
          <span class="ml-2 text-sm font-medium" 
                [ngClass]="kpiCard.trend.direction === 'up' ? 'text-green-500' : 'text-red-500'">
            {{ kpiCard.trend.percentage }}%
          </span>
          <span class="ml-1 text-xs text-500">vs last month</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover-card {
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid transparent;
    }
    
    .hover-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color);
    }
    
    .icon-container {
      transition: all 0.3s ease;
    }
    
    .hover-card:hover .icon-container {
      transform: scale(1.1);
    }
    
    .kpi-card-primary {
      border-left: 4px solid var(--primary-color);
    }
    
    .kpi-card-success {
      border-left: 4px solid var(--green-500);
    }
    
    .kpi-card-warning {
      border-left: 4px solid var(--yellow-500);
    }
    
    .kpi-card-danger {
      border-left: 4px solid var(--red-500);
    }
    
    .kpi-card-info {
      border-left: 4px solid var(--blue-500);
    }
  `]
})
export class KpiCardComponent {
  @Input() kpiCard!: KPICard;

  getCardClass(): string {
    return `kpi-card-${this.kpiCard.color}`;
  }

  getIconBackground(): string {
    const colors = {
      primary: 'var(--primary-50)',
      success: 'var(--green-50)',
      warning: 'var(--yellow-50)',
      danger: 'var(--red-50)',
      info: 'var(--blue-50)'
    };
    return colors[this.kpiCard.color];
  }

  getIconColor(): string {
    const colors = {
      primary: 'var(--primary-color)',
      success: 'var(--green-500)',
      warning: 'var(--yellow-500)',
      danger: 'var(--red-500)',
      info: 'var(--blue-500)'
    };
    return colors[this.kpiCard.color];
  }

  onCardClick(): void {
    // Add navigation or detailed view logic here
    console.log('KPI Card clicked:', this.kpiCard.title);
  }
}