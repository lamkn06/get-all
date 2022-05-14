/* eslint-disable no-empty */
/* eslint-disable no-console */
import {
  Button,
  Form,
  Input,
  InputNumber,
  notification,
  Popconfirm,
  Row,
  Space,
  Spin,
  Switch,
  Typography,
} from 'antd';
import campaignService from 'api/campaign.api';
import { Drawer } from 'components/drawer';
import { MODULES } from 'constants/index';
import { buildMessage } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setEditing,
  setVisible,
} from 'pages/campaign-management/list/redux/slice';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { validateMessages } from 'validators';
import './index.scss';

const { Title, Text } = Typography;

interface Props {
  loading: boolean;

  onSuccess: () => void;
}

export const EditCampaign: React.FC<Props> = ({ onSuccess, loading }) => {
  const { canEdit } = usePermissions({
    module: MODULES.MANAGE_CAMPAIGNS,
  });

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { visible, currentCampaign, isEditing } = useAppSelector(
    state => state.campaignManagement,
  );

  useEffect(() => {
    if (!currentCampaign || !visible) {
      return;
    }

    form.setFieldsValue(currentCampaign);
  }, [currentCampaign, visible]);

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [visible]);

  const handleClose = () => {
    dispatch(setVisible(false));
  };

  const handleEdit = () => dispatch(setEditing(true));

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();

      if (currentCampaign) {
        // Update
        await campaignService.update({
          ...currentCampaign,
          ...formValues,
        });
      }

      notification.success({
        message: buildMessage({
          isCreate: !currentCampaign,
          name: formValues.title,
        }),
      });

      handleClose();
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  const title =
    isEditing && currentCampaign
      ? 'Edit Campaign'
      : currentCampaign
      ? 'Role Info'
      : 'Create a new campaign';

  const readOnly = !isEditing;

  return (
    <div className="campaign-edit">
      <Drawer
        title={title}
        width={500}
        visible={visible}
        onClose={handleClose}
        footer={
          <Space size={16}>
            {isEditing && (
              <Popconfirm
                title="Discard changes made in the profile information?"
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
                {currentCampaign?.key ? 'Update campaign' : 'Add campaign'}
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
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            hideRequiredMark
            scrollToFirstError
            validateMessages={validateMessages}
          >
            <Title level={5}>INFORMATION</Title>
            <Form.Item
              name="title"
              label="Campaign Title"
              rules={[{ required: true }]}
            >
              <Input disabled={readOnly} placeholder="Campaign Title" />
            </Form.Item>
            <Form.Item
              className="slider"
              name="sliderItemNumber"
              label="Slider Item Number"
              rules={[{ required: true }]}
            >
              <InputNumber
                disabled={readOnly}
                min={0}
                placeholder="Slider Item Number"
              />
            </Form.Item>
            <Row align="middle" justify="space-between">
              <Text>Status</Text>
              <Form.Item
                valuePropName="checked"
                name="isActive"
                className="mb-0"
              >
                <Switch
                  disabled={readOnly}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>
            </Row>
          </Form>
        </Spin>
      </Drawer>
    </div>
  );
};
