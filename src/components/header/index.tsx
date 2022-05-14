import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Layout, Modal, notification, Typography } from 'antd';
import { useAppSelector } from 'hooks/app-hooks';
import { MenuInfo } from 'rc-menu/lib/interface';
import { useAuth } from 'reactfire';
import { AvatarDropdown, MenuKeyType } from 'components/avatar-dropdown';
import { removeToken } from 'utils/localStorage';
import { useDispatch } from 'react-redux';
import { setUser, setIdToken } from 'state/userSlice';
import commonService from 'api/common.api';
import './index.scss';

type MenuInfoType = MenuInfo & {
  key: MenuKeyType;
};

const { confirm } = Modal;
const { Header: AntHeader } = Layout;
export const Header: React.FC = () => {
  const auth = useAuth();
  const dispatch = useDispatch();

  const user = useAppSelector(state => state.user);

  const handleMenuClick = async (action: MenuInfoType) => {
    if (action.key === 'logout') {
      confirm({
        title: 'Exit',
        content: (
          <div>
            <p>Are you sure you want to log out?</p>
          </div>
        ),
        icon: <ExclamationCircleOutlined />,
        okText: 'Logout',
        onOk() {
          handleLogout();
        },
      });
    } else if (action.key === 'change_pass') {
      Modal.confirm({
        title: 'Change Password',
        icon: <ExclamationCircleOutlined />,
        content: 'Are you sure you want to change password?',
        okText: 'Yes',
        cancelText: 'Cancel',
        onOk: () => {
          commonService.changePassword();
          notification.success({
            message: (
              <Typography.Title level={5}>Change Password</Typography.Title>
            ),
            description: 'A link was sent to your email.',
          });
        },
      });
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      notification.success({ message: 'Logged out!' });
      dispatch(setUser({}));
      dispatch(setIdToken(''));
      removeToken();
    } catch (_) {}
  };

  return (
    <AntHeader className="header">
      <AvatarDropdown onMenuClick={handleMenuClick} avatarSrc={user.photoURL} />
      <span className="header__name">{user.email}</span>
    </AntHeader>
  );
};
