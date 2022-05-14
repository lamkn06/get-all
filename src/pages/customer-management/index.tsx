/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable no-useless-catch */
import { useInjectReducer } from 'utils/redux-injectors';
import { ListCustomer } from 'containers/customer/list';
import { EditCustomer } from 'containers/customer/edit';
import reducer from './redux/slice';

interface Props {}

const CustomerMgt: React.FC<Props> = () => {
  useInjectReducer({ key: 'customerManagement', reducer });

  return (
    <div>
      <ListCustomer />
      <EditCustomer />
    </div>
  );
};

export default CustomerMgt;
