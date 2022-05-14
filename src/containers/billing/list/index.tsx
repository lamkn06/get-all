import { MoreOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Popover,
  Row,
  Space,
  Table,
  TablePaginationConfig,
} from 'antd';
import Search from 'antd/lib/input/Search';
import { TableNoData } from 'components/table-no-data';
import { formatDateTime } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setBilling,
  setEditing,
  setTable,
  setVisible,
} from 'pages/billing-management/list/redux/slice';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { BillingType } from 'types';
import './index.scss';

interface Props {
  loading?: boolean;
  billings: BillingType[];

  onSuccess(): void;
}

export const ListBilling: React.FC<Props> = ({ billings, loading }) => {
  const { canCreate, canEdit } = usePermissions({
    module: 'manage_billing',
  });

  const { table } = useAppSelector(state => state.billingManagement);

  const { total, pageSize, pageIndex } = table;

  const dispatch = useDispatch();

  const handleAddNew = () => {
    dispatch(setBilling(undefined));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const handleOnEdit = (billing: BillingType) => {
    dispatch(setBilling(billing));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
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

  const onRowClick = (billing: BillingType) => {
    dispatch(setEditing(false));
    dispatch(setVisible(true));
    dispatch(setBilling(billing));
  };

  const onTableChange = ({ current, pageSize }: TablePaginationConfig) => {
    dispatch(setTable({ ...table, pageIndex: current, pageSize }));
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      render: (name: string) => name || <TableNoData />,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || <TableNoData />,
    },
    {
      title: 'Approved At',
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      render: (approvedAt: string) =>
        approvedAt ? formatDateTime(approvedAt) : <TableNoData />,
    },
    {
      key: 'action',
      width: 60,
      fixed: 'right' as any,
      render: (billing: BillingType) => {
        if (!canEdit) {
          return <></>;
        }
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
                      handleOnEdit(billing);
                    }}
                  >
                    Edit
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
              Add new billing
            </Button>
          </Col>
        )}
      </Row>

      <Table
        loading={loading}
        rowKey="billingUid"
        columns={columns}
        dataSource={billings}
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
