import axios from 'axios';
import { RESTAURANT_API } from 'api';
import { FoodOrderType, RestaurantType, ResType } from 'types';

interface RestaurantResType extends Omit<ResType, 'results'> {
  results: RestaurantType[];
}

interface FoodOrderResType extends Omit<ResType, 'results'> {
  results: FoodOrderType[];
}
class RestaurantService {
  get(params = '') {
    return axios.get<RestaurantResType>(`${RESTAURANT_API}?${params}`);
  }
  getDetail(id: string) {
    return axios.get<RestaurantResType>(`${RESTAURANT_API}?id=${id}`);
  }
  create(restaurant: RestaurantType) {
    return axios.post<RestaurantType>(`${RESTAURANT_API}`, restaurant);
  }
  update(restaurant: RestaurantType) {
    return axios.patch<RestaurantType>(
      `${RESTAURANT_API}/${restaurant.id}`,
      restaurant,
    );
  }
  delete(id: string) {
    return axios.delete<RestaurantType>(`${RESTAURANT_API}/${id}`);
  }
  uploadBanner(id: string, data: FormData) {
    return axios.post<RestaurantType>(
      `${RESTAURANT_API}/${id}/banner-image`,
      data,
    );
  }
}

const restaurantService = new RestaurantService();
export default restaurantService;
