import { UserType } from 'types';

export interface RateType {
  name: string;
  rateId?: string;

  isActive?: boolean;
  isDefault?: boolean;
  active?: boolean;

  rateFares?: RateFareType[];
  createdByUserId?: string;

  user?: UserType;

  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RateFareType {
  id: string;
  rateId: string;
  vehicleType: string;
  baseFee: number;
  standardPricePerKM: number;
  commission: number;
  premiumServiceFee: number;
  cashHandlingFee: number;
  additionalStopFee: number;
  afterHoursSurchargeFee: number;
  holidaySurchargeFee: number;
  remittanceFee: number;
  queueingFee: number;
  overweightHandlingFee: number;
  purchaseServiceFee: number;
  discount: number;
  discountType: string;
  insulatedBox: string;
  createdAt: Date;
  updatedAt: Date;
  helperFee: {
    perStop: number;
    min: number;
    max: number;
  };
}

export interface RateCustomerType {
  id?: string;
  rateId: string;
  customerId: number;
  createdByUserId: string;
  createdAt: Date;
}
