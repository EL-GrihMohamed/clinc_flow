import { Gender, PatientStatus, BloodGroup } from '../models/patient.model';

export interface DropdownOption {
  label: string;
  value: any;
}

export class PatientUtils {
  
  // Format enum values for display
  static formatEnum(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  // Get dropdown options for Gender
  static getGenderOptions(): DropdownOption[] {
    return Object.values(Gender).map(gender => ({
      label: this.formatEnum(gender),
      value: gender
    }));
  }

  // Get dropdown options for Patient Status
  static getStatusOptions(): DropdownOption[] {
    return Object.values(PatientStatus).map(status => ({
      label: this.formatEnum(status),
      value: status
    }));
  }

  // Get dropdown options for Blood Group
  static getBloodGroupOptions(): DropdownOption[] {
    return Object.values(BloodGroup).map(group => ({
      label: group,
      value: group
    }));
  }

  // Get severity color for patient status
  static getStatusSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
      case 'active':
      case PatientStatus.ACTIVE.toLowerCase():
        return 'success';
      case 'pending':
      case PatientStatus.PENDING.toLowerCase():
        return 'info';
      case 'inactive':
      case PatientStatus.INACTIVE.toLowerCase():
        return 'warn';
      case 'critical':
      case PatientStatus.CRITICAL.toLowerCase():
        return 'danger';
      case 'discharged':
      case PatientStatus.DISCHARGED.toLowerCase():
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  // Calculate age from date of birth
  static calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Check if patient is minor
  static isMinor(dateOfBirth: Date): boolean {
    return this.calculateAge(dateOfBirth) < 18;
  }

  // Generate full name from first and last name
  static generateFullName(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) return '';
    if (!firstName) return lastName || '';
    if (!lastName) return firstName || '';
    return `${firstName} ${lastName}`;
  }

  // Get table columns configuration
  static getTableColumns() {
    return [
      { field: 'ipp', header: 'IPP' },
      { field: 'cin', header: 'CIN' },
      { field: 'fullName', header: 'Name' },
      { field: 'gender', header: 'Gender' },
      { field: 'age', header: 'Age' },
      { field: 'phoneNumber', header: 'Phone' },
      { field: 'status', header: 'Status' },
      { field: 'assignedDoctor', header: 'Doctor' }
    ];
  }

  // Get breadcrumb items
  static getBreadcrumbItems() {
    return [
      { label: 'Dashboard', routerLink: ['/dashboard'] },
      { label: 'Patients' }
    ];
  }

  // Validate required patient fields
  static validatePatient(patient: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!patient.firstName) {
      errors.push('First name is required');
    }

    if (!patient.lastName) {
      errors.push('Last name is required');
    }

    if (!patient.dateOfBirth) {
      errors.push('Date of birth is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get current date (helper for date picker max date)
  static getCurrentDate(): Date {
    return new Date();
  }

  // Convert status enum to string
  static getStatusString(status: PatientStatus | undefined): string {
    return status ? status.toString() : '';
  }
}