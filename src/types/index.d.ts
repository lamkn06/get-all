import { CampaignDetailManagementState } from 'pages/campaign-management/id/redux/slice';
import { CampaignManagementState } from 'pages/campaign-management/list/redux/slice';
import { DriverManagementState } from 'pages/driver-management/redux/slice';
import { ParcelManagementState } from 'pages/parcel-management/list/redux/slice';
import { RateDetailManagementState } from 'pages/rate-management/id/redux/slice';
import { RateManagementState } from 'pages/rate-management/list/redux/slice';
import { ProductManagementState } from 'pages/restaurant-management/redux/product';
import { RestaurantManagementState } from 'pages/restaurant-management/redux/restaurant';
import { RoleManagementState } from 'pages/role-management/redux/slice';
import { UserManagementState } from 'pages/user-management/redux/slice';
import { VoucherManagementState } from 'pages/voucher-management/redux/slice';
import { CustomerManagementState } from 'pages/customer-management/redux/slice';
import { AddonManagementState } from 'pages/restaurant-management/redux/addon';
import { BillingManagementState } from 'pages/billing-management/list/redux/slice';
import { Reducer, Store } from 'redux';
import { MasterState } from 'state/masterSlice';
import { ModuleState } from 'state/moduleSlice';
// State Type
import { UserState } from 'state/userSlice';
import { CustomerType } from './customer';
import { DriverType } from './driver';
import { LoginRequestType, LoginResponseType } from './login';
import { ParcelType } from './parcel';
import { RestaurantType } from './restaurant';
import { RoleType } from './role';
import { UserType } from './user';
import { VoucherType } from './voucher';
import { CategoryType } from './category';
import { BillingType } from './billings';
import { FoodOrderType } from './food-order';
import { FoodRateManagementState } from 'pages/food-rate-management/list/redux/slice';

export interface InjectedStore extends Store {
  injectedReducers: any;
}

export interface InjectReducerParams {
  key: keyof ApplicationRootState;
  reducer: Reducer<any, any>;
}

export interface ApplicationRootState {
  readonly user: UserState;
  readonly modules: ModuleState;
  readonly master: MasterState;

  readonly userManagement: UserManagementState;
  readonly roleManagement: RoleManagementState;

  readonly driverManagement: DriverManagementState;
  readonly parcelManagement: ParcelManagementState;

  readonly rateManagement: RateManagementState;
  readonly rateDetailManagement: RateDetailManagementState;
  readonly foodRateManagement: FoodRateManagementState;

  readonly voucherManagement: VoucherManagementState;

  readonly campaignManagement: CampaignManagementState;
  readonly campaignDetailManagement: CampaignDetailManagementState;

  readonly restaurantManagement: RestaurantManagementState;
  readonly productManagement: ProductManagementState;
  readonly addonManagement: AddonManagementState;
  readonly customerManagement: CustomerManagementState;

  readonly billingManagement: BillingManagementState;

  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
  // for testing purposes
  readonly test: any;
}
export * from './common';

export {
  DriverType,
  LoginRequestType,
  LoginResponseType,
  ParcelType,
  UserType,
  RoleType,
  CustomerType,
  VoucherType,
  RestaurantType,
  CategoryType,
  BillingType,
  FoodOrderType,
};

declare global {
  interface Window {
    window: any;
  }
}
