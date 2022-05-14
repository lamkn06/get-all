/* eslint-disable no-empty */
import { notification } from 'antd';
import driverService from 'api/driver.api';
import { EditDriver } from 'containers/drivers/edit';
import { ListDrivers } from 'containers/drivers/list';
import { downloadCSVFile, serializeQuery } from 'helpers';
import { useAppSelector } from 'hooks/app-hooks';
import { setTableAll } from 'pages/driver-management/redux/slice';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DriverType } from 'types';

const ListDriver = () => {
  const dispatch = useDispatch();

  const { tableAll } = useAppSelector(state => state.driverManagement);
  const params = serializeQuery(tableAll);
  const [loading, setLoading] = useState(false);

  const [drivers, setDrivers] = useState<DriverType[]>([]);

  useEffect(() => {
    fetchData();
  }, [tableAll.pageIndex, tableAll.filter]);

  useEffect(() => {
    return () => {
      dispatch(setTableAll({ ...tableAll, filter: undefined }));
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await driverService.getList(params);
      const { data } = res;
      setDrivers(
        data.results.map(item => ({ ...item, ...item.driverProfile })),
      );
      dispatch(setTableAll({ ...tableAll, total: data.totalRecords }));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handleApprove = useCallback(async (driver: DriverType) => {
    try {
      const { data: newDriver } = await driverService.approve(driver);
      notification.success({
        message: `Approve successful!`,
      });
      setDrivers(oldData =>
        oldData.map(item =>
          item.driverId === newDriver.driverId ? newDriver : item,
        ),
      );
    } catch (error) {}
  }, []);

  const handleReject = useCallback(
    async (driverId: string, reasons: string[]) => {
      try {
        const { data: newDriver } = await driverService.reject(
          driverId,
          reasons,
        );
        notification.success({
          message: `Reject successful!`,
        });
        setDrivers(oldData =>
          oldData.map(item =>
            item.driverId === newDriver.driverId ? newDriver : item,
          ),
        );
      } catch (error) {}
    },
    [],
  );

  const handlePending = useCallback(
    async (driverId: string, message: string) => {
      try {
        const { data: newDriver } = await driverService.pending(
          driverId,
          message,
        );
        notification.success({
          message: `Pending successful!`,
        });
        setDrivers(oldData =>
          oldData.map(item =>
            item.driverId === newDriver.driverId ? newDriver : item,
          ),
        );
        // eslint-disable-next-line no-empty
      } catch (error) {}
    },
    [],
  );

  const onExport = useCallback(async () => {
    const { data } = await driverService.getList(
      serializeQuery({
        ...tableAll,
        exportFile: 1,
        pageSize: undefined,
        pageIndex: undefined,
      }),
    );
    downloadCSVFile(data as unknown as Blob);
  }, [tableAll]);

  return (
    <div>
      <ListDrivers
        drivers={drivers}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
        onPending={handlePending}
        onExport={onExport}
      />
      <EditDriver onSuccess={fetchData} />
    </div>
  );
};

export default ListDriver;
