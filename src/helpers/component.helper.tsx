import { FilterFilled, SearchOutlined } from '@ant-design/icons';
import { Button, Input, message, Radio, Space } from 'antd';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { TableNoData } from 'components/table-no-data';
import { isEmpty } from 'lodash';
import { CustomerType } from 'types';
import { DriverProfile } from 'types/driver';

// Limit number is MB, set `false` if no limit
export const checkValidFile = (file: RcFile, limit?: number | boolean) => {
  if (limit === false) return true;

  const _limit = limit || 2;
  const isLt = file.size / 1024 / 1024 < _limit;
  if (!isLt) {
    message.error(`Image must smaller than ${_limit}MB!`);
    return false;
  }
  return true;
};

export const normFile = (e: UploadChangeParam, limit?: number | boolean) => {
  if (!checkValidFile(e.file as RcFile, limit)) {
    return [];
  }
  if (Array.isArray(e)) {
    return e[e.length - 1];
  }
  return e && e.fileList[e.fileList.length - 1];
};

export const getColumnCheckboxProps = (
  options: Array<{ text: string; value: string | number }>,
) => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <div className="p-1">
      <div className="mb-2">
        <Radio.Group
          value={selectedKeys[0] || 'all'}
          onChange={({ target }) => {
            setSelectedKeys(target.value ? [target.value] : []);
          }}
        >
          <Space direction="vertical">
            {[{ text: 'All', value: 'all' }, ...options].map(item => (
              <Radio key={item.value} value={item.value}>
                {item.text}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>
      <div>
        <Button
          onClick={() => {
            clearFilters();
          }}
          size="small"
          className="mr-2"
          type="link"
          disabled={!selectedKeys[0]}
        >
          Reset
        </Button>
        <Button type="primary" onClick={() => confirm()} size="small">
          Search
        </Button>
      </div>
    </div>
  ),
  filterIcon: (filtered: string) => (
    <FilterFilled style={{ color: filtered ? '#1890ff' : undefined }} />
  ),
});

export const getColumnSearchProps = (title: string) => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <div className="p-1">
      <Input
        placeholder={`Search ${title}`}
        value={selectedKeys[0]}
        size="small"
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => confirm()}
        style={{ display: 'block', marginBottom: 8 }}
      />
      <Space className="flex" style={{ justifyContent: 'space-between' }}>
        <Button
          onClick={() => clearFilters()}
          size="small"
          className="mr-2"
          type="link"
          disabled={!selectedKeys[0]}
        >
          Reset
        </Button>
        <Button type="primary" onClick={() => confirm()} size="small" block>
          Search
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered: string) => (
    <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
  ),
});

export const joinDriverName = (profile: DriverProfile | CustomerType) =>
  !isEmpty(profile) ? (
    `${profile.firstName}, ${profile.lastName || ''} ${
      profile.middleName || ''
    }`.trimRight()
  ) : (
    <TableNoData />
  );

export const joinCustomerName = (customer: CustomerType) =>
  customer.firstName
    ? `${customer.firstName}, ${customer.lastName} (${customer.phoneNumber})`
    : customer.phoneNumber;
