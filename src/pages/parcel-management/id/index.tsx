/* eslint-disable no-console */
import {
  CheckSquareFilled,
  ExclamationCircleOutlined,
  InteractionFilled,
} from '@ant-design/icons';
import { useJsApiLoader } from '@react-google-maps/api';
import {
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import customerService from 'api/customer.api';
import deliveryService from 'api/delivery.api';
import driverService from 'api/driver.api';
import userService from 'api/user.api';
import { AxiosResponse } from 'axios';
import { GreenButton } from 'components/green-button';
import { TableNoData } from 'components/table-no-data';
import {
  CancelReasons,
  FailedDeliveryReasons,
  GG_MAP_LIBS,
} from 'constants/index';
import { PATHS } from 'constants/paths';
import ParcelDetailMap from 'containers/parcel/map';
import { checkAcceptedText, formatDateTime, removeSnakeCase } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { capitalize, isEmpty, sortBy } from 'lodash';
import moment from 'moment';
import {
  DropOffLocation,
  ReassignForm,
} from 'pages/parcel-management/id/index.chunk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  CustomerType,
  DriverType,
  OrderProgressType,
  ParcelType,
  UserType,
} from 'types';
import './index.scss';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const statusTree: Array<OrderProgressType> = [
  'assigned',
  'for_pickup',
  'picked_up',
  'on_going',
  'delivered',
];

interface Props {}

