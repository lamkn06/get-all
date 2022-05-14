import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  Row,
  Table,
  TablePaginationConfig,
  Tag,
  Typography,
} from 'antd';
import { TableNoData } from 'components/table-no-data';
import { DriverFilter } from 'containers/parcel/driver-filter';
import { checkAcceptedText, formatDateTime, removeSnakeCase } from 'helpers';
import { joinDriverName } from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import produce from 'immer';
import { upperCase } from 'lodash';
import moment from 'moment';
import {
  setDriverCompletedOrders,
  setDriverOpenOrders,
  TableType,
  TabsType,
} from 'pages/parcel-management/list/redux/slice';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { DriverType, OrderProgressType, ParcelType } from 'types';
import './index.scss';

const { Link } = Typography;
interface Prop {
  data: ParcelType[];
  loading?: boolean;
  type: TabsType;
  pagination: TableType;
  onRowClick?: (parcel: ParcelType) => void;
  onChange: (pagination: TableType) => void;
  onAddNew?: () => void;
}

export const ListParcel: React.FC<Prop> = ({
  data,
  loading,
  type,
  onRowClick,
  onChange,
  pagination,
}) => {
  const dispatch = useDispatch();
  const {
    driverOpenOrders,
    driverCompletedOrders,
    openOrders,
    completedOrders,
  } = useAppSelector(state => state.parcelManagement);

  const isOpenOrder = type === 'open-orders';

  const selectedDriver = isOpenOrder ? driverOpenOrders : driverCompletedOrders;

  const listFilters: OrderProgressType[] = isOpenOrder
    ? ['pending', 'assigned', 'for_pickup', 'picked_up', 'on_going']
    : ['delivered', 'canceled'];

  useEffect(() => {
    onFilterDriver();
  }, [selectedDriver]);

  const onSearch = useCallback(
    values => {
      onChange &&
        onChange(
          produce(pagination, draft => {
            draft.pageIndex = 1;
            draft.filter.keyword = values;
          }),
        );
    },
    [pagination],
  );

  const onFilterDriver = useCallback(() => {
    onChange(
      produce(pagination, draft => {
        draft.pageIndex = 1;
        if (selectedDriver) {
          draft.filter.driverId = selectedDriver;
        } else {
          draft.filter.driverId = undefined;
        }
      }),
    );
  }, [selectedDriver]);

  const onTableChange = useCallback(
    (
      { current }: TablePaginationConfig,
      filters: {
        status: OrderProgressType[];
      },
    ) => {
      if (onChange) {
        onChange(
          produce(pagination, draft => {
            draft.pageIndex = current;
            draft.filter.status = filters.status || listFilters;
            if (selectedDriver) {
              draft.filter.driverId = selectedDriver;
            }
          }),
        );
      }
    },
    [pagination, selectedDriver],
  );

  const selectDriver = (driverId?: string) => {
    if (isOpenOrder) {
      dispatch(setDriverOpenOrders(driverId));
    } else {
      dispatch(setDriverCompletedOrders(driverId));
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'Order code',
        dataIndex: ['order', 'orderCode'],
        key: 'orderCode',
        width: 120,
        render: (value: string) =>
          value ? <Link>{value}</Link> : <TableNoData />,
      },
      {
        title: 'Reference code',
        dataIndex: ['order', 'referenceNumber'],
        key: 'referenceNumber',
        width: 120,
        render: (value: string) => (value ? value : <TableNoData />),
      },
      {
        title: 'Location',
        key: 'location',
        width: 200,
        dataIndex: ['pickUp', 'locationAddress'],
      },
      {
        title: 'Pick Up',
        key: 'location',
        width: 160,
        dataIndex: ['pickUp', 'contactName'],
      },
      {
        title: 'Driver',
        key: 'driver',
        width: 160,
        dataIndex: 'driver',
        render: (driver: DriverType) => joinDriverName(driver?.driverProfile),
        filterDropdown: ({ confirm }) => (
          <div className="p-1">
            <DriverFilter
              onSelect={value => {
                selectDriver(value);
              }}
              driverId={selectedDriver}
            />
            <div className="text-right">
              <Button
                onClick={() => {
                  selectDriver(undefined);
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
            style={{ color: selectedDriver ? '#1890ff' : undefined }}
          />
        ),
      },
      {
        title: 'Date & Time Placed',
        key: 'scheduleStartTime',
        width: 180,
        render: (parcel: ParcelType) =>
          formatDateTime(
            parcel.deliveryStartTime ||
              parcel.scheduleStartTime ||
              parcel.createdAt,
          ),
      },
      {
        title: 'Status',
        key: 'status',
        width: 100,
        defaultFilteredValue: isOpenOrder
          ? openOrders.filter.status
          : completedOrders.filter.status,
        filters: listFilters.map(item => ({
          text: upperCase(removeSnakeCase(checkAcceptedText(item))),
          value: item,
        })),
        render: (parcel: ParcelType) => {
          let color: string;
          switch (parcel.status) {
            case 'pending':
              color = 'red';
              break;
            case 'assigned':
              color = 'magenta';
              break;
            case 'for_pickup':
              color = 'geekblue';
              break;
            case 'picked_up':
              color = 'blue';
              break;
            case 'on_going':
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
              {removeSnakeCase(checkAcceptedText(parcel.status))}
            </Tag>
          );
        },
      },
      {
        title: 'Rider Share',
        dataIndex: ['fee', 'total'],
        key: 'total',
        width: 120,
        className: 'text-center',
        render: (value: string) => (
          <Typography.Title level={5} className="parcel-list__col-price">
            ₱ {value}
          </Typography.Title>
        ),
      },
      {
        title: 'Grand Total',
        dataIndex: ['order', 'totalCharge'],
        key: 'total',
        width: 120,
        className: 'text-center',
        render: (value: string) => (
          <Typography.Title level={5} className="parcel-list__col-price">
            ₱ {value}
          </Typography.Title>
        ),
      },
    ],
    [selectedDriver, openOrders, completedOrders],
  );

  return (
    <div className="parcel-list">
      <Row gutter={22} className="mb-1">
        <Col md={{ span: 8 }} sm={{ span: 24 }} xs={{ span: 24 }}>
          <Input.Search onSearch={onSearch} placeholder="input search text" />
        </Col>
      </Row>

      <Table
        tableLayout="auto"
        loading={loading}
        rowKey="deliveryId"
        columns={columns}
        dataSource={data}
        rowClassName="parcel-list__row"
        pagination={{
          total: pagination.total,
          pageSize: pagination.pageSize,
          current: pagination.pageIndex,
        }}
        onChange={onTableChange}
        scroll={{ x: 1100, y: `calc(100vh - 406px)` }}
        onRow={(record: ParcelType) => {
          return {
            onClick: _ => onRowClick && onRowClick(record),
            className:
              isOpenOrder &&
              record.status === 'pending' &&
              moment().diff(moment(record.createdAt), 'minutes') > 15
                ? 'parcel-list__row--alert'
                : '',
          };
        }}
      />
    </div>
  );
};
