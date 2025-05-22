// src/app/core/services/kpi.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { KPIData, KPICard } from '../models/kpi.model';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private apiUrl = 'your-api-base-url'; // Replace with your actual API URL
  private kpiDataSubject = new BehaviorSubject<KPIData | null>(null);
  public kpiData$ = this.kpiDataSubject.asObservable();

  constructor(private http: HttpClient) {
    // Auto-refresh KPI data every 5 minutes
    this.startAutoRefresh();
  }

  private startAutoRefresh(): void {
    interval(300000) // 5 minutes
      .pipe(
        switchMap(() => this.refreshKPIData())
      )
      .subscribe();
  }

  getKPIData(): Observable<KPIData> {
    return this.http.get<KPIData>(`${this.apiUrl}/dashboard/kpi`);
  }

  refreshKPIData(): Observable<KPIData> {
    return this.getKPIData().pipe(
      map(data => {
        this.kpiDataSubject.next(data);
        return data;
      }),
      catchError(error => {
        console.error('Error fetching KPI data:', error);
        throw error;
      })
    );
  }

  // Mock data for development - remove when you have real API
  getMockKPIData(): Observable<KPIData> {
    const mockData: KPIData = {
      patientStats: {
        totalActivePatients: 1247,
        newPatientsThisMonth: 89,
        patientsScheduledToday: 34,
        criticalStatusPatients: 7
      },
      visitMetrics: {
        todaysVisits: 45,
        completedVisits: 28,
        pendingVisits: 17,
        averageWaitTime: 12
      },
      systemUsage: {
        activeUsers: 23,
        qrScansToday: 156,
        systemAlerts: 3
      },
      lastUpdated: new Date()
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockData);
        observer.complete();
      }, 1000);
    });
  }

  transformToKPICards(data: KPIData): KPICard[] {
    return [
      // Patient Statistics
      {
        title: 'Total Active Patients',
        value: data.patientStats.totalActivePatients.toLocaleString(),
        icon: 'pi pi-users',
        color: 'primary',
        subtitle: 'Currently in system'
      },
      {
        title: 'New Patients This Month',
        value: data.patientStats.newPatientsThisMonth,
        icon: 'pi pi-user-plus',
        color: 'success',
        trend: {
          percentage: 12,
          direction: 'up'
        },
        subtitle: 'Monthly registrations'
      },
      {
        title: 'Scheduled Today',
        value: data.patientStats.patientsScheduledToday,
        icon: 'pi pi-calendar',
        color: 'info',
        subtitle: 'Today\'s appointments'
      },
      {
        title: 'Critical Status',
        value: data.patientStats.criticalStatusPatients,
        icon: 'pi pi-exclamation-triangle',
        color: 'danger',
        subtitle: 'Require attention'
      },
      // Visit Metrics
      {
        title: 'Today\'s Visits',
        value: data.visitMetrics.todaysVisits,
        icon: 'pi pi-check-circle',
        color: 'primary',
        subtitle: 'Scheduled visits'
      },
      {
        title: 'Completed Visits',
        value: data.visitMetrics.completedVisits,
        icon: 'pi pi-check',
        color: 'success',
        subtitle: 'Finished today'
      },
      {
        title: 'Pending Visits',
        value: data.visitMetrics.pendingVisits,
        icon: 'pi pi-clock',
        color: 'warning',
        subtitle: 'Waiting to be processed'
      },
      {
        title: 'Avg Wait Time',
        value: `${data.visitMetrics.averageWaitTime} min`,
        icon: 'pi pi-hourglass',
        color: data.visitMetrics.averageWaitTime > 15 ? 'warning' : 'success',
        subtitle: 'Current average'
      },
      // System Usage
      {
        title: 'Active Users',
        value: data.systemUsage.activeUsers,
        icon: 'pi pi-user',
        color: 'info',
        subtitle: 'Currently logged in'
      },
      {
        title: 'QR Scans Today',
        value: data.systemUsage.qrScansToday,
        icon: 'pi pi-qrcode',
        color: 'primary',
        subtitle: 'Patient check-ins'
      },
      {
        title: 'System Alerts',
        value: data.systemUsage.systemAlerts,
        icon: 'pi pi-bell',
        color: data.systemUsage.systemAlerts > 5 ? 'danger' : 'warning',
        subtitle: 'Need attention'
      }
    ];
  }
}