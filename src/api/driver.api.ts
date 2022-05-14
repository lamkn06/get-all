import axios from 'axios';
import { ACCREDITATIONS, DRIVER_API } from 'api';
import { DriverType, ResType } from 'types';
import { AccreditationsType } from 'types/accreditations';
import { VehicleType } from 'types/driver';

class DriverService {
  getList(params: string) {
    return axios.get<ResType>(`${DRIVER_API}?${params}`);
  }

  addVehicle(driverId: string, vehicle: VehicleType) {
    return axios.patch<VehicleType>(
      `${DRIVER_API}/${driverId}/vehicles`,
      vehicle,
    );
  }

  approve(driver: DriverType) {
    return axios.put<DriverType>(`${DRIVER_API}/${driver.driverId}/approve`);
  }

  pending(driverId: string, message: string) {
    return axios.put<DriverType>(`${DRIVER_API}/${driverId}/pending`, {
      message,
    });
  }

  reject(driverId: string, reasons: string[]) {
    return axios.put<DriverType>(`${DRIVER_API}/${driverId}/reject`, {
      reasons,
    });
  }

  create(driver: DriverType) {
    return axios.post<DriverType>(DRIVER_API, driver);
  }

  update(driver: DriverType) {
    return axios.patch<DriverType>(`${DRIVER_API}/${driver.driverId}`, driver);
  }

  delete(id: string) {
    return axios.delete(`${DRIVER_API}/${id}`);
  }

  updateProfileImage(id: string, formData: FormData) {
    return axios.post<ResType>(`${DRIVER_API}/${id}/profile-image`, formData);
  }

  findById(id: string) {
    return axios.get<DriverType>(`${DRIVER_API}/find-by-user-id/${id}`);
  }

  getAccreditations(code: string) {
    return axios.get<AccreditationsType>(`${ACCREDITATIONS}/${code}`);
  }

  updateAccreditations(code: string, driver: AccreditationsType) {
    return axios.patch<ResType>(`${ACCREDITATIONS}/${code}`, driver);
  }

  updateAccreditationsDocs(code: string, formData: FormData) {
    return axios.post<ResType>(`${ACCREDITATIONS}/${code}/docs`, formData);
  }
}

const driverService = new DriverService();

export default driverService;
