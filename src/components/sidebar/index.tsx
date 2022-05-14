import { createElement } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { routes } from 'routes';
import './index.scss';
import { useAppSelector } from 'hooks/app-hooks';

const { Sider } = Layout;
const { SubMenu } = Menu;
interface Props {
  collapsed: boolean;
  onToggle?: () => void;
}

export const SideBar: React.FC<Props> = ({ collapsed, children, onToggle }) => {
  const { role } = useAppSelector(state => state.user);

  const pathname = useLocation().pathname;
  const parentMenu = `/${pathname.split('/').filter(Boolean)[0] || ''}`;
  let childMenu = pathname;

  // Handle hidden route: example detail/:id
  if (pathname !== '/') {
    const partRoute = pathname.split('/');
    if (partRoute.length >= 4) {
      partRoute.pop();
      if (pathname.includes(partRoute.join('/'))) {
        childMenu = partRoute.join('/');
      }
    }
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="sider-bar"
    >
      {children}
      <Menu
        mode="inline"
        defaultOpenKeys={[parentMenu]}
        selectedKeys={[childMenu]}
        className="sider-bar__menu"
      >
        {routes.map(route => {
          if (route.hidden) return null;

          const isShow =
            route.key === 'all'
              ? true
              : role &&
                !!role.roleAccesses.find(
                  roleAccess => roleAccess.module.key === route.key,
                );
          if (route.routes) {
            return (
              isShow && (
                <SubMenu key={route.path} icon={route.icon} title={route.name}>
                  {route.routes.map(subRoute => (
                    <Menu.Item key={subRoute.path}>
                      <Link to={subRoute.path}>{subRoute.name}</Link>
                    </Menu.Item>
                  ))}
                </SubMenu>
              )
            );
          }
          return (
            isShow && (
              <Menu.Item key={route.path} icon={route.icon}>
                <Link to={route.path}>{route.name}</Link>
              </Menu.Item>
            )
          );
        })}
      </Menu>
      <div className="sider-bar__trigger">
        {createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          onClick: onToggle,
        })}
      </div>
    </Sider>
  );
};
