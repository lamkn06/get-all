/* eslint-disable no-console */
import React, { useCallback } from 'react';
import { Select, Typography } from 'antd';
import { AsyncSearch } from 'components/asynchronous-search';
import { CategoryType } from 'types';
import { RESTAURANT_CATEGORY_API } from 'api';

const { Option } = Select;
const { Text } = Typography;

interface Props {
  onSelect: (id: string) => void;
  categoryId?: string;
}

export const CategoryFilter: React.FC<Props> = ({ onSelect, categoryId }) => {
  const renderOption = useCallback(
    (category: CategoryType) => {
      return (
        <Option value={category.id} key={category.id}>
          <Text strong>{category.name}</Text>
        </Option>
      );
    },
    [categoryId],
  );

  return (
    <AsyncSearch
      placeholder="Find a category"
      url={RESTAURANT_CATEGORY_API}
      onChange={onSelect}
      pageSize={10}
      renderOption={renderOption}
      optionLabelProp={undefined}
      autoFocus
      searchField="name"
      value={categoryId}
    />
  );
};
