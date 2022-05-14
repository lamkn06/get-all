import axios from 'axios';
import { CUSTOMER_API } from 'api';
import { CustomerType, ResType } from 'types';

interface CustomerResType extends Omit<ResType, 'results'> {
  results: CustomerType[];
}

class CustomerService {
  getList(params: string = '') {
    return axios.get<CustomerResType>(`${CUSTOMER_API}?${params}`);
  }
  findById(id: string) {
    return axios.get<CustomerType>(`${CUSTOMER_API}/find-by-user-id/${id}`);
  }
  findByListIds(params: string = '') {
    return axios.get<CustomerType[]>(`${CUSTOMER_API}/find-by-ids?${params}`);
  }
  create(customer: CustomerType) {
    return axios.post(CUSTOMER_API, customer);
  }
  update(customerId: number, data: FormData) {
    return axios.patch<CustomerType>(`${CUSTOMER_API}/${customerId}`, data);
  }
  delete(id: any) {
    return axios.delete(`${CUSTOMER_API}/${id}`);
  }
  changePassword({
    id,
    ...body
  }: {
    id: number;
    newPassword: string;
    confirmPassword: string;
  }) {
    return axios.post(`${CUSTOMER_API}/${id}/change-pw`, body);
  }
}

const customerService = new CustomerService();

export default customerService;
