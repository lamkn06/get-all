import { Layout, Typography } from 'antd';
import classNames from 'classnames';
import { Logo } from 'components/logo';
import { isAccreditationPage } from 'helpers';
import './index.scss';

const UnAuthorizedLayout: React.FC = ({ children }) => {
  return (
    <Layout
      className={classNames(
        'unauthorized-layout',
        isAccreditationPage && 'unauthorized-layout_accreditation',
      )}
    >
      <div className="unauthorized-layout_logo-container">
        <Logo />
        {isAccreditationPage && (
          <Typography.Title level={4}>
            Get All Rider Application
          </Typography.Title>
        )}
      </div>
      {children}
    </Layout>
  );
};

export default UnAuthorizedLayout;
