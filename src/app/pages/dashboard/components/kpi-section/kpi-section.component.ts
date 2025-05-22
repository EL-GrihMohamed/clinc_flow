// src/app/pages/dashboard/components/kpi-section/kpi-section.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { KpiService } from '../../../../core/services/kpi.service';
import { KPICard, KPIData } from '../../../../core/models/kpi.model';

@Component({
  selector: 'app-kpi-section',
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
              [text]="true">
            </p-button>
            <small class="text-500" *ngIf="lastUpdated">
              Last updated: {{ lastUpdated | date:'short' }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <div class="grid" *ngIf="!isLoading && kpiCards.length > 0; else loadingTemplate">
      <app-kpi-card 
        *ngFor="let card of kpiCards; trackBy: trackByTitle" 
        [kpiCard]="card">
      </app-kpi-card>
    </div>

    <ng-template #loadingTemplate>
      <div class="grid">
        <div class="col-12 md:col-6 lg:col-3" *ngFor="let item of [1,2,3,4,5,6,7,8,9,10,11]">
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

    <div class="grid" *ngIf="error">
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
  `]
})
export class KpiSectionComponent implements OnInit, OnDestroy {
  kpiCards: KPICard[] = [];
  isLoading = true;
  error: string | null = null;
  lastUpdated: Date | null = null;
  
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
}