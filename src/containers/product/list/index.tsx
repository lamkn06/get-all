import {
  ExclamationCircleOutlined,
  MoreOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Modal,
  notification,
  Popover,
  Row,
  Space,
  Table,
  TablePaginationConfig,
  Typography,
  Upload,
} from 'antd';
import Search from 'antd/lib/input/Search';
import productService from 'api/product.api';
import { TableNoData } from 'components/table-no-data';
import { PRICE_UNIT } from 'constants/index';
import { CategoryFilter } from 'containers/product/list/category-filter';
import { formatDateTime } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setCurrentProduct,
  setEditing,
  setSelectedCategory,
  setTable,
  setVisible,
} from 'pages/restaurant-management/redux/product';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ProductType } from 'types/product';

interface Props {
  restaurantId: string;
  loading: boolean;
  products: ProductType[];
  onSuccess(): void;
}

export const ListProduct: React.FC<Props> = ({
  restaurantId,
  products,
  loading,
  onSuccess,
}) => {
  const { canDelete, canCreate, canEdit } = usePermissions({
    module: 'manage_restaurants',
  });

  const { table, selectedCategory } = useAppSelector(
    state => state.productManagement,
  );

  const { total, pageSize, pageIndex } = table;

  const dispatch = useDispatch();
  const onRowClick = (product: ProductType) => {
    dispatch(setCurrentProduct(product));
    dispatch(setVisible(true));
    dispatch(setEditing(false));
  };

  const handleAddNew = () => {
    dispatch(setCurrentProduct(undefined));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleUploadFile = useCallback(async event => {
    try {
      const data = new FormData();

      data.append('file', event.file);

      await productService.uploadFile(restaurantId, data);

      notification.success({ message: `Upload file successful` });
      onSuccess();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, []);

  const handleOnEdit = (product: ProductType) => {
    dispatch(setCurrentProduct(product));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleSearch = useCallback(
    (text: string) => {
      dispatch(
        setTable({
          ...table,
          pageIndex: 1,
          filter: {
            name: text,
          },
        }),
      );
    },
    [setTable],
  );

  const handleOnDelete = (product: ProductType) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Typography.Text type="warning">
          Note: You cannot undo this action
        </Typography.Text>
      ),
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk() {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
          try {
            await productService.delete(product.id);
            notification.success({
              message: `Delete ${product.name} successful!`,
            });
            onSuccess();
            resolve('');
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  };

  const onTableChange = ({ current, pageSize }: TablePaginationConfig) => {
    dispatch(setTable({ ...table, pageIndex: current, pageSize }));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name || <TableNoData />,
    },
    {
      title: 'Category',
      dataIndex: ['productCategory', 'name'],
      key: 'productCategory.name',
      render: (name: string) => name || <TableNoData />,
      filterDropdown: ({ confirm, setSelectedKeys, clearFilters }) => (
        <div className="p-1">
          <CategoryFilter
            onSelect={value => {
              setSelectedKeys(value ? [value] : []);
              dispatch(setSelectedCategory(value));
            }}
            categoryId={selectedCategory}
          />
          <div className="text-right">
            <Button
              onClick={() => {
                dispatch(setSelectedCategory(''));
                clearFilters();
                confirm();
              }}
              size="small"
            >
              Reset
            </Button>
            <Button
              className="ml-1"
              onClick={() => confirm()}
              size="small"
              type="primary"
            >
              Search
            </Button>
          </div>
        </div>
      ),
      filterIcon: () => (
        <SearchOutlined
          style={{ color: selectedCategory ? '#1890ff' : undefined }}
        />
      ),
    },
    {
      title: 'Price',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price: string) => `${price} ${PRICE_UNIT}` || <TableNoData />,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount: string) =>
        discount ? `${discount} ${PRICE_UNIT}` : <TableNoData />,
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) =>
        createdAt ? formatDateTime(createdAt) : <TableNoData />,
    },
    {
      title: 'Date Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string) =>
        updatedAt ? formatDateTime(updatedAt) : <TableNoData />,
    },
    {
      key: 'action',
      width: 60,
      fixed: 'right' as any,
      render: (product: ProductType) => {
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
                      handleOnEdit(product);
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
                      handleOnDelete(product);
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
  ];

  return (
    <div>
      <Row justify="space-between" className="mb-1" gutter={10}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Search
            defaultValue={table.filter?.name}
            placeholder="input search text"
            onSearch={handleSearch}
          />
        </Col>
        {canCreate && (
          <Space>
            <Col md={{ span: 12 }} sm={{ span: 24 }} className="text-right">
              <Upload
                name="image"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleUploadFile}
                accept="'.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'"
              >
                <Button type="primary" ghost icon={<UploadOutlined />}>
                  Upload file
                </Button>
              </Upload>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }} className="text-right">
              <Button
                type="primary"
                ghost
                icon={<PlusCircleOutlined />}
                onClick={handleAddNew}
              >
                Add new product
              </Button>
            </Col>
          </Space>
        )}
      </Row>

      <Table
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={products}
        onChange={onTableChange}
        pagination={{ total, pageSize, current: pageIndex }}
        scroll={{
          x: 800,
          y: `calc(100vh - 320px)`,
        }}
        onRow={record => {
          return {
            onClick: () => onRowClick(record),
          };
        }}
      />
    </div>
  );
};
