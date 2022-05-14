import axios from 'axios';
import { ADD_ON_API } from 'api';
import { ResType } from 'types';
import { AddonType } from 'types/addon';

class AddonService {
  get(params = '') {
    return axios.get<ResType>(`${ADD_ON_API}?${params}`);
  }
  create(payload: AddonType) {
    return axios.post<AddonType>(`${ADD_ON_API}`, payload);
  }
  update(payload: AddonType) {
    return axios.patch<AddonType>(`${ADD_ON_API}/${payload.id}`, payload);
  }
  delete(id: string) {
    return axios.delete<AddonType>(`${ADD_ON_API}/${id}`);
  }
  getDetail(addonId: string) {
    return axios.get<ResType>(`${ADD_ON_API}/${addonId}`);
  }
}

const addonService = new AddonService();
export default addonService;
