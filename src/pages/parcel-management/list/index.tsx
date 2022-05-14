/* eslint-disable no-empty */
import { Tabs } from 'antd';
import deliveryService from 'api/delivery.api';
import { PATHS } from 'constants/paths';
import { ListParcel } from 'containers/parcel/list';
import { serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ParcelType, TableBaseType } from 'types';
import { useInjectReducer } from 'utils/redux-injectors';
import reducer, {
  setActiveTab,
  setCurrentParcel,
  setPagingCompletedOrders,
  setPagingOpenOrders,
  setParcelList,
  TabsType,
} from './redux/slice';

const { TabPane } = Tabs;

const ParcelDetailPath = PATHS.ParcelDetail.replace(/\/:id/g, '');

const ParcelManagement = () => {
  useInjectReducer({ key: 'parcelManagement', reducer });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeTab, listParcels, openOrders, completedOrders } =
    useAppSelector(state => state.parcelManagement);
  const [loading, setLoading] = useState(false);

  const getParams = useMemo(() => {
    switch (activeTab) {
      case 'open-orders':
        return openOrders;
      case 'completed-orders':
        return completedOrders;
      default:
        break;
    }
  }, [activeTab]);

  const onChangeTab = (activeKey: TabsType) => {
    dispatch(setActiveTab(activeKey));
  };

  useEffect(() => {
    if (activeTab) {
      const initParams = getParams;
      fetchData(initParams);
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      dispatch(
        setPagingOpenOrders({
          ...openOrders,
          filter: { ...openOrders.filter, keyword: undefined },
        }),
      );
      dispatch(
        setPagingCompletedOrders({
          ...completedOrders,
          filter: { ...completedOrders.filter, keyword: undefined },
        }),
      );
    };
  }, []);

  const fetchData = useCallback(
    async ({ total: _, ...params }: TableBaseType) => {
      const _params = serializeQuery(params);
      try {
        setLoading(true);
        const { data } = await deliveryService.getList(_params);

        dispatch(setParcelList(data.results));
        const newParams = { ...params, total: data.totalRecords };
        switch (activeTab) {
          case 'open-orders':
            dispatch(setPagingOpenOrders(newParams));
            break;
          case 'completed-orders':
            dispatch(setPagingCompletedOrders(newParams));
            break;
          default:
            break;
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    },
    [activeTab],
  );

  const goToParcelDetail = (parcel: ParcelType) => {
    dispatch(setCurrentParcel(parcel));
    navigate(`${ParcelDetailPath}/${parcel.deliveryId}`);
  };

  return (
    <div className="parcel-management">
      <Tabs activeKey={activeTab} onChange={onChangeTab}>
        <TabPane tab="Open Orders" key="open-orders">
          <ListParcel
            data={listParcels}
            loading={loading}
            pagination={openOrders}
            onChange={fetchData}
            onRowClick={goToParcelDetail}
            type="open-orders"
          />
        </TabPane>
        <TabPane tab="Completed Orders" key="completed-orders">
          <ListParcel
            data={listParcels}
            loading={loading}
            pagination={completedOrders}
            onChange={fetchData}
            onRowClick={goToParcelDetail}
            type="completed-orders"
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ParcelManagement;
