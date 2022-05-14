import { FoodOrderStatus } from 'types/common';
import { DriverType } from 'types/driver';
import { DeliveryProgress } from 'types/parcel';
export interface FoodOrderType {
  orderId: string;
  orderCode: string;
  customerId: string;
  scheduleStartTime?: string;
  deliveryId?: string;
  createdAt: string;
  acceptedAt?: string;
  preparedAt?: string;
  pickedAt?: string;
  deliveredAt?: string;
  canceledAt?: string;
  cancelReason?: string;
  dropOff: string;
  pickupOnly: boolean;
  withCutlery: boolean;
  tip: number;
  distance: number;
  deliveryFee: number;
  commission: number;
  goodsFee: number;
  totalCharge: number;
  subtotal: number;
  voucherCode?: string;
  discount: number;
  status: FoodOrderStatus;
  delivery?: Delivery;
  orderItems: OrderItems[];
}

interface Fee {
  total: number;
  deliveryFee: number;
  otherFee: number;
  amountToBeCollected: number;
  amountToBeRemitted: number;
  detail: Detail[];
}

interface Detail {
  particular: string;
  amount: number;
  type: `${Type}`;
}

export enum Type {
  AmountToBeCollected = 'amount_to_be_collected',
  AmountToBeRemitted = 'amount_to_be_remitted',
  DeliveryFee = 'delivery_fee',
  OtherFee = 'other_fee',
}

interface Pickup {
  locationAddress: string;
  location: PickupLocation;
  contactName?: string;
  contactPhone?: string;
  pickedAt?: string;
}

interface PickupLocation {
  lat: number;
  lng: number;
  hash: string;
}

interface Stop {
  location: StopLocation;
  deliveryId: string;
  sequenceNo: number;
  contactPhone?: string;
  contactName: string;
  itemCategory?: string;
  deliveryInstruction?: string;
  locationAddress?: string;
  proofImage?: string;
  skipReason?: string;
  skipOtherReason?: string;
  createdAt: string;
  deliveredAt?: string;
}

interface StopLocation {
  lat: number;
  lng: number;
  address: string;
}

interface Delivery {
  deliveryId: string;
  vehicleType: string;
  referenceNumber: string;
  orderCode: string;
  driver: DriverType;
  itemDescription: string;
  notes: string;
  cancelledAt?: string;
  visibleToDrivers: any[];
  deliveryType: string;
  scheduleStartTime?: string;
  deliveryStartTime?: string;
  distance: string;
  stopCount: number;
  createdAt: string;
  deliveryProgress: DeliveryProgress;
  additionalStopFee?: string;
  cancelReason?: string;
  status: string;
  pickup: Pickup;
  stops: Stop[];
  fee: Fee;
  thirdPartyDriver?: { contactName: string; contactNumber: string };
  feedback?: string;
  acceptedAt?: string;
  paymentMethod: string;
  driverGroups: Array<'all_of_the_above' | 'food_delivery_only'>;
  shareToken: string;
  trackingLink: string;
}

interface OrderItems {
  id: string;
  orderId: string;
  product: {
    id: string;
    name: string;
  };
  productId: string;
  basePrice: number;
  discount: number;
  unit: number;
  notes?: string;
  total: number;
  addons: Addon[];
}

export interface Addon {
  name?: string;
  option: string;
  price?: number;
}
