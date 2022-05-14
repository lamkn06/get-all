import { PaymentMethod, DiscountTypes } from 'constants/index';
import { CustomerType } from 'types';

export type PaymentMethodType = typeof PaymentMethod[number]['value'];
export type DiscountType = typeof DiscountTypes[number]['value'];
export const VoucherStatus = ['active', 'pending', 'expired'] as const;

export interface VoucherType {
  id?: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountAmount: number;
  effectiveDate?: string;
  expiryDate?: string;
  limitPerCustomer?: number;
  limitNumberOfVoucher?: number;
  numberOfUsed?: number;
  vehicleType?: string;
  paymentMethod?: PaymentMethodType;
  visibleTimeStart?: string;
  visibleTimeEnd?: string;
  status?: typeof VoucherStatus[number];
  // FE: Field
  customers?: Array<CustomerType>;
  customerIds?: Array<number>;
  maxDiscount?: number;
}
