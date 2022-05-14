import { FoodOrderStatus, OrderProgressType } from 'types/common';
import { CustomerType } from 'types/customer';
import { DriverType } from 'types/driver';
import { UserType } from 'types/user';

export interface ParcelType {
  deliveryId: string;
  vehicleType: string;
  referenceNumber: string;
  driver?: DriverType;
  visibleToDrivers: string[];
  deliveryType: string;
  scheduleStartTime?: Date;
  deliveryStartTime?: Date;
  distance: string;
  stopCount: number;
  createdAt: string;
  deliveryProgress?: DeliveryProgress;
  cancelReason?: string;
  cancelledAt?: Date;
  status: OrderProgressType | FoodOrderStatus;
  pickUp: PickUp;
  pickup?: PickUp;
  stops: Stop[];
  fee: Fee;
  order?: Order;
  deliveryStatusHistories?: DeliveryStatusHistory[];
  thirdPartyDriver?: ThirdPartyDriver;
  customer?: CustomerType;
}

interface ThirdPartyDriver {
  contactName: string;
  contactNumber: string;
}

interface DeliveryStatusHistory {
  id?: string;
  deliveryId?: string;
  status: OrderProgressType;
  createdByObjectId?: string;
  createdByObjectType: 'user' | 'driver' | 'customer';
  contactName?: string;
  contactPhone?: string;
  createdAt?: string;
  driver?: Partial<DriverType>;
  user?: Partial<UserType>;
  customer?: Partial<CustomerType>;
  // The client field
  deliveredAt?: string;
}

interface Order {
  orderId?: string;
  orderCode: string;
  deliveryId: string;
  customerId: string;
  vehicleType: string;
  pickup: string;
  additionalStops: number;
  dropOff: string;
  orderType: string;
  createdAt: Date;
  status: string;
  insulatedBoxFee: number;
  premiumServiceFee: number;
  cashHandlingFee: number;
  additionalStopFee: number;
  afterHoursSurchargeFee: number;
  holidaySurchargeFee: number;
  waitingTimeFee: number;
  remittanceFee: number;
  queueingFee: number;
  overweightHandlingFee: number;
  purchaseServiceFee: number;
  tip: number;
  deliveryFee: number;
  totalCharge: number;
  commission: number;
  amountToBeCollected: string;
  paymentMethod: string;
  billTo?: string;
  paymentDetails: string;
  itemDescription: string;
  notes: string;
  canceledAt: Date;
  cancelReason: string;
  voucherCode?: string;
  discountAmount: number;
  originTotal: number;
  customerToken: string;
  referenceNumber?: string;
  helperFee: number;
  distance: string;
  scheduleStartTime?: string;
  acceptedAt?: string;
  arrivedAtPickupAt?: string;
  pickedUpAt?: string;
  arrivedAtDropOffAt?: string;
  deliveredAt?: string;
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
  type:
    | 'amount_to_be_collected'
    | 'amount_to_be_remitted'
    | 'delivery_fee'
    | 'other_fee';
}

interface PickUp {
  location: Location;
  contactPhone: string;
  contactName: string;
  locationAddress: string;
  createdAt: Date;
  pickedAt: Date;
}

interface Location {
  address?: string;
  lat: number;
  lng: number;
}

export interface Stop {
  location: Location;
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

interface DeliveryProgress {
  type: 'PICK_UP' | 'DROP_OFF';
  action: 'ARRIVED' | 'COMPLETED';
  sequenceNo: number;
}
