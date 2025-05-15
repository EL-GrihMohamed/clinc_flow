export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
  }
  
  export enum PatientStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
    DISCHARGED = 'DISCHARGED',
    CRITICAL = "CRITICAL"
  }
  
  export enum BloodGroup {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-'
  }
  
  export interface EmergencyContact {
    name: string;
    relationship: string;
    phoneNumber: string;
  }
  
  export interface Visit {
    id?: string;
    date: Date;
    doctorId: string;
    doctorName: string;
    reason: string;
    diagnosis?: string;
    notes?: string;
  }
  
  export interface Patient {
    // Basic Information
    id?: string;
    ipp?: string;
    cin?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string; // Computed property
    
    // Contact Information
    phoneNumber?: string;
    address?: string;
    city?: string;
    
    // Personal Information
    dateOfBirth?: Date;
    age?: number; // Computed property
    gender?: Gender;
    
    // Medical Information
    bloodGroup?: BloodGroup;
    allergies?: string[];
    chronicConditions?: string[];
    status?: PatientStatus;
    
    // Insurance Information
    hasInsurance?: boolean;
    insuranceName?: string;
    insuranceNumber?: string;
    
    // Related People
    isMinor?: boolean;
    referringDoctorId?: string;
    referringDoctor?: string; // Name
    assignedDoctorId?: string;
    assignedDoctor?: string; // Name
    companionId?: string;
    companionName?: string;
    companionGuid?: number; // Kept from old model
    emergencyContacts?: EmergencyContact[];
    
    // Visit History
    visits?: Visit[];
    
    // System Fields
    qrCode?: string;
    createdAt?: Date;
    updatedAt?: Date;
    image?: string;
  }