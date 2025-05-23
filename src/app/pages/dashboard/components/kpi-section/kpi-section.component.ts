// src/app/pages/dashboard/components/kpi-section/kpi-section.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { KpiService } from '../../../../core/services/kpi.service';
import { KPICard, KPIData } from '../../../../core/models/kpi.model';

@Component({
  selector: 'app-kpi-section',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    SkeletonModule,
    MessageModule
  ],
  template: `
    <div class="grid">
      <div class="col-12">
        <div class="flex justify-content-between align-items-center mb-4">
          <h3 class="text-900 font-medium text-xl mb-0">Key Performance Indicators</h3>
          <div class="flex align-items-center gap-2">
            <p-button 
              icon="pi pi-refresh" 
              [loading]="isLoading" 
              (click)="refreshData()"
              severity="secondary"
              size="small"
              [text]="true"
              pTooltip="Refresh data">
            </p-button>
            <small class="text-500" *ngIf="lastUpdated">
              Last updated: {{ lastUpdated | date:'short' }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Cards Grid -->
    <div class="grid" *ngIf="!isLoading && kpiCards.length > 0; else loadingTemplate">
      <div class="col-12 md:col-6 lg:col-3" *ngFor="let card of kpiCards; trackBy: trackByTitle">
        <div class="card mb-0 hover-card" 
             [ngClass]="getCardClass(card)" 
             (click)="onCardClick(card)">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">{{ card.title }}</span>
              <div class="text-900 font-medium text-xl">{{ card.value }}</div>
            </div>
            <div class="flex align-items-center justify-content-center border-round icon-container" 
                 [style.background]="getIconBackground(card)" 
                 style="width:2.5rem;height:2.5rem">
              <i [class]="card.icon" [style.color]="getIconColor(card)"></i>
            </div>
          </div>
          
          <div class="flex align-items-center" *ngIf="card.subtitle">
            <span class="text-500 text-sm">{{ card.subtitle }}</span>
          </div>
          
          <div class="flex align-items-center mt-2" *ngIf="card.trend">
            <i class="pi" 
               [ngClass]="card.trend.direction === 'up' ? 'pi-arrow-up text-green-500' : 'pi-arrow-down text-red-500'">
            </i>
            <span class="ml-2 text-sm font-medium" 
                  [ngClass]="card.trend.direction === 'up' ? 'text-green-500' : 'text-red-500'">
              {{ card.trend.percentage }}%
            </span>
            <span class="ml-1 text-xs text-500">vs last month</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3" *ngFor="let item of skeletonItems">
          <div class="card mb-0">
            <div class="flex justify-content-between mb-3">
              <div class="flex-1">
                <p-skeleton height="1rem" class="mb-3" width="60%"></p-skeleton>
                <p-skeleton height="1.5rem" width="40%"></p-skeleton>
              </div>
              <p-skeleton size="2.5rem" shape="circle"></p-skeleton>
            </div>
            <p-skeleton height="0.8rem" width="80%"></p-skeleton>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- Error Message -->
    <div class="grid" *ngIf="error && !isLoading">
      <div class="col-12">
        <p-message 
          severity="error" 
          text="Failed to load KPI data. Please try refreshing."
          [closable]="false">
        </p-message>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .refresh-button {
      transition: transform 0.3s ease;
    }
    
    .refresh-button:hover {
      transform: rotate(180deg);
    }
    
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
export class KpiSectionComponent implements OnInit, OnDestroy {
  kpiCards: KPICard[] = [];
  isLoading = true;
  error: string | null = null;
  lastUpdated: Date | null = null;
  skeletonItems = Array(8).fill(null); // Array for skeleton loading items
  
  private destroy$ = new Subject<void>();

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    this.loadKPIData();
    
    // Subscribe to real-time updates
    this.kpiService.kpiData$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            this.kpiCards = this.kpiService.transformToKPICards(data);
            this.lastUpdated = data.lastUpdated;
          }
        },
        error: (error) => {
          this.error = 'Failed to load real-time updates';
          console.error('KPI data subscription error:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadKPIData(): void {
    this.isLoading = true;
    this.error = null;

    // Use mock data for development - replace with real service call
    this.kpiService.getMockKPIData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: KPIData) => {
          this.kpiCards = this.kpiService.transformToKPICards(data);
          this.lastUpdated = data.lastUpdated;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load KPI data';
          this.isLoading = false;
          console.error('Error loading KPI data:', error);
        }
      });
  }

  refreshData(): void {
    this.loadKPIData();
  }

  trackByTitle(index: number, card: KPICard): string {
    return card.title;
  }

  // KPI Card helper methods (moved from KpiCardComponent)
  getCardClass(card: KPICard): string {
    return `kpi-card-${card.color}`;
  }

  getIconBackground(card: KPICard): string {
    const colors = {
      primary: 'var(--primary-50)',
      success: 'var(--green-50)',
      warning: 'var(--yellow-50)',
      danger: 'var(--red-50)',
      info: 'var(--blue-50)'
    };
    return colors[card.color] || colors.primary;
  }

  getIconColor(card: KPICard): string {
    const colors = {
      primary: 'var(--primary-color)',
      success: 'var(--green-500)',
      warning: 'var(--yellow-500)',
      danger: 'var(--red-500)',
      info: 'var(--blue-500)'
    };
    return colors[card.color] || colors.primary;
  }

  onCardClick(card: KPICard): void {
    // Add navigation or detailed view logic here
    console.log('KPI Card clicked:', card.title);
  }
}