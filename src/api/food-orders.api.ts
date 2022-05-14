import axios from 'axios';
import { FOOD_ORDERS } from 'api';
import { FoodOrderStatus, FoodOrderType, ResType } from 'types';

interface FoodOrderResType extends Omit<ResType, 'results'> {
  results: FoodOrderType[];
}

class FoodOrdersService {
  getFoodOrder(params = '') {
    return axios.get<FoodOrderResType>(`${FOOD_ORDERS}?${params}`);
  }
  changeStatus({
    orderId,
    newStatus,
  }: {
    orderId: string;
    newStatus: FoodOrderStatus;
  }) {
    return axios.put<FoodOrderResType>(
      `${FOOD_ORDERS}/${orderId}/change-status`,
      {
        newStatus,
      },
    );
  }
}

const foodOrdersService = new FoodOrdersService();
export default foodOrdersService;
