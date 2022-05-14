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
  Input,
  Popover,
  Radio,
  Row,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
} from 'antd';
import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Highlighter from 'react-highlight-words';
import { useNavigate } from 'react-router-dom';
import {
  setCurrentRestaurant,
  setPagination,
  setSelectedCategory,
} from 'pages/restaurant-management/redux/restaurant';
import { ColumnsType } from 'antd/es/table';
import { RestaurantType, StatusType } from 'types';
import { usePermissions } from 'hooks/usePermission';
import { cleanObject, removeSnakeCase } from 'helpers';
import { PATHS } from 'constants/paths';
import reducers from 'pages/restaurant-management/redux';
import { TableNoData } from 'components/table-no-data';
import { CategoryFilter } from 'containers/restaurant/list/category-filter';
import { useAppSelector } from 'hooks/app-hooks';

interface Props {
  loading?: boolean;
  restaurants?: RestaurantType[];
  onDelete?: (restaurant: RestaurantType) => void;
}

export const ListRestaurant: React.FC<Props> = ({
  restaurants,
  loading,
  onDelete,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { canCreate, canDelete } = usePermissions({
    module: 'manage_restaurants',
  });
  const { selectedCategory } = useAppSelector(
    state => state.restaurantManagement,
  );

  const { restaurant } = reducers.getState();
  const { pagination } = restaurant;
  const { total, pageSize, pageIndex } = pagination;

  const [searchData, setSearchData] = useState({
    searchText: '',
    searchedColumn: '',
  });
  const searchInput = useRef(undefined);

  const onRowClick = (restaurant: RestaurantType) => {
    navigate(PATHS.RestaurantDetail.replace(':id', restaurant.id));
  };

  const handleSearch = useCallback(
    (text: string) => {
      dispatch(
        setPagination({
          ...pagination,
          pageIndex: 1,
          filter: {
            name: text,
          },
        }),
      );
    },
    [pagination],
  );

  const handleAddNew = () => {
    dispatch(setCurrentRestaurant(undefined));
    navigate(PATHS.RestaurantDetail.replace(':id', 'create'));
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
          <div className="text-right">
            <Button
              onClick={() => {
                handleReset(clearFilters);
                confirm();
              }}
              size="small"
              type="link"
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={() =>
                handleSearchColumn(selectedKeys, confirm, dataIndex)
              }
              className="ml-1"
              size="small"
            >
              Search
            </Button>
          </div>
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

  const getColumnCheckboxProps = useCallback(
    (options: Array<{ text: string; value: string }>) => ({
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div>
          <div className="px-2 py-1">
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
    [],
  );

  const onTableChange = useCallback(
    (
      { current, pageSize }: TablePaginationConfig,
      filters: {
        brandName?: string[];
        name?: string[];
        categoryId?: string[];
        status?: Array<'all'>;
      },
    ) => {
      const newFilter = {
        brandName: filters.brandName?.[0],
        name: filters.name?.[0],
        categoryId: filters.categoryId?.[0],
        status: filters.status?.[0] !== 'all' && filters.status?.[0],
      };
      dispatch(
        setPagination({
          ...pagination,
          pageIndex: current,
          pageSize,
          filter: cleanObject(newFilter),
        }),
      );
    },
    [selectedCategory],
  );

  const columns: ColumnsType<RestaurantType> = useMemo(() => {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        ...getColumnSearchProps('name', 'Name'),
      },
      {
        title: 'Brand',
        dataIndex: 'brandName',
        key: 'brandName',
        ...getColumnSearchProps('brandName', 'brandName'),
      },
      {
        title: 'Category',
        dataIndex: ['category', 'name'],
        key: 'categoryId',
        filterDropdown: ({ confirm, setSelectedKeys, clearFilters }) => (
          <div className="p-1">
            <CategoryFilter
              onSelect={value => {
                setSelectedKeys(value ? [value] : []);
                dispatch(setSelectedCategory(value));
              }}
              categoryId={selectedCategory}
            />
            <div className="text-right">
              <Button
                onClick={() => {
                  dispatch(setSelectedCategory(''));
                  clearFilters();
                  confirm();
                }}
                size="small"
                type="link"
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
            style={{ color: selectedCategory ? '#1890ff' : undefined }}
          />
        ),
      },
      {
        title: 'Open Hour',
        dataIndex: 'openHour',
        key: 'openHour',
        render: value => value || <TableNoData />,
      },
      {
        title: 'Close Hour',
        dataIndex: 'closeHour',
        key: 'closeHour',
        render: value => value || <TableNoData />,
      },
      {
        title: 'Operation Status',
        dataIndex: 'operationStatus',
        key: 'operationStatus',
        className: 'text-capitalize',
        render: value => removeSnakeCase(value),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        ...getColumnCheckboxProps([
          { text: 'Active', value: 'active' },
          { text: 'Inactive', value: 'inactive' },
        ]),
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
        render: (restaurant: RestaurantType) => {
          return (
            canDelete && (
              <Popover
                placement="left"
                trigger="focus"
                content={
                  <Space direction="vertical">
                    <Button
                      block
                      danger
                      size="small"
                      onClick={ev => {
                        ev.stopPropagation();
                        onDelete(restaurant);
                      }}
                    >
                      Delete
                    </Button>
                  </Space>
                }
              >
                <Button
                  onClick={ev => ev.stopPropagation()}
                  icon={<MoreOutlined />}
                  shape="circle"
                />
              </Popover>
            )
          );
        },
      },
    ];
  }, [restaurants, selectedCategory]);

  return (
    <Fragment>
      <Row justify="space-between" className="mb-1" gutter={[10, 10]}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Input.Search
            defaultValue={pagination.filter?.name}
            placeholder="search restaurant name"
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
              Add a new restaurant
            </Button>
          )}
        </Col>
      </Row>

      <Table<RestaurantType>
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={restaurants}
        pagination={{
          total,
          pageSize,
          current: pageIndex,
          hideOnSinglePage: true,
        }}
        scroll={{
          x: 900,
        }}
        onChange={onTableChange}
        onRow={record => {
          return {
            onClick: _ => onRowClick(record),
          };
        }}
      />
    </Fragment>
  );
};
