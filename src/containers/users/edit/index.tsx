/* eslint-disable no-console */
import {
  Button,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import { Drawer } from 'components/drawer';
import { PhoneNumber } from 'components/phone-number';
import { MODULES, PhoneNumberPrefix } from 'constants/index';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import { setEditing, setVisible } from 'pages/user-management/redux/slice';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UserType } from 'types';
import { EmailValidate, phoneValidator, validateMessages } from 'validators';

const { Title, Text } = Typography;
const { Option } = Select;
const NameRegexValidate = new RegExp(`^[^-\\s][a-zA-Z]*$`);

interface Props {
  loading?: boolean;

  onSubmit: (formValues: UserType) => void;
}

export const EditUser: React.FC<Props> = ({ onSubmit, loading }) => {
  const { canEdit } = usePermissions({
    module: MODULES.MANAGE_USERS,
  });

  const { currentUser, isEditing, visible, roles } = useAppSelector(
    state => state.userManagement,
  );
  const auth = useAppSelector(state => state.user);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser && visible) {
      form.setFieldsValue({
        ...currentUser,
        roleId: currentUser.role.id,
      });
    }
  }, [currentUser, visible]);

  useEffect(() => {
    return () => form.resetFields();
  }, [visible]);

  const handleClose = () => dispatch(setVisible(false));

  const handleEdit = () => dispatch(setEditing(true));

  const handleSubmit = useCallback(async () => {
    try {
      const formValues = await form.validateFields();
      const _currentUser = { ...currentUser };
      delete _currentUser.role;
      onSubmit &&
        onSubmit({
          ..._currentUser,
          ...formValues,
          contactNumber: `${PhoneNumberPrefix}${formValues.contactNumber}`,
          email: formValues.email ? formValues.email : null,
        });
    } catch (error) {
      console.error(error);
    }
  }, [onSubmit, currentUser]);

  const title =
    isEditing && currentUser
      ? 'Edit user'
      : currentUser
      ? 'User info'
      : 'Create a new user';

  const readOnly = !isEditing;

  return (
    <Drawer
      title={title}
      width={400}
      visible={visible}
      onClose={handleClose}
      footer={
        <Space size={16}>
          {isEditing && (
            <Popconfirm
              title="Discard changes made in the user information?"
              cancelText="Cancel"
              okText="Discard"
              onConfirm={handleClose}
            >
              <Button className="float-right" type="ghost">
                Cancel
              </Button>
            </Popconfirm>
          )}
          {isEditing ? (
            <Button onClick={handleSubmit} type="primary" disabled={loading}>
              {currentUser ? 'Update user' : 'Add user'}
            </Button>
          ) : (
            canEdit && <Button onClick={handleEdit}>Edit</Button>
          )}
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        hideRequiredMark
        validateMessages={validateMessages}
        initialValues={{
          createdBy: auth.email,
        }}
      >
        <Title level={5}>PROFILE</Title>
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[
            {
              required: true,
              pattern: NameRegexValidate,
              message: `Only alphabets`,
            },
          ]}
        >
          <Input disabled={readOnly} placeholder="First Name" />
        </Form.Item>
        <Form.Item
          name="middleName"
          label="Middle Name"
          rules={[
            {
              pattern: NameRegexValidate,
              message: `Only alphabets`,
            },
          ]}
        >
          <Input disabled={readOnly} placeholder="Middle Name (optional)" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[
            {
              required: true,
              pattern: NameRegexValidate,
              message: `Only alphabets`,
            },
          ]}
        >
          <Input disabled={readOnly} placeholder="Last Name" />
        </Form.Item>
        <Form.Item
          name="suffix"
          label="Suffix"
          rules={[
            {
              pattern: NameRegexValidate,
              message: `Only alphabets`,
            },
          ]}
        >
          <Input disabled={readOnly} placeholder="Suffix (optional)" />
        </Form.Item>
        <Title level={5}>CONTACT DETAILS</Title>
        <Form.Item
          name="contactNumber"
          label="Contact Number"
          rules={[
            {
              required: !!currentUser?.id,
              validator: (_, values: string) => phoneValidator(values),
              validateTrigger: 'onSubmit',
            },
          ]}
        >
          <PhoneNumber
            placeholder="Contact Number"
            maxLength={10}
            disabled={readOnly}
          />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            {
              required: true,
              message: 'Email address is invalid',
              validateTrigger: 'onSubmit',
              pattern: EmailValidate,
            },
          ]}
        >
          <Input
            disabled={!!currentUser?.id}
            placeholder="Email Address"
            type="email"
          />
        </Form.Item>
        <Form.Item
          name="employeeNumber"
          label="Employee Number"
          rules={[{ required: true }]}
        >
          <Input disabled={readOnly} placeholder="Employee number" />
        </Form.Item>
        <Title level={5}>Role</Title>
        <Form.Item name="roleId" rules={[{ required: true }]}>
          <Select placeholder="Select an option" allowClear disabled={readOnly}>
            {roles?.map(item => (
              <Option value={item.id} key={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Row align="middle" justify="space-between" className="mb-1">
          <Text>Access Status</Text>
          <Form.Item
            valuePropName="checked"
            name="accessStatus"
            className="mb-0"
          >
            <Tag
              color={currentUser?.accessStatus === 'active' ? 'green' : 'red'}
              className="text-capitalize"
            >
              {currentUser?.accessStatus || 'pending'}
            </Tag>
          </Form.Item>
        </Row>
        <div className="hide">
          <Title level={5}>Created by</Title>
          <Form.Item name="createdBy">
            <Input disabled />
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  );
};
