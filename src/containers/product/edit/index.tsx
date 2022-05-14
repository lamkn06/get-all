/* eslint-disable no-console */
/* eslint-disable no-empty */
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  notification,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Upload,
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import productService from 'api/product.api';
import { Drawer } from 'components/drawer';
import { NumberInput } from 'components/number-input';
import { PRICE_UNIT } from 'constants/index';
import { buildMessage, getBase64 } from 'helpers';
import { checkValidFile } from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setEditing,
  setVisible,
} from 'pages/restaurant-management/redux/product';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ProductType } from 'types/product';
import { validateMessages } from 'validators';
import './index.scss';

interface Props {
  restaurantId: string;
  onSuccess: () => void;
}

const normFile = e => {
  if (Array.isArray(e)) {
    return e;
  }

  return e && [e.fileList[e.fileList.length - 1]];
};

export const EditProduct: React.FC<Props> = ({ restaurantId, onSuccess }) => {
  const { canEdit } = usePermissions({
    module: 'manage_restaurants',
  });

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const dispatch = useDispatch();
  const {
    visible,
    isEditing,
    currentProduct,
    productCategories,
    productAddons,
  } = useAppSelector(state => state.productManagement);

  useEffect(() => {
    if (currentProduct && visible) {
      form.setFieldsValue({
        ...currentProduct,
        addons: currentProduct.addons.map(addon => addon.id),
        image: currentProduct.image ? [currentProduct.image] : undefined,
        productCategories: currentProduct.productCategories.map(cat => cat.id),
      });
      setImageUrl(currentProduct.image);
    } else {
      setImageUrl('');
    }
  }, [currentProduct, visible]);

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
    try {
      const formValues = await form.validateFields();
      const data = new FormData();

      const payload = {
        ...formValues,
        active: formValues.active === undefined ? false : formValues.active,
        restaurantId: restaurantId,
      } as ProductType;
      delete payload.image;

      let id = '';
      if (currentProduct) {
        await productService.update({
          ...currentProduct,
          ...payload,
        });
        id = currentProduct.id;
      } else {
        const res = await productService.create(payload);
        id = res.data.id;
      }

      if (formValues.image && formValues.image[0].originFileObj) {
        data.append('file', formValues.image[0].originFileObj);
        await productService.upload(id, data);
      }

      notification.success({
        message: buildMessage({
          isCreate: !currentProduct,
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
  }, [currentProduct]);

  const validatorBasePrice = useCallback(() => {
    const {
      basePrice,
      discount,
    }: {
      basePrice: number;
      discount: number;
    } = form.getFieldsValue();

    if (basePrice && basePrice < discount) {
      return Promise.reject('The regular price can not over discount');
    }
    return Promise.resolve();
  }, []);

  const readOnly = !isEditing;

  const title =
    isEditing && currentProduct
      ? 'Edit Product'
      : currentProduct
      ? 'Product Info'
      : 'Create a new Product';

  return (
    <Drawer
      className="product-edit"
      title={title}
      width={500}
      visible={visible}
      onClose={handleClose}
      footer={
        <Space size={16}>
          {isEditing && (
            <Popconfirm
              title="Discard changes made in the product information?"
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
              {currentProduct?.id ? 'Update Product' : 'Add Product'}
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
        <Form.Item
          name="image"
          valuePropName="fileList"
          className="product-edit__upload mb-2"
          getValueFromEvent={normFile}
          rules={[{ required: true }]}
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
          name="name"
          label="Product Name"
          rules={[{ required: true }]}
        >
          <Input disabled={readOnly} placeholder="Product Name" />
        </Form.Item>
        <Form.Item
          name="productCategories"
          label="Category"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            mode="multiple"
            showSearch
            disabled={readOnly}
            placeholder="Category"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {productCategories.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea placeholder="Description" disabled={readOnly} />
        </Form.Item>
        <Space>
          <Form.Item
            name="basePrice"
            label="Regular Price"
            rules={[
              {
                required: true,
                validator: () => validatorBasePrice(),
                validateTrigger: 'onSubmit',
              },
            ]}
          >
            <NumberInput
              disabled={readOnly}
              placeholder="Regular Price"
              addonBefore={PRICE_UNIT}
            />
          </Form.Item>
          <Form.Item name="discount" label="Discount">
            <NumberInput
              disabled={readOnly}
              placeholder="Discount"
              addonBefore={PRICE_UNIT}
            />
          </Form.Item>
        </Space>
        <Space>
          <Form.Item name="unit" label="Unit">
            <NumberInput disabled={readOnly} placeholder="Product Unit" />
          </Form.Item>
          <Form.Item name="unit" label="Sold Unit">
            <NumberInput disabled placeholder="Sold Unit" />
          </Form.Item>
          <Form.Item label="Active" valuePropName="checked" name="active">
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
              disabled={readOnly}
            />
          </Form.Item>
        </Space>
        <Row align="middle" justify="space-between">
          <Col>
            <Form.Item
              label="Recommended"
              valuePropName="checked"
              name="isRecommended"
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
                disabled={readOnly}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="Popular" valuePropName="checked" name="isPopular">
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
                disabled={readOnly}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="New" valuePropName="checked" name="isNew">
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
                disabled={readOnly}
              />
            </Form.Item>
          </Col>
          {/* <Col>
            <Form.Item label="Veg" valuePropName="checked" name="isVeg">
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
                disabled={readOnly}
              />
            </Form.Item>
          </Col> */}
        </Row>
        <Form.Item name="addons" label="Addons">
          <Select
            showSearch
            mode="multiple"
            disabled={readOnly}
            placeholder="Addons"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {productAddons.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};
