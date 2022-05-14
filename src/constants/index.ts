export const test = '';

export const PRICE_UNIT = '₱';

export const DATE_FORMAT = 'YYYY-MM-DD';

export const GG_MAP_LIBS = ['drawing', 'places'];

export const VehicleTypes = [
  {
    label: 'Motorcycle',
    value: 'motorcycle',
  },
  {
    label: 'MPV600',
    value: 'mpv600',
  },
  {
    label: 'MPV300',
    value: 'mpv300',
  },
  {
    label: 'MPV200',
    value: 'mpv200',
  },
  {
    label: 'LT1000',
    value: 'lt1000',
  },
];

export const DriverGroup = [
  { name: 'Parcel and Grocery Delivery', value: 'parcel_and_grocery_delivery' },
  { name: 'Food Delivery Only', value: 'food_delivery_only' },
  { name: 'Bulky Orders Only', value: 'bulky_orders_only' },
  { name: 'All of the Above', value: 'all_of_the_above' },
];

export const DriverLicenceType = [
  { name: 'Professional', value: 'professional' },
  { name: 'Non Professional', value: 'non_professional' },
];

export const CancelReasons = [
  {
    value: 'No rider Found',
    label: 'No rider Found',
  },
  {
    value: 'Customer Change of Mind',
    label: 'Customer Change of Mind',
  },
  {
    value: 'Delivery fee is high',
    label: 'Delivery fee is high',
  },
  {
    value: 'Change pick-up location',
    label: 'Change pick-up location',
  },
  {
    value: 'Change drop off location',
    label: 'Change drop off location',
  },
  {
    value: 'Double order',
    label: 'Double order',
  },
  {
    value: 'Service is no longer required',
    label: 'Service is no longer required',
  },
  {
    value: 'Other',
    label: 'Others: Please specify',
  },
];

export const FailedDeliveryReasons = [
  {
    value: 'Item is not available during',
    label: 'Item is not available during',
  },
  {
    value: 'Customer is not available',
    label: 'Customer is not available',
  },
  {
    value: 'Incorrect address',
    label: 'Incorrect address',
  },
  {
    value: 'Customer cannot pay',
    label: 'Customer cannot pay',
  },
  {
    value: 'Wrong Item delivered',
    label: 'Wrong Item delivered',
  },
  {
    value: 'Damaged item during delivery',
    label: 'Damaged item during delivery',
  },
  {
    value: 'Other',
    label: 'Others: Please specify',
  },
];

export const PhoneNumberPrefix = '+63';

export const DiscountTypes = [
  {
    value: 'percentage',
    label: 'Percentage',
  },
  {
    value: 'fixed',
    label: 'Fixed',
  },
] as const;

export const CustomerTypes = [
  {
    value: 'merchant',
    label: 'Merchant',
  },
  {
    value: 'cooperate',
    label: 'Cooperate',
  },
  {
    value: 'individual',
    label: 'Individual',
  },
  {
    value: 'sales',
    label: 'Sales',
  },
  {
    value: 'admin',
    label: 'Admin',
  },
] as const;

export const PermissionsTypes = [
  {
    value: 'canList',
    label: 'Can List',
  },
  {
    value: 'canDelete',
    label: 'Can Delete',
  },
  {
    value: 'canCreate',
    label: 'Can Create',
  },
  {
    value: 'canEdit',
    label: 'Can Edit',
  },
  {
    value: 'canArchive',
    label: 'Can Archive',
  },
];

export const OperationStatus = [
  {
    label: 'Open',
    value: 'open',
  },
  {
    label: 'Closed',
    value: 'closed',
  },
  {
    label: 'Pick Only',
    value: 'pick_only',
  },
  {
    label: 'Busy',
    value: 'busy',
  },
] as const;

export const AccessActions = [
  'canArchive',
  'canCreate',
  'canDelete',
  'canEdit',
  'canList',
];

export const PaymentMethod = [
  { label: 'All Easy', value: 'all_easy' },
  { label: 'Cash on delivery', value: 'cash_on_delivery' },
  {
    label: 'Paynamics card',
    value: 'paynamics_card',
  },
  {
    label: 'Alleasy on deliver',
    value: 'alleasy_on_delivery',
  },
  {
    label: 'Reward points',
    value: 'reward_points',
  },
] as const;

export enum MODULES {
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_SERVICEABLE_AREAS = 'manage_serviceable_areas',
  MANAGE_CALENDAR = 'manage_calendar',
  MANAGE_DRIVERS = 'manage_drivers',
  MANAGE_PARCEL_DELIVERIES = 'manage_parcel_deliveries',
  MANAGE_VOUCHERS = 'manage_vouchers',
  MANAGE_RATE_CARDS = 'manage_rate_cards',
  MANAGE_NOTIFICATIONS = 'manage_notifications',
  MANAGE_RESTAURANTS = 'manage_restaurants',
  MANAGE_CAMPAIGNS = 'manage_campaigns',
  MANAGE_CUSTOMERS = 'manage_customers',
  MANAGE_BILLING = 'manage_billing',
}
