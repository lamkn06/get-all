import { UserType } from 'types';

export interface FoodRateType {
  rateId: string;
  createdByUserId: string;
  name: string;
  description: string;
  isDefault: boolean;
  base: number;
  perKm: number;
  longDistanceCharge: number;
  longDistanceStartFrom: number;
  amountShortDistanceCharge: number;
  commission: number;
  user?: UserType;
}
