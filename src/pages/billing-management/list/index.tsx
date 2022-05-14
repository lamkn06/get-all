import billingService from 'api/billing.api';
import { ListBilling } from 'containers/billing/list';
import { EditBilling } from 'containers/billing/edit';
import { serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BillingType } from 'types';
import { useInjectReducer } from 'utils/redux-injectors';
import reducer, { setTable } from './redux/slice';

const RateManagement = () => {
  useInjectReducer({ key: 'billingManagement', reducer });

  const dispatch = useDispatch();

  const { table } = useAppSelector(state => state.billingManagement);

  const params = serializeQuery(table);
  const [loading, setLoading] = useState(false);

  const [billings, setBillings] = useState<BillingType[]>([]);

  useEffect(() => {
    fetchData();
  }, [table.pageIndex, table.filter]);

  useEffect(() => {
    return () => {
      dispatch(setTable({ ...table, filter: undefined }));
    };
  }, []);

  // useEffect(() => {
  //   if (ids.length === 0) {
  //     return;
  //   }

  //   ids.forEach(id => {
  //     fetchUser(id);
  //   });
  // }, [ids]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await billingService.getList(params);
      const { data } = res;
      setBillings(data.results);
      dispatch(setTable({ ...table, total: data.totalRecords }));
      // const ids = [...new Set(data.results.map(item => item.createdByUserId))];

      // setIds(ids);
      // eslint-disable-next-line no-empty
    } catch (error) {
      // eslint-disable-next-line no-empty
    } finally {
      setLoading(false);
    }
  }, [params]);

  // const fetchUser = useCallback(
  //   async (id: string) => {
  //     try {
  //       const { data } = await userService.findByUserId(id);
  //       setRates(
  //         rates.map(rate => {
  //           if (rate.createdByUserId === id) {
  //             rate.user = data;
  //           }
  //           return rate;
  //         }),
  //       );
  //       // eslint-disable-next-line no-empty
  //     } catch (error) {
  //       // eslint-disable-next-line no-empty
  //     } finally {
  //     }
  //   },
  //   [params, rates],
  // );

  return (
    <div>
      <ListBilling
        loading={loading}
        billings={billings}
        onSuccess={fetchData}
      />
      <EditBilling onSuccess={fetchData} />
    </div>
  );
};

export default RateManagement;
