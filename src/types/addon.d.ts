export interface AddonType {
  id: string;
  name: string;
  description: string;
  type: 'single' | 'multiple';
  restaurantId: string;
  options: {
    name: string;
    price: number;
  };
}
