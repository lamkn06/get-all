export interface ProductType {
  id: string;
  name: string;
  image: string;

  description: string;
  restaurantId: string;
  productCategories: any;
  productCategoryId: string;

  basePrice: number;
  discount: number;
  active: boolean;
  unit: number;
  soldUnit: number;
  isRecommended: boolean;
  isPopular: boolean;
  isNew: boolean;
  isVeg: boolean;

  addons: {
    id: string;
    name: string;
  }[];
}
