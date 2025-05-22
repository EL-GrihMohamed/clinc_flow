import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  specialization: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DoctorOption {
  label: string;
  value: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly baseUrl = '/api';
  private doctorsSubject = new BehaviorSubject<Doctor[]>([]);
  public doctors$ = this.doctorsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDoctors();
  }

  // API Methods
  getAll(): Observable<Doctor[]> {
    return this.http.get<ApiResponse<Doctor[]>>(`${this.baseUrl}/doctors`).pipe(
      map(response => {
        if (response.success && response.data) {
          const processedDoctors = response.data.map(doctor => this.processDoctor(doctor));
          this.doctorsSubject.next(processedDoctors);
          return processedDoctors;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error loading doctors:', error);
        // Return sample data for demo
        const sampleData = this.createSampleData();
        this.doctorsSubject.next(sampleData);
        return of(sampleData);
      })
    );
  }

  getById(id: string): Observable<Doctor | null> {
    return this.http.get<ApiResponse<Doctor>>(`${this.baseUrl}/doctors/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.processDoctor(response.data);
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching doctor:', error);
        // Search in local data for demo
        const doctors = this.doctorsSubject.value;
        const found = doctors.find(d => d.id === id);
        return of(found || null);
      })
    );
  }

  // Get doctors as dropdown options
  getDoctorOptions(): Observable<DoctorOption[]> {
    return this.doctors$.pipe(
      map(doctors => 
        doctors
          .filter(doctor => doctor.isActive)
          .map(doctor => ({
            label: doctor.fullName || `${doctor.firstName} ${doctor.lastName}`,
            value: doctor.id
          }))
      )
    );
  }

  // Get active doctors only
  getActiveDoctors(): Observable<Doctor[]> {
    return this.doctors$.pipe(
      map(doctors => doctors.filter(doctor => doctor.isActive))
    );
  }

  // Business Logic Methods
  private processDoctor(doctor: Doctor): Doctor {
    const processedDoctor = { ...doctor };
    
    // Calculate full name
    if (doctor.firstName && doctor.lastName) {
      processedDoctor.fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    }
    
    return processedDoctor;
  }

  // Private helper methods
  private loadDoctors(): void {
    this.getAll().subscribe();
  }

  private createSampleData(): Doctor[] {
    return [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        fullName: 'Dr. John Smith',
        specialization: 'Cardiology',
        email: 'john.smith@hospital.com',
        phoneNumber: '+212 661234567',
        isActive: true,
        createdAt: new Date(2023, 0, 15),
        updatedAt: new Date(2024, 3, 10)
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        fullName: 'Dr. Sarah Johnson',
        specialization: 'Pediatrics',
        email: 'sarah.johnson@hospital.com',
        phoneNumber: '+212 662345678',
        isActive: true,
        createdAt: new Date(2023, 1, 20),
        updatedAt: new Date(2024, 3, 15)
      },
      {
        id: '3',
        firstName: 'Michael',
        lastName: 'Brown',
        fullName: 'Dr. Michael Brown',
        specialization: 'Orthopedics',
        email: 'michael.brown@hospital.com',
        phoneNumber: '+212 663456789',
        isActive: true,
        createdAt: new Date(2023, 2, 10),
        updatedAt: new Date(2024, 3, 20)
      },
      {
        id: '4',
        firstName: 'Emily',
        lastName: 'Davis',
        fullName: 'Dr. Emily Davis',
        specialization: 'Dermatology',
        email: 'emily.davis@hospital.com',
        phoneNumber: '+212 664567890',
        isActive: true,
        createdAt: new Date(2023, 3, 5),
        updatedAt: new Date(2024, 4, 1)
      }
    ];
  }
}