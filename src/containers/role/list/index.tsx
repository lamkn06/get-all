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
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setEditing,
  setTable,
  setVisible,
} from 'pages/role-management/redux/slice';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { RoleType } from 'types/role';
import './index.scss';

interface InfoProp {
  roles: RoleType[];

  loading?: boolean;
  onRowClick(id: string): void;
  onDelete(role: RoleType): void;
}

export const ListRole: React.FC<InfoProp> = ({
  roles,
  loading,

  onDelete,
  onRowClick,
}) => {
  const { canCreate, canDelete, canEdit } = usePermissions({
    module: MODULES.MANAGE_ROLES,
  });

  const dispatch = useDispatch();

  const { tablePagination } = useAppSelector(state => state.roleManagement);
  const { total, pageSize, pageIndex } = tablePagination;

  const handleRowClick = (role: RoleType) => {
    onRowClick(role.id);
    dispatch(setVisible(true));
    dispatch(setEditing(false));
  };

  const handleSearch = useCallback(
    (text: string) => {
      dispatch(
        setTable({
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
    onRowClick(undefined);
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const onEdit = (role: RoleType) => {
    onRowClick(role.id);
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const onTableChange = ({ current, pageSize }: TablePaginationConfig) =>
    dispatch(setTable({ ...tablePagination, pageIndex: current, pageSize }));

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => name || <TableNoData />,
    },
    {
      title: 'Role Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || <TableNoData />,
    },
    {
      title: 'Role Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const active = status === 'active';
        const color = active ? 'green' : 'red';
        return status ? (
          <Tag color={color} className="text-capitalize">
            {status}
          </Tag>
        ) : (
          <TableNoData />
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
      key: 'action',
      width: 60,
      fixed: 'right' as any,
      render: (role: RoleType) => {
        if (!canEdit && !canDelete) {
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
                      onEdit(role);
                    }}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    danger
                    block
                    size="small"
                    onClick={ev => {
                      ev.stopPropagation();
                      onDelete(role);
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
  return (
    <div className="role_list">
      <Row justify="space-between" className="mb-2" gutter={10}>
        <Col md={{ span: 8 }} sm={{ span: 24 }}>
          <Search
            defaultValue={tablePagination.filter?.keyword}
            placeholder="input search text"
            onSearch={handleSearch}
          />
        </Col>
        {canCreate && (
          <Col md={{ span: 4 }} sm={{ span: 24 }} className="text-right">
            <Button
              type="primary"
              ghost
              icon={<PlusCircleOutlined />}
              onClick={handleAddNew}
            >
              Add Role
            </Button>
          </Col>
        )}
      </Row>
      <Table
        tableLayout="fixed"
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={roles}
        rowClassName="role-list__row"
        pagination={{ total, pageSize, current: pageIndex }}
        onChange={onTableChange}
        scroll={{
          y: `calc(100vh - 322px)`,
          x: 900,
        }}
        onRow={record => {
          return {
            onClick: _ => handleRowClick(record),
          };
        }}
      />
    </div>
  );
};
