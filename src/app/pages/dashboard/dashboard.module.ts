// src/app/pages/dashboard/dashboard.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';

// Components
import { DashboardComponent } from './dashboard.component';
import { KpiSectionComponent } from './components/kpi-section/kpi-section.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';

@NgModule({
  declarations: [
  ],
  imports: [
    DashboardComponent,
    KpiSectionComponent,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent
      }
    ]),
    // PrimeNG Modules
    CardModule,
    ButtonModule,
    SkeletonModule,
    MessageModule,
    KpiCardComponent
  ],
  exports: [
    DashboardComponent,
    KpiSectionComponent,
    KpiCardComponent
  ]
})
export class DashboardModule { }