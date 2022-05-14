/* eslint-disable no-console */
/* eslint-disable no-empty */
import { ClockCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import deliveryService from 'api/delivery.api';
import driverService from 'api/driver.api';
import { PhoneNumber } from 'components/phone-number';
import { TableNoData } from 'components/table-no-data';
import { PhoneNumberPrefix } from 'constants/index';
import { PATHS } from 'constants/paths';
import { formatDateTime, removeSnakeCase, serializeQuery } from 'helpers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { DriverType, ParcelType, TableBaseType } from 'types';
import { DriverProfile } from 'types/driver';
import { Stop } from 'types/parcel';
import { useDebouncedCallback } from 'use-debounce';
import { phoneValidator } from 'validators';

const { Option } = Select;
const { Text } = Typography;

export const DropOffLocation: React.FC<Partial<ParcelType>> = ({
  stops = [],
  status,
  deliveryProgress,
  deliveryStatusHistories,
}) => {
  const getStatusTitle = useCallback(
    (stop: Stop): '' | 'on going' | 'delivered' | 'canceled' => {
      if (status === 'pending' || status === 'assigned') return '';
      if (status === 'for_pickup' || status === 'picked_up') {
        return 'on going';
      }
      if (status === 'delivered') {
        return 'delivered';
      }
      if (!deliveryProgress) {
        if (status === 'canceled') {
          return 'canceled';
        }
        return '';
      }
      if (
        stop.sequenceNo > deliveryProgress.sequenceNo ||
        (stop.sequenceNo === deliveryProgress.sequenceNo &&
          deliveryProgress.action === 'ARRIVED')
      ) {
        return status === 'canceled' ? 'canceled' : 'on going';
      }
      return 'delivered';
    },
    [deliveryProgress, status],
  );

  const showPOD = ['on_going', 'delivered', 'canceled'].includes(status);

  const hasPOD = (stop: Stop) => {
    return (
      showPOD && (stop.proofImage || stop.skipReason || stop.skipOtherReason)
    );
  };

  const renderJourney = useCallback(
    (stop: Stop) => {
      if (
        !deliveryStatusHistories ||
        !getStatusTitle(stop) ||
        !deliveryStatusHistories.some(
          item => item.driver || item.user || item.customer,
        )
      )
        return null;

      const history = deliveryStatusHistories.find(
        item => item.status === getStatusTitle(stop),
      );

      return (
        history &&
        (stop.deliveredAt || history.deliveredAt) && (
          <div className="parcel-detail__journey mb-1">
            <p>
              <Text strong>
                {history.createdByObjectType === 'driver'
                  ? `${history.driver.driverProfile.firstName}, ${history.driver.driverProfile.lastName}`
                  : history.createdByObjectType === 'user'
                  ? `${history.user.firstName}, ${history.user.lastName}`
                  : `${history.customer.firstName}, ${history.customer.lastName}`}
              </Text>
              , at{' '}
              <Text strong>
                {formatDateTime(stop.deliveredAt || history.deliveredAt)}
              </Text>
            </p>
          </div>
        )
      );
    },
    [deliveryStatusHistories, deliveryProgress, status],
  );

  return (
    <>
      {stops.map((stop, idx) => (
        <div key={idx}>
          <Row key={idx} className="row-info" gutter={16}>
            <Col
              md={{ span: !getStatusTitle(stop) ? 8 : 5 }}
              sm={{ span: 12 }}
              xs={{ span: 24 }}
            >
              <Text strong>Address</Text>
              <p>{stop?.locationAddress || <TableNoData />}</p>
              <Text type="secondary">
                ● {stop?.location?.address || <TableNoData />}
              </Text>
            </Col>
            <Col md={{ span: 5 }} sm={{ span: 12 }} xs={{ span: 24 }}>
              <Text strong>Contact Person</Text>
              <p>{stop.contactName || <TableNoData />}</p>
            </Col>
            <Col md={{ span: 5 }} sm={{ span: 12 }} xs={{ span: 24 }}>
              <Text strong>Contact Number</Text>
              <p>{stop.contactPhone || <TableNoData />}</p>
            </Col>
            <Col md={{ span: 4 }} sm={{ span: 12 }} xs={{ span: 24 }}>
              <Text strong>Item Category</Text>
              <p className="text-capitalize">
                {stop.itemCategory || <TableNoData />}
              </p>
            </Col>

            {!!getStatusTitle(stop) && (
              <Col md={{ span: 5 }} sm={{ span: 12 }} xs={{ span: 24 }}>
                <Text strong>
                  Package {idx + 1} status {` `}
                </Text>
                <br />
                <Text
                  className="text-capitalize"
                  strong
                  type={
                    getStatusTitle(stop) === 'canceled' ? 'danger' : 'success'
                  }
                >
                  {getStatusTitle(stop)}
                </Text>
              </Col>
            )}

            {showPOD && (
              <Col span={24}>
                <Card size="small" className="stop-card mt-1">
                  <Space direction="vertical" size={0}>
                    <Text strong>Proof of Delivery:</Text>
                    {hasPOD(stop) ? (
                      <>
                        {stop.proofImage && (
                          <Typography.Link
                            target="_blank"
                            href={stop.proofImage}
                          >
                            {stop.proofImage}
                          </Typography.Link>
                        )}
                        {(stop.skipReason || '').toLocaleLowerCase() ===
                        'other' ? (
                          <Text className="text-capitalize">
                            {stop.skipOtherReason}
                          </Text>
                        ) : (
                          stop.skipReason && (
                            <Text className="text-capitalize">
                              {removeSnakeCase(stop.skipReason)}
                            </Text>
                          )
                        )}
                      </>
                    ) : (
                      <TableNoData />
                    )}
                  </Space>
                </Card>
              </Col>
            )}
          </Row>
          <Row className="row-info" justify="end">
            <Space direction="vertical" size={0}>
              {renderJourney(stop)}
            </Space>
          </Row>
          {stops.length > 1 && idx < stops.length - 1 && (
            <Divider className="my-1" />
          )}
        </div>
      ))}
    </>
  );
};

export const ReassignForm: React.FC<{
  onClose: () => void;
  onSuccess?: () => void;
  vehicleType?: string;
  deliveryId: string;
  type: 'assign' | 'reassign';
}> = ({ vehicleType, deliveryId, type, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isUse3rd, setIsUse3rd] = useState(false);
  const [drivers, setDrivers] = useState<Array<DriverType>>([]);
  const [params, setParams] = useState<TableBaseType>({
    pageIndex: 1,
    pageSize: 10,
    filter: {
      vehicleType,
      approvalStatus: 'approved',
      status: 'active',
    },
  });

  const hasMoreRef = useRef(true);

  useEffect(() => {
    form.resetFields();
  }, [deliveryId]);

  useEffect(() => {
    hasMoreRef.current = true;
    fetchDrivers();
  }, [params]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await driverService.getList(serializeQuery(params));
      const {
        data: { results },
      } = res;
      if (params.pageIndex === 1) {
        setDrivers(results);
      } else {
        setDrivers([...drivers, ...results]);
      }
      if (results.length < params.pageSize) {
        hasMoreRef.current = false;
      }
      setLoading(false);
    } catch (error) {}
  };

  const onFinish = useCallback(
    async formValues => {
      const ParcelDetailPath = PATHS.ParcelDetail.replace(/\/:id/g, '');
      try {
        setLoading(true);
        const { driverId, reason, contactName, contactNumber } = formValues;
        const body = {
          driverId,
          reason,
          deliveryId,
          contactName,
          contactNumber: `${PhoneNumberPrefix}${contactNumber}`,
        };

        if (type === 'reassign') {
          const { data } = await deliveryService.reAssign(body);
          navigate(`${ParcelDetailPath}/${data.deliveryId}`);
        } else {
          await deliveryService.assign(body);
          onSuccess();
        }
        setLoading(false);
        fetchDrivers();
        onClose();
      } catch (error) {
        console.error(error);
      }
    },
    [deliveryId],
  );

  const handleScroll = async ({
    currentTarget,
  }: React.UIEvent<HTMLDivElement>) => {
    if (!hasMoreRef.current) return;
    const isEndOfList =
      currentTarget.scrollHeight -
        (currentTarget.clientHeight + currentTarget.scrollTop) <=
      2;

    if (isEndOfList) {
      setParams({
        ...params,
        pageIndex: params.pageIndex + 1,
      });
    }
  };

  const handleSearch = useDebouncedCallback((keyword: string) => {
    let _keyword = '';
    if (keyword) {
      _keyword = keyword;
    }
    setParams({
      ...params,
      pageIndex: 1,
      filter: {
        ...params.filter,
        keyword: _keyword,
      },
    });
  }, 500);

  const onChange3rdProvider = (checked: boolean) => setIsUse3rd(checked);

  const joinDriverName = useCallback(
    (driverProfile: DriverProfile) =>
      `${driverProfile.lastName}, ${driverProfile.firstName || ''} ${
        driverProfile.middleName || ''
      }`.trimRight(),
    [],
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      requiredMark="optional"
    >
      <Form.Item className="mb-1">
        <Checkbox
          className="parcel-detail__3rd-provider"
          onChange={ev => onChange3rdProvider(ev.target.checked)}
        >
          Use 3rd Provider Driver
        </Checkbox>
      </Form.Item>

      {!isUse3rd && (
        <Form.Item
          label={
            type === 'reassign'
              ? 'Select a driver to re-assign'
              : 'Select a driver to assign'
          }
          name="driverId"
          rules={[{ required: true, message: 'Driver is required' }]}
          className="mb-1"
        >
          <Select
            showSearch
            optionLabelProp="label"
            loading={loading}
            filterOption={false}
            onPopupScroll={handleScroll}
            onSearch={handleSearch}
            autoClearSearchValue={false}
            allowClear={false}
            onClear={null}
            placeholder="Choose a driver"
          >
            {drivers.map(item => (
              <Option
                value={item.driverId}
                key={item.driverId}
                label={joinDriverName(item.driverProfile)}
              >
                <Text strong>{joinDriverName(item.driverProfile)}</Text>
                <div>
                  <Text className="mr-2">{item.phoneNumber}</Text>
                  <Tag
                    color={
                      item.isBusy
                        ? 'warning'
                        : item.driverStatus === 'active'
                        ? 'success'
                        : 'error'
                    }
                    className="text-capitalize"
                    icon={item.isBusy ? <ClockCircleOutlined /> : undefined}
                  >
                    {item.isBusy ? 'Is Busy' : item.driverStatus}
                  </Tag>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}

      {isUse3rd && (
        <>
          <Form.Item
            className="mb-1"
            label="Driver Contact Name"
            name="contactName"
          >
            <Input placeholder="Driver Contact Name" />
          </Form.Item>
          <Form.Item
            className="mb-1"
            label="Driver Contact Number"
            name="contactNumber"
            rules={[
              {
                validator: (_, values: string) => phoneValidator(values, false),
                validateTrigger: 'onSubmit',
              },
            ]}
          >
            <PhoneNumber placeholder="Driver Contact Number" maxLength={10} />
          </Form.Item>
        </>
      )}

      {type === 'reassign' && (
        <Form.Item
          label="Re-assign reason"
          name="reason"
          rules={[{ required: true, message: 'Reason is required' }]}
        >
          <Input placeholder="Re-assign reason" />
        </Form.Item>
      )}

      <Row justify="end">
        <Button onClick={onClose} className="mr-2" loading={loading}>
          Cancel
        </Button>
        <Button htmlType="submit" type="primary" loading={loading}>
          {type === 'reassign' ? 'ReAssign' : 'Assign'}
        </Button>
      </Row>
    </Form>
  );
};
