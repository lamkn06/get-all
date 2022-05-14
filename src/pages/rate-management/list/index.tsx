import rateService from 'api/rate.api';
import userService from 'api/user.api';
import { AddRate } from 'containers/rate/add';
import { ListRate } from 'containers/rate/list';
import { serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RateType } from 'types/rate';
import { useInjectReducer } from 'utils/redux-injectors';
import reducer, { setTable } from './redux/slice';

const RateManagement = () => {
  useInjectReducer({ key: 'rateManagement', reducer });

  const dispatch = useDispatch();

  const { table } = useAppSelector(state => state.rateManagement);

  const params = serializeQuery(table);
  const [loading, setLoading] = useState(false);

  const [rates, setRates] = useState<RateType[]>([]);
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
      const res = await rateService.getList(params);
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

  const handleOnSuccess = () => {
    fetchData();
  };

  return (
    <div>
      <ListRate loading={loading} rates={rates} />
      <AddRate onSuccess={handleOnSuccess} />
    </div>
  );
};

export default RateManagement;
