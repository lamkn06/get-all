import { Button, Result } from 'antd';

export const NotFound: React.FC<{ title: string }> = ({ title }) => (
  <Result
    status="404"
    title="404"
    subTitle={title}
    extra={
      <Button type="link" href="/">
        Back Home
      </Button>
    }
  />
);
