export enum PATHS {
  Home = '/',

  UserManagement = '/user-management',
  RoleManagement = '/role-management',

  ParcelManagement = '/parcel-management',
  ParcelTransactions = '/parcel-management/list',
  ParcelDetail = '/parcel-management/list/:id',

  DriverManagement = '/driver-management',
  ListDriver = '/driver-management/list',
  ListPendingDriver = '/driver-management/pending',

  CorpAccManagement = '/corp-acc-management',
  ServiceArea = '/corp-acc-management/service-area',

  RateManagement = '/rate-management',
  ExpressRateManagement = '/rate-management/express-list',
  FoodRateManagement = '/rate-management/food-list',
  RateDetail = '/rate-management/:id',

  CampaignManagement = '/campaign-management',
  CampaignDetail = '/campaign-management/:key',

  VoucherManagement = '/voucher-management',

  RestaurantManagement = '/restaurant-management',
  RestaurantDetail = '/restaurant-management/:id',
  Categories = '/categories',
  RestaurantCategories = '/restaurant-categories',
  ProductCategories = '/product-categories',

  CustomerManagement = '/customer-management',

  BillingManagement = '/billing-management',

  // Unauthorized
  Login = '/login',
  Accreditation = '/driver-accreditation/:code',
}
