import { BILLING_API } from 'api';
import axios from 'axios';
import { BillingType, ResType } from 'types';

class BillingService {
  getList(params: string) {
    return axios.get<ResType>(`${BILLING_API}?${params}`);
  }

  create(billing: BillingType) {
    return axios.post<BillingType>(BILLING_API, billing);
  }

  update(billing: BillingType) {
    return axios.put<BillingType>(`${BILLING_API}/${billing.id}`, billing);
  }

  delete(id: number) {
    return axios.delete(`${BILLING_API}/${id}`);
  }
}

const billingService = new BillingService();
export default billingService;
