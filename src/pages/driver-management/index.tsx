import { useInjectReducer } from 'utils/redux-injectors';
import reducer from './redux/slice';
const DriverManagement = ({ children }) => {
  useInjectReducer({ key: 'driverManagement', reducer });
  return <div>{children}</div>;
};

export default DriverManagement;
