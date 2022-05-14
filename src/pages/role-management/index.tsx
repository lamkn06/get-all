/* eslint-disable no-console */

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, notification, Typography } from 'antd';
import roleService from 'api/role.api';
import userService from 'api/user.api';
import { EditRole } from 'containers/role/edit';
import { ListRole } from 'containers/role/list';
import { serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RoleType } from 'types/role';
import { useInjectReducer } from 'utils/redux-injectors';
import reducer, { setCurrentRole, setTable } from './redux/slice';

const RoleManagement = () => {
  useInjectReducer({ key: 'roleManagement', reducer });

  const [loading, setLoading] = useState(false);

  const [loadingDetail, setLoadingDetail] = useState(false);

  const [roles, setRoles] = useState<RoleType[]>([]);

  const [ids, setIds] = useState<string[]>([]);

  const { tablePagination } = useAppSelector(state => state.roleManagement);

  const params = serializeQuery(tablePagination);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchRoles();
  }, [tablePagination.pageIndex, tablePagination.filter]);

  useEffect(() => {
    return () => {
      dispatch(setTable({ ...tablePagination, filter: undefined }));
    };
  }, []);

  useEffect(() => {
    if (ids.length === 0) {
      return;
    }
    ids.forEach(id => {
      fetchUser(id);
    });
  }, [ids]);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await roleService.getList(params);
      const { data } = res;

      setRoles(data.results.filter(role => !role.isDefault));
      dispatch(setTable({ ...tablePagination, total: data.totalRecords }));

      const ids = [...new Set(data.results.map(item => item.createdByUserId))];

      setIds(ids);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchUser = useCallback(
    async (id: string) => {
      try {
        const { data } = await userService.findByUserId(id);
        setRoles(
          roles.map(role => {
            if (role.createdByUserId === id) {
              role.user = data;
            }
            return role;
          }),
        );
        // eslint-disable-next-line no-empty
      } catch (error) {
        // eslint-disable-next-line no-empty
      } finally {
      }
    },
    [params, roles],
  );

  const handleRowClick = async currentRoleId => {
    setLoadingDetail(true);
    try {
      if (!currentRoleId) {
        dispatch(setCurrentRole(undefined));
        return;
      }
      const res = await roleService.getDetail(currentRoleId);
      dispatch(setCurrentRole(res.data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      fetchRoles();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (role: RoleType) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this Role?',
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
            await roleService.delete(role.id);
            notification.success({
              message: `Delete ${role.name} successful!`,
            });
            resolve('');
            fetchRoles();
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  };

  return (
    <div className="role-management">
      <ListRole
        loading={loading}
        roles={roles}
        onRowClick={handleRowClick}
        onDelete={handleDelete}
      />
      <EditRole loading={loadingDetail} onSuccess={handleSubmit} />
    </div>
  );
};

export default RoleManagement;
