/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable no-useless-catch */
import {
  MoreOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  notification,
  Popconfirm,
  Popover,
  Row,
  Space,
  Spin,
  Switch,
  Table,
  TablePaginationConfig,
  Typography,
} from 'antd';
import Search from 'antd/lib/input/Search';
import Upload, { UploadChangeParam, RcFile } from 'antd/lib/upload';
import productCategoryService from 'api/productCategory.api';
import { Drawer } from 'components/drawer';
import { TableNoData } from 'components/table-no-data';
import { showConfirm } from 'components/ultil';
import { buildMessage, getBase64, serializeQuery } from 'helpers';
import { checkValidFile } from 'helpers/component.helper';
import { usePermissions } from 'hooks/usePermission';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoryType, TableBaseType } from 'types';
import { validateMessages } from 'validators';
import './index.scss';

interface Props {}

const normFile = e => {
  if (Array.isArray(e)) {
    return e;
  }

  return e && [e.fileList[e.fileList.length - 1]];
};

const ProductCategories: React.FC<Props> = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentCate, setCurrentCate] = useState<
    Partial<CategoryType> | undefined
  >();

  const { canCreate, canEdit, canDelete } = usePermissions({
    module: 'manage_restaurants',
  });

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [pagination, setPagination] = useState<TableBaseType>({
    pageIndex: 1,
    pageSize: 10,
    total: 10,
  });

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.filter]);

  useEffect(() => {
    if (currentCate) {
      form.setFieldsValue({ ...currentCate });
    } else {
      form.resetFields();
    }
  }, [currentCate]);

  const fetchData = async () => {
    setLoading(true);
    const params = serializeQuery(pagination);
    const { data } = await productCategoryService.get(params);
    setCategories(data.results);
    setPagination(oldValue => ({ ...oldValue, total: data.totalRecords }));
    setLoading(false);
  };

  const onRowClick = (category: CategoryType) => {
    const image: any = category.image ? [category.image] : undefined;
    setCurrentCate({
      ...category,
      image: image,
    });
    setImageUrl(category.image);
    setEditing(false);
  };

  const handleAddNew = () => {
    setCurrentCate({});
    setEditing(true);
  };

  const handleSearch = useCallback((text: string) => {
    setPagination({
      ...pagination,
      pageIndex: 1,
      filter: {
        name: text,
      },
    });
  }, []);

  const handleOnDelete = (category: CategoryType) => {
    showConfirm({
      title: 'Are you sure you want to delete this category?',
      onOk() {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
          try {
            await productCategoryService.delete(category.id);
            notification.success({
              message: `Delete ${category.name} successful!`,
            });
            resolve('');
            fetchData();
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  };

  const onTableChange = ({ current }: TablePaginationConfig) => {
    setPagination(oldValue => ({ ...oldValue, pageIndex: current }));
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

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();
      const data = new FormData();
      setSaving(true);

      const payload = {
        ...formValues,
      } as CategoryType;

      delete payload.image;

      let id = '';
      if (currentCate) {
        await productCategoryService.update({
          ...currentCate,
          ...payload,
        });
        id = currentCate.id;
      } else {
        const res = await productCategoryService.create(payload);
        id = res.data.id;
      }

      if (formValues.image && formValues.image[0].originFileObj) {
        data.append('file', formValues.image[0].originFileObj);
        await productCategoryService.upload(id, data);
      }

      notification.success({
        message: buildMessage({
          isCreate: !currentCate.id,
          name: formValues.name,
        }),
      });

      handleClose();
      fetchData();
    } catch (error) {
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleClose = useCallback(() => setCurrentCate(undefined), []);

  const columns = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => name || <TableNoData />,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        render: (name: string) => name || <TableNoData />,
      },
      {
        key: 'action',
        width: 60,
        fixed: 'right' as any,
        render: (category: CategoryType) => {
          if (!canEdit && !canDelete) {
            return <></>;
          }

          return (
            <Popover
              placement="left"
              trigger="focus"
              content={
                <Space direction="vertical">
                  {canEdit && (
                    <Button
                      block
                      size="small"
                      onClick={ev => {
                        ev.stopPropagation();
                        setEditing(true);
                        setCurrentCate(category);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      danger
                      block
                      size="small"
                      onClick={ev => {
                        ev.stopPropagation();
                        handleOnDelete(category);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Space>
              }
            >
              <Button
                onClick={ev => ev.stopPropagation()}
                icon={<MoreOutlined />}
                shape="circle"
              />
            </Popover>
          );
        },
      },
    ],
    [categories],
  );

  return (
    <div>
      <Row justify="space-between" className="mb-1" gutter={10}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Search placeholder="input search text" onSearch={handleSearch} />
        </Col>
        {canCreate && (
          <Col md={{ span: 12 }} sm={{ span: 24 }} className="text-right">
            <Button
              type="primary"
              ghost
              icon={<PlusCircleOutlined />}
              onClick={handleAddNew}
            >
              Add new category
            </Button>
          </Col>
        )}
      </Row>

      <Table
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={categories}
        onChange={onTableChange}
        scroll={{
          x: 800,
        }}
        onRow={record => {
          return {
            onClick: () => onRowClick(record),
          };
        }}
        pagination={{
          total: pagination.total,
          pageSize: pagination.pageSize,
          size: 'small',
        }}
      />

      <Drawer
        title="View category"
        visible={!!currentCate}
        onClose={handleClose}
        footer={
          <Space size={16}>
            {editing ? (
              <>
                <Popconfirm
                  title="Discard changes made in the category information?"
                  cancelText="Cancel"
                  okText="Discard"
                  onConfirm={handleClose}
                >
                  <Button type="ghost">Cancel</Button>
                </Popconfirm>
                <Button onClick={handleSubmit} type="primary" loading={saving}>
                  {currentCate?.id ? 'Update' : 'Save'}
                </Button>
              </>
            ) : (
              canEdit && (
                <Button type="ghost" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )
            )}
          </Space>
        }
      >
        <Spin tip="Saving..." spinning={saving}>
          <Form
            form={form}
            validateMessages={validateMessages}
            layout="vertical"
          >
            <Typography.Title level={5}>Category information</Typography.Title>
            <Form.Item name="id" noStyle>
              <Input hidden />
            </Form.Item>
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
                disabled={!editing}
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
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input placeholder="Name" disabled={!editing} />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea placeholder="Description" disabled={!editing} />
            </Form.Item>
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
                    disabled={editing}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  label="Popular"
                  valuePropName="checked"
                  name="isPopular"
                >
                  <Switch
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                    disabled={editing}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label="New" valuePropName="checked" name="isNew">
                  <Switch
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                    disabled={editing}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Drawer>
    </div>
  );
};

export default ProductCategories;
