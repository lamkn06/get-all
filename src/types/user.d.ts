import { RoleType } from 'types';

export type StatusType = 'Active' | 'Pending';

export interface UserType {
  employeeNumber: number;
  id?: string;
  idToken?: string;
  firstName: string;
  accessStatus: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: number;
  createdBy?: string;
  createdByUser?: {
    email: string;
  };
  email: string;
  role: RoleType;
  status: StatusType;
  userId: string;
}
