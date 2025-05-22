import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Patient, Gender, PatientStatus, BloodGroup } from '../models/patient.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DoctorService } from './doctor.service';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly baseUrl = '/api';
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private doctorService: DoctorService
  ) {
    // Load initial data
    this.loadPatients().subscribe();
  }

  // API Methods
  getAll(): Observable<Patient[]> {
    return this.http.get<ApiResponse<Patient[]>>(`${this.baseUrl}/patients`).pipe(
      map(response => {
        if (response.success && response.data) {
          const processedPatients = response.data.map(patient => this.processPatient(patient));
          this.patientsSubject.next(processedPatients);
          return processedPatients;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error loading patients:', error);
        // Return sample data for demo purposes
        const sampleData = this.createSampleData();
        this.patientsSubject.next(sampleData);
        return of(sampleData);
      })
    );
  }

  getByCIN(cin: string): Observable<Patient | null> {
    return this.http.get<ApiResponse<Patient>>(`${this.baseUrl}/patients/search`, {
      params: { cin }
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.processPatient(response.data);
        }
        return null;
      }),
      catchError(error => {
        console.error('Error searching patient by CIN:', error);
        // Search in local data for demo
        const patients = this.patientsSubject.value;
        const found = patients.find(p => p.cin?.toLowerCase() === cin.toLowerCase());
        return of(found || null);
      })
    );
  }

  create(patient: Patient): Observable<Patient> {
    // Process and validate patient data
    const processedPatient = this.processPatient({
      ...patient,
      id: this.createId(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return this.http.post<ApiResponse<Patient>>(`${this.baseUrl}/patients`, processedPatient).pipe(
      map(response => {
        if (response.success && response.data) {
          const newPatient = this.processPatient(response.data);
          // Update local state
          const currentPatients = this.patientsSubject.value;
          this.patientsSubject.next([...currentPatients, newPatient]);
          return newPatient;
        }
        throw new Error(response.message || 'Failed to create patient');
      }),
      catchError(error => {
        console.error('Error creating patient:', error);
        // For demo, add to local state
        const currentPatients = this.patientsSubject.value;
        this.patientsSubject.next([...currentPatients, processedPatient]);
        return of(processedPatient);
      })
    );
  }

  update(id: string, patient: Patient): Observable<Patient> {
    if (!id) {
      return throwError(() => new Error('Patient ID is required for update'));
    }

    const processedPatient = this.processPatient({
      ...patient,
      id: id,
      updatedAt: new Date()
    });

    return this.http.put<ApiResponse<Patient>>(`${this.baseUrl}/patients/${id}`, processedPatient).pipe(
      map(response => {
        if (response.success && response.data) {
          const updatedPatient = this.processPatient(response.data);
          // Update local state
          const currentPatients = this.patientsSubject.value;
          const index = currentPatients.findIndex(p => p.id === id);
          if (index !== -1) {
            currentPatients[index] = updatedPatient;
            this.patientsSubject.next([...currentPatients]);
          }
          return updatedPatient;
        }
        throw new Error(response.message || 'Failed to update patient');
      }),
      catchError(error => {
        console.error('Error updating patient:', error);
        // For demo, update local state
        const currentPatients = this.patientsSubject.value;
        const index = currentPatients.findIndex(p => p.id === id);
        if (index !== -1) {
          currentPatients[index] = processedPatient;
          this.patientsSubject.next([...currentPatients]);
        }
        return of(processedPatient);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/patients/${id}`).pipe(
      map(response => {
        if (response.success) {
          // Update local state
          const currentPatients = this.patientsSubject.value;
          const filteredPatients = currentPatients.filter(p => p.id !== id);
          this.patientsSubject.next(filteredPatients);
          return true;
        }
        throw new Error(response.message || 'Failed to delete patient');
      }),
      catchError(error => {
        console.error('Error deleting patient:', error);
        // For demo, delete from local state
        const currentPatients = this.patientsSubject.value;
        const filteredPatients = currentPatients.filter(p => p.id !== id);
        this.patientsSubject.next(filteredPatients);
        return of(true);
      })
    );
  }

  deleteMultiple(ids: string[]): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/patients/delete-multiple`, { ids }).pipe(
      map(response => {
        if (response.success) {
          // Update local state
          const currentPatients = this.patientsSubject.value;
          const filteredPatients = currentPatients.filter(p => !ids.includes(p.id!));
          this.patientsSubject.next(filteredPatients);
          return true;
        }
        throw new Error(response.message || 'Failed to delete patients');
      }),
      catchError(error => {
        console.error('Error deleting patients:', error);
        // For demo, delete from local state
        const currentPatients = this.patientsSubject.value;
        const filteredPatients = currentPatients.filter(p => !ids.includes(p.id!));
        this.patientsSubject.next(filteredPatients);
        return of(true);
      })
    );
  }

  // Business Logic Methods
  processPatient(patient: Patient): Patient {
    const processedPatient = { ...patient };
    
    // Calculate full name
    if (patient.firstName && patient.lastName) {
      processedPatient.fullName = `${patient.firstName} ${patient.lastName}`;
    }
    
    // Calculate age and minor status
    if (patient.dateOfBirth) {
      const age = this.calculateAge(patient.dateOfBirth);
      processedPatient.age = age;
      processedPatient.isMinor = age < 18;
    }
    
    // Initialize arrays if not present
    if (!processedPatient.allergies) processedPatient.allergies = [];
    if (!processedPatient.chronicConditions) processedPatient.chronicConditions = [];
    if (!processedPatient.emergencyContacts) processedPatient.emergencyContacts = [];
    if (!processedPatient.visits) processedPatient.visits = [];
    
    return processedPatient;
  }

  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  }

  generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Add the missing generateSampleData method
  generateSampleData(): Observable<Patient[]> {
    const sampleData = this.createSampleData();
    return of(sampleData);
  }

  // Utility Methods
  formatEnum(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  createId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Get doctor options for dropdowns
  getDoctorOptions(): Observable<any[]> {
    return this.doctorService.getDoctorOptions();
  }

  getFormOptions() {
    return {
      genderOptions: Object.values(Gender).map(gender => ({ 
        label: this.formatEnum(gender), 
        value: gender 
      })),
      statusOptions: Object.values(PatientStatus).map(status => ({ 
        label: this.formatEnum(status), 
        value: status 
      })),
      bloodGroupOptions: Object.values(BloodGroup).map(group => ({ 
        label: group, 
        value: group 
      }))
    };
  }

  getSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
      case PatientStatus.ACTIVE.toLowerCase():
        return 'success';
      case PatientStatus.PENDING.toLowerCase():
        return 'info';
      case PatientStatus.INACTIVE.toLowerCase():
        return 'warn';
      case PatientStatus.CRITICAL.toLowerCase():
        return 'danger';
      default:
        return 'secondary';
    }
  }

  // CIN Data Processing
  parseCinData(scannedData: string): Partial<Patient> | null {
    try {
      // This would contain your actual CIN parsing logic
      // For now, returning mock data
      const parsedData: Partial<Patient> = {
        cin: scannedData,
        firstName: 'Mohammed',
        lastName: 'El Amrani',
        dateOfBirth: new Date(1990, 5, 15),
        address: '123 Avenue Hassan II',
        city: 'Casablanca',
        gender: Gender.MALE
      };

      return parsedData;
    } catch (error) {
      console.error('Data parsing error:', error);
      return null;
    }
  }

  // Private helper methods
  private loadPatients(): Observable<Patient[]> {
    return this.getAll();
  }

  private createSampleData(): Patient[] {
    return [
      {
        id: '1',
        ipp: 'IPP001',
        cin: 'A123456',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        phoneNumber: '+212 612345678',
        address: '123 Main St',
        city: 'Casablanca',
        dateOfBirth: new Date(1985, 5, 15),
        age: 38,
        gender: Gender.MALE,
        bloodGroup: BloodGroup.A_POSITIVE,
        allergies: ['Penicillin', 'Dust'],
        chronicConditions: ['Hypertension'],
        status: PatientStatus.ACTIVE,
        hasInsurance: true,
        insuranceName: 'CNOPS',
        insuranceNumber: 'INS123456',
        isMinor: false,
        assignedDoctorId: '1',
        assignedDoctor: 'Dr. John Smith',
        emergencyContacts: [
          { name: 'Jane Doe', relationship: 'Spouse', phoneNumber: '+212 612345679' }
        ],
        visits: [],
        createdAt: new Date(2023, 1, 15),
        image: 'patient-placeholder.svg'
      },
      {
        id: '2',
        ipp: 'IPP002',
        cin: 'B654321',
        firstName: 'Sarah',
        lastName: 'Johnson',
        fullName: 'Sarah Johnson',
        phoneNumber: '+212 633445566',
        address: '456 Oak Avenue',
        city: 'Rabat',
        dateOfBirth: new Date(1992, 8, 21),
        age: 31,
        gender: Gender.FEMALE,
        bloodGroup: BloodGroup.O_NEGATIVE,
        allergies: ['Seafood'],
        chronicConditions: ['Asthma', 'Diabetes'],
        status: PatientStatus.ACTIVE,
        hasInsurance: true,
        insuranceName: 'CNSS',
        insuranceNumber: 'INS654321',
        isMinor: false,
        assignedDoctorId: '2',
        assignedDoctor: 'Dr. Sarah Johnson',
        emergencyContacts: [
          { name: 'Michael Johnson', relationship: 'Brother', phoneNumber: '+212 633445567' }
        ],
        visits: [],
        createdAt: new Date(2023, 6, 10),
        image: 'patient-placeholder.svg'
      }
    ];
  }
}