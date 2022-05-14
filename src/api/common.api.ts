import axios from 'axios';
import { UserType } from 'types';

class CommonService {
  me() {
    return axios.get<UserType>(`/me`);
  }

  changePassword() {
    return axios.post(`/me/change-pw`);
  }
}
const commonService = new CommonService();
export default commonService;
