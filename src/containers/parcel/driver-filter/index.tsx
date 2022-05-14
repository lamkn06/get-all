/* eslint-disable no-console */
import React, { useCallback } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Select, Tag, Typography } from 'antd';
import { DriverType } from 'types';
import { DRIVER_API } from 'api';
import { AsyncSearch } from 'components/asynchronous-search';
import { joinDriverName } from 'helpers/component.helper';
import './index.scss';

const { Option } = Select;
const { Text } = Typography;

interface Props {
  onSelect: (driverId: string) => void;
  driverId?: string;
}

export const DriverFilter: React.FC<Props> = ({ onSelect, driverId }) => {
  const renderOption = useCallback((driver: DriverType) => {
    return (
      <Option
        value={driver.driverId}
        key={driver.driverId}
        label={joinDriverName(driver.driverProfile)}
      >
        <Text strong>{joinDriverName(driver.driverProfile)}</Text>
        <div>
          <Text className="mr-2">{driver.phoneNumber}</Text>
          <Tag
            color={
              driver.isBusy
                ? 'warning'
                : driver.driverStatus === 'active'
                ? 'success'
                : 'error'
            }
            className="text-capitalize"
            icon={driver.isBusy ? <ClockCircleOutlined /> : undefined}
          >
            {driver.isBusy ? 'Is Busy' : driver.driverStatus}
          </Tag>
        </div>
      </Option>
    );
  }, []);

  return (
    <AsyncSearch
      className="driver-filter"
      placeholder="Find a customer"
      url={DRIVER_API}
      onSelect={(value: string) => onSelect(value as string)}
      pageSize={10}
      renderOption={renderOption}
      optionLabelProp={undefined}
      value={driverId}
      autoFocus
      defaultFilter={{
        approvalStatus: 'approved',
        status: 'active',
      }}
    />
  );
};
