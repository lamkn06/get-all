import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Fragment, useMemo } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { flattenRoutes } from 'routes';
import { HomeOutlined } from '@ant-design/icons';

const recursionPathName = (ddd: string) => {
  const parts = ddd.split('/').filter(Boolean);
  return parts.map((part, index) => {
    if (index === 0) {
      return `/${part}`;
    }
    return `/${parts[index - 1]}/${part}`;
  });
};

export const Breadcrumb = () => {
  const pathname = useLocation().pathname;
  const partRoutes = recursionPathName(pathname);

  const ListBreadcrumbItems = useMemo(
    () =>
      partRoutes.map((route, index) => {
        const flattenRoute = flattenRoutes.find(({ path }) => path === route);
        if (!flattenRoute) {
          return <Fragment key={`${route}-${index}`}></Fragment>;
        }

        return (
          <AntBreadcrumb.Item key={`${route}-${index}`}>
            {flattenRoute.breadcrumbName || flattenRoute.name}
          </AntBreadcrumb.Item>
        );
      }),
    [pathname],
  );

  return (
    <AntBreadcrumb style={{ marginBottom: 10 }}>
      <AntBreadcrumb.Item>
        <Link to="/">
          <HomeOutlined />
        </Link>
      </AntBreadcrumb.Item>
      {ListBreadcrumbItems}
    </AntBreadcrumb>
  );
};
