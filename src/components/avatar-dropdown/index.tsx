import React, { Fragment, useMemo } from 'react';
import {
  KeyOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Menu } from 'antd';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import './index.scss';

export type MenuKeyType = 'profile' | 'settings' | 'change_pass' | 'logout';

interface MenuProp {
  title: string;
  key: MenuKeyType;
  icon: React.ReactElement;
}

interface Props {
  onMenuClick?: MenuClickEventHandler;
  avatarSrc?: string;
}

const menuList: MenuProp[] = [
  // { title: 'Profile', key: 'profile', icon: <UserOutlined /> },
  // { title: 'Settings', key: 'settings', icon: <SettingOutlined /> },
  { title: 'Change Password', key: 'change_pass', icon: <KeyOutlined /> },
  { title: 'Logout', key: 'logout', icon: <LogoutOutlined /> },
];

export const AvatarDropdown: React.FC<Props> = ({ onMenuClick, avatarSrc }) => {
  const menuHeaderDropdown = useMemo(
    () => (
      <Menu
        selectedKeys={[]}
        onClick={onMenuClick}
        className="avatar-dropdown__menu"
      >
        {menuList.map(({ title, key, icon }) =>
          key !== 'logout' ? (
            <Menu.Item key={key}>
              {icon}
              {title}
            </Menu.Item>
          ) : (
            <Fragment key={key}>
              <Menu.Divider />
              <Menu.Item key={key}>
                {icon}
                {title}
              </Menu.Item>
            </Fragment>
          ),
        )}
      </Menu>
    ),
    [onMenuClick],
  );

  return (
    <Dropdown
      overlay={menuHeaderDropdown}
      trigger={['click']}
      placement="bottomRight"
      overlayClassName="avatar-dropdown"
    >
      <Avatar size={32} icon={<UserOutlined />} alt="avatar" src={avatarSrc} />
    </Dropdown>
  );
};
