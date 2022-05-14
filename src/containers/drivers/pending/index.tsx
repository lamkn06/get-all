import {
  ExclamationCircleOutlined,
  MoreOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popover,
  Row,
  Select,
  Space,
  Table,
  TablePaginationConfig,
  Typography,
} from 'antd';
import Search from 'antd/lib/input/Search';
import { LetterAvatar } from 'components/letter-avatar';
import { TableNoData } from 'components/table-no-data';
import { MODULES } from 'constants/index';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setCurrentDriver,
  setEditing,
  setTablePending,
  setVisible,
} from 'pages/driver-management/redux/slice';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ApprovalStatusType, DriverType } from 'types';
import { VehicleType } from 'types/driver';
import { docs } from 'utils/commons';
import './index.scss';

interface Props {
  loading?: boolean;
  drivers?: DriverType[];

  onDelete?: (driver: DriverType) => void;
  onApprove?: (driver: DriverType) => void;
  onReject?: (driverId: string, reasons: string[]) => void;
  onPending?: (driverId: string, message: string) => void;
}

export const PendingDrivers: React.FC<Props> = ({
  drivers,
  loading,

  onApprove,
  onReject,
  onPending,
}) => {
  const { canEdit, canCreate } = usePermissions({
    module: MODULES.MANAGE_DRIVERS,
  });

  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();
  const { tablePending, currentDriver } = useAppSelector(
    state => state.driverManagement,
  );

  const { total, pageSize, pageIndex } = tablePending;

  const onRowClick = (driver: DriverType) => {
    dispatch(setCurrentDriver(driver));
    dispatch(setVisible(true));
    dispatch(setEditing(false));
  };

  const onShowModal = useCallback((driver: DriverType, type: string) => {
    form.resetFields();
    setOpen(true);
    setModalType(type);
    dispatch(setCurrentDriver(driver));
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      dispatch(
        setTablePending({
          ...tablePending,
          pageIndex: 1,
          filter: {
            ...tablePending.filter,
            keyword: text,
          },
        }),
      );
    },
    [tablePending],
  );

  const handleAddNew = () => {
    dispatch(setCurrentDriver(undefined));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  // const handleConfirm = useCallback(
  //   (driver: DriverType) => {
  //     confirm({
  //       title: 'Are you sure you want to delete this driver?',
  //       icon: <ExclamationCircleOutlined />,
  //       content: (
  //         <Typography.Text type="warning">
  //           NotTypography.e: You cannot undo this action
  //         </Typography.Text>
  //       ),
  //       okText: 'Yes',
  //       okType: 'danger',
  //       cancelText: 'No',
  //       centered: true,
  //       onOk() {
  //         onDelete && onDelete(driver);
  //       },
  //     });
  //   },
  //   [onDelete],
  // );

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
    if (!pendingNote) {
      return;
    }

    onPending(currentDriver.driverId, pendingNote);
    setOpen(false);
  }, [modalType, onReject, onPending, currentDriver]);

  const handleReject = useCallback(() => {
    const { reason } = form.getFieldsValue() as { reason: string[] };
    if (!reason) {
      return;
    }

    if (reason.length === 0) {
      return;
    }
    onReject(currentDriver.driverId, reason);
    setOpen(false);
  }, [modalType, onReject, onPending, currentDriver]);

  const handleChangeStatus = useCallback(() => {
    form.validateFields();
    if (modalType === 'reject') {
      handleReject();
    }
    if (modalType === 'pending') {
      handlePending();
    }
  }, [modalType, onReject, onPending, currentDriver]);

  const columns = useMemo(() => {
    return [
      {
        title: 'Driver Name',
        key: 'profile',
        render: ({ driverProfile }: DriverType) => (
          <LetterAvatar
            photoURL={driverProfile.picture}
            alt={`${driverProfile.firstName} ${driverProfile.lastName}`}
            firstName={driverProfile.firstName}
            fullName={`${driverProfile.firstName}, ${driverProfile.lastName}`}
          />
        ),
      },
      {
        title: 'Mobile Number',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
      },
      {
        title: 'Email Address',
        dataIndex: 'email',
        key: 'email',
        render: (email: string) => email || <TableNoData />,
      },
      {
        title: 'Registered Address',
        dataIndex: ['driverProfile', 'address'],
        key: 'driverProfile.address',
        render: (address: string) => address || <TableNoData />,
      },
      {
        title: 'Vehicle Registered',
        dataIndex: 'vehicles',
        key: 'vehicleModel',
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
        title: 'Driver License Restriction',
        dataIndex: 'licenseRestriction',
        key: 'licenseRestriction',
        render: (licenseRestriction: string) =>
          licenseRestriction || <TableNoData />,
      },
      {
        title: 'Cluster',
        dataIndex: 'deliveryCluster',
        key: 'deliveryCluster',
        render: (deliveryCluster: string) => deliveryCluster || <TableNoData />,
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
                      onRowClick(driver);
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
                      type="ghost"
                      size="small"
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

  const onTableChange = ({ current, pageSize }: TablePaginationConfig) => {
    dispatch(
      setTablePending({ ...tablePending, pageIndex: current, pageSize }),
    );
  };

  return (
    <div className="driver-list">
      <Row justify="space-between" className="mb-1" gutter={[10, 10]}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Search
            defaultValue={tablePending.filter?.keyword}
            placeholder="input search text"
            onSearch={handleSearch}
          />
        </Col>
        {canCreate && (
          <Col md={{ span: 12 }} sm={{ span: 24 }} className="text-right">
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
        scroll={{
          x: 1300,
          y: `calc(100vh - 344px)`,
        }}
        pagination={{ total, pageSize, current: pageIndex }}
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
