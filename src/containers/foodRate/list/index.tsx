import { MoreOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Popover,
  Row,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
} from 'antd';
import Search from 'antd/lib/input/Search';
import { TableNoData } from 'components/table-no-data';
import { formatDateTime } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setEditing,
  setFoodRate,
  setTable,
  setVisible,
} from 'pages/food-rate-management/list/redux/slice';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FoodRateType } from 'types/foodRate';
import { RateType } from 'types/rate';
import './index.scss';

interface Props {
  loading?: boolean;
  rates: FoodRateType[];
  onSuccess();
}

export const ListFoodRate: React.FC<Props> = ({
  rates,
  loading,
  onSuccess,
}) => {
  const { canCreate, canEdit } = usePermissions({
    module: 'manage_rate_cards',
  });

  const { table } = useAppSelector(state => state.foodRateManagement);

  const { total, pageSize, pageIndex } = table;

  const dispatch = useDispatch();
  const handleAddNew = () => {
    dispatch(setFoodRate(undefined));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleOnEdit = (rate: FoodRateType) => {
    dispatch(setFoodRate(rate));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const onRowClick = (rate: FoodRateType) => {
    dispatch(setFoodRate(rate));
    dispatch(setVisible(true));
    dispatch(setEditing(false));
  };

  const handleSearch = useCallback(
    (text: string) => {
      dispatch(
        setTable({
          ...table,
          pageIndex: 1,
          filter: {
            keyword: text,
          },
        }),
      );
    },
    [setTable],
  );

  const onTableChange = ({ current, pageSize }: TablePaginationConfig) => {
    dispatch(setTable({ ...table, pageIndex: current, pageSize }));
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: ({ isDefault, name }: RateType) => {
        return (
          <Space>
            {name}
            {isDefault && (
              <Tag color="purple" className="text-capitalize">
                ● Default
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Created by',
      dataIndex: ['user', 'email'],
      key: 'email',
      render: (email: string) => email || <TableNoData />,
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) =>
        createdAt ? formatDateTime(createdAt) : <TableNoData />,
    },
    {
      title: 'Date Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string) =>
        updatedAt ? formatDateTime(updatedAt) : <TableNoData />,
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
    {
      key: 'action',
      width: 60,
      fixed: 'right' as any,
      render: (foodRate: FoodRateType) => {
        return (
          canEdit && (
            <Popover
              placement="left"
              trigger="focus"
              content={
                <Button
                  block
                  size="small"
                  onClick={ev => {
                    ev.stopPropagation();
                    handleOnEdit(foodRate);
                  }}
                >
                  Edit
                </Button>
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

  return (
    <div className="parcel-detail">
      <Row justify="space-between" className="mb-1" gutter={10}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Search
            defaultValue={table.filter?.keyword}
            placeholder="input search text"
            onSearch={handleSearch}
          />
        </Col>
        {canCreate && (
          <Col md={{ span: 12 }} sm={{ span: 24 }} className="text-right">
            <Button
              type="primary"
              ghost
              icon={<PlusCircleOutlined />}
              onClick={handleAddNew}
            >
              Add new rate card
            </Button>
          </Col>
        )}
      </Row>

      <Table
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={rates}
        onChange={onTableChange}
        pagination={{ total, pageSize, current: pageIndex }}
        scroll={{
          x: 800,
          y: `calc(100vh - 320px)`,
        }}
        onRow={record => {
          return {
            onClick: _ => onRowClick(record),
          };
        }}
      />
    </div>
  );
};
