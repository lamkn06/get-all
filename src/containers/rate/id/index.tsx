/* eslint-disable no-async-promise-executor */
/* eslint-disable no-empty */
import {
  Button,
  Card,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import Text from 'antd/lib/typography/Text';
import { PATHS } from 'constants/paths';
import { useAppSelector } from 'hooks/app-hooks';
import {
  setEditing,
  setRateFare,
  setVisible,
} from 'pages/rate-management/id/redux/slice';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CustomerType } from 'types';
import { RateFareType, RateType } from 'types/rate';
import { useState } from 'react';
import { AsyncSearch } from 'components/asynchronous-search';
import { CUSTOMER_API } from 'api';
import { isEmpty } from 'lodash';
import { joinCustomerName } from 'helpers/component.helper';
import './index.scss';

interface Props {
  loading?: boolean;
  rate?: RateType;
  onApply?: (ids: number[]) => void;
  onRemove?: (customer: CustomerType) => void;
}

const RateDetail: React.FC<Props> = ({ loading, rate, onApply, onRemove }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCustomerId, setCustomerId] = useState<number>(undefined);
  const { appliedCustomers } = useAppSelector(
    state => state.rateDetailManagement,
  );

  const onRowClick = (rateFare: RateFareType) => {
    dispatch(setRateFare(rateFare));
    dispatch(setVisible(true));
    dispatch(setEditing(false));
  };

  const columns = useMemo(
    () => [
      {
        title: 'Vehicle Type',
        dataIndex: ['vehicleType'],
        key: 'vehicleType',
        render: value => <span className="text-capitalize">{value}</span>,
      },
      {
        title: 'Base Price ₱',
        dataIndex: ['baseFee'],
        key: 'baseFee',
        render: value => `${value}.00`,
      },
      {
        title: 'Price per KM ₱',
        dataIndex: ['standardPricePerKM'],
        key: 'standardPricePerKM',
        render: value => `${value}.00`,
      },
      {
        title: 'Additional Stop ₱',
        dataIndex: ['additionalStopFee'],
        key: 'additionalStopFee',
        render: value => `${value}.00`,
      },
      {
        title: 'GetAll Share %',
        dataIndex: ['commission'],
        key: 'getAllShare',
        render: value => `${parseFloat(`${value * 100}`).toFixed(1)}%`,
      },
      {
        title: 'Driver Share %',
        dataIndex: ['commission'],
        key: 'driverShare',
        render: value => `${parseFloat(`${(1 - value) * 100}`).toFixed(1)}%`,
      },
    ],
    [],
  );

  const renderOption = useCallback((customer: CustomerType) => {
    return (
      <Select.Option value={customer.id}>
        {joinCustomerName(customer)}
      </Select.Option>
    );
  }, []);

  const renderTag = useCallback((customer: CustomerType) => {
    return (
      <span key={customer.id}>
        {customer.firstName ? (
          <>
            <Typography.Link strong>
              {customer.firstName}, {customer.lastName}
            </Typography.Link>
            <br />
            {customer.phoneNumber}
          </>
        ) : (
          <Typography.Link strong>{customer.phoneNumber}</Typography.Link>
        )}
      </span>
    );
  }, []);

  return (
    <Spin wrapperClassName="rate-detail" spinning={loading}>
      <Row align="middle" justify="space-between">
        <Space size={50}>
          <Typography.Title level={4} type="warning" style={{ margin: 0 }}>
            {rate?.name}
          </Typography.Title>
          <div>
            {rate?.isDefault && (
              <Tag color="purple" className="text-capitalize">
                ● Default
              </Tag>
            )}
          </div>
        </Space>
        <Button
          type="primary"
          onClick={() => navigate(PATHS.ExpressRateManagement)}
        >
          Back to list
        </Button>
      </Row>

      <Table
        rowKey="id"
        pagination={false}
        columns={columns}
        dataSource={rate?.rateFares}
        className="mt-4 mb-4"
        onRow={record => {
          return {
            onClick: _ => onRowClick(record),
          };
        }}
      />

      <div className="my-4">
        <Row
          gutter={[12, 12]}
          align="middle"
          className="rate-detail__heading_row mb-2"
        >
          <Text strong type="warning" className="mx-1">
            Applied customers
          </Text>
          <div>
            <AsyncSearch
              placeholder="Find a customer"
              url={CUSTOMER_API}
              onSelect={setCustomerId}
              pageSize={10}
              renderOption={renderOption}
              optionLabelProp={undefined}
              value={selectedCustomerId}
            />
            <Tooltip title="Apply rate card for this customer">
              <Button
                type="primary"
                disabled={!selectedCustomerId}
                onClick={() => {
                  onApply([selectedCustomerId]);
                  setCustomerId(undefined);
                }}
              >
                Apply
              </Button>
            </Tooltip>
          </div>
        </Row>

        {!isEmpty(appliedCustomers) && (
          <Card className="rate-detail__tag-wrapper" size="small">
            {appliedCustomers.map(item => (
              <Tag
                className="rate-detail__cus-tag"
                color="processing"
                key={item.id}
                closable
                onClose={ev => {
                  ev.preventDefault();
                  onRemove(item);
                }}
              >
                {renderTag(item)}
              </Tag>
            ))}
          </Card>
        )}
      </div>
    </Spin>
  );
};

export default RateDetail;
