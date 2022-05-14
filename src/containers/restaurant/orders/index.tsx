/* eslint-disable no-console */
import {
  Col,
  Input,
  Modal,
  Row,
  Table,
  TablePaginationConfig,
  Tag,
  Typography,
} from 'antd';
import foodOrdersService from 'api/food-orders.api';
import { TableNoData } from 'components/table-no-data';
import { PRICE_UNIT } from 'constants/index';
import { RestaurantOrder } from 'containers/restaurant/orders/detail';
import {
  checkAcceptedText,
  formatDateTime,
  removeSnakeCase,
  serializeQuery,
} from 'helpers';
import {
  getColumnCheckboxProps,
  getColumnSearchProps,
  joinDriverName,
} from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import produce from 'immer';
import { upperCase } from 'lodash';
import {
  setOpenOrders,
  setCompletedOrders,
  setPagingOpenOrders,
  setPagingCompletedOrders,
  FoodStatusType,
  OrdersTableType,
} from 'pages/restaurant-management/redux/restaurant';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DriverType, FoodOrderType } from 'types';
import './index.scss';

type TabsType = 'open-orders' | 'completed-orders';

const { Link } = Typography;
interface Prop {
  activeTab: TabsType;
}

export const ListRestaurantOrders: React.FC<Prop> = ({ activeTab }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<FoodOrderType>(undefined);

  const {
    openOrdersPagination,
    completedOrdersPagination,
    listCompletedOrders,
    listOpenOrders,
    currentRestaurant,
  } = useAppSelector(state => state.restaurantManagement);

  const isOpenOrder = activeTab === 'open-orders';

  const listFilters: FoodStatusType[] = isOpenOrder
    ? [
        'pending',
        'accepted',
        'preparing',
        'ready',
        'for_delivery',
        'in_transit',
        'for_pickup',
        'picked_up',
      ]
    : ['delivered', 'canceled'];

  // useEffect(() => {
  //   onFilterDriver();
  // }, [selectedDriver]);

  const onSearch = useCallback(
    value => {
      onTableChange({ current: 1 }, { keyword: [value] });
    },
    [openOrdersPagination, completedOrdersPagination],
  );

  useEffect(() => {
    if (activeTab === 'open-orders') {
      fetchOpenOrders();
    }
  }, [openOrdersPagination.pageIndex, openOrdersPagination.filter]);

  useEffect(() => {
    if (activeTab === 'completed-orders') {
      fetchCompletedOrders();
    }
  }, [completedOrdersPagination.pageIndex, completedOrdersPagination.filter]);

  const fetchOpenOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = serializeQuery({
        ...openOrdersPagination,
        restaurantId: currentRestaurant.id,
      });
      const res = await foodOrdersService.getFoodOrder(params);
      const { data } = res;
      dispatch(setOpenOrders(data.results));
      dispatch(
        setPagingOpenOrders({
          ...openOrdersPagination,
          total: data.totalRecords,
        }),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [openOrdersPagination]);

  const fetchCompletedOrders = useCallback(async () => {
    try {
      const params = serializeQuery(completedOrdersPagination);
      setLoading(true);
      const res = await foodOrdersService.getFoodOrder(params);
      const { data } = res;
      dispatch(setCompletedOrders(data.results));
      dispatch(
        setPagingCompletedOrders({
          ...completedOrdersPagination,
          total: data.totalRecords,
        }),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [completedOrdersPagination]);

  const onTableChange = useCallback(
    (
      { current }: TablePaginationConfig,
      filters: {
        status?: FoodStatusType[];
        keyword?: string[];
        orderCode?: string[];
        driver?: string[];
        pickupOnly?: Array<'all'>;
      },
    ) => {
      const getPaging = (oldData: OrdersTableType) => {
        return produce(oldData, draft => {
          draft.pageIndex = current;
          draft.filter.status = filters.status || listFilters;
          draft.filter.orderCode = filters.orderCode
            ? filters.orderCode[0]
            : undefined;
          draft.filter.keyword = filters.keyword
            ? filters.keyword[0]
            : undefined;
          draft.filter.pickupOnly =
            filters.pickupOnly && filters.pickupOnly[0] !== 'all'
              ? filters.pickupOnly[0]
              : undefined;
        });
      };
      if (isOpenOrder) {
        dispatch(setPagingOpenOrders(getPaging(openOrdersPagination)));
      } else {
        dispatch(
          setPagingCompletedOrders(getPaging(completedOrdersPagination)),
        );
      }
    },
    [openOrdersPagination, completedOrdersPagination],
  );

  const columns = useMemo(
    () => [
      {
        title: 'Order code',
        dataIndex: 'orderCode',
        key: 'orderCode',
        width: 120,
        render: (value: string) =>
          value ? <Link>{value}</Link> : <TableNoData />,
        ...getColumnSearchProps('Order code'),
      },
      {
        title: 'PickUp Only',
        key: 'pickupOnly',
        dataIndex: 'pickupOnly',
        width: 120,
        ...getColumnCheckboxProps([
          { text: 'True', value: '1' },
          { text: 'False', value: '0' },
        ]),
        render: (pickupOnly: boolean) => (
          <Tag
            className="text-uppercase"
            color={pickupOnly ? 'success' : 'error'}
          >
            {pickupOnly ? 'True' : 'False'}
          </Tag>
        ),
      },
      {
        title: 'Driver',
        key: 'driver',
        dataIndex: ['delivery', 'driver'],
        width: 120,
        render: (driver: DriverType) => joinDriverName(driver?.driverProfile),
      },
      {
        title: 'Date & Time Placed',
        key: 'createdAt',
        dataIndex: 'createdAt',
        width: 100,
        render: (value: string) => formatDateTime(value),
      },
      {
        title: 'Schedule Date & Time',
        key: 'scheduleStartTime',
        dataIndex: 'scheduleStartTime',
        width: 120,
        render: (value: string) =>
          value ? formatDateTime(value) : <TableNoData />,
      },
      {
        title: 'Goods Fee',
        key: 'goodsFee',
        width: 90,
        dataIndex: 'goodsFee',
        render: (value: string) =>
          value ? `${value} ${PRICE_UNIT}` : <TableNoData />,
      },
      {
        title: 'Status',
        key: 'status',
        width: 100,
        defaultFilteredValue: isOpenOrder
          ? openOrdersPagination.filter.status
          : completedOrdersPagination.filter.status,
        filters: listFilters.map(item => ({
          text: upperCase(removeSnakeCase(item)),
          value: item,
        })),
        render: (foodOrder: FoodOrderType) => {
          let color: string;
          switch (foodOrder.status) {
            case 'pending':
              color = 'red';
              break;
            case 'preparing':
              color = 'magenta';
              break;
            case 'for_pickup':
              color = 'geekblue';
              break;
            case 'picked_up':
              color = 'blue';
              break;
            case 'in_transit':
              color = 'green';
              break;
            case 'delivered':
              color = 'green';
              break;
            case 'canceled':
              color = 'red';
              break;
            default:
              color = 'gold';
              break;
          }
          return (
            <Tag className="text-uppercase" color={color}>
              {removeSnakeCase(foodOrder.status)}
            </Tag>
          );
        },
      },
      {
        title: 'Grand Total',
        dataIndex: 'totalCharge',
        key: 'totalCharge',
        width: 120,
        render: (value: string) => (
          <Typography.Title level={5} className="restaurant-order__col-price">
            {value} {PRICE_UNIT}
          </Typography.Title>
        ),
      },
    ],
    [currentRestaurant],
  );

  const handleClose = useCallback(() => setCurrentOrder(undefined), []);

  return (
    <div className="restaurant-order">
      <Row gutter={22} className="my-1">
        <Col md={{ span: 8 }} sm={{ span: 24 }} xs={{ span: 24 }}>
          <Input.Search onSearch={onSearch} placeholder="input search text" />
        </Col>
      </Row>

      {isOpenOrder ? (
        <Table
          tableLayout="auto"
          loading={loading}
          rowKey="orderId"
          columns={columns}
          dataSource={listOpenOrders}
          rowClassName="restaurant-order__row"
          pagination={{
            total: openOrdersPagination.total,
            pageSize: openOrdersPagination.pageSize,
            current: openOrdersPagination.pageIndex,
          }}
          onChange={onTableChange}
          scroll={{ x: 1100, y: `calc(100vh - 406px)` }}
          onRow={(record: FoodOrderType) => {
            return {
              onClick: _ => setCurrentOrder(record),
            };
          }}
        />
      ) : (
        <Table
          tableLayout="auto"
          loading={loading}
          rowKey="orderId"
          columns={columns}
          dataSource={listCompletedOrders}
          rowClassName="restaurant-order__row"
          pagination={{
            total: completedOrdersPagination.total,
            pageSize: completedOrdersPagination.pageSize,
            current: completedOrdersPagination.pageIndex,
          }}
          onChange={onTableChange}
          scroll={{ x: 1200, y: `calc(100vh - 406px)` }}
          onRow={(record: FoodOrderType) => {
            return {
              onClick: _ => setCurrentOrder(record),
            };
          }}
        />
      )}

      <Modal
        title="Order detail"
        centered
        visible={!!currentOrder}
        footer={null}
        onCancel={handleClose}
        width="90vw"
      >
        <RestaurantOrder defaultOrder={currentOrder} />
      </Modal>
    </div>
  );
};
