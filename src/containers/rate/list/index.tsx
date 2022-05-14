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
import { MODULES } from 'constants/index';
import { PATHS } from 'constants/paths';
import { formatDateTime } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setRate,
  setTable,
  setVisible,
} from 'pages/rate-management/list/redux/slice';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RateType } from 'types/rate';
import './index.scss';

interface Props {
  loading?: boolean;
  rates: RateType[];
}

export const ListRate: React.FC<Props> = ({ rates, loading }) => {
  const { canCreate, canEdit } = usePermissions({
    module: MODULES.MANAGE_RATE_CARDS,
  });

  const navigate = useNavigate();
  const { table } = useAppSelector(state => state.rateManagement);

  const { total, pageSize, pageIndex } = table;

  const dispatch = useDispatch();
  const handleAddNew = () => {
    dispatch(setRate(undefined));
    dispatch(setVisible(true));
  };

  const handleOnEdit = (rate: RateType) => {
    dispatch(setRate(rate));
    dispatch(setVisible(true));
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
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => {
        return (
          <Tag color={active ? 'green' : 'red'} className="text-capitalize">
            {active ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      key: 'action',
      width: 60,
      fixed: 'right' as any,
      render: (driver: RateType) => {
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
                    handleOnEdit(driver);
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
    <div>
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
        rowKey="rateId"
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
            onClick: _ => navigate(`${PATHS.RateManagement}/${record.rateId}`),
          };
        }}
      />
    </div>
  );
};
