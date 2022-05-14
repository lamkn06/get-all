/* eslint-disable no-console */
/* eslint-disable no-empty */
import { Button, Form, Input, notification, Popconfirm, Space } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import addonService from 'api/addon.api';
import billingService from 'api/billing.api';
import { Drawer } from 'components/drawer';
import { buildMessage } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setEditing,
  setVisible,
} from 'pages/billing-management/list/redux/slice';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { EmailValidate, validateMessages } from 'validators';
import './index.scss';

interface Props {
  onSuccess: () => void;
}

export const EditBilling: React.FC<Props> = ({ onSuccess }) => {
  const { canEdit } = usePermissions({
    module: 'manage_billing',
  });

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { visible, isEditing, currentBilling } = useAppSelector(
    state => state.billingManagement,
  );

  useEffect(() => {
    if (currentBilling && visible) {
      form.setFieldsValue(currentBilling);
    }
  }, [currentBilling, visible]);

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [visible]);

  const handleClose = () => {
    dispatch(setEditing(false));
    dispatch(setVisible(false));
  };

  const handleEdit = () => dispatch(setEditing(true));

  const handleSubmit = useCallback(async () => {
    try {
      const formValues = await form.validateFields();
      const payload = {
        ...formValues,
      };
      if (currentBilling) {
        await billingService.update({
          ...currentBilling,
          ...payload,
        });
      } else {
        await billingService.create(payload);
      }

      notification.success({
        message: buildMessage({
          isCreate: !currentBilling,
          name: formValues.name,
        }),
      });
      handleClose();
      onSuccess();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentBilling]);

  const readOnly = !isEditing;

  const title =
    isEditing && currentBilling
      ? 'Edit Billing'
      : currentBilling
      ? 'Billing Info'
      : 'Create a new Billing';

  return (
    <Drawer
      className="billing-edit"
      title={title}
      width={500}
      visible={visible}
      onClose={handleClose}
      footer={
        <Space size={16}>
          {isEditing && (
            <Popconfirm
              title="Discard changes made this billing information?"
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
              {currentBilling?.id ? 'Update Billing' : 'Add Billing'}
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
      <Form
        form={form}
        scrollToFirstError
        validateMessages={validateMessages}
        layout="vertical"
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input disabled={readOnly} placeholder="Name" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true },
            {
              type: 'email',
              message: 'Email address is invalid',
              validateTrigger: 'onSubmit',
              pattern: EmailValidate,
            },
          ]}
        >
          <Input placeholder="Email" disabled={readOnly} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
