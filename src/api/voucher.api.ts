import axios from 'axios';
import { VOUCHER_API } from 'api';
import { ResType, VoucherType } from 'types';

class VoucherService {
  get(params = '') {
    return axios.get<ResType>(`${VOUCHER_API}?${params}`);
  }
  create(voucher: VoucherType) {
    return axios.post<VoucherType>(`${VOUCHER_API}`, voucher);
  }
  update(voucher: VoucherType) {
    return axios.patch<VoucherType>(`${VOUCHER_API}/${voucher.id}`, voucher);
  }
  delete(id: string) {
    return axios.delete<VoucherType>(`${VOUCHER_API}/${id}`);
  }
}

const voucherService = new VoucherService();
export default voucherService;
