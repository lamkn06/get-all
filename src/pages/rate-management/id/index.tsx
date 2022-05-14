/* eslint-disable no-useless-catch */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-empty */
import { message } from 'antd';
import Text from 'antd/lib/typography/Text';
import customerService from 'api/customer.api';
import rateService from 'api/rate.api';
import { showConfirm } from 'components/ultil';
import { EditRate } from 'containers/rate/edit';
import RateDetail from 'containers/rate/id';
import { serializeQuery } from 'helpers';
import { joinCustomerName } from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useInjectReducer } from 'redux-injectors';
import { CustomerType } from 'types';
import { RateCustomerType, RateType } from 'types/rate';
import reducer, { setAppliedCustomers } from './redux/slice';

const RateDetailManagement: React.FC = () => {
  useInjectReducer({ key: 'rateDetailManagement', reducer });

  const dispatch = useDispatch();
  const { appliedCustomers } = useAppSelector(
    state => state.rateDetailManagement,
  );

  const [loading, setLoading] = useState(false);

  const [rate, setRate] = useState<RateType>(undefined);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchDetail(id);
      fetchAppliedCustomers();
    }
  }, [id]);

  const fetchDetail = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await rateService.getDetail(id);
      setRate(data.results[0]);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedCustomers = async () => {
    try {
      const { data } = await rateService.getCustomers(id);
      if (data?.length) {
        const res = await fetchCustomerDetail(data);
        dispatch(setAppliedCustomers(res.data));
      } else {
        dispatch(setAppliedCustomers([]));
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchCustomerDetail = async (list: RateCustomerType[]) => {
    const listIDs = list.map(item => item.customerId);
    const params = {
      ids: listIDs,
      attributes: 'id,firstName,lastName,phoneNumber',
    };
    return await customerService.findByListIds(serializeQuery(params));
  };

  const handleApply = async (ids: number[]) => {
    if (isEmpty(ids)) {
      message.error('Please select a customer.');
      return;
    }
    try {
      setLoading(true);
      const { data } = await rateService.updateCustomers(id, ids);
      const customers = await fetchCustomerDetail(data);
      dispatch(setAppliedCustomers(customers.data));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (customer: CustomerType) => {
    showConfirm({
      title: (
        <>
          Are you sure you want to remove{' '}
          <Text type="danger">{joinCustomerName(customer)} </Text>?
        </>
      ),
      onOk() {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
          try {
            await rateService.deleteCustomers(id, [customer.id]);
            dispatch(
              setAppliedCustomers(
                appliedCustomers.filter(item => item.id !== customer.id),
              ),
            );
            resolve('');
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  };

  return (
    <div>
      <RateDetail
        loading={loading}
        rate={rate}
        onApply={handleApply}
        onRemove={handleRemove}
      />
      <EditRate onSuccess={fetchDetail} />
    </div>
  );
};

export default RateDetailManagement;
