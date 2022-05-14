/* eslint-disable no-console */
/* eslint-disable no-empty */
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  notification,
  Popconfirm,
  Row,
  Space,
  Switch,
  Typography,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import foodRateService from 'api/foodRate.api';
import { Drawer } from 'components/drawer';
import { NumberInput } from 'components/number-input';
import { PRICE_UNIT } from 'constants/index';
import { buildMessage } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setEditing,
  setVisible,
} from 'pages/food-rate-management/list/redux/slice';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { validateMessages } from 'validators';

interface Props {
  onSuccess: () => void;
}

export const EditFoodRate: React.FC<Props> = ({ onSuccess }) => {
  const { canEdit } = usePermissions({
    module: 'manage_rate_cards',
  });

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { visible, isEditing, currentFoodRate } = useAppSelector(
    state => state.foodRateManagement,
  );

  useEffect(() => {
    if (currentFoodRate && visible) {
      const getAllShare = currentFoodRate.commission * 100;
      form.setFieldsValue({
        ...currentFoodRate,
        getAllShare: getAllShare,
        driverShare: parseFloat(`${100 - getAllShare}`).toFixed(1),
      });
    }
  }, [currentFoodRate, visible]);

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [visible]);

  const handleClose = () => {
    dispatch(setEditing(false));
    dispatch(setVisible(false));
  };

  const handleOnValueChange = (formData: FormData) => {
    const key = Object.keys(formData)[0];
    if (key && key === 'getAllShare') {
      form.setFieldsValue({
        driverShare:
          !formData[key] || formData[key] > 100
            ? 0
            : parseFloat(`${100 - formData[key]}`).toFixed(1),
      });
    }

    if (key && key === 'driverShare') {
      form.setFieldsValue({
        getAllShare:
          !formData[key] || formData[key] > 100
            ? 0
            : parseFloat(`${100 - formData[key]}`).toFixed(1),
      });
    }
  };

  const handleEdit = () => dispatch(setEditing(true));

  const handleSubmit = useCallback(async () => {
    try {
      const formValues = await form.validateFields();
      const payload = {
        ...formValues,
        commission: formValues.getAllShare / 100,
      };
      if (currentFoodRate) {
        await foodRateService.update({
          ...currentFoodRate,
          ...payload,
        });
      } else {
        await foodRateService.create(payload);
      }

      notification.success({
        message: buildMessage({
          isCreate: !currentFoodRate,
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
  }, [currentFoodRate]);

  const readOnly = !isEditing;

  const title =
    isEditing && currentFoodRate
      ? 'Edit Addon'
      : currentFoodRate
      ? 'Addon Info'
      : 'Create a new Addon';

  return (
    <Drawer
      className="food-rate-edit"
      title={title}
      width={500}
      visible={visible}
      onClose={handleClose}
      footer={
        <Space size={16}>
          {isEditing && (
            <Popconfirm
              title="Discard changes made in the food rate information?"
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
              {currentFoodRate?.rateId ? 'Update Rate' : 'Add Rate'}
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
        onValuesChange={handleOnValueChange}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input disabled={readOnly} placeholder="Name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea placeholder="Description" disabled={readOnly} />
        </Form.Item>
        <Space>
          <Form.Item name="base" label="Base" rules={[{ required: true }]}>
            <NumberInput
              disabled={readOnly}
              placeholder="Base"
              addonBefore={PRICE_UNIT}
            />
          </Form.Item>
          <Form.Item name="perKm" label="Per Km" rules={[{ required: true }]}>
            <NumberInput
              disabled={readOnly}
              placeholder="Base Rate "
              addonBefore={PRICE_UNIT}
            />
          </Form.Item>
        </Space>
        <Space align="start">
          <Form.Item
            name="getAllShare"
            label="GetAll Share"
            rules={[
              { required: true },
              {
                validator: (_, values: string) => {
                  if (Number(values) < 0 || Number(values) > 100) {
                    return Promise.reject(
                      'GetAll Share must be between 0 & Driver',
                    );
                  }
                  return Promise.resolve();
                },
                validateTrigger: 'onSubmit',
              },
            ]}
          >
            <NumberInput
              disabled={readOnly}
              placeholder="GetAll Share"
              addonBefore="%"
            />
          </Form.Item>
          <Form.Item
            name="driverShare"
            label="Driver Share"
            rules={[
              { required: true },
              {
                validator: (_, values: string) => {
                  if (Number(values) < 0 || Number(values) > 100) {
                    return Promise.reject(
                      'Driver Share must be between 0 & 100',
                    );
                  }
                  return Promise.resolve();
                },
                validateTrigger: 'onSubmit',
              },
            ]}
          >
            <NumberInput
              disabled={readOnly}
              placeholder="Driver Share"
              addonBefore="%"
            />
          </Form.Item>
        </Space>
        <Space>
          <Form.Item
            name="longDistanceCharge"
            label="Long Distance Charge"
            rules={[{ required: true }]}
          >
            <NumberInput
              disabled={readOnly}
              placeholder="Long Distance Charge"
              addonBefore={PRICE_UNIT}
            />
          </Form.Item>
          <Form.Item
            name="longDistanceStartFrom"
            label="Long Distance Start From (km)"
            rules={[{ required: true }]}
          >
            <NumberInput
              disabled={readOnly}
              placeholder="Long Distance Start From (km)"
              addonBefore="KM"
            />
          </Form.Item>
        </Space>
        <Space>
          <Form.Item
            name="amountShortDistanceCharge"
            label="Amount Short Distance Charge"
            rules={[{ required: true }]}
          >
            <NumberInput
              disabled={readOnly}
              placeholder="Amount Short Distance Charge"
              addonBefore={PRICE_UNIT}
            />
          </Form.Item>
        </Space>
        <Row align="middle" justify="space-between">
          <Typography.Text>Default Rate</Typography.Text>
          <Form.Item
            name="isDefault"
            className="mb-0"
            valuePropName="checked"
            initialValue={currentFoodRate && currentFoodRate.isDefault}
          >
            <Switch
              disabled={
                (currentFoodRate && currentFoodRate.isDefault) || readOnly
              }
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Form.Item>
        </Row>
      </Form>
    </Drawer>
  );
};
