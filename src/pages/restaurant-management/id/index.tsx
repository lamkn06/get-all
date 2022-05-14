/* eslint-disable no-empty */
/* eslint-disable no-console */
import { notification, Tabs } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import restaurantService from 'api/restaurant.api';
import restaurantCategoryService from 'api/restaurantCategory.api';
import { PATHS } from 'constants/paths';
import { EditRestaurant } from 'containers/restaurant/edit';
import { ListRestaurantOrders } from 'containers/restaurant/orders';
import { buildMessage } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import RestaurantAddon from 'pages/restaurant-management/id/addon';
import RestaurantProduct from 'pages/restaurant-management/id/product';
import {
  setCurrentRestaurant,
  setRestaurantCategories,
} from 'pages/restaurant-management/redux/restaurant';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { useInjectReducer } from 'redux-injectors';
import { RestaurantType } from 'types/restaurant';
import reducerAddon from '../redux/addon';
import reducerProduct from '../redux/product';
import reducerRestaurant from '../redux/restaurant';
import './index.scss';

const { TabPane } = Tabs;

const RestaurantDetail = () => {
  useInjectReducer({ key: 'restaurantManagement', reducer: reducerRestaurant });
  useInjectReducer({ key: 'productManagement', reducer: reducerProduct });
  useInjectReducer({ key: 'addonManagement', reducer: reducerAddon });

  const { currentRestaurant } = useAppSelector(
    state => state.restaurantManagement,
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const isCreate = id === 'create';

  useEffect(() => {
    fetchRestaurantCategories();
  }, []);

  useEffect(() => {
    if (id && !isCreate) {
      fetchDetail(id);
    }
  }, [id]);

  const fetchRestaurantCategories = async () => {
    try {
      const { data } = await restaurantCategoryService.get(`pageSize=2000`);
      dispatch(setRestaurantCategories(data.results));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDetail = async (id: string) => {
    try {
      setLoading(true);
      const { data } = await restaurantService.getDetail(id);
      const restaurant = data.results[0];
      dispatch(setCurrentRestaurant(restaurant));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async ({ bannerImage, ...restaurant }: RestaurantType) => {
    try {
      setLoading(true);
      const res = currentRestaurant
        ? await restaurantService.update(restaurant)
        : await restaurantService.create(restaurant);
      if (bannerImage && typeof bannerImage !== 'string') {
        const file = new FormData();
        file.append('file', (bannerImage as UploadFile).originFileObj);
        await restaurantService.uploadBanner(res.data.id, file);
      }
      navigate(PATHS.RestaurantManagement);

      notification.success({
        message: buildMessage({
          isCreate: !currentRestaurant,
          name: res.data.name,
        }),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-restaurant">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Restaurant" key="1" className="p-2">
          <EditRestaurant loading={loading} onSubmit={onSubmit} />
        </TabPane>
        {!isCreate && (
          <>
            <TabPane tab="Products" key="2" className="p-2">
              <RestaurantProduct />
            </TabPane>
            <TabPane tab="Addons" key="3" className="p-2">
              <RestaurantAddon />
            </TabPane>
            <TabPane tab="Orders" key="4" className="p-2">
              <Tabs defaultActiveKey="4-1">
                <TabPane tab="Open Orders" key="4-1">
                  <ListRestaurantOrders activeTab="open-orders" />
                </TabPane>
                <TabPane tab="Completed Orders" key="4-2">
                  <ListRestaurantOrders activeTab="completed-orders" />
                </TabPane>
              </Tabs>
            </TabPane>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default RestaurantDetail;
