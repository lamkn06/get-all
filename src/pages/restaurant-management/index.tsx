/* eslint-disable no-console */

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, notification, Typography } from 'antd';
import restaurantService from 'api/restaurant.api';
import { ListRestaurant } from 'containers/restaurant/list';
import { serializeQuery } from 'helpers';

import { setPagination } from 'pages/restaurant-management/redux/restaurant';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RestaurantType } from 'types';
import { useInjectReducer } from 'utils/redux-injectors';
import reducer from './redux/restaurant';
import { useAppSelector } from 'hooks/app-hooks';

const RestaurantManagement = () => {
  useInjectReducer({ key: 'restaurantManagement', reducer });
  const { pagination } = useAppSelector(state => state.restaurantManagement);
  const dispatch = useDispatch();

  const params = serializeQuery(pagination);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.filter]);

  useEffect(() => {
    return () => {
      dispatch(setPagination({ ...pagination, filter: undefined }));
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await restaurantService.get(params);
      const { data } = res;
      setRestaurants(data.results);
      dispatch(setPagination({ ...pagination, total: data.totalRecords }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  const handleDelete = (restaurant: RestaurantType) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this restaurant?',
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
            await restaurantService.delete(restaurant.id);
            notification.success({
              message: `Delete ${restaurant.name} successful!`,
            });
            resolve('');
            fetchData();
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  };

  return (
    <Fragment>
      <ListRestaurant
        loading={loading}
        restaurants={restaurants}
        onDelete={handleDelete}
      />
    </Fragment>
  );
};

export default RestaurantManagement;
