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
import { LetterAvatar } from 'components/letter-avatar';
import { TableNoData } from 'components/table-no-data';
import { MODULES } from 'constants/index';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import {
  setCurrentUser,
  setEditing,
  setTable,
  setVisible,
} from 'pages/user-management/redux/slice';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { UserType } from 'types/user';
import './index.scss';

interface InfoProp {
  users: UserType[];

  loading?: boolean;
  onDelete?: (user: UserType) => void;
  onChangePwd?: (user: UserType) => void;
}

export const ListUser: React.FC<InfoProp> = ({
  users,
  loading,
  onDelete,

  onChangePwd,
}) => {
  const { canCreate, canDelete, canEdit } = usePermissions({
    module: MODULES.MANAGE_USERS,
  });

  const dispatch = useDispatch();

  const { tablePagination } = useAppSelector(state => state.userManagement);
  const { total, pageSize, pageIndex } = tablePagination;

  const onRowClick = (users: UserType) => {
    dispatch(setCurrentUser(users));
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
    dispatch(setCurrentUser(undefined));
    dispatch(setVisible(true));
    dispatch(setEditing(true));
  };

  const onTableChange = ({ current, pageSize }: TablePaginationConfig) =>
    dispatch(setTable({ ...tablePagination, pageIndex: current, pageSize }));

  const columns = [
    {
      title: 'Employee No.',
      dataIndex: 'employeeNumber',
      key: 'employeeNumber',
    },
    {
      title: 'Name',
      key: 'name',
      ellipsis: true,
      width: 200,
      render: (user: UserType) => (
        <LetterAvatar
          alt={user.firstName}
          firstName={user.firstName}
          fullName={`${user.lastName}, ${user.firstName || ''} ${
            user.middleName || ''
          }`}
        />
      ),
    },
    {
      title: 'Contact No.',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
      key: 'role',
    },
    {
      title: 'Access Status',
      dataIndex: 'accessStatus',
      key: 'accessStatus',
    },
    {
      title: 'Created by',
      dataIndex: 'createdByUser',
      key: 'createdByUser',
      render: (createdByUser: { email: string }) =>
        createdByUser?.email || <TableNoData />,
    },
    {
      key: 'action',
      width: 50,
      fixed: 'right' as any,
      render: (user: UserType) => {
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
                    ghost
                    size="small"
                    type="primary"
                    onClick={ev => {
                      ev.stopPropagation();
                      dispatch(setCurrentUser(user));
                      dispatch(setEditing(true));
                      dispatch(setVisible(true));
                    }}
                  >
                    Edit
                  </Button>
                )}
                {canEdit && (
                  <Button
                    block
                    ghost
                    size="small"
                    type="primary"
                    onClick={ev => {
                      ev.stopPropagation();
                      onChangePwd(user);
                    }}
                  >
                    Change Password
                  </Button>
                )}
                {canDelete && (
                  <Button
                    danger
                    block
                    size="small"
                    type="primary"
                    onClick={ev => {
                      ev.stopPropagation();
                      onDelete(user);
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
    <div className="user_list">
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
              Add User
            </Button>
          </Col>
        )}
      </Row>
      <Table
        tableLayout="fixed"
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={users}
        rowClassName="user-list__row"
        pagination={{ total, pageSize, current: pageIndex }}
        onChange={onTableChange}
        scroll={{
          y: `calc(100vh - 322px)`,
          x: 1100,
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
