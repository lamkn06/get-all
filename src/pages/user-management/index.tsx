/* eslint-disable no-console */
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, notification, Typography } from 'antd';
import userService from 'api/user.api';
import { EditUser } from 'containers/users/edit';
import { ListUser } from 'containers/users/list';
import { buildMessage, serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UserType } from 'types/user';
import { useInjectReducer } from 'utils/redux-injectors';
import reducer, { setRoles, setTable, setVisible } from './redux/slice';

const { confirm } = Modal;

const UserManagement = () => {
  useInjectReducer({ key: 'userManagement', reducer });

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const { tablePagination } = useAppSelector(state => state.userManagement);
  const params = serializeQuery(tablePagination);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [tablePagination.pageIndex, tablePagination.filter]);

  useEffect(() => {
    return () => {
      dispatch(setTable({ ...tablePagination, filter: undefined }));
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getList(params);
      setUsers(res.data.results);
      dispatch(setTable({ ...tablePagination, total: res.data.totalRecords }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await userService.getRoles();
      dispatch(setRoles(res.data));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDelete = (user: UserType) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Typography.Text type="warning">
          Note: You cannot undo this action
        </Typography.Text>
      ),
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk() {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
          try {
            await userService.deleteUser(user.id);
            dispatch(setVisible(false));
            notification.success({
              message: `Delete ${user.lastName} successful!`,
            });
            resolve('');
            fetchUsers();
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  };

  const handleSubmit = async (user: UserType) => {
    try {
      setLoading(true);
      if (user.id) {
        await userService.updateUser(user);
      } else {
        await userService.createUser(user);
      }
      notification.success({
        message: buildMessage({
          isCreate: !user.id,
          name: user.firstName,
        }),
      });
      fetchUsers();
      dispatch(setVisible(false));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePwd = (user: UserType) => {
    confirm({
      title: (
        <>
          Change password of user:{' '}
          <Typography.Link>{user.firstName}</Typography.Link>
        </>
      ),
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to change password?`,
      okText: 'Yes',
      cancelText: 'Cancel',
      onOk: () => {
        userService.changePwd(user.userId);
        notification.success({
          message: (
            <Typography.Title level={5}>Change Password</Typography.Title>
          ),
          description: 'A link was sent to your email.',
        });
      },
    });
  };

  return (
    <div className="user-management">
      <ListUser
        loading={loading}
        users={users}
        onDelete={handleDelete}
        onChangePwd={handleChangePwd}
      />
      <EditUser loading={loading} onSubmit={handleSubmit} />
    </div>
  );
};

export default UserManagement;
