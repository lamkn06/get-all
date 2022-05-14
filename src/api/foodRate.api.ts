import { FOOD_RATE_API } from 'api';
import axios from 'axios';
import { ResType } from 'types';
import { RateType } from 'types/rate';

class FoodRateService {
  getList(params: string) {
    return axios.get<ResType>(`${FOOD_RATE_API}?${params}`);
  }
  getDetail(id: string) {
    return axios.get<ResType>(`${FOOD_RATE_API}?id=${id}`);
  }
  create(rate: RateType) {
    return axios.post<RateType>(`${FOOD_RATE_API}`, rate);
  }
  update(rate: RateType) {
    return axios.patch<RateType>(`${FOOD_RATE_API}/${rate.rateId}`, rate);
  }
}

const foodRateService = new FoodRateService();

export default foodRateService;
