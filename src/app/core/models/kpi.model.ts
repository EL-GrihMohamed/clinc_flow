// src/app/core/models/kpi.model.ts

export interface PatientStatistics {
  totalActivePatients: number;
  newPatientsThisMonth: number;
  patientsScheduledToday: number;
  criticalStatusPatients: number;
}

export interface VisitMetrics {
  todaysVisits: number;
  completedVisits: number;
  pendingVisits: number;
  averageWaitTime: number; // in minutes
}

export interface SystemUsage {
  activeUsers: number;
  qrScansToday: number;
  systemAlerts: number;
}

export interface KPIData {
  patientStats: PatientStatistics;
  visitMetrics: VisitMetrics;
  systemUsage: SystemUsage;
  lastUpdated: Date;
}

export interface KPICard {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    percentage: number;
    direction: 'up' | 'down';
  };
  subtitle?: string;
}