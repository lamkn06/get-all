import { MODULES_API } from 'api';
import axios from 'axios';
import { ModuleType } from 'types/module';

class ModuleService {
  getList() {
    return axios.get<ModuleType[]>(`${MODULES_API}`);
  }
}

const moduleService = new ModuleService();

export default moduleService;
