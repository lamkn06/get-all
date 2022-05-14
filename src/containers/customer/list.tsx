/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable no-useless-catch */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MoreOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Col,
  Form,
  Modal,
  Popover,
  Row,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
} from 'antd';
import { TableNoData } from 'components/table-no-data';
import { cleanObject, serializeQuery } from 'helpers';
import { BillingType, CustomerType, StatusType } from 'types';
import customerService from 'api/customer.api';
import { useAppSelector } from 'hooks/app-hooks';
import {
  setListCustomer,
  setPagination,
  setCurrentCustomer,
  setVisible,
  setEditing,
} from 'pages/customer-management/redux/slice';
import { useDispatch } from 'react-redux';
import { usePermissions } from 'hooks/usePermission';
import Search from 'antd/lib/input/Search';
import { getColumnCheckboxProps } from 'helpers/component.helper';
import { CustomerTypes } from 'constants/index';
import { BillingsFilter } from 'containers/customer/billings-filter';
import { ChangePassword } from 'containers/customer/change-password';

interface Props {}

export const ListCustomer: React.FC<Props> = () => {
  const { canEdit } = usePermissions({
    module: 'manage_customers',
  });
  const dispatch = useDispatch();
  const { currentCustomer, pagination, listCustomers } = useAppSelector(
    state => state.customerManagement,
  );

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedBillings, setSelectedBillings] = useState(undefined);
  const [openChangePwd, setOpenChangePwd] = useState(false);

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.filter]);

  useEffect(() => {
    return () => {
      dispatch(setPagination({ ...pagination, filter: undefined }));
    };
  }, []);

  useEffect(() => {
    if (currentCustomer) {
      form.setFieldsValue({ ...currentCustomer });
    } else {
      form.resetFields();
    }
  }, [currentCustomer]);

  const fetchData = async () => {
    setLoading(true);
    const params = serializeQuery(pagination);
    const { data } = await customerService.getList(params);
    dispatch(setListCustomer(data.results));
    dispatch(setPagination({ ...pagination, total: data.totalRecords }));
    setLoading(false);
  };

  const onEdit = (customer: CustomerType) => {
    dispatch(setEditing(true));
    dispatch(setVisible(true));
    dispatch(setCurrentCustomer(customer));
  };

  const onRowClick = (customer: CustomerType) => {
    dispatch(setEditing(false));
    dispatch(setVisible(true));
    dispatch(setCurrentCustomer(customer));
  };

  const handleSearch = useCallback((text: string) => {
    dispatch(
      setPagination({
        ...pagination,
        pageIndex: 1,
        filter: {
          keyword: text,
        },
      }),
    );
  }, []);

  const onTableChange = useCallback(
    (
      { current }: TablePaginationConfig,
      filters: {
        billings: Array<any>;
        types: Array<string>;
        status: Array<'all' | string>;
      },
    ) => {
      const newFilter = {
        billings: filters.billings?.[0],
        types: filters.types,
        status: undefined,
      };

      if (filters.status && filters.status[0] !== 'all') {
        newFilter.status = filters.status[0];
      }

      dispatch(
        setPagination({
          ...pagination,
          pageIndex: current,
          filter: cleanObject(newFilter),
        }),
      );
    },
    [pagination],
  );

  const columns = useMemo(
    () => [
      {
        title: 'Name',
        key: 'name',
        width: 250,
        ellipsis: true,
        render: (customer: CustomerType) => {
          return (
            <div>
              <Avatar
                src={customer.profileImage}
                alt={customer.profileImage as string}
              >
                <UserOutlined />
              </Avatar>
              <span className="ml-1">
                {customer.firstName ? (
                  `${customer.firstName}, ${customer.lastName || ''} ${
                    customer.middleName || ''
                  }`.trimRight()
                ) : (
                  <TableNoData />
                )}
              </span>
            </div>
          );
        },
      },
      {
        title: 'Phone',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        render: (phone: string) => phone || <TableNoData />,
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        ...getColumnCheckboxProps([
          { text: 'Active', value: 'active' },
          { text: 'Inactive', value: 'inactive' },
        ]),
        render: (status: StatusType) => {
          const color = status === 'active' ? 'green' : 'red';
          return (
            <Tag color={color} className="text-capitalize">
              {status}
            </Tag>
          );
        },
      },
      {
        title: 'Billings',
        dataIndex: 'billings',
        key: 'billings',
        width: 250,
        ellipsis: true,
        render: (billings: BillingType[]) =>
          billings.map(item => item.name).join(', ') || <TableNoData />,
        filterDropdown: ({
          confirm,
          setSelectedKeys,
          selectedKeys,
          clearFilters,
        }) => (
          <div className="p-1">
            <BillingsFilter
              onSelect={value => {
                setSelectedKeys(value ? [value] : []);
              }}
              billingsIds={selectedKeys[0]}
            />
            <div className="text-right">
              <Button
                onClick={() => {
                  setSelectedKeys([]);
                  setSelectedBillings(undefined);
                  clearFilters();
                  confirm();
                }}
                size="small"
              >
                Reset
              </Button>
              <Button
                className="ml-1"
                onClick={() => {
                  confirm();
                  setSelectedBillings(selectedKeys[0]);
                }}
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
            style={{ color: selectedBillings ? '#1890ff' : undefined }}
          />
        ),
      },
      {
        title: 'Customer Type',
        dataIndex: 'type',
        key: 'types',
        className: 'text-capitalize',
        filters: CustomerTypes.map(item => ({
          text: item.label,
          value: item.value,
        })),
        render: (type: string) => type || <TableNoData />,
      },
      {
        key: 'action',
        width: 60,
        fixed: 'right' as any,
        render: (customer: CustomerType) => {
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
                        onEdit(customer);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    block
                    type="primary"
                    size="small"
                    ghost
                    onClick={ev => {
                      ev.stopPropagation();
                      setOpenChangePwd(true);
                      dispatch(setCurrentCustomer(customer));
                    }}
                  >
                    Change password
                  </Button>
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
    [listCustomers, selectedBillings],
  );

  return (
    <div>
      <Row justify="space-between" className="mb-2" gutter={10}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Search placeholder="input search text" onSearch={handleSearch} />
        </Col>
      </Row>

      <Table
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={listCustomers || []}
        onChange={onTableChange}
        scroll={{
          x: 1100,
        }}
        onRow={record => {
          return {
            onClick: () => onRowClick(record),
          };
        }}
        pagination={{
          total: pagination.total,
          hideOnSinglePage: true,
          showSizeChanger: false,
        }}
      />

      <Modal
        title="Change password"
        visible={openChangePwd}
        maskClosable={false}
        onCancel={() => setOpenChangePwd(false)}
        footer={null}
      >
        <ChangePassword onToggle={setOpenChangePwd} />
      </Modal>
    </div>
  );
};
