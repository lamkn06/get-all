import foodRateService from 'api/foodRate.api';
import userService from 'api/user.api';
import { EditFoodRate } from 'containers/foodRate/edit';
import { ListFoodRate } from 'containers/foodRate/list';
import { serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FoodRateType } from 'types/foodRate';
import { useInjectReducer } from 'utils/redux-injectors';
import reducer, { setTable } from './redux/slice';

const FoodRateManagement = () => {
  useInjectReducer({ key: 'foodRateManagement', reducer });

  const dispatch = useDispatch();

  const { table } = useAppSelector(state => state.foodRateManagement);

  const params = serializeQuery(table);
  const [loading, setLoading] = useState(false);

  const [rates, setRates] = useState<FoodRateType[]>([]);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      dispatch(setTable({ ...table, filter: undefined }));
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [table.pageIndex, table.filter]);

  useEffect(() => {
    if (ids.length === 0) {
      return;
    }

    ids.forEach(id => {
      fetchUser(id);
    });
  }, [ids]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await foodRateService.getList(params);
      const { data } = res;
      setRates(data.results);
      dispatch(setTable({ ...table, total: data.totalRecords }));
      const ids = [...new Set(data.results.map(item => item.createdByUserId))];

      setIds(ids);
      // eslint-disable-next-line no-empty
    } catch (error) {
      // eslint-disable-next-line no-empty
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchUser = useCallback(
    async (id: string) => {
      try {
        const { data } = await userService.findByUserId(id);
        setRates(
          rates.map(rate => {
            if (rate.createdByUserId === id) {
              rate.user = data;
            }
            return rate;
          }),
        );
        // eslint-disable-next-line no-empty
      } catch (error) {
        // eslint-disable-next-line no-empty
      } finally {
      }
    },
    [params, rates],
  );

  return (
    <div>
      <ListFoodRate loading={loading} rates={rates} onSuccess={fetchData} />
      <EditFoodRate onSuccess={fetchData} />
    </div>
  );
};

export default FoodRateManagement;
