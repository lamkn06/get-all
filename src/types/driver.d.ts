import { ApprovalStatusType, StatusType } from 'types/common';

export interface VehicleType {
  registeredPlateNumber: string;
  status: StatusType;
  vehicleId?: string;
  vehicleType: string;
}

export interface DriverType {
  userId: string;
  driverId: string;
  referralDriverId?: string;
  phoneNumber: string;
  email?: string;
  deliveryCluster?: string;
  deliveryCity?: string;
  deliveryArea?: string;
  licenseRestriction?: string;
  driverStatus: StatusType;
  status: StatusType;
  driverProfile: DriverProfile;
  approvalNote?: string;
  approvalStatus?: ApprovalStatusType;
  vehicles: VehicleType[];
  driverDocuments: DriverDocuments[];
  isBusy?: boolean;
}

export interface DriverProfile {
  picture: string;
  address?: string;
  city?: string;
  province?: string;
  driverGroup?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  location: Location;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface DriverDocuments {
  docId: number;
  driverId: string;
  docType: string;
  filePath: string;
  fileKey: string;
  createdAt: Date;
  updatedAt: Date;
}
