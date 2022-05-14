import { ROLE_API } from 'api';
import axios from 'axios';
import { ResType, RoleType } from 'types';
import { RoleAccessesRequest } from 'types/role';

class RoleService {
  getList(params = '') {
    return axios.get<ResType>(`${ROLE_API}?${params}`);
  }

  getDetail(id: string) {
    return axios.get<RoleType>(`${ROLE_API}/${id}`);
  }

  create(role: RoleType) {
    return axios.post<RoleType>(`${ROLE_API}`, role);
  }

  update(role: RoleType) {
    return axios.patch<RoleType>(`${ROLE_API}/${role.id}`, role);
  }

  delete(id: string) {
    return axios.delete<RoleType>(`${ROLE_API}/${id}`);
  }

  updatePermissions(roleId: string, permissions: RoleAccessesRequest[]) {
    return axios.put<RoleType>(
      `${ROLE_API}/${roleId}/permissions`,
      permissions,
    );
  }
}
const roleService = new RoleService();
export default roleService;
