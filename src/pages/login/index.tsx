import { Form, Input, Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LoginRequestType } from 'types/login';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from 'reactfire';
import { useState } from 'react';
import { setToken } from 'utils/localStorage';
import { EmailValidate } from 'validators';
import './index.scss';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const auth = useAuth();

  const onLogin = async (values: LoginRequestType) => {
    try {
      setLoading(true);
      const { user } = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      notification.success({
        message: user.displayName || user.email,
      });
      setToken((user as any).accessToken);
      navigate('/');
    } catch (_) {
      notification.error({
        message: `Email address or password is incorrect`,
      });
      setLoading(false);
    }
  };

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  return (
    <section className="page-login">
      <Form
        name="login"
        onFinish={onLogin}
        autoComplete="off"
        form={form}
        {...layout}
      >
        <Form.Item
          label="Email address"
          name="email"
          rules={[
            {
              required: true,
              message: 'Email address is invalid',
              validateTrigger: 'onSubmit',
              pattern: EmailValidate,
            },
          ]}
        >
          <Input placeholder="Email address" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            className="mt-1"
            loading={loading}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </section>
  );
};

export default Login;
