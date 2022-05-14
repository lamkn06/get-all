import { OperationStatus } from 'constants/index';
import { CategoryType } from 'types/category';

type OperationStatusType = typeof OperationStatus[number]['value'];

export interface RestaurantType {
  id?: string;
  categoryId: string;
  category?: CategoryType;
  name: string;
  brandName: string;
  openHour?: string;
  restaurantCategories: any;
  closeHour?: string;
  openDay?: number[];
  operationStatus: OperationStatusType;
  bannerImage?: string;
  location: Location;
  address: string;
  status: string;
  contactName?: string;
  contactNumber?: string;
  prepareTime?: number;
  approxPriceForTwo?: number;
  landMark?: string;
  minPriceOrder?: number;
}

interface Location {
  lat: number;
  lng: number;
}
