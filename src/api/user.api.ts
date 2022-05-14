import { USER_API } from 'api';
import axios from 'axios';
import { ResType, RoleType, UserType } from 'types';

class UserService {
  getList(params: string) {
    return axios.get<ResType>(`${USER_API}?${params}`);
  }

  createUser(user: UserType) {
    return axios.post<ResType>(`${USER_API}`, user);
  }

  updateUser(user: UserType) {
    return axios.patch<ResType>(`${USER_API}/${user.id}`, user);
  }

  deleteUser(id: string) {
    return axios.delete<ResType>(`${USER_API}/${id}`);
  }

  changePwd(userId: string) {
    return axios.post<ResType>(`${USER_API}/${userId}/change-pw`);
  }

  getRoles() {
    return axios.get<RoleType[]>(`${USER_API}/roles`);
  }

  findByUserId(userId: string) {
    return axios.get<UserType>(`${USER_API}/find-by-user-id/${userId}`);
  }
}
const userService = new UserService();
export default userService;
