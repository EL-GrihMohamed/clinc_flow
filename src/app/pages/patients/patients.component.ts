import { Component, signal, ViewChild, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabViewModule } from 'primeng/tabview';
import { ChipsModule } from 'primeng/chips';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { Patient, Gender, PatientStatus, BloodGroup, EmergencyContact, Visit } from '../../core/models/patient.model';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToolbarModule,
    TableModule,
    TagModule,
    DialogModule,
    DropdownModule,
    RadioButtonModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule,
    ConfirmDialogModule,
    CalendarModule,
    CheckboxModule,
    MultiSelectModule,
    TabViewModule,
    ChipsModule,
    BreadcrumbModule,
    TooltipModule,
    TimelineModule,
    CardModule,
    DividerModule,
    ProgressSpinnerModule
],
  providers: [MessageService, ConfirmationService],
  templateUrl: './patients.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    .full-width {
      width: 100%;
    }
    .patient-card {
      margin-bottom: 1rem;
    }
    .emergency-contact {
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 1rem;
      margin-top: 0.5rem;
    }
    .visit-timeline .custom-marker {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .visit-timeline .visit-card {
      padding: 1rem;
    }
    .search-form {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .search-input {
      flex: 1;
      max-width: 300px;
    }
    .search-results {
      margin-top: 1rem;
    }
    .no-results {
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
      text-align: center;
    }
  `
})
export class PatientsComponent implements OnInit {
  // Table configuration
  cols!: Column[];
  patients = signal<Patient[]>([]);
  selectedPatients!: Patient[] | null;
  
  // Patient editing
  patient!: Patient;
  submitted: boolean = false;
  patientDialog: boolean = false;
  dialogMode: 'add' | 'edit' | 'view' = 'add';
  activeTabIndex: number = 0;
  
  // Form options
  genderOptions = Object.values(Gender).map(gender => ({ label: this.formatEnum(gender), value: gender }));
  statusOptions = Object.values(PatientStatus).map(status => ({ label: this.formatEnum(status), value: status }));
  bloodGroupOptions = Object.values(BloodGroup).map(group => ({ label: group, value: group }));
  
  // New fields for editing
  newAllergy: string = '';
  newChronicCondition: string = '';
  
  // Emergency contact temp object
  newEmergencyContact: EmergencyContact = { name: '', relationship: '', phoneNumber: '' };
  
  // Breadcrumb items
  breadcrumbItems: MenuItem[] = [
    { label: 'Dashboard', routerLink: ['/dashboard'] },
    { label: 'Patients' }
  ];

  // Used for doctor selection
  doctors: any[] = [];
  
  // Table reference for export
  @ViewChild('dt') dt!: Table;

  // Search functionality
  searchCin: string = '';
  searchInProgress: boolean = false;
  noPatientFound: boolean = false;

  // CIN scanning functionality
  scannerDialog: boolean = false;
  scanningInProgress: boolean = false;
  scanningComplete: boolean = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private http: HttpClient
  ) { }

  // Define base URL for API calls
  get baseUrl(): string {
    // In a real application, this would come from environment config
    return 'api'; // Base API path
  }

  ngOnInit() {
    // Initialize columns for the table
    this.cols = [
      { field: 'ipp', header: 'IPP' },
      { field: 'fullName', header: 'Name' },
      { field: 'gender', header: 'Gender' },
      { field: 'age', header: 'Age' },
      { field: 'phoneNumber', header: 'Phone' },
      { field: 'status', header: 'Status' },
      { field: 'assignedDoctor', header: 'Doctor' }
    ];

    // Load patients from API
    this.loadPatients();
    
    // Load doctors for dropdown
    this.loadDoctors();
  }

  // Add this method to fix the "new Date()" issues
  getCurrentDate(): Date {
    return new Date();
  }

  // API Methods
  loadPatients() {
    // Replace with your actual API endpoint
    this.http.get<Patient[]>(`${this.baseUrl}/patients`).subscribe(
      (data) => {
        // Process patients to add computed properties
        const processedPatients = data.map(patient => this.processPatient(patient));
        this.patients.set(processedPatients);
      },
      (error) => {
        console.error('Error loading patients', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load patients',
          life: 3000
        });
        
        // For demonstration, create sample data
        this.createSampleData();
      }
    );
  }

  loadDoctors() {
    // Replace with your actual API endpoint
    this.http.get<any[]>(`${this.baseUrl}/doctors`).subscribe(
      (data) => {
        this.doctors = data.map(doctor => ({
          label: `${doctor.firstName} ${doctor.lastName}`,
          value: doctor.id
        }));
      },
      (error) => {
        console.error('Error loading doctors', error);
        // Sample doctors for demonstration
        this.doctors = [
          { label: 'Dr. John Smith', value: '1' },
          { label: 'Dr. Sarah Johnson', value: '2' },
          { label: 'Dr. Michael Brown', value: '3' }
        ];
      }
    );
  }
  
  // Create sample data for demonstration
  createSampleData() {
    const samplePatients: Patient[] = [
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
        visits: [
          {
            id: 'v1',
            date: new Date(2024, 4, 1),
            doctorId: '1',
            doctorName: 'Dr. John Smith',
            reason: 'Annual checkup',
            diagnosis: 'Healthy'
          }
        ],
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
        visits: [
          {
            id: 'v2',
            date: new Date(2024, 3, 15),
            doctorId: '2',
            doctorName: 'Dr. Sarah Johnson',
            reason: 'Asthma follow-up',
            diagnosis: 'Stable condition'
          }
        ],
        createdAt: new Date(2023, 6, 10),
        image: 'patient-placeholder.svg'
      }
    ];
    
    this.patients.set(samplePatients);
  }

  // Patient search by CIN
  searchPatientByCin() {
    if (!this.searchCin || this.searchCin.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter a CIN number',
        life: 3000
      });
      return;
    }
    
    this.searchInProgress = true;
    this.noPatientFound = false;
    
    // Call the API endpoint with the CIN parameter
    this.http.get<Patient>(`${this.baseUrl}/patients/search?cin=${this.searchCin}`).subscribe(
      (data) => {
        if (data) {
          // Process the returned patient
          const processedPatient = this.processPatient(data);
          
          // Check if patient already exists in the list
          const index = this.findPatientByCin(this.searchCin);
          
          if (index !== -1) {
            // Update existing patient in the list
            const updatedPatients = [...this.patients()];
            updatedPatients[index] = processedPatient;
            this.patients.set(updatedPatients);
          } else {
            // Add to the patients list if it's not already there
            this.patients.update(patients => [...patients, processedPatient]);
          }
          
          // Select the patient in the table
          this.selectedPatients = [processedPatient];
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Patient found',
            life: 3000
          });
        } else {
          this.noPatientFound = true;
          this.messageService.add({
            severity: 'info',
            summary: 'Information',
            detail: 'No patient found with this CIN',
            life: 3000
          });
        }
        this.searchInProgress = false;
      },
      (error) => {
        console.error('Error searching for patient', error);
        this.searchInProgress = false;
        
        // For demonstration purposes, search locally
        const foundPatient = this.patients().find(p => p.cin?.toLowerCase() === this.searchCin.toLowerCase());
        
        if (foundPatient) {
          this.selectedPatients = [foundPatient];
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Patient found',
            life: 3000
          });
        } else {
          this.noPatientFound = true;
          this.messageService.add({
            severity: 'info',
            summary: 'Information',
            detail: 'No patient found with this CIN',
            life: 3000
          });
        }
      }
    );
  }

  // Helper method to find patient by CIN
  findPatientByCin(cin: string): number {
    return this.patients().findIndex(patient => 
      patient.cin?.toLowerCase() === cin.toLowerCase()
    );
  }

  // Utility methods
  processPatient(patient: Patient): Patient {
    const processedPatient = { ...patient };
    
    // Calculate full name
    if (patient.firstName && patient.lastName) {
      processedPatient.fullName = `${patient.firstName} ${patient.lastName}`;
    }
    
    // Calculate age
    if (patient.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(patient.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      processedPatient.age = age;
      
      // Update isMinor status
      processedPatient.isMinor = age < 18;
    }
    
    // Initialize arrays if not present
    if (!processedPatient.allergies) processedPatient.allergies = [];
    if (!processedPatient.chronicConditions) processedPatient.chronicConditions = [];
    if (!processedPatient.emergencyContacts) processedPatient.emergencyContacts = [];
    if (!processedPatient.visits) processedPatient.visits = [];
    
    return processedPatient;
  }

  formatEnum(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  getAge(dateOfBirth?: Date): number {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // Add this method for the PatientStatus type issue
  getStatusString(status: PatientStatus | undefined): string {
    return status ? status.toString() : '';
  }

  // UI event handlers
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Updated openNew method
  openNew() {
    this.patient = {
      status: PatientStatus.ACTIVE,
      allergies: [],
      chronicConditions: [],
      emergencyContacts: [],
      visits: [],
      dateOfBirth: new Date(),
      hasInsurance: false,
      isMinor: false
    };
    this.submitted = false;
    this.patientDialog = true;
    this.dialogMode = 'add';
    this.activeTabIndex = 0;
  }

  editItem(patient: Patient) {
    this.patient = { ...patient };
    
    // Ensure date is a Date object
    if (this.patient.dateOfBirth && typeof this.patient.dateOfBirth === 'string') {
      this.patient.dateOfBirth = new Date(this.patient.dateOfBirth);
    }
    
    this.patientDialog = true;
    this.dialogMode = 'edit';
    this.activeTabIndex = 0;
  }

  // Added View Details functionality
  viewPatientDetails(patient: Patient) {
    this.patient = { ...patient };
    
    // Ensure date is a Date object
    if (this.patient.dateOfBirth && typeof this.patient.dateOfBirth === 'string') {
      this.patient.dateOfBirth = new Date(this.patient.dateOfBirth);
    }
    
    this.patientDialog = true;
    this.dialogMode = 'view';
    this.activeTabIndex = 0;
  }

  // Added method to switch from view to edit mode
  switchToEditMode() {
    this.dialogMode = 'edit';
  }

  deleteItem(patient: Patient) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + patient.fullName + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Call API to delete patient
        this.http.delete(`${this.baseUrl}/patients/${patient.id}`).subscribe(
          () => {
            this.patients.set(this.patients().filter((val) => val.id !== patient.id));
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Patient Deleted',
              life: 3000
            });
          },
          (error) => {
            console.error('Error deleting patient', error);
            
            // For demonstration, delete from local array
            this.patients.set(this.patients().filter((val) => val.id !== patient.id));
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Patient Deleted',
              life: 3000
            });
          }
        );
      }
    });
  }

  deleteSelectedItems() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected patients?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (!this.selectedPatients || this.selectedPatients.length === 0) return;
        
        // Get IDs of selected patients
        const ids = this.selectedPatients.map(patient => patient.id);
        
        // Call API to delete multiple patients
        this.http.post(`${this.baseUrl}/patients/delete-multiple`, { ids }).subscribe(
          () => {
            this.patients.set(this.patients().filter((val) => !this.selectedPatients?.includes(val)));
            this.selectedPatients = null;
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Patients Deleted',
              life: 3000
            });
          },
          (error) => {
            console.error('Error deleting patients', error);
            
            // For demonstration, delete from local array
            this.patients.set(this.patients().filter((val) => !this.selectedPatients?.includes(val)));
            this.selectedPatients = null;
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Patients Deleted',
              life: 3000
            });
          }
        );
      }
    });
  }

  saveItem() {
    this.submitted = true;
    
    // Validate required fields
    if (!this.patient.firstName || !this.patient.lastName || !this.patient.dateOfBirth) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields',
        life: 3000
      });
      return;
    }
    
    // Process patient data
    this.patient = this.processPatient(this.patient);
    
    if (this.patient.id) {
      // Update existing patient
      this.http.put<Patient>(`${this.baseUrl}/patients/${this.patient.id}`, this.patient).subscribe(
        (response) => {
          const updatedPatient = this.processPatient(response);
          const index = this.findIndexById(this.patient.id!);
          
          if (index !== -1) {
            const updatedPatients = [...this.patients()];
            updatedPatients[index] = updatedPatient;
            this.patients.set(updatedPatients);
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Patient Updated',
            life: 3000
          });
          this.patientDialog = false;
        },
        (error) => {
          console.error('Error updating patient', error);
          
          // For demonstration, update locally
          const index = this.findIndexById(this.patient.id!);
          
          if (index !== -1) {
            const updatedPatients = [...this.patients()];
            updatedPatients[index] = this.patient;
            this.patients.set(updatedPatients);
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Patient Updated',
            life: 3000
          });
          this.patientDialog = false;
        }
      );
    } else {
      // Create new patient
      this.patient.id = this.createId();
      this.patient.createdAt = new Date();
      this.patient.image = 'patient-placeholder.svg';
      
      this.http.post<Patient>(`${this.baseUrl}/patients`, this.patient).subscribe(
        (response) => {
          const newPatient = this.processPatient(response);
          this.patients.update(patients => [...patients, newPatient]);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Patient Created',
            life: 3000
          });
          this.patientDialog = false;
        },
        (error) => {
          console.error('Error creating patient', error);
          
          // For demonstration, add locally
          this.patients.update(patients => [...patients, this.patient]);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Patient Created',
            life: 3000
          });
          this.patientDialog = false;
        }
      );
    }
  }

  hideDialog() {
    this.patientDialog = false;
    this.submitted = false;
    this.newAllergy = '';
    this.newChronicCondition = '';
    this.newEmergencyContact = { name: '', relationship: '', phoneNumber: '' };
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  getSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
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
      default:
        return 'secondary';
    }
  }

  // Helper methods for managing collections
  findIndexById(id: string): number {
    return this.patients().findIndex(patient => patient.id === id);
  }

  createId(): string {
    // Generate a UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Emergency contact management
  addEmergencyContact() {
    if (!this.patient.emergencyContacts) {
      this.patient.emergencyContacts = [];
    }
    
    if (this.newEmergencyContact.name && this.newEmergencyContact.phoneNumber) {
      this.patient.emergencyContacts.push({...this.newEmergencyContact});
      this.newEmergencyContact = { name: '', relationship: '', phoneNumber: '' };
    }
  }

  removeEmergencyContact(index: number) {
    if (this.patient.emergencyContacts) {
      this.patient.emergencyContacts.splice(index, 1);
    }
  }

  // Allergies management
  addAllergy() {
    if (!this.patient.allergies) {
      this.patient.allergies = [];
    }
    
    if (this.newAllergy && !this.patient.allergies.includes(this.newAllergy)) {
      this.patient.allergies.push(this.newAllergy);
      this.newAllergy = '';
    }
  }

  removeAllergy(allergy: string) {
    if (this.patient.allergies) {
      const index = this.patient.allergies.indexOf(allergy);
      if (index !== -1) {
        this.patient.allergies.splice(index, 1);
      }
    }
  }

  // Chronic conditions management
  addChronicCondition() {
    if (!this.patient.chronicConditions) {
      this.patient.chronicConditions = [];
    }
    
    if (this.newChronicCondition && !this.patient.chronicConditions.includes(this.newChronicCondition)) {
      this.patient.chronicConditions.push(this.newChronicCondition);
      this.newChronicCondition = '';
    }
  }

  removeChronicCondition(condition: string) {
    if (this.patient.chronicConditions) {
      const index = this.patient.chronicConditions.indexOf(condition);
      if (index !== -1) {
        this.patient.chronicConditions.splice(index, 1);
      }
    }
  }

  // CIN Card Scanner Methods
  openCinScanner() {
    this.scannerDialog = true;
    this.scanningInProgress = false;
    this.scanningComplete = false;
  }

  startScanning() {
    this.scanningInProgress = true;
    
    // Simulate scanning process
    setTimeout(() => {
      // In a real app, this would call a service to handle the camera and OCR
      const mockedCinData = {
        cin: 'AB123456',
        firstName: 'Mohammed',
        lastName: 'El Amrani',
        dateOfBirth: new Date(1990, 5, 15),
        address: '123 Avenue Hassan II',
        city: 'Casablanca'
      };
      
      // Update patient object with scanned data
      this.patient.cin = mockedCinData.cin;
      this.patient.firstName = mockedCinData.firstName;
      this.patient.lastName = mockedCinData.lastName;
      this.patient.dateOfBirth = mockedCinData.dateOfBirth;
      this.patient.address = mockedCinData.address;
      this.patient.city = mockedCinData.city;
      
      this.scanningInProgress = false;
      this.scanningComplete = true;
      
      // Close the scanner dialog after a short delay
      setTimeout(() => {
        this.closeScannerDialog();
      }, 1500);
    }, 2000);
  }

  closeScannerDialog() {
    this.scannerDialog = false;
  }
}