const ParcelDetail: React.FC<Props> = () => {
  const user = useAppSelector(state => state.user);
  const navigate = useNavigate();
  const [parcel, setParcel] = useState<ParcelType>(undefined);
  const [open, setOpen] = useState(false);
  const [openReassign, setOpenReassign] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [form] = Form.useForm();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_API_KEY,
    libraries: GG_MAP_LIBS as any,
  });

  const nextStatus = useMemo(() => {
    if (!parcel) return '';
    const index = statusTree.findIndex(item => item === parcel?.status);
    if (index === -1) return '';
    return statusTree[index + 1];
  }, [parcel]);

  useEffect(() => {
    if (id) {
      fetchDetail(id);
    }
  }, [id]);

  useEffect(() => {
    if (parcel?.order) {
      (async () => {
        let customer;

        if (
          (process.env.MASK_CUSTOMER ?? '')
            .split(',')
            .indexOf(parcel.order.customerId) > -1
        ) {
          customer = {
            firstName: parcel.pickUp.contactName,
            lastName: '',
            phoneNumber: parcel.pickUp.contactPhone,
          };
        } else {
          const { data } = await customerService.findById(
            parcel.order.customerId,
          );

          customer = data;
        }
        setParcel(oldData => ({ ...oldData, customer }));
      })();
    }
  }, [parcel?.deliveryId]);

  useEffect(() => {
    if (parcel?.deliveryStatusHistories) {
      fetchDeliveryHistories();
    }
  }, [parcel?.deliveryId]);

  const fetchDetail = async (id: string) => {
    try {
      setLoading(true);
      const { data } = await deliveryService.getDetail(id);
      const _parcel = data.results[0];
      setParcel({ ..._parcel, stops: sortBy(_parcel.stops, 'sequenceNo') });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryHistories = async () => {
    const validHistories = parcel.deliveryStatusHistories.filter(
      item => !!item.createdByObjectId,
    );
    const apis = validHistories.map(
      ({ createdByObjectType, createdByObjectId }) => {
        return createdByObjectType === 'user'
          ? userService.findByUserId(createdByObjectId)
          : createdByObjectType === 'driver'
          ? driverService.findById(createdByObjectId)
          : customerService.findById(createdByObjectId);
      },
    );
    try {
      const res = await Promise.all<AxiosResponse<any>>(apis);
      setParcel(oldData => ({
        ...oldData,
        deliveryStatusHistories: validHistories.map((item, index) => {
          return item.createdByObjectType === 'user'
            ? { ...item, user: res[index].data as UserType }
            : item.createdByObjectType === 'driver'
            ? { ...item, driver: res[index].data as DriverType }
            : { ...item, customer: res[index].data as CustomerType };
        }),
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirm = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const { cancelReason, reasonText } = values as {
        cancelReason: string;
        reasonText: string;
      };
      await deliveryService.cancelOrder(
        parcel.deliveryId,
        cancelReason === 'Other' ? reasonText : cancelReason,
      );
      notification.success({ message: 'Order canceled!' });
      navigate(PATHS.ParcelTransactions);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [parcel?.deliveryId]);

  const onChangeStatus = useCallback(async () => {
    Modal.confirm({
      title: 'Change delivery status',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Text>
          Are you sure you want to change the status to{' '}
          <Text className="text-capitalize" strong type="success">
            {' '}
            {removeSnakeCase(
              checkAcceptedText(nextStatus as OrderProgressType),
            )}
          </Text>{' '}
          ?
        </Text>
      ),
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
          try {
            setUpdating(true);
            const { data } = await deliveryService.nextStatus(
              parcel.deliveryId,
            );
            notification.success({ message: 'Delivery status updated!' });
            setParcel({
              ...parcel,
              status: data.status,
              deliveryStatusHistories: [
                ...parcel.deliveryStatusHistories,
                {
                  deliveredAt: moment().add(1, 'minute').toISOString(),
                  createdByObjectType: 'user',
                  status: data.status as OrderProgressType,
                  user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                  },
                },
              ],
            });
            resolve('');
            setUpdating(false);
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  }, [nextStatus, parcel?.deliveryStatusHistories]);

  const canCancel = [
    'pending',
    'accepted',
    'assigned',
    'for_pickup',
    'picked_up',
    'on_going',
  ].includes(parcel?.status);

  const canReassign = [
    'assigned',
    'for_pickup',
    'picked_up',
    'on_going',
  ].includes(parcel?.status);

  const canAssign =
    parcel?.status === 'pending' &&
    moment().diff(moment(parcel.createdAt), 'minutes') >= 15;

  const cancelText =
    parcel?.status === 'pending' ? 'Cancel delivery' : 'Failed Delivery';

  const reasons = useMemo(() => {
    return parcel?.status === 'pending' ? CancelReasons : FailedDeliveryReasons;
  }, [parcel?.deliveryId]);

  const renderDeliveryFare = useMemo(() => {
    if (parcel?.fee?.detail) {
      return parcel.fee.detail
        .filter(
          item =>
            item.type !== 'amount_to_be_collected' &&
            item.type !== 'amount_to_be_remitted' &&
            item.amount,
        )
        .sort((a, b) => a.particular.charCodeAt(0) - b.particular.charCodeAt(0))
        .map((item, index) => (
          <Row justify="space-between" key={index}>
            <span>{item.particular}</span>
            <span className="fare-price">
              <Text strong>₱</Text>
              {` ${item.amount}`}
            </span>
          </Row>
        ));
    }
    return null;
  }, [parcel?.deliveryId]);

  const renderJourney = useMemo(() => {
    if (!parcel) return null;
    if (
      !parcel.deliveryStatusHistories.some(
        item => item.driver || item.user || item.customer,
      )
    )
      return null;

    const history = parcel.deliveryStatusHistories.find(
      ({ status }) => status === 'assigned' || status === 'picked_up',
    );

    return history ? (
      <div className="parcel-detail__journey">
        <p>
          <Text strong>
            {history.createdByObjectType === 'driver'
              ? `${history.driver.driverProfile.firstName}, ${history.driver.driverProfile.lastName}`
              : history.createdByObjectType === 'user'
              ? `${history.user.firstName}, ${history.user.lastName}`
              : `${history.customer.firstName}, ${history.customer.lastName}`}
          </Text>
          , at{' '}
          <Text strong>
            {formatDateTime(history.createdAt || history.deliveredAt)}
          </Text>
        </p>
      </div>
    ) : null;
  }, [parcel]);

  return (
    <Spin wrapperClassName="parcel-detail" spinning={loading}>
      {parcel && (
        <Row gutter={20}>
          <Col md={{ span: 6 }} sm={{ span: 24 }}>
            <div className="left">
              <Card>
                <Title level={3}>₱ {parcel.fee.total}</Title>
                <p>Total Amount</p>
              </Card>
              <Space className="status-box" align="baseline">
                <span>Status:</span>
                <Title level={5}>
                  {removeSnakeCase(checkAcceptedText(parcel.status))}
                </Title>
              </Space>

              {nextStatus && (
                <div>
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    onClick={onChangeStatus}
                    loading={updating}
                  >
                    Change to{` `}
                    {capitalize(removeSnakeCase(checkAcceptedText(nextStatus)))}
                  </Button>
                </div>
              )}

              {parcel.cancelReason ? (
                <div>
                  <Space direction="vertical" size={0} className="mb-1">
                    <span>Cancel reason:</span>
                    <Text strong>{parcel.cancelReason}</Text>
                  </Space>
                </div>
              ) : null}

              {parcel.cancelledAt ? (
                <div>
                  <Space direction="vertical" size={0} className="mb-2">
                    <span>Cancel at:</span>
                    <Text strong>{formatDateTime(parcel.cancelledAt)}</Text>
                  </Space>
                </div>
              ) : null}
            </div>
            <Divider className="mb-1 mt-0" />

            <Card size="small">
              <Title level={5} type="warning">
                CUSTOMER DETAILS
              </Title>

              <Space direction="vertical" size={0}>
                <div>
                  <span>Order Number:</span>
                  <p>
                    <Tag color="green">
                      <Text strong>{parcel.order?.orderCode}</Text>
                    </Tag>
                  </p>
                </div>
                {parcel.order?.referenceNumber && (
                  <div>
                    <span>Reference Number:</span>
                    <p>
                      <Tag color="green">
                        <Text strong>{parcel.order?.referenceNumber}</Text>
                      </Tag>
                    </p>
                  </div>
                )}
                <div>
                  <span>Contact Name:</span>
                  <p>
                    <Text strong>
                      {parcel.customer ? (
                        `${parcel.customer.firstName} ${parcel.customer.lastName}`
                      ) : (
                        <TableNoData />
                      )}
                    </Text>
                  </p>
                </div>
                <div>
                  <span>Contact No:</span>
                  <p>
                    <Text strong>
                      {parcel.customer?.phoneNumber || <TableNoData />}
                    </Text>
                  </p>
                </div>
                <div>
                  <span>Order Placed:</span>
                  <p>
                    <Text strong>
                      {formatDateTime(parcel.order?.createdAt) || (
                        <TableNoData />
                      )}
                    </Text>
                  </p>
                </div>
                {parcel.scheduleStartTime && (
                  <div>
                    <span>Scheduled At:</span>
                    <p>
                      <Text strong>
                        {formatDateTime(parcel.scheduleStartTime) || (
                          <TableNoData />
                        )}
                      </Text>
                    </p>
                  </div>
                )}
              </Space>
            </Card>
            <Card size="small" className="mt-1">
              <Title level={5} type="warning">
                DRIVER DETAILS
              </Title>
              {parcel.driver ? (
                <Space direction="vertical" size={0}>
                  <div>
                    <span>Name:</span>
                    <p>
                      {parcel.driver?.driverProfile ? (
                        <Text strong>
                          {`${parcel.driver.driverProfile.lastName}, ${
                            parcel.driver.driverProfile.firstName || ''
                          } ${parcel.driver.driverProfile.middleName || ''}`}
                        </Text>
                      ) : (
                        <TableNoData />
                      )}
                    </p>
                  </div>
                  <div>
                    <span>Phone Number:</span>
                    <p>
                      <Text strong>
                        {parcel.driver.phoneNumber || <TableNoData />}
                      </Text>
                    </p>
                  </div>
                </Space>
              ) : (
                <Empty />
              )}
            </Card>

            {!parcel.driver && !isEmpty(parcel.thirdPartyDriver) && (
              <Badge.Ribbon text="3rd Provider">
                <Card size="small" className="mt-1">
                  <Space direction="vertical" size={0}>
                    <div>
                      <span>Name:</span>
                      <p>
                        <Text strong>
                          {parcel.thirdPartyDriver.contactName || (
                            <TableNoData />
                          )}
                        </Text>
                      </p>
                    </div>
                    <div>
                      <span>Phone Number:</span>
                      <p>
                        <Text strong>
                          {parcel.thirdPartyDriver.contactNumber || (
                            <TableNoData />
                          )}
                        </Text>
                      </p>
                    </div>
                  </Space>
                </Card>
              </Badge.Ribbon>
            )}

            <Card size="small" className="mt-1">
              <Title level={5} type="warning">
                REMARKS
              </Title>

              <Space direction="vertical" size={0}>
                <div>
                  <span>Items:</span>
                  <p>
                    <Text strong>
                      {parcel.order?.itemDescription || <TableNoData />}
                    </Text>
                  </p>
                </div>
                <div>
                  <span>Notes to Driver:</span>
                  <p>
                    <Text strong>
                      {' '}
                      {parcel.order?.notes || <TableNoData />}
                    </Text>
                  </p>
                </div>
              </Space>
            </Card>
          </Col>

          <Col md={{ span: 18 }} sm={{ span: 24 }}>
            <div className="right">
              <Row justify="space-between">
                <Title level={3}>Delivery Details</Title>
                <Button
                  type="primary"
                  onClick={() => navigate(PATHS.ParcelTransactions)}
                >
                  Back to parcels
                </Button>
              </Row>
              <div className="box mb-2">
                <Text strong>Vehicle Used</Text>
                <label>{(parcel.order?.vehicleType || '').toUpperCase()}</label>
                <Divider type="vertical" />

                <Text strong>Total Distance</Text>
                <label>{parcel.distance} KM</label>
              </div>

              <Collapse
                defaultActiveKey={['1', '3']}
                expandIconPosition={'right'}
                onChange={keys => setShowMap(keys.includes('2'))}
                className="parcel-detail__collapse"
              >
                <Panel
                  header={
                    <div className="collapse-header">
                      <CheckSquareFilled
                        style={{ fontSize: '30px', color: '#84b15c' }}
                      />
                      <label>Pick-up Location</label>
                    </div>
                  }
                  key="1"
                >
                  <Row className="row-info" gutter={16}>
                    <Col md={{ span: 8 }} sm={{ span: 12 }} xs={{ span: 24 }}>
                      <Text strong>Address</Text>
                      <p>{parcel.pickUp?.locationAddress || <TableNoData />}</p>
                      <Text type="secondary">
                        ● {parcel.pickUp?.location?.address || <TableNoData />}
                      </Text>
                    </Col>
                    <Col md={{ span: 5 }} sm={{ span: 12 }} xs={{ span: 24 }}>
                      <Text strong>Contact Person</Text>
                      <p>{parcel.pickUp.contactName || <TableNoData />}</p>
                    </Col>
                    <Col md={{ span: 5 }} sm={{ span: 12 }} xs={{ span: 24 }}>
                      <Text strong>Contact Number</Text>
                      <p>{parcel.pickUp.contactPhone || <TableNoData />}</p>
                    </Col>
                  </Row>
                  <Divider className="my-1" />
                  <Row className="row-info" justify="end">
                    <Space direction="vertical" size={0}>
                      {renderJourney}
                    </Space>
                  </Row>
                </Panel>
                <Panel
                  header={
                    <div className="collapse-header">
                      <InteractionFilled
                        style={{ fontSize: '30px', color: '#7140b8' }}
                      />
                      <label>Drop-off Location</label>
                    </div>
                  }
                  key="3"
                >
                  <DropOffLocation
                    stops={parcel.stops}
                    status={parcel.status}
                    deliveryProgress={parcel.deliveryProgress}
                    deliveryStatusHistories={parcel.deliveryStatusHistories}
                  />
                </Panel>
                <Panel
                  header={
                    <div className="collapse-header">
                      <CheckSquareFilled
                        style={{ fontSize: '30px', color: '#ff4d4f' }}
                      />
                      <label>Map Navigation</label>
                    </div>
                  }
                  key="2"
                  forceRender
                >
                  {parcel.pickUp?.location && (
                    <ParcelDetailMap parcel={parcel} isShow={showMap} />
                  )}
                </Panel>
              </Collapse>

              <Card className="my-2">
                <Row gutter={[30, 16]} className="fare-row">
                  <Col
                    md={{ span: 12 }}
                    sm={{ span: 24 }}
                    className="delivery-fare-col"
                  >
                    {parcel.order ? (
                      <div className="fare-detail">
                        <Text strong>Order fare</Text>
                        {parcel.order.additionalStopFee ? (
                          <Row justify="space-between">
                            <span>Additional Stop Charge</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.additionalStopFee}`}
                            </span>
                          </Row>
                        ) : null}
                        {parcel.order.afterHoursSurchargeFee ? (
                          <Row justify="space-between">
                            <span>Afterhours Charge</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.afterHoursSurchargeFee}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.cashHandlingFee ? (
                          <Row justify="space-between">
                            <span>Cash Handling Fare</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.cashHandlingFee}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.tip ? (
                          <Row justify="space-between">
                            <span>Driver Tip</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.tip}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.insulatedBoxFee ? (
                          <Row justify="space-between">
                            <span>Insulated Box</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.insulatedBoxFee}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.holidaySurchargeFee ? (
                          <Row justify="space-between">
                            <span>Holiday Charge</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.holidaySurchargeFee}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.purchaseServiceFee ? (
                          <Row justify="space-between">
                            <span>Purchase Service</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.purchaseServiceFee}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.overweightHandlingFee ? (
                          <Row justify="space-between">
                            <span>Overweight Handling Fare</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.overweightHandlingFee}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.premiumServiceFee ? (
                          <Row justify="space-between">
                            <span>Premium Service Fare</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.premiumServiceFee}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.remittanceFee ? (
                          <Row justify="space-between">
                            <span>Remittance Fare</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.remittanceFee}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.queueingFee ? (
                          <Row justify="space-between">
                            <span>Queueing</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.queueingFee}`}
                            </span>
                          </Row>
                        ) : null}

                        {parcel.order.helperFee ? (
                          <Row justify="space-between">
                            <span>Helper Fee</span>
                            <span className="fare-price">
                              <Text strong>₱</Text>
                              {` ${parcel.order.helperFee}`}
                            </span>
                          </Row>
                        ) : null}

                        <Row justify="space-between" className="total">
                          <span>Total Delivery Charge</span>
                          <span className="fare-price">
                            <Text strong>₱</Text>
                            {` ${parcel.order.deliveryFee}`}
                          </span>
                        </Row>
                      </div>
                    ) : null}
                    <Divider />
                    <Row
                      justify="space-between"
                      align="bottom"
                      className="my-1 collected-row"
                    >
                      <Title level={5} className="mb-0">
                        Grand Total
                      </Title>
                      <span className="price">
                        ₱ {parcel.order?.totalCharge}
                      </span>
                    </Row>
                  </Col>

                  <Col
                    md={{ span: 12 }}
                    sm={{ span: 24 }}
                    className="delivery-fare-col"
                  >
                    <div className="fare-detail">
                      <Text strong>Delivery fare</Text>

                      {renderDeliveryFare}

                      <Row justify="space-between" className="total">
                        <span>Amount to be collected</span>
                        <span className="fare-price">
                          <Text strong>₱</Text>
                          {` ${parcel.fee.amountToBeCollected}`}
                        </span>
                      </Row>
                      <Row justify="space-between" className="total">
                        <span>Amount to be remitted</span>
                        <span className="fare-price">
                          <Text strong>₱</Text>
                          {` ${parcel.fee.amountToBeRemitted}`}
                        </span>
                      </Row>
                    </div>
                    <Divider />
                    <Row
                      justify="space-between"
                      align="bottom"
                      className="my-1 collected-row"
                    >
                      <Title level={5} className="mb-0">
                        Total fee
                      </Title>
                      <span className="price">₱ {parcel.fee.total}</span>
                    </Row>
                  </Col>
                </Row>
              </Card>
              <Row className="mb-2">
                {canAssign && (
                  <GreenButton onClick={() => setOpenAssign(true)}>
                    Assign Driver
                  </GreenButton>
                )}

                {canReassign && (
                  <GreenButton onClick={() => setOpenReassign(true)}>
                    ReAssign Driver
                  </GreenButton>
                )}

                {canCancel && (
                  <Button
                    type="primary"
                    className="cancel-btn"
                    danger
                    onClick={() => setOpen(true)}
                  >
                    {cancelText}
                  </Button>
                )}
              </Row>
            </div>
          </Col>
        </Row>
      )}

      <Modal
        title="Are you sure you want to cancel?"
        visible={open}
        maskClosable={false}
        centered
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="1" onClick={() => setOpen(false)}>
            Close
          </Button>,
          <Button
            key="2"
            type="primary"
            danger
            onClick={handleConfirm}
            loading={loading}
          >
            <span className="text-capitalize">Cancel</span>
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" className="mt-1">
          <Form.Item
            name="cancelReason"
            rules={[{ required: true, message: 'Reason is required' }]}
          >
            <Select placeholder="Please select the reason" allowClear>
              {reasons.map((item, idx) => (
                <Select.Option key={idx} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.cancelReason !== currentValues.cancelReason
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('cancelReason') === 'Other' && (
                <Form.Item
                  name="reasonText"
                  rules={[{ required: true, message: 'Reason is required' }]}
                >
                  <Input placeholder="Other reason" />
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>

      {canReassign && (
        <Modal
          title="ReAssign the order to another driver"
          visible={openReassign}
          centered
          onCancel={() => setOpenReassign(false)}
          footer={null}
        >
          <ReassignForm
            onClose={() => setOpenReassign(false)}
            vehicleType={parcel.vehicleType}
            deliveryId={parcel.deliveryId}
            type="reassign"
          />
        </Modal>
      )}

      {canAssign && (
        <Modal
          title="Assign the order to a driver"
          visible={openAssign}
          centered
          onCancel={() => setOpenAssign(false)}
          footer={null}
        >
          <ReassignForm
            onClose={() => setOpenAssign(false)}
            vehicleType={parcel.vehicleType}
            deliveryId={parcel.deliveryId}
            type="assign"
            onSuccess={() => fetchDetail(parcel.deliveryId)}
          />
        </Modal>
      )}
    </Spin>
  );
};

export default ParcelDetail;
