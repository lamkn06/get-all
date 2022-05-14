import { Image } from 'antd';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GetAllLogo = require('images/logo.svg');

export const Logo: React.FC = () => <Image src={GetAllLogo} preview={false} />;
