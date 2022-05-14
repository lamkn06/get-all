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
  Modal,
  notification,
  Row,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
} from 'antd';
import foodOrdersService from 'api/food-orders.api';
import { TableNoData } from 'components/table-no-data';
import { GG_MAP_LIBS } from 'constants/index';
import ParcelDetailMap from 'containers/parcel/map';
import { formatDateTime, removeSnakeCase } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { capitalize, isEmpty } from 'lodash';
import { DropOffLocation } from 'pages/parcel-management/id/index.chunk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FoodOrderType, ParcelType } from 'types';
import { FoodOrderStatus } from 'types/common';
const { Step } = Steps;

import './index.scss';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Props {
  defaultOrder?: FoodOrderType;
}

export const RestaurantOrder: React.FC<Props> = ({ defaultOrder }) => {
  const { currentRestaurant } = useAppSelector(
    state => state.restaurantManagement,
  );
  const [order, setOrder] = useState<FoodOrderType>(defaultOrder);
  const [loading, setLoading] = useState(false);
  // const [updating, setUpdating] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_API_KEY,
    libraries: GG_MAP_LIBS as any,
  });

  useEffect(() => {
    if (defaultOrder) {
      setOrder(defaultOrder);
    }
  }, [defaultOrder]);

  const statusSteps = useMemo(() => {
    return [
      'pending',
      'accepted',
      'preparing',
      'ready',
      'for_delivery',
      'in_transit',
      'for_pickup',
      'picked_up',
      'delivered',
    ].filter(item =>
      order.pickupOnly ? true : !['for_pickup', 'picked_up'].includes(item),
    ) as FoodOrderStatus[];
  }, [order]);

  const nextStatus = useMemo(() => {
    if (!order) return undefined;
    const index = statusSteps.findIndex(item => item === order.status);
    if (index === -1) return undefined;
    return { text: statusSteps[index + 1], value: index };
  }, [order]);

  const onChangeStatus = useCallback(async () => {
    Modal.confirm({
      title: 'Change order status',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Text>
          Are you sure you want to change the status to{' '}
          <Text className="text-capitalize" strong type="success">
            {removeSnakeCase(nextStatus.text)}
          </Text>
          ?
        </Text>
      ),
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
          try {
            const newStatus = nextStatus.text;
            setLoading(true);
            await foodOrdersService.changeStatus({
              orderId: order.orderId,
              newStatus,
            });
            notification.success({ message: 'Delivery status updated!' });
            setOrder({
              ...order,
              status: newStatus,
            });
            resolve('');
          } catch (error) {
            reject(error);
          } finally {
            setLoading(false);
          }
        });
      },
    });
  }, [nextStatus, order]);

  const renderDeliveryFare = useMemo(() => {
    if (order.delivery?.fee) {
      return order.delivery.fee.detail
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
  }, [order]);

  const renderOrderFare = useCallback(() => {
    const listFares = [
      { title: 'Tip', value: order.tip },
      { title: 'Goods Fee', value: order.goodsFee },
      { title: 'Discount', value: order.discount },
      // { title: 'Commission', value: order.commission },
      { title: 'Delivery Fee', value: order.deliveryFee },
    ]
      .filter(item => Boolean(item.value))
      .sort((a, b) => a.value - b.value);

    return listFares.map((item, index) => (
      <Row justify="space-between" key={index}>
        <span>{item.title}</span>
        <span className="fare-price">
          <Text strong>₱</Text>
          {` ${item.value}`}
        </span>
      </Row>
    ));
  }, [order]);

  return (
    <Spin wrapperClassName="restaurant-order" spinning={loading}>
      {order && (
        <Row gutter={20}>
          <Col md={{ span: 6 }} sm={{ span: 24 }} xs={{ span: 24 }}>
            <div className="left">
              {order.delivery ? (
                <Card>
                  <Title level={3}>₱ {order.delivery.fee.total}</Title>
                  <p>Total Amount</p>
                </Card>
              ) : null}

              {nextStatus?.text && (
                <Button
                  className="mt-1"
                  size="small"
                  type="primary"
                  ghost
                  onClick={onChangeStatus}
                  loading={loading}
                >
                  Change to
                  <strong>
                    {` `}
                    {capitalize(removeSnakeCase(nextStatus.text))}
                  </strong>
                </Button>
              )}

              {order.cancelReason ? (
                <div>
                  <Space direction="vertical" size={0} className="mb-1">
                    <span>Cancel reason:</span>
                    <Text strong>{order.cancelReason}</Text>
                  </Space>
                </div>
              ) : null}

              {order.delivery?.cancelledAt ? (
                <div>
                  <Space direction="vertical" size={0} className="mb-2">
                    <span>Cancel at:</span>
                    <Text strong>
                      {formatDateTime(order.delivery.cancelledAt)}
                    </Text>
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
                      <Text strong>{order.orderCode}</Text>
                    </Tag>
                  </p>
                </div>

                <div>
                  <span>Order Placed:</span>
                  <p>
                    <Text strong>
                      {formatDateTime(order.createdAt) || <TableNoData />}
                    </Text>
                  </p>
                </div>
                {order.scheduleStartTime && (
                  <div>
                    <span>Scheduled At:</span>
                    <p>
                      <Text strong>
                        {formatDateTime(order.scheduleStartTime) || (
                          <TableNoData />
                        )}
                      </Text>
                    </p>
                  </div>
                )}
              </Space>
            </Card>
            {order.pickupOnly || isEmpty(order.delivery) ? null : (
              <Card size="small" className="mt-1">
                <Title level={5} type="warning">
                  DRIVER DETAILS
                </Title>
                {order.delivery?.driver ? (
                  <Space direction="vertical" size={0}>
                    <div>
                      <span>Name:</span>
                      <p>
                        {isEmpty(order.delivery.driver?.driverProfile) ? (
                          <TableNoData />
                        ) : (
                          <Text strong>
                            {`${
                              order.delivery.driver.driverProfile.lastName
                            }, ${
                              order.delivery.driver.driverProfile.firstName ||
                              ''
                            } ${
                              order.delivery.driver.driverProfile.middleName ||
                              ''
                            }`}
                          </Text>
                        )}
                      </p>
                    </div>
                    <div>
                      <span>Phone Number:</span>
                      <p>
                        <Text strong>
                          {order.delivery.driver.phoneNumber || <TableNoData />}
                        </Text>
                      </p>
                    </div>
                  </Space>
                ) : (
                  <Empty />
                )}
              </Card>
            )}

            {!order.delivery?.driver &&
              order.delivery &&
              !isEmpty(order.delivery.thirdPartyDriver) && (
                <Badge.Ribbon text="3rd Provider">
                  <Card size="small" className="mt-1">
                    <Space direction="vertical" size={0}>
                      <div>
                        <span>Name:</span>
                        <p>
                          <Text strong>
                            {order.delivery.thirdPartyDriver.contactName || (
                              <TableNoData />
                            )}
                          </Text>
                        </p>
                      </div>
                      <div>
                        <span>Phone Number:</span>
                        <p>
                          <Text strong>
                            {order.delivery.thirdPartyDriver.contactNumber || (
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
                      {order.delivery?.itemDescription || <TableNoData />}
                    </Text>
                  </p>
                </div>
                <div>
                  <span>Notes to Driver:</span>
                  <p>
                    <Text strong>
                      {' '}
                      {order.delivery?.notes || <TableNoData />}
                    </Text>
                  </p>
                </div>
              </Space>
            </Card>
          </Col>

          <Col
            md={{ span: 18 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="restaurant-order_right-wrapper"
          >
            <div className="restaurant-order_right-content">
              <div className="box mb-2">
                <Text strong>Vehicle Used</Text>
                <label>
                  {(order.delivery?.vehicleType || '').toUpperCase()}
                </label>
                <Divider type="vertical" />

                <Text strong>Total Distance</Text>
                <label>{order.distance} KM</label>
              </div>

              <Collapse
                defaultActiveKey={['1', '2', '3']}
                expandIconPosition={'right'}
                onChange={keys => setShowMap(keys.includes('4'))}
                className="restaurant-order__collapse"
              >
                <Panel
                  header={
                    <div className="collapse-header">
                      <CheckSquareFilled className="restaurant-order__check-icon" />
                      <label>Restaurant</label>
                    </div>
                  }
                  key="1"
                >
                  <Row className="row-info" gutter={16}>
                    <Col md={{ span: 4 }} sm={{ span: 12 }} xs={{ span: 24 }}>
                      <Text strong>Name</Text>
                      <p>{currentRestaurant.name || <TableNoData />}</p>
                    </Col>
                    <Col md={{ span: 4 }} sm={{ span: 12 }} xs={{ span: 24 }}>
                      <Text strong>Brand</Text>
                      <p>{currentRestaurant.brandName || <TableNoData />}</p>
                    </Col>

                    <Col md={{ span: 4 }} sm={{ span: 12 }} xs={{ span: 24 }}>
                      <Text strong>Category</Text>
                      <p>
                        {currentRestaurant.category?.name || <TableNoData />}
                      </p>
                    </Col>
                    <Col md={{ span: 12 }} sm={{ span: 12 }} xs={{ span: 24 }}>
                      <Text strong>Address</Text>
                      <p>{currentRestaurant.address || <TableNoData />}</p>
                    </Col>
                  </Row>
                </Panel>

                <Panel
                  header={
                    <div className="collapse-header">
                      <CheckSquareFilled className="restaurant-order__check-icon" />
                      <label>Order Items</label>
                    </div>
                  }
                  key="2"
                >
                  <Badge.Ribbon
                    text="Request Cutlery"
                    className={
                      !order.withCutlery ? 'restaurant-order__hide-cutlery' : ''
                    }
                  />
                  {order.orderItems.map((item, index) => (
                    <Row className="order-items-info" key={index} gutter={16}>
                      <Col
                        md={{ span: 12 }}
                        sm={{ span: 12 }}
                        xs={{ span: 24 }}
                      >
                        <div>
                          <Text strong>Product: </Text>
                          {item.product?.name}
                        </div>
                        <div>
                          <Text strong>Regular Price: </Text>₱ {item.basePrice}
                        </div>
                        <div>
                          <Text strong>Discount: </Text>₱ {item.discount}
                        </div>
                        <div>
                          <Text strong>Price: </Text>₱{' '}
                          {item.basePrice - item.discount}
                        </div>
                        <div>
                          <Text strong>Total: </Text>₱ {item.total}
                        </div>
                      </Col>

                      <Col
                        md={{ span: 12 }}
                        sm={{ span: 12 }}
                        xs={{ span: 24 }}
                      >
                        <div>
                          <Text strong>Unit: </Text>
                          {item.unit}
                        </div>
                        <div>
                          <Text strong>Notes: </Text>
                          {item.notes || <TableNoData />}
                        </div>

                        <div>
                          <Text strong>Addons: </Text>
                          {item.addons.map((item, idx2) => (
                            <div key={idx2} className="ml-1">
                              - {item.name}, {item.option}, ₱ {item.price}
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  ))}
                </Panel>
                {order.pickupOnly ? null : (
                  <>
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
                        stops={order.delivery.stops}
                        status={order.status}
                        deliveryProgress={order.delivery.deliveryProgress}
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
                      key="4"
                      forceRender
                    >
                      {order.delivery.pickup && (
                        <ParcelDetailMap
                          parcel={order.delivery as unknown as ParcelType}
                          isShow={showMap}
                        />
                      )}
                    </Panel>
                  </>
                )}
              </Collapse>

              <Card className="my-2">
                <Row gutter={[30, 16]} className="fare-row">
                  <Col
                    md={{ span: order.pickupOnly ? 24 : 12 }}
                    sm={{ span: 24 }}
                    className="delivery-fare-col"
                  >
                    <div className="fare-detail">
                      <Text strong>Order fare</Text>

                      {renderOrderFare()}
                    </div>
                    <Divider />
                    <Row
                      justify="space-between"
                      align="bottom"
                      className="my-1 collected-row"
                    >
                      <Title level={5} className="mb-0">
                        Grand Total
                      </Title>
                      <span className="price">₱ {order.totalCharge}</span>
                    </Row>
                  </Col>

                  {order.pickupOnly || !order.delivery ? null : (
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
                            {` ${order.delivery.fee.amountToBeCollected}`}
                          </span>
                        </Row>
                        <Row justify="space-between" className="total">
                          <span>Amount to be remitted</span>
                          <span className="fare-price">
                            <Text strong>₱</Text>
                            {` ${order.delivery.fee.amountToBeRemitted}`}
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
                        <span className="price">
                          ₱ {order.delivery.fee.total}
                        </span>
                      </Row>
                    </Col>
                  )}
                </Row>
              </Card>
            </div>

            {nextStatus ? (
              <Steps
                size="small"
                current={nextStatus.value}
                direction="vertical"
                className="restaurant-order_right-steps"
                status={order.status === 'delivered' ? 'finish' : 'process'}
              >
                {statusSteps.map((item, index) => (
                  <Step title={removeSnakeCase(item)} key={index} />
                ))}
              </Steps>
            ) : null}
          </Col>
        </Row>
      )}
    </Spin>
  );
};
