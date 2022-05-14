/* eslint-disable no-useless-catch */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-console */
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message, Modal, notification, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import voucherService from 'api/voucher.api';
import { showConfirm } from 'components/ultil';
import { EditVoucher } from 'containers/voucher/edit';
import { ListVouchers } from 'containers/voucher/list';
import { buildMessage, serializeQuery } from 'helpers';
import { joinCustomerName } from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import { isEmpty } from 'lodash';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CustomerType, VoucherType } from 'types';
import { useInjectReducer } from 'utils/redux-injectors';
import reducer, {
  setPagination,
  setVisible,
  setCurrentVoucher,
} from './redux/slice';

const { confirm } = Modal;

const VoucherManagement = () => {
  useInjectReducer({ key: 'voucherManagement', reducer });
  const [vouchers, setVouchers] = useState<VoucherType[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { tablePagination, currentVoucher } = useAppSelector(
    state => state.voucherManagement,
  );

  const params = serializeQuery(tablePagination);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchVouchers();
  }, [tablePagination.pageIndex, tablePagination.filter]);

  useEffect(() => {
    return () => {
      dispatch(setPagination({ ...tablePagination, filter: undefined }));
    };
  }, []);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await voucherService.get(params);
      setVouchers(data.results);
      dispatch(setPagination({ ...tablePagination, total: data.totalRecords }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handleDelete = (voucher: VoucherType) => {
    confirm({
      title: 'Are you sure you want to delete this voucher?',
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
        return new Promise(async (resolve, reject) => {
          try {
            await voucherService.delete(voucher.id);
            dispatch(setVisible(false));
            notification.success({
              message: `Delete ${voucher.code} successful!`,
            });
            resolve('');
            fetchVouchers();
          } catch (error) {
            reject(error);
          }
        });
      },
    });
  };

  const handleSubmit = async (voucher: VoucherType) => {
    try {
      setLoading(true);
      if (voucher.id) {
        await voucherService.update(voucher);
      } else {
        await voucherService.create(voucher);
      }
      notification.success({
        message: buildMessage({
          isCreate: !voucher.id,
          name: voucher.code,
        }),
      });

      dispatch(setVisible(false));
      fetchVouchers();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (customer: CustomerType) => {
    if (isEmpty(customer)) {
      message.error('Please select a customer.');
      return;
    }
    try {
      setUpdating(true);
      const { data } = await voucherService.update({
        ...currentVoucher,
        customerIds: (currentVoucher.customerIds || []).concat(customer.id),
      });

      dispatch(
        setCurrentVoucher({
          ...currentVoucher,
          customerIds: data.customerIds,
          customers: [...(currentVoucher.customers || []), { ...customer }],
        }),
      );

      setVouchers(oldValue =>
        oldValue.map(item => ({
          ...item,
          customerIds:
            item.id === data.id ? data.customerIds : item.customerIds,
        })),
      );
    } catch (error) {
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (customerIds: number[]) => {
    try {
      setUpdating(true);
      const { data } = await voucherService.update({
        ...currentVoucher,
        customerIds: currentVoucher.customerIds.filter(
          item => !customerIds.includes(item),
        ),
      });
      dispatch(
        setCurrentVoucher({
          ...currentVoucher,
          customerIds: data.customerIds,
          customers: currentVoucher.customers.filter(
            item => !customerIds.includes(item.id),
          ),
        }),
      );
      setVouchers(oldValue =>
        oldValue.map(item => ({
          ...item,
          customerIds:
            item.id === data.id ? data.customerIds : item.customerIds,
        })),
      );
    } catch (error) {
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Fragment>
      <ListVouchers
        loading={loading}
        vouchers={vouchers}
        onDelete={handleDelete}
      />
      <EditVoucher
        loading={updating}
        onSubmit={handleSubmit}
        onApply={handleApply}
        onRemove={handleRemove}
      />
    </Fragment>
  );
};

export default VoucherManagement;
