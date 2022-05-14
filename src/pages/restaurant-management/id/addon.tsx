/* eslint-disable no-empty */
/* eslint-disable no-console */
import addonService from 'api/addon.api';
import { EditAddon } from 'containers/addon/edit';
import { ListAddon } from 'containers/addon/list';
import { serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { setTable } from 'pages/restaurant-management/redux/addon';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { AddonType } from 'types/addon';

const RestaurantAddon = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { table: pagination } = useAppSelector(state => state.addonManagement);

  const [loading, setLoading] = useState(false);
  const params = serializeQuery({
    ...pagination,
    restaurantId: id,
  });
  const [addons, setAddons] = useState<AddonType[]>([]);

  useEffect(() => {
    fetchAddons();
  }, [pagination.pageIndex, pagination.filter]);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const { data } = await addonService.get(params);
      setAddons(data.results);
      dispatch(setTable({ ...pagination, total: data.totalRecords }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListAddon addons={addons} loading={loading} onSuccess={fetchAddons} />
      <EditAddon onSuccess={fetchAddons} restaurantId={id} />
    </>
  );
};

export default RestaurantAddon;
