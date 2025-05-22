import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

export interface ScannerDevice {
  label: string;
  value: MediaDeviceInfo;
}

@Injectable({
  providedIn: 'root'
})
export class CinScannerService {
  private availableCameras: MediaDeviceInfo[] = [];
  private scannerDevices$ = new BehaviorSubject<ScannerDevice[]>([]);
  
  constructor() { }

  // Get available scanner devices
  getAvailableDevices(): Observable<ScannerDevice[]> {
    return this.scannerDevices$.asObservable();
  }

  // Set available cameras
  setAvailableCameras(cameras: MediaDeviceInfo[]): void {
    this.availableCameras = cameras;
    
    const devices: ScannerDevice[] = cameras.map((camera, index) => ({
      label: camera.label || `Camera ${index + 1}`,
      value: camera
    }));
    
    this.scannerDevices$.next(devices);
  }

  // Get default camera
  getDefaultCamera(): MediaDeviceInfo | undefined {
    return this.availableCameras.length > 0 ? this.availableCameras[0] : undefined;
  }

  // Parse CIN data from scanned result
  parseCinData(scanResult: string): Partial<Patient> | null {
    try {
      // This is a mock implementation
      // In a real-world scenario, you'd parse the actual CIN card format
      
      // Check if it's a valid CIN format (basic validation)
      if (!scanResult || scanResult.length < 8) {
        return null;
      }

      // Mock parsing - replace with actual CIN parsing logic
      const parsedData: Partial<Patient> = {
        cin: scanResult.substring(0, 8), // Extract CIN
        // Add more fields based on your CIN card format
      };

      // If the scan result contains structured data (like JSON), parse it
      if (scanResult.startsWith('{')) {
        try {
          const jsonData = JSON.parse(scanResult);
          return {
            cin: jsonData.cin,
            firstName: jsonData.firstName,
            lastName: jsonData.lastName,
            dateOfBirth: jsonData.dateOfBirth ? new Date(jsonData.dateOfBirth) : undefined,
            address: jsonData.address,
            city: jsonData.city,
            gender: jsonData.gender
          };
        } catch (e) {
          console.warn('Failed to parse JSON data from scan result');
        }
      }

      return parsedData;
    } catch (error) {
      console.error('Error parsing CIN data:', error);
      return null;
    }
  }

  // Validate CIN format
  validateCin(cin: string): boolean {
    // Implement your CIN validation logic here
    // This is a basic example
    return typeof cin === 'string' && cin.length >= 8 && /^[A-Z0-9]+$/.test(cin);
  }

  // Generate mock CIN data for testing
  generateMockCinData(): Partial<Patient> {
    return {
      cin: 'A' + Math.random().toString().substring(2, 8),
      firstName: 'Mohammed',
      lastName: 'El Amrani',
      dateOfBirth: new Date(1990, 5, 15),
      address: '123 Avenue Hassan II',
      city: 'Casablanca'
    };
  }
}