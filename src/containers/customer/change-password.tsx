import { Button, Form, Input, notification, Typography } from 'antd';
import customerService from 'api/customer.api';
import { useAppSelector } from 'hooks/app-hooks';
import { useEffect } from 'react';
import { validateMessages } from 'validators';

interface Props {
  onToggle: (toggle: boolean) => void;
}

export const ChangePassword: React.FC<Props> = ({ onToggle }) => {
  const { currentCustomer } = useAppSelector(state => state.customerManagement);
  const [form2] = Form.useForm();

  useEffect(() => {
    form2.resetFields();
  }, [currentCustomer.id]);

  const onUpdatePassword = async (formValues: {
    newPassword: 'string';
    confirmPassword: 'string';
  }) => {
    customerService.changePassword({
      id: currentCustomer.id,
      ...formValues,
    });
    notification.success({
      message: 'Change password successful!',
    });
    onToggle(false);
  };

  return (
    <Form
      validateMessages={validateMessages}
      layout="vertical"
      onFinish={onUpdatePassword}
      form={form2}
    >
      <Typography.Title level={5}></Typography.Title>
      <Form.Item
        name="newPassword"
        label="New password"
        rules={[{ required: true }]}
        hasFeedback
      >
        <Input.Password placeholder="New password" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="Confirm password"
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value)
                return Promise.resolve();
              return Promise.reject(
                'The two passwords that you entered do not match!',
              );
            },
          }),
        ]}
        dependencies={['newPassword']}
        hasFeedback
      >
        <Input.Password placeholder="Confirm password" />
      </Form.Item>
      <div className="text-right mt-2">
        <Button onClick={() => onToggle(false)}>Cancel</Button>
        <Button type="primary" className="ml-1" htmlType="submit">
          OK
        </Button>
      </div>
    </Form>
  );
};
