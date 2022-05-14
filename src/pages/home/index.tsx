import { Image } from 'antd';
import './index.scss';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const EasyGoBg = require('images/logo.svg');

const Home: React.FC = () => (
  <div className="home-page">
    <Image className="home-page__main-img" preview={false} src={EasyGoBg} />
  </div>
);

export default Home;
