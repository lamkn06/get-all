/* eslint-disable no-useless-catch */
import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import billingService from 'api/billing.api';
import customerService from 'api/customer.api';
import { CommonUpload } from 'components/common-upload';
import { Drawer } from 'components/drawer';
import { CustomerTypes } from 'constants/index';
import { buildMessage } from 'helpers';
import { normFile } from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setEditing,
  setListCustomer,
  setVisible,
} from 'pages/customer-management/redux/slice';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BillingType, CustomerType } from 'types';
import { EmailValidate, validateMessages } from 'validators';

export const EditCustomer: React.FC = () => {
  const { canEdit } = usePermissions({
    module: 'manage_customers',
  });

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [billingsList, setBillingsList] = useState<Array<BillingType>>([]);
  const [form] = Form.useForm();
  const { visible, currentCustomer, isEditing, listCustomers } = useAppSelector(
    state => state.customerManagement,
  );

  useEffect(() => {
    fetchBillings();
  }, []);

  useEffect(() => {
    if (currentCustomer) {
      form.setFieldsValue({
        ...currentCustomer,
        billings: currentCustomer.billings
          ? currentCustomer.billings.map(item => item.id)
          : [],
      });
    }
  }, [currentCustomer]);

  const fetchBillings = async () => {
    const { data } = await billingService.getList(`pageIndex=1&pageSize=9999`);
    setBillingsList(data.results);
  };

  const handleClose = () => dispatch(setVisible(false));

  const handleEdit = () => {
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleSubmit = async () => {
    const { profileImage, ...formValues }: CustomerType =
      await form.validateFields();

    try {
      setLoading(true);
      const formData = new FormData();
      for (let key in formValues) {
        if (key === 'billings') {
          formData.append('billing', formValues[key] as unknown as string);
        } else {
          formData.append(key, formValues[key]);
        }
      }
      if (profileImage && typeof profileImage !== 'string') {
        formData.append('avatar', profileImage.originFileObj);
      }
      const { data } = await customerService.update(
        currentCustomer.id,
        formData,
      );

      notification.success({
        message: buildMessage({
          isCreate: !currentCustomer.id,
          name: formValues.firstName,
        }),
      });

      dispatch(
        setListCustomer(
          listCustomers.map(item => (item.id === data.id ? data : item)),
        ),
      );
      handleClose();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={currentCustomer ? 'Update customer' : 'Create new customer'}
      visible={visible}
      onClose={handleClose}
      footer={
        <Space size={16}>
          {isEditing && (
            <Popconfirm
              title="Discard changes made in the customer information?"
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
            <Button onClick={handleSubmit} type="primary" loading={loading}>
              {currentCustomer?.id ? 'Update' : 'Save'}
            </Button>
          ) : (
            canEdit && (
              <Button onClick={handleEdit} loading={loading}>
                Edit
              </Button>
            )
          )}
        </Space>
      }
    >
      <Spin tip="Saving..." spinning={loading}>
        <Form form={form} validateMessages={validateMessages} layout="vertical">
          <Typography.Title level={5}>Customer information</Typography.Title>
          <Form.Item name="id" noStyle>
            <Input hidden />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(
              prevValues: CustomerType,
              currentValues: CustomerType,
            ) => prevValues.profileImage !== currentValues.profileImage}
          >
            {({ getFieldValue }) => (
              <Form.Item
                name="profileImage"
                valuePropName="fileList"
                className="text-center mt-3"
                getValueFromEvent={normFile}
              >
                <CommonUpload
                  imgSrc={getFieldValue('profileImage')}
                  disabled={!isEditing}
                />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="First Name" disabled={!isEditing} />
          </Form.Item>

          <Form.Item name="middleName" label="Middle Name">
            <Input placeholder="Middle Name" disabled={!isEditing} />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Last Name" disabled={!isEditing} />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Phone number">
            <Input placeholder="Phone number" disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                type: 'email',
                message: 'Email address is invalid',
                validateTrigger: 'onSubmit',
                pattern: EmailValidate,
              },
            ]}
          >
            <Input disabled={!isEditing} placeholder="Email" type="email" />
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input placeholder="Address" disabled={!isEditing} />
          </Form.Item>

          <Form.Item name="type" label="Customer Type">
            <Select
              options={CustomerTypes as any}
              placeholder="Customer Type"
              disabled={!isEditing}
            />
          </Form.Item>

          <Form.Item name="billings" label="Billings">
            <Select
              placeholder="Billings"
              disabled={!isEditing}
              mode="multiple"
            >
              {billingsList.map(item => (
                <Select.Option value={item.id} key={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" className="mb-0" label="Status">
            <Select
              placeholder="Status"
              disabled={!isEditing}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
};
