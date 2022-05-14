/* eslint-disable no-empty */
/* eslint-disable no-console */
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  notification,
  Popconfirm,
  Space,
  Upload,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import campaignService from 'api/campaign.api';
import { Drawer } from 'components/drawer';
import { MODULES } from 'constants/index';
import { buildMessage, getBase64 } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setEditing,
  setVisible,
} from 'pages/campaign-management/id/redux/slice';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { URLValidate, validateMessages } from 'validators';
import './index.scss';

interface Props {
  onSuccess?: () => void;
}

const checkValidFile = (file: RcFile) => {
  const isJpgOrPng = ['image/jpeg', 'image/jpg', 'image/png'].includes(
    file.type,
  );

  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
    return false;
  }
  const isLt1_8M = file.size / 1024 / 1024 < 1.8;
  if (!isLt1_8M) {
    message.error('Image must smaller than 1.8MB!');
    return false;
  }
  return true;
};

export const EditCampaignItem: React.FC<Props> = ({ onSuccess }) => {
  const { canEdit } = usePermissions({
    module: MODULES.MANAGE_CAMPAIGNS,
  });

  const dispatch = useDispatch();
  const { visible, currentItem, isEditing } = useAppSelector(
    state => state.campaignDetailManagement,
  );

  const { key } = useParams();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (currentItem && visible) {
      form.setFieldsValue({
        ...currentItem,
        saleOff: currentItem.saleOff ? currentItem.saleOff * 100 : 0,
      });
      setImageUrl(currentItem.imagePath);
    } else {
      setImageUrl('');
    }
  }, [currentItem, visible]);

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [visible]);

  const handleClose = () => dispatch(setVisible(false));

  const handleEdit = () => dispatch(setEditing(true));

  const normFile = (e: UploadChangeParam) => {
    if (!checkValidFile(e.file as RcFile)) {
      return [];
    }
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onChangeUpload = async ({ file }: UploadChangeParam) => {
    try {
      const _file = file as RcFile;
      if (checkValidFile(_file)) {
        getBase64(_file, (imageUrl: string) => {
          setImageUrl(imageUrl);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const formValues = await form.validateFields();
      const data = new FormData();

      data.append('title', formValues.title);
      data.append(
        'description',
        formValues.description ? formValues.description : '',
      );
      data.append('url', formValues.url ? formValues.url : '');

      if (formValues.saleOff > 0) {
        data.append('saleOff', `${formValues.saleOff / 100}`);
      }

      if (currentItem) {
        data.append(
          'image',
          !!formValues.image ? formValues.image[0].originFileObj : imageUrl,
        );
        await campaignService.updateItem(key, currentItem.campaignItemId, data);
      } else {
        data.append('image', formValues.image[0].originFileObj);
        await campaignService.createdItem(key, data);
      }

      notification.success({
        message: buildMessage({
          isCreate: !currentItem,
          name: formValues.title,
        }),
      });

      handleClose();
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentItem]);

  const title =
    isEditing && currentItem
      ? 'Edit Item'
      : currentItem
      ? 'Item info'
      : 'Create a new Item';

  const readOnly = !isEditing;

  return (
    <div>
      <Drawer
        className="item-edit"
        title={title}
        width={500}
        visible={visible}
        onClose={handleClose}
        footer={
          <Space size={16}>
            {isEditing && (
              <Popconfirm
                title="Discard changes made in the item information?"
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
                {currentItem?.campaignItemId ? 'Update Item' : 'Add Item'}
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
          layout="vertical"
          hideRequiredMark
          scrollToFirstError
          validateMessages={validateMessages}
        >
          <Form.Item
            name="image"
            valuePropName="fileList"
            className="item-edit__upload mb-2"
            getValueFromEvent={normFile}
            rules={[
              {
                validator: () => {
                  if (!imageUrl) {
                    return Promise.reject('This is a required field');
                  }
                  return Promise.resolve();
                },
                validateTrigger: 'onSubmit',
              },
            ]}
          >
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
              disabled={readOnly}
              onChange={onChangeUpload}
              accept=".jpg,.jpeg,.png"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="image" />
              ) : (
                <div>
                  <PlusOutlined />
                  <div>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="Title" disabled={readOnly} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea placeholder="Description" disabled={readOnly} />
          </Form.Item>
          <Form.Item
            name="url"
            label="Url"
            rules={[
              {
                pattern: URLValidate,
                message: `Url invalid`,
              },
            ]}
          >
            <Input placeholder="Url" disabled={readOnly} />
          </Form.Item>
          <Form.Item name="saleOff" label="Sale Off">
            <InputNumber
              defaultValue={0}
              disabled={readOnly}
              min={0}
              max={100}
              formatter={value => `${value}%`}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};
