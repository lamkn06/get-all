/* eslint-disable no-empty */
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  notification,
  Row,
  Space,
  Switch,
  Typography,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import rateService from 'api/rate.api';
import { Drawer } from 'components/drawer';
import { buildMessage } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { setVisible } from 'pages/rate-management/list/redux/slice';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RateType } from 'types/rate';
import { validateMessages } from 'validators';
import './index.scss';

interface Props {
  onSuccess?: (rate?: RateType) => void;
}
export const AddRate: React.FC<Props> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { visible, currentRate } = useAppSelector(
    state => state.rateManagement,
  );

  useEffect(() => {
    if (currentRate && visible) {
      form.setFieldsValue(currentRate);
    }
  }, [currentRate, visible]);

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [visible]);

  const [loading, setLoading] = useState(false);

  const handleClose = () => dispatch(setVisible(false));

  const handleSubmit = useCallback(async () => {
    try {
      const formValues = await form.validateFields();
      const rateFormValue = {
        ...currentRate,
        ...formValues,
      } as RateType;

      setLoading(true);
      if (currentRate?.rateId) {
        const updateRate = await rateService.update(rateFormValue);
        onSuccess(updateRate.data as RateType);
      } else {
        await rateService.create(rateFormValue);
        onSuccess();
      }
      notification.success({
        message: buildMessage({
          isCreate: !currentRate?.rateId,
          name: formValues.name,
        }),
      });
      handleClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentRate]);
  const title = !currentRate ? 'Add Rate' : `Update ${currentRate.name}`;

  return (
    <Drawer
      className="rate-add"
      title={title}
      visible={visible}
      onClose={handleClose}
      footer={
        <Row justify={'center'}>
          <Space>
            <Button
              onClick={handleClose}
              loading={loading}
              className="float-right"
            >
              Cancel
            </Button>

            <Button onClick={handleSubmit} loading={loading} type="primary">
              {!currentRate ? 'Create' : 'Update'}
            </Button>
          </Space>
        </Row>
      }
    >
      <Form
        form={form}
        layout="vertical"
        hideRequiredMark
        scrollToFirstError
        validateMessages={validateMessages}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea placeholder="Description" />
        </Form.Item>
        <Row align="middle" justify="space-between">
          <Typography.Text>Default Card</Typography.Text>
          <Form.Item
            name="isDefault"
            className="mb-0"
            valuePropName="checked"
            initialValue={currentRate && currentRate.isDefault}
          >
            <Switch
              disabled={currentRate && currentRate.isDefault}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Form.Item>
        </Row>
        <Row align="middle" justify="space-between">
          <Typography.Text>Active</Typography.Text>
          <Form.Item valuePropName="checked" name="active" className="mb-0">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Row>
      </Form>
    </Drawer>
  );
};
