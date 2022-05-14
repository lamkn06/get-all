import { DriverProfile } from 'types/driver';

export interface AccreditationsType {
  email: string;
  deliveryCluster: string;
  deliveryCity: string;
  deliveryArea: string;
  driverBackground: string;
  taxRegistrationNumber: string;
  licenseRestriction: string;
  driverLicence: DriverLicence;
  emergencyContact: EmergencyContact;
  vehicles: Vehicle[];
  address: string;
  phoneNumber?: string;
  driverProfile: DriverProfile;
  city: string;
  province: string;
  dayOfBirth: string;
  driverGroup: string;
  firstName: string;
  lastName: string;
  middleName: string;
  picture: string;
}

interface DriverLicence {
  type: string;
  number: string;
}

interface EmergencyContact {
  name: string;
  contactPhone: string;
  relationship: string;
}

interface Vehicle {
  vehicleType: string;
  vehicleModel: string;
  registeredPlateNumber: string;
}
