/* eslint-disable no-console */
import React, { useCallback } from 'react';
import { Select, Typography } from 'antd';
import { BILLING_API } from 'api';
import { AsyncSearch } from 'components/asynchronous-search';
import { BillingType } from 'types';

const { Option } = Select;
const { Text } = Typography;

interface Props {
  onSelect: (ids: string | string[]) => void;
  billingsIds?: string[];
}

export const BillingsFilter: React.FC<Props> = ({ onSelect, billingsIds }) => {
  const renderOption = useCallback((billing: BillingType) => {
    return (
      <Option value={billing.id} key={billing.id}>
        <Text strong>{billing.name}</Text>
      </Option>
    );
  }, []);

  return (
    <AsyncSearch
      placeholder="Find the billings"
      url={BILLING_API}
      onChange={value => onSelect(value as string[])}
      pageSize={10}
      renderOption={renderOption}
      optionLabelProp={undefined}
      autoFocus
      mode="multiple"
      value={billingsIds}
    />
  );
};
