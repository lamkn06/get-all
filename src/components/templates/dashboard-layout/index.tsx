/* eslint-disable no-console */
import { Card, Layout } from 'antd';
import { Breadcrumb } from 'components/breadcrumb';
import { Header } from 'components/header';
import { Logo } from 'components/logo';
import { PageTitle } from 'components/page-title';
import { SideBar } from 'components/sidebar';
import { useDetectMobile } from 'hooks/useDetectMobile';
import { useEffect, useState } from 'react';
import './index.scss';

const { Content } = Layout;

const DashboardLayout: React.FC = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useDetectMobile();

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const onToggle = () => setCollapsed(oldVal => !oldVal);

  return (
    <Layout className="dashboard-layout">
      <SideBar collapsed={collapsed} onToggle={onToggle}>
        <div className="dashboard-layout__logo">
          <Logo />
        </div>
      </SideBar>
      <Layout>
        <Header />
        <Content className="dashboard-layout__content">
          <Card size="small">
            <Breadcrumb />
            <PageTitle />
            <div className="dashboard-layout__body">{children}</div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};
export default DashboardLayout;
