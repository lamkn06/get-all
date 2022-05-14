/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-empty */
import {
  FilterFilled,
  MoreOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Input,
  Popover,
  Radio,
  Row,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
  Typography,
} from 'antd';
import { useAppSelector } from 'hooks/app-hooks';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Highlighter from 'react-highlight-words';
import {
  setCurrentVoucher,
  setVisible,
  setEditing,
  setPagination,
} from 'pages/voucher-management/redux/slice';
import { VoucherType, PaymentMethodType, VoucherStatus } from 'types/voucher';
import {
  PaymentMethod,
  VehicleTypes,
  DiscountTypes,
  DATE_FORMAT,
} from 'constants/index';
import { ColumnsType } from 'antd/es/table';
import { checkIsPercentage, cleanObject, removeSnakeCase } from 'helpers';
import { StatusType } from 'types';
import { capitalize } from 'lodash';
import moment, { Moment } from 'moment';
import { usePermissions } from 'hooks/usePermission';
import { TableNoData } from 'components/table-no-data';
import { getColumnCheckboxProps } from 'helpers/component.helper';

interface Props {
  loading?: boolean;
  vouchers?: VoucherType[];
  onDelete?: (voucher: VoucherType) => void;
}

export const ListVouchers: React.FC<Props> = ({
  vouchers,
  loading,
  onDelete,
}) => {
  const dispatch = useDispatch();
  const { canCreate, canDelete, canEdit } = usePermissions({
    module: 'manage_vouchers',
  });
  const [searchData, setSearchData] = useState({
    searchText: '',
    searchedColumn: '',
  });
  const searchInput = useRef(undefined);

  const { tablePagination } = useAppSelector(state => state.voucherManagement);
  const { total, pageSize, pageIndex } = tablePagination;

  const onRowClick = (voucher: VoucherType) => {
    dispatch(setCurrentVoucher(voucher));
    dispatch(setVisible(true));
    dispatch(setEditing(false));
  };

  const onEdit = (voucher: VoucherType) => {
    dispatch(setCurrentVoucher(voucher));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleSearch = useCallback(
    (text: string) => {
      dispatch(
        setPagination({
          ...tablePagination,
          pageIndex: 1,
          filter: {
            keyword: text,
          },
        }),
      );
    },
    [tablePagination],
  );

  const handleAddNew = () => {
    dispatch(setCurrentVoucher(undefined));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleSearchColumn = (
    selectedKeys: string[],
    confirm: Function,
    dataIndex: string,
  ) => {
    confirm();
    setSearchData({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  const handleReset = (clearFilters: Function) => {
    clearFilters();
    setSearchData({ searchText: '', searchedColumn: '' });
  };

  const getColumnSearchProps = useCallback(
    (dataIndex: string, title: string) => ({
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Search ${title}`}
            value={selectedKeys[0]}
            size="small"
            onChange={e =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearchColumn(selectedKeys, confirm, dataIndex)
            }
            style={{ display: 'block', marginBottom: 8 }}
          />
          <Space>
            <Button
              onClick={() => handleReset(clearFilters)}
              size="small"
              block
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={() =>
                handleSearchColumn(selectedKeys, confirm, dataIndex)
              }
              size="small"
              block
            >
              Search
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: string) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInput.current.select(), 100);
        }
      },
      render: (text: string) =>
        searchData.searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchData.searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    }),
    [searchData],
  );

  const getColumnDatetimeProps = useCallback(
    () => ({
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div>
          <div className="px-2 py-1">
            <DatePicker.RangePicker
              value={selectedKeys[0]}
              onChange={(values: [Moment, Moment]) => {
                setSelectedKeys(values ? [values] : []);
              }}
            />
          </div>
          <div className="ant-table-filter-dropdown-btns">
            <Button
              onClick={() => {
                clearFilters();
                confirm();
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
    }),
    [searchData],
  );

  const onTableChange = useCallback(
    (
      { current, pageSize }: TablePaginationConfig,
      filters: {
        code: Array<string>;
        paymentMethod: Array<string>;
        vehicleType: Array<string>;
        discountType: Array<'all'>;
        status: Array<'all'>;
        effectiveDate: Array<Array<Moment>>;
        expiryDate: Array<Array<Moment>>;
      },
    ) => {
      const newFilter = {
        code: filters.code ? filters.code[0] : undefined,
        discountType: undefined,
        paymentMethod: filters.paymentMethod,
        status: undefined,
        vehicleType: filters.vehicleType,
        [`effectiveDate[gt]`]: undefined,
        [`effectiveDate[lt]`]: undefined,
        [`expiryDate[gt]`]: undefined,
        [`expiryDate[lt]`]: undefined,
      };
      if (filters.discountType && filters.discountType[0] !== 'all') {
        newFilter.discountType = filters.discountType[0];
      }
      if (filters.status && filters.status[0] !== 'all') {
        newFilter.status = filters.status[0];
      }
      if (filters.effectiveDate) {
        newFilter['effectiveDate[gt]'] = moment(
          filters.effectiveDate[0][0],
        ).format(DATE_FORMAT);
        newFilter['effectiveDate[lt]'] = moment(
          filters.effectiveDate[0][1],
        ).format(DATE_FORMAT);
      }
      if (filters.expiryDate) {
        newFilter['expiryDate[gt]'] = moment(filters.expiryDate[0][0]).format(
          DATE_FORMAT,
        );
        newFilter['expiryDate[lt]'] = moment(filters.expiryDate[0][1]).format(
          DATE_FORMAT,
        );
      }

      dispatch(
        setPagination({
          ...tablePagination,
          pageIndex: current,
          pageSize,
          filter: cleanObject(newFilter),
        }),
      );
    },
    [],
  );

  const columns: ColumnsType<VoucherType> = useMemo(() => {
    return [
      {
        title: 'Voucher Number',
        dataIndex: 'code',
        key: 'code',
        ...getColumnSearchProps('code', 'Voucher Number'),
      },
      {
        title: 'Voucher Details',
        dataIndex: 'description',
        key: 'description',
        render: value => (
          <Typography.Paragraph ellipsis={{ rows: 3 }}>
            {value}
          </Typography.Paragraph>
        ),
      },
      {
        title: 'Effective Date',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        ...getColumnDatetimeProps(),
        render: value => (value ? value.toUpperCase() : <TableNoData />),
      },
      {
        title: 'Expiry Date',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        ...getColumnDatetimeProps(),
        render: value => (value ? value.toUpperCase() : <TableNoData />),
      },
      {
        title: 'Discount Type',
        dataIndex: 'discountType',
        key: 'discountType',
        ...getColumnCheckboxProps(
          DiscountTypes.map(item => ({
            text: item.label,
            value: item.value,
          })),
        ),
        className: 'text-capitalize',
        render: (method: PaymentMethodType) => {
          return removeSnakeCase(method);
        },
      },
      {
        title: 'Amount to be Deducted',
        key: 'discountAmount',
        width: 120,
        render: (record: VoucherType) =>
          checkIsPercentage(record.discountType)
            ? `${record.discountAmount * 100} %`
            : `${record.discountAmount} ₱`,
      },
      {
        title: 'Vehicle Type',
        dataIndex: 'vehicleType',
        key: 'vehicleType',
        filters: [
          {
            text: 'NONE',
            value: 'null',
          },
        ].concat(
          VehicleTypes.map(item => ({
            text: item.label.toUpperCase(),
            value: item.value,
          })),
        ),
        render: value => (value ? value.toUpperCase() : <TableNoData />),
      },
      {
        title: 'Payment Method',
        dataIndex: 'paymentMethod',
        width: 160,
        key: 'paymentMethod',
        filters: [
          {
            text: 'None',
            value: 'null',
          },
        ].concat(
          PaymentMethod.map(item => ({
            text: capitalize(item.label),
            value: item.value,
          })),
        ),
        className: 'text-capitalize',
        render: (method: PaymentMethodType) => {
          return method ? removeSnakeCase(method) : <TableNoData />;
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        ...getColumnCheckboxProps(
          VoucherStatus.map(item => ({
            text: capitalize(item),
            value: item,
          })),
        ),
        render: (status: StatusType) => {
          const color =
            status === 'pending'
              ? 'gold'
              : status === 'active'
              ? 'green'
              : 'red';
          return (
            <Tag color={color} className="text-capitalize">
              {status}
            </Tag>
          );
        },
      },
      {
        key: 'action',
        width: 60,
        fixed: 'right' as any,
        render: (voucher: VoucherType) => {
          if (!canEdit && !canDelete) return null;
          return (
            <Popover
              placement="left"
              trigger="focus"
              content={
                <Space direction="vertical">
                  {canEdit && (
                    <Button
                      block
                      size="small"
                      onClick={ev => {
                        ev.stopPropagation();
                        onEdit(voucher);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      block
                      danger
                      size="small"
                      onClick={ev => {
                        ev.stopPropagation();
                        onDelete(voucher);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Space>
              }
            >
              <Button
                onClick={ev => ev.stopPropagation()}
                icon={<MoreOutlined />}
                shape="circle"
              />
            </Popover>
          );
        },
      },
    ];
  }, [vouchers]);

  return (
    <div>
      <Row justify="space-between" className="mb-1" gutter={[10, 10]}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Input.Search
            defaultValue={tablePagination.filter?.keyword}
            placeholder="input search text"
            onSearch={handleSearch}
          />
        </Col>
        <Col md={{ span: 12 }} sm={{ span: 24 }} className="text-right">
          {canCreate && (
            <Button
              type="primary"
              ghost
              icon={<PlusCircleOutlined />}
              onClick={handleAddNew}
            >
              Add a new voucher
            </Button>
          )}
        </Col>
      </Row>

      <Table<VoucherType>
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={vouchers}
        rowClassName="voucher-list__row"
        pagination={{
          total,
          pageSize,
          current: pageIndex,
          hideOnSinglePage: true,
        }}
        scroll={{
          x: 1450,
          // y: `calc(100vh - 322px)`,
        }}
        onChange={onTableChange as any}
        onRow={record => {
          return {
            onClick: _ => onRowClick(record),
          };
        }}
      />
    </div>
  );
};
