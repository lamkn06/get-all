/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-empty */
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  FilterFilled,
  MoreOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popover,
  Radio,
  Row,
  Select,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
  Typography,
} from 'antd';
import Search from 'antd/lib/input/Search';
import { LetterAvatar } from 'components/letter-avatar';
import { TableNoData } from 'components/table-no-data';
import { DriverGroup, MODULES, VehicleTypes } from 'constants/index';
import { cleanObject, removeSnakeCase } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import { capitalize } from 'lodash';
import {
  setCurrentDriver,
  setEditing,
  setTableAll,
  setVisible,
} from 'pages/driver-management/redux/slice';
import { useCallback, useMemo, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { useDispatch } from 'react-redux';
import { ApprovalStatusType, DriverType, StatusType } from 'types';
import { VehicleType } from 'types/driver';
import { docs } from 'utils/commons';

interface Props {
  loading?: boolean;
  drivers?: DriverType[];
  onApprove?: (driver: DriverType) => void;
  onReject?: (driverId: string, reasons: string[]) => void;
  onPending?: (driverId: string, message: string) => void;
  onExport?: () => void;
}

export const ListDrivers: React.FC<Props> = ({
  drivers,
  loading,
  onApprove,
  onReject,
  onPending,
  onExport,
}) => {
  const { canEdit, canCreate } = usePermissions({
    module: MODULES.MANAGE_DRIVERS,
  });

  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();
  const [searchData, setSearchData] = useState({
    searchText: '',
    searchedColumn: '',
  });
  const searchInput = useRef(undefined);

  const { tableAll, currentDriver } = useAppSelector(
    state => state.driverManagement,
  );
  const { total, pageSize, pageIndex } = tableAll;

  const onRowClick = (driver: DriverType) => {
    dispatch(setCurrentDriver(driver));
    dispatch(setVisible(true));
    dispatch(setEditing(false));
  };

  const onEdit = (driver: DriverType) => {
    dispatch(setCurrentDriver(driver));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const onShowModal = useCallback((driver: DriverType, type: string) => {
    setOpen(true);
    setModalType(type);
    dispatch(setCurrentDriver(driver));
    form.resetFields();
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      dispatch(
        setTableAll({
          ...tableAll,
          pageIndex: 1,
          filter: {
            keyword: text,
          },
        }),
      );
    },
    [tableAll],
  );

  const handleAddNew = () => {
    dispatch(setCurrentDriver(undefined));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleApprove = useCallback(
    driver => {
      Modal.confirm({
        title: 'Confirm',
        icon: <ExclamationCircleOutlined />,
        content: 'Are you sure?',
        okText: 'Approve',
        cancelText: 'Close',
        centered: true,
        onOk: () => {
          const { note } = form.getFieldsValue();
          const _driver = {
            ...driver,
            approvalStatus: 'approval' as ApprovalStatusType,
            approvalNote: note,
          };
          onApprove(_driver);
          setOpen(false);
        },
      });
    },
    [modalType, onApprove, currentDriver],
  );

  const handlePending = useCallback(() => {
    const { pendingNote } = form.getFieldsValue();
    onPending(currentDriver.driverId, pendingNote);
    setOpen(false);
  }, [onPending, currentDriver]);

  const handleReject = useCallback(() => {
    const { reason } = form.getFieldsValue() as { reason: string[] };
    onReject(currentDriver.driverId, reason);
    setOpen(false);
  }, [modalType, onReject, currentDriver]);

  const handleChangeStatus = useCallback(async () => {
    try {
      await form.validateFields();
      if (modalType === 'reject') {
        handleReject();
      }
      if (modalType === 'pending') {
        handlePending();
      }
    } catch (_) {}
  }, [modalType, onReject, onPending, currentDriver]);

  const handleSearchColumn = (
    selectedKeys: string[],
    confirm: Function,
    dataIndex: string,
  ) => {
    confirm();
    setSearchData({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  const handleReset = (clearFilters: Function) => {
    clearFilters();
    setSearchData({ searchText: '', searchedColumn: '' });
  };

  const getColumnSearchProps = useCallback(
    (dataIndex: string, title: string) => ({
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search ${title}`}
            value={selectedKeys[0]}
            onChange={e =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearchColumn(selectedKeys, confirm, dataIndex)
            }
            style={{ display: 'block', marginBottom: 8 }}
          />
          <Space>
            <Button
              onClick={() => handleReset(clearFilters)}
              size="small"
              block
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={() =>
                handleSearchColumn(selectedKeys, confirm, dataIndex)
              }
              size="small"
              block
            >
              Search
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: string) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInput.current.select(), 100);
        }
      },
      render: (text: string) =>
        searchData.searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchData.searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    }),
    [searchData],
  );

  const getColumnCheckboxProps = useCallback(
    () => ({
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div>
          <div className="px-2 py-1">
            <Radio.Group
              value={selectedKeys[0] || 'all'}
              onChange={({ target }) => {
                setSelectedKeys(target.value ? [target.value] : []);
              }}
            >
              <Space direction="vertical">
                {[
                  { text: 'All', value: 'all' },
                  { text: 'Active', value: 'active' },
                  { text: 'Inactive', value: 'inactive' },
                  { text: 'Is Busy', value: 'isBusy' },
                ].map(item => (
                  <Radio key={item.value} value={item.value}>
                    {item.text}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
          <div className="ant-table-filter-dropdown-btns">
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
              className="mr-2"
              type="link"
              disabled={!selectedKeys[0]}
            >
              Reset
            </Button>
            <Button type="primary" onClick={() => confirm()} size="small">
              Ok
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered: string) => (
        <FilterFilled style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
    }),
    [searchData],
  );

  const columns = useMemo(() => {
    return [
      {
        title: 'Driver Name',
        key: 'profile',
        width: 200,
        render: ({ driverProfile }: DriverType) => (
          <LetterAvatar
            photoURL={driverProfile.picture}
            alt={driverProfile.firstName}
            firstName={driverProfile.firstName}
            fullName={`${driverProfile.firstName}, ${
              driverProfile.lastName || ''
            }`}
          />
        ),
      },
      {
        title: 'Contact No.',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        width: 140,
        render: (phoneNumber: string) => phoneNumber || <TableNoData />,
      },
      {
        title: 'Vehicle',
        dataIndex: 'vehicles',
        key: 'vehicleType',
        filters: VehicleTypes.map(item => ({
          text: item.label,
          value: item.value,
        })),
        render: (vehicles: VehicleType[]) => {
          return (
            <Space direction="vertical" size={2}>
              {!vehicles || vehicles.length === 0 ? (
                <TableNoData />
              ) : (
                vehicles.map(vehicle =>
                  vehicle.status === 'active' ? (
                    <Typography.Link key={vehicle.vehicleId}>
                      {vehicle.registeredPlateNumber} ({vehicle.vehicleType})
                    </Typography.Link>
                  ) : (
                    <Typography.Text key={vehicle.vehicleId} type="secondary">
                      {vehicle.registeredPlateNumber} ({vehicle.vehicleType})
                    </Typography.Text>
                  ),
                )
              )}
            </Space>
          );
        },
      },
      {
        title: 'Driver Group',
        dataIndex: ['driverProfile', 'driverGroup'],
        key: 'driverGroup',
        className: 'text-capitalize',
        filters: DriverGroup.map(item => ({
          text: item.name,
          value: item.value,
        })),
        render: (value: string) => removeSnakeCase(value),
      },
      {
        title: 'Cluster',
        dataIndex: 'deliveryCluster',
        key: 'deliveryCluster',
        ...getColumnSearchProps('deliveryCluster', 'Cluster'),
      },
      {
        title: 'Area',
        dataIndex: 'deliveryArea',
        key: 'deliveryArea',
        ...getColumnSearchProps('deliveryArea', 'Area'),
      },
      {
        title: 'Approval Status',
        dataIndex: 'approvalStatus',
        key: 'approvalStatus',
        filters: ['pending', 'approved', 'rejected'].map(item => ({
          text: capitalize(item),
          value: item,
        })),
        width: 150,
        render: (approvalStatus: ApprovalStatusType) => {
          const color =
            approvalStatus === 'approved'
              ? 'green'
              : approvalStatus === 'pending'
              ? 'gold'
              : 'red';
          return approvalStatus ? (
            <Tag color={color} className="text-capitalize">
              {approvalStatus}
            </Tag>
          ) : (
            <TableNoData />
          );
        },
      },
      {
        title: 'Driver Status',
        key: 'driverStatus',
        width: 130,
        render: (driver: DriverType) =>
          driver.isBusy ? (
            <Tag
              color="error"
              className="text-capitalize"
              icon={<ClockCircleOutlined />}
            >
              <Typography.Text style={{ color: 'currentcolor' }} strong>
                Busy
              </Typography.Text>
            </Tag>
          ) : (
            <Tag
              color={driver.driverStatus === 'active' ? 'green' : 'red'}
              className="text-capitalize"
            >
              {driver.driverStatus}
            </Tag>
          ),
        ...getColumnCheckboxProps(),
      },
      {
        title: 'System Status',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        filters: [
          { text: 'Active', value: 'active' },
          { text: 'Inactive', value: 'inactive' },
        ],
        render: (status: StatusType) => {
          const color = status === 'active' ? 'green' : 'red';
          return status ? (
            <Tag color={color} className="text-capitalize">
              {status}
            </Tag>
          ) : (
            <TableNoData />
          );
        },
      },
      {
        key: 'action',
        width: 60,
        fixed: 'right' as any,
        render: (driver: DriverType) => {
          if (!canEdit) return null;
          return (
            <Popover
              placement="left"
              trigger="focus"
              content={
                <Space direction="vertical">
                  <Button
                    block
                    size="small"
                    onClick={ev => {
                      ev.stopPropagation();
                      onEdit(driver);
                    }}
                  >
                    Edit
                  </Button>
                  {driver.approvalStatus !== 'approved' && (
                    <Button
                      block
                      size="small"
                      type="primary"
                      onClick={ev => {
                        ev.stopPropagation();
                        handleApprove(driver);
                      }}
                    >
                      Approval
                    </Button>
                  )}

                  {driver.approvalStatus !== 'approved' && (
                    <Button
                      block
                      size="small"
                      type="primary"
                      ghost
                      onClick={ev => {
                        ev.stopPropagation();
                        onShowModal(driver, 'pending');
                      }}
                    >
                      Pending
                    </Button>
                  )}

                  {driver.approvalStatus !== 'approved' && (
                    <Button
                      block
                      size="small"
                      type="ghost"
                      danger
                      onClick={ev => {
                        ev.stopPropagation();
                        onShowModal(driver, 'reject');
                      }}
                    >
                      Reject
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
  }, [drivers]);

  const onTableChange = useCallback(
    (
      { current, pageSize }: TablePaginationConfig,
      filters: {
        deliveryArea: Array<string>;
        deliveryCluster: Array<string>;
        driverGroup: Array<string>;
        driverStatus: Array<'all' | 'active' | 'inactive' | 'isBusy'>;
        vehicleType: Array<string>;
        approvalStatus: Array<'active' | 'inactive'>;
        status: Array<'active' | 'inactive'>;
      },
    ) => {
      const newFilter = {
        driverGroup: filters.driverGroup,
        vehicleType: filters.vehicleType,
        approvalStatus: filters.approvalStatus,
        status: undefined,
        driverStatus: undefined,
        deliveryArea: undefined,
        deliveryCluster: undefined,
        isBusy: undefined,
      };
      if (filters.driverStatus) {
        const driverStatus = filters.driverStatus[0];
        if (driverStatus !== 'all') {
          if (driverStatus === 'isBusy') {
            newFilter.isBusy = 1;
          } else {
            newFilter.driverStatus = filters.driverStatus[0];
          }
        }
      }
      if (filters.status?.length === 1) {
        newFilter.status = filters.status[0];
      }
      if (filters.deliveryArea?.length === 1) {
        newFilter.deliveryArea = filters.deliveryArea[0];
      }
      if (filters.deliveryCluster?.length === 1) {
        newFilter.deliveryCluster = filters.deliveryCluster[0];
      }
      dispatch(
        setTableAll({
          ...tableAll,
          pageIndex: current,
          pageSize,
          filter: cleanObject(newFilter),
        }),
      );
    },
    [tableAll],
  );

  return (
    <div className="driver-list">
      <Row justify="space-between" className="mb-1" gutter={[10, 10]}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Search
            defaultValue={tableAll.filter?.keyword}
            placeholder="input search text"
            onSearch={handleSearch}
          />
        </Col>
        {canCreate && (
          <Col md={{ span: 14 }} sm={{ span: 24 }} className="text-right">
            <Button
              type="primary"
              icon={<ExportOutlined />}
              className="mr-1"
              onClick={onExport}
            >
              Export
            </Button>
            <Button
              type="primary"
              ghost
              icon={<PlusCircleOutlined />}
              onClick={handleAddNew}
            >
              Add a new driver
            </Button>
          </Col>
        )}
      </Row>

      <Table
        loading={loading}
        rowKey="userId"
        columns={columns}
        dataSource={drivers}
        rowClassName="driver-list__row"
        pagination={{ total, pageSize, current: pageIndex }}
        scroll={{
          x: 1400,
          y: `calc(100vh - 322px)`,
        }}
        onChange={onTableChange}
        onRow={record => {
          return {
            onClick: _ => onRowClick(record),
          };
        }}
      />

      <Modal
        title="Update approval status"
        visible={open}
        maskClosable={false}
        centered
        onCancel={() => setOpen(false)}
        onOk={handleApprove}
        okText="Approve"
        footer={[
          <Button key="4" onClick={() => setOpen(false)}>
            Close
          </Button>,
          <Button key="1" type="primary" danger onClick={handleChangeStatus}>
            <span className="text-capitalize">{modalType}</span>
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          validateMessages={{
            required: '${label} is required!',
          }}
        >
          {modalType === 'pending' && (
            <Form.Item
              name="pendingNote"
              label="Pending Note"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          )}
          {modalType === 'reject' && (
            <Form.Item
              name="reason"
              label="Select a reason that why it is disapproved"
              rules={[{ required: true }]}
            >
              <Select defaultActiveFirstOption mode="multiple">
                {docs.map(doc => (
                  <Select.Option value={doc.value} key={doc.value}>
                    {doc.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};
