import axios from 'axios';
import { DELIVERY_API } from 'api';
import { ParcelType, ResType } from 'types';

interface AssignBody {
  deliveryId: string;
  reason?: string;
  cancelReason?: string;
  driverId: string;
  contactName?: string;
  contactNumber?: string;
}

interface ParcelResType extends Omit<ResType, 'results'> {
  results: ParcelType[];
}
class DeliveryService {
  reAssign({ deliveryId, ...body }: AssignBody) {
    return axios.post<ParcelType>(
      `${DELIVERY_API}/${deliveryId}/re-assign`,
      body,
    );
  }

  assign({ deliveryId, ...body }: AssignBody) {
    return axios.put<ParcelType>(`${DELIVERY_API}/${deliveryId}/assign`, body);
  }

  nextStatus(deliveryId: string) {
    return axios.put<ParcelType>(`${DELIVERY_API}/${deliveryId}/next-status`);
  }

  getList(params: string) {
    return axios.get<ResType>(`${DELIVERY_API}?${params}`);
  }

  getDetail(id: string) {
    return axios.get<ParcelResType>(`${DELIVERY_API}?id=${id}`);
  }

  update(parcel: ParcelType) {
    return axios.patch<ResType>(`${DELIVERY_API}/${parcel.deliveryId}`);
  }

  cancelOrder(deliveryId: string, cancelReason: string) {
    return axios.post<ResType>(`${DELIVERY_API}/${deliveryId}/cancel`, {
      cancelReason,
    });
  }
}

const deliveryService = new DeliveryService();

export default deliveryService;
