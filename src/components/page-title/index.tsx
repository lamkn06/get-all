import { useLocation } from 'react-router';
import { flattenRoutes } from 'routes';
import { Typography } from 'antd';

const { Title } = Typography;

export const PageTitle = () => {
  const pathname = useLocation().pathname;

  const title = flattenRoutes.find(({ path }) => `/${path}` === pathname)?.name;

  return <Title level={4}>{title}</Title>;
};
