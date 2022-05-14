import { UploadFile } from 'antd/lib/upload/interface';
import { CustomerTypes } from 'constants/index';
import { BillingType } from 'types';

type Type = typeof CustomerTypes[number]['value'];

export interface CustomerType {
  id?: number;
  userId: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  middleName: string;
  profileImage?: string | UploadFile;
  billings?: Array<BillingType>;
  address: string;
  email: string;
  facebookUserId: string;
  googleUserId: string;
  status: string;
  type: Type;
  createdAt: Date;
  updatedAt: Date;
  updatedProfileAt: Date;
}
