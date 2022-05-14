import { RATE_API } from 'api';
import axios from 'axios';
import { CustomerType, ResType } from 'types';
import { RateCustomerType, RateFareType, RateType } from 'types/rate';

class RateService {
  getList(params: string) {
    return axios.get<ResType>(`${RATE_API}?${params}`);
  }
  getDetail(id: string) {
    return axios.get<ResType>(`${RATE_API}?id=${id}`);
  }
  create(rate: RateType) {
    return axios.post<RateType>(`${RATE_API}`, rate);
  }
  update(rate: RateType) {
    return axios.patch<RateType>(`${RATE_API}/${rate.rateId}`, rate);
  }
  updateFare(fare: RateFareType) {
    return axios.patch<ResType>(
      `${RATE_API}/${fare.rateId}/fare/${fare.vehicleType}`,
      fare,
    );
  }
  getCustomers(rateId: string) {
    return axios.get<RateCustomerType[]>(`${RATE_API}/${rateId}/customers`);
  }
  updateCustomers(rateId: string, customerIds: number[]) {
    return axios.post<RateCustomerType[]>(`${RATE_API}/${rateId}/customers`, {
      customerIds,
    });
  }
  deleteCustomers(rateId: string, customerIds: number[]) {
    return axios.delete<CustomerType[]>(`${RATE_API}/${rateId}/customers`, {
      data: { customerIds },
    });
  }
}

const rateService = new RateService();

export default rateService;
