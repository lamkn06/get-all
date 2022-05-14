/* eslint-disable no-console */
import { Select, SelectProps } from 'antd';
import axios from 'axios';
import classNames from 'classnames';
import { serializeQuery } from 'helpers';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import './index.scss';

interface AsyncSearchProps extends SelectProps<{}> {
  // onSelect: (item: any) => void;
  renderOption: (item: any) => React.ReactNode;
  url: string;
  searchField?: string;
  defaultFilter?: Record<string, any>;
  value?: any;
  pageSize?: number;
}

export const AsyncSearch: React.FC<AsyncSearchProps> = ({
  onSelect,
  defaultFilter,
  renderOption,
  value,
  url,
  pageSize = 20,
  searchField = 'keyword',
  className,
  ...selectProps
}) => {
  const hasMoreRef = useRef(true);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    pageIndex: 1,
    pageSize,
    filter: {
      ...defaultFilter,
    },
  });

  useEffect(() => {
    hasMoreRef.current = true;
    fetchData();
  }, [params]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}?${serializeQuery(params)}`);
      const {
        data: { results },
      } = res;
      if (params.pageIndex === 1) {
        setDataSource(results);
      } else {
        setDataSource([...dataSource, ...results]);
      }
      if (results.length < params.pageSize) {
        hasMoreRef.current = false;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handleScroll = async ({
    currentTarget,
  }: React.UIEvent<HTMLDivElement>) => {
    if (!hasMoreRef.current) return;
    const isEndOfList =
      currentTarget.scrollHeight -
        (currentTarget.clientHeight + currentTarget.scrollTop) <=
      2;

    if (isEndOfList) {
      setParams({
        ...params,
        pageIndex: params.pageIndex + 1,
      });
    }
  };

  const handleSearch = useDebouncedCallback((keyword: string) => {
    let _keyword = '';
    if (keyword) {
      _keyword = keyword;
    }
    setParams({
      ...params,
      pageIndex: 1,
      filter: {
        ...params.filter,
        [searchField]: _keyword,
      },
    });
  }, 500);

  return (
    <Select
      showSearch
      optionLabelProp="label"
      loading={loading}
      filterOption={false}
      onPopupScroll={handleScroll}
      onSearch={handleSearch}
      onClear={null}
      className={classNames('asynchronous-search', className)}
      onSelect={onSelect}
      value={value}
      {...selectProps}
    >
      {dataSource.map((item, index) => (
        <React.Fragment key={index}>{renderOption(item)}</React.Fragment>
      ))}
    </Select>
  );
};
