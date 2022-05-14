/* eslint-disable no-console */
/* eslint-disable no-empty */
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  notification,
  Popconfirm,
  Radio,
  Row,
  Space,
  Typography,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import addonService from 'api/addon.api';
import classNames from 'classnames';
import { Drawer } from 'components/drawer';
import { NumberInput } from 'components/number-input';
import { MODULES, PRICE_UNIT } from 'constants/index';
import { buildMessage } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import { isEmpty } from 'lodash';
import {
  setEditing,
  setVisible,
} from 'pages/restaurant-management/redux/addon';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { validateMessages } from 'validators';
import './index.scss';

interface Props {
  restaurantId: string;
  onSuccess: () => void;
}

export const EditAddon: React.FC<Props> = ({ restaurantId, onSuccess }) => {
  const { canEdit } = usePermissions({
    module: MODULES.MANAGE_RESTAURANTS,
  });

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { visible, isEditing, currentAddon } = useAppSelector(
    state => state.addonManagement,
  );

  useEffect(() => {
    if (currentAddon && visible) {
      form.setFieldsValue(currentAddon);
    }
  }, [currentAddon, visible]);

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
        type: formValues.type.toLowerCase(),
        restaurantId: restaurantId,
      };
      if (currentAddon) {
        await addonService.update({
          ...currentAddon,
          ...payload,
        });
      } else {
        await addonService.create(payload);
      }

      notification.success({
        message: buildMessage({
          isCreate: !currentAddon,
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
  }, [currentAddon]);

  const readOnly = !isEditing;

  const title =
    isEditing && currentAddon
      ? 'Edit Addon'
      : currentAddon
      ? 'Addon Info'
      : 'Create a new Addon';

  return (
    <Drawer
      className="addon-edit"
      title={title}
      width={500}
      visible={visible}
      onClose={handleClose}
      footer={
        <Space size={16}>
          {isEditing && (
            <Popconfirm
              title="Discard changes made in the addon information?"
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
              {currentAddon?.id ? 'Update Addon' : 'Add Addon'}
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
        <Form.Item name="name" label="Addon Name" rules={[{ required: true }]}>
          <Input disabled={readOnly} placeholder="Addon Name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea placeholder="Description" disabled={readOnly} />
        </Form.Item>
        <Form.Item label="Type" name="type" rules={[{ required: true }]}>
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="single" disabled={readOnly}>
              Single
            </Radio.Button>
            <Radio.Button value="multiple" disabled={readOnly}>
              Multiple
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Card
          size="small"
          className={classNames(
            isEmpty(currentAddon?.options) && !isEditing && 'hide',
          )}
        >
          <Form.List
            name="options"
            rules={[
              {
                validator: async (_, names) => {
                  if (
                    !form.getFieldValue('options') ||
                    form.getFieldValue('options').length === 0
                  ) {
                    return Promise.reject(
                      new Error('This is a required field'),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, fieldIndex) => (
                  <div key={field.key}>
                    <Space>
                      <Typography.Link>
                        Options {fieldIndex + 1}
                      </Typography.Link>
                      <Button
                        disabled={readOnly}
                        block
                        danger
                        size="small"
                        onClick={ev => {
                          ev.stopPropagation();
                          remove(fieldIndex);
                        }}
                      >
                        Delete
                      </Button>
                    </Space>
                    <Form.Item
                      name={[field.name, 'vehicleId']}
                      className="addon-edit__hidden"
                    >
                      <Input hidden />
                    </Form.Item>

                    <Row justify="space-between" align="middle" gutter={20}>
                      <Col sm={{ span: 24 }} md={{ span: 12 }}>
                        <Form.Item
                          name={[field.name, 'name']}
                          label="Name"
                          rules={[{ required: true }]}
                          className="mb-0"
                        >
                          <Input
                            disabled={readOnly}
                            placeholder="Option name"
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 24 }} md={{ span: 12 }}>
                        <Form.Item
                          name={[field.name, 'price']}
                          label="Price"
                          rules={[{ required: true }]}
                          className="mb-0"
                        >
                          <NumberInput
                            disabled={readOnly}
                            placeholder="Option Price"
                            addonBefore={PRICE_UNIT}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider />
                  </div>
                ))}
                {!readOnly && (
                  <>
                    <Button
                      ghost
                      className="mb-1"
                      type="primary"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      disabled={readOnly}
                    >
                      Add option
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </>
                )}
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </Drawer>
  );
};
