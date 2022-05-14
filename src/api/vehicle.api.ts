import { VEHICLES_API } from 'api';
import axios from 'axios';
import { ResType } from 'types';
import { VehicleType } from 'types/driver';

class VehicleService {
  updateVehicle(vehicle: VehicleType) {
    return axios.patch<ResType>(
      `${VEHICLES_API}/${vehicle.vehicleId}`,
      vehicle,
    );
  }

  deleteVehicle(vehicleId: string) {
    return axios.delete<ResType>(`${VEHICLES_API}/${vehicleId}`);
  }
}
const vehicleService = new VehicleService();
export default vehicleService;
