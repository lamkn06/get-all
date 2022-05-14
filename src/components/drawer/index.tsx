import { Drawer as AntDrawer, DrawerProps } from 'antd';
import classNames from 'classnames';
import './index.scss';

export const Drawer: React.FC<DrawerProps> = ({
  className,
  children,
  ...props
}) => (
  <AntDrawer
    // closable={false}
    className={classNames('drawer', className)}
    maskClosable={false}
    {...props}
  >
    {children}
  </AntDrawer>
);
