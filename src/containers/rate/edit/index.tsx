/* eslint-disable no-empty */
import {
  Button,
  Col,
  Divider,
  Form,
  Popconfirm,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import rateService from 'api/rate.api';
import { Drawer } from 'components/drawer';
import { NumberInput } from 'components/number-input';
import { DiscountTypes, PRICE_UNIT } from 'constants/index';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import { setEditing, setVisible } from 'pages/rate-management/id/redux/slice';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RateFareType } from 'types/rate';
import { validateMessages } from 'validators';
import './index.scss';

interface Props {
  onSuccess?: (rateId: string) => void;
}

export const EditRate: React.FC<Props> = ({ onSuccess }) => {
  const { canEdit } = usePermissions({
    module: 'manage_rate_cards',
  });

  const [form] = Form.useForm();
  const [isPercentage, setIsPercentage] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { visible, isEditing, rateFare } = useAppSelector(
    state => state.rateDetailManagement,
  );

  useEffect(() => {
    if (rateFare && visible) {
      const isPercentage = rateFare.discountType === 'percentage';
      const helperFee = rateFare.helperFee;
      const getAllShare = rateFare.commission * 100;
      form.setFieldsValue({
        ...rateFare,
        getAllShare: getAllShare,
        driverShare: parseFloat(`${100 - getAllShare}`).toFixed(1),
        discount: isPercentage ? rateFare.discount * 100 : rateFare.discount,
        helperFee: helperFee && {
          perStop: helperFee.perStop ?? 90,
          min: helperFee.min ?? 180,
          max: helperFee.max ?? 400,
        },
      });
      setIsPercentage(isPercentage);
    }
  }, [rateFare, visible]);

  const handleClose = () => {
    dispatch(setEditing(false));
    dispatch(setVisible(false));
  };

  const handleEdit = () => dispatch(setEditing(true));

  const handleOnValueChange = (formData: FormData) => {
    const key = Object.keys(formData)[0];
    if (key === 'discountType') {
      setIsPercentage(formData[key] === 'percentage');
    }
    if (key && key === 'getAllShare') {
      form.setFieldsValue({
        driverShare:
          !formData[key] || formData[key] > 100
            ? 0
            : parseFloat(`${100 - formData[key]}`).toFixed(1),
      });
    }

    if (key && key === 'driverShare') {
      form.setFieldsValue({
        getAllShare:
          !formData[key] || formData[key] > 100
            ? 0
            : parseFloat(`${100 - formData[key]}`).toFixed(1),
      });
    }
  };

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const formValues = await form.validateFields();
      const driverFormValue = {
        ...rateFare,
        ...formValues,
        commission: formValues.getAllShare / 100,
        discount: isPercentage
          ? formValues.discount / 100
          : formValues.discount,
      } as RateFareType;
      await rateService.updateFare(driverFormValue);
      handleClose();
      onSuccess(rateFare.rateId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [rateFare]);

  const readOnly = !isEditing;

  const HalfColumn = useMemo(() => {
    return { md: { span: 12 }, sm: { span: 12 }, xs: { span: 12 } };
  }, []);

  const emptyValidator = useMemo(() => {
    return {
      validator: (_: any, values: string) => {
        if (values === '')
          return Promise.reject(
            'This service will not available to the customer',
          );
        return Promise.resolve();
      },
      warningOnly: true,
      validateTrigger: 'onChange',
    };
  }, []);

  return (
    <Drawer
      className="rate-edit"
      title={'View Rate'}
      width={460}
      visible={visible}
      onClose={handleClose}
      footer={
        <Space size={16}>
          {isEditing && (
            <Popconfirm
              title="Discard changes made in the rate information?"
              cancelText="Cancel"
              okText="Discard"
              onConfirm={handleClose}
            >
              <Button className="float-right" type="ghost">
                Cancel
              </Button>
            </Popconfirm>
          )}

          {isEditing ? (
            <Button onClick={handleSubmit} type="primary" loading={loading}>
              Update
            </Button>
          ) : (
            canEdit && (
              <Button onClick={handleEdit} loading={loading}>
                Edit
              </Button>
            )
          )}
        </Space>
      }
    >
      <Form
        form={form}
        scrollToFirstError
        validateMessages={validateMessages}
        layout="vertical"
        onValuesChange={handleOnValueChange}
      >
        <Typography.Title level={5}>
          Vehicle Type {rateFare?.vehicleType}
        </Typography.Title>

        <Typography.Title level={5}>Basic Fare</Typography.Title>

        <Row gutter={16}>
          <Col {...HalfColumn}>
            <Form.Item
              name="baseFee"
              label="Base Rate"
              rules={[{ required: true }]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="Base Rate "
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
          <Col {...HalfColumn}>
            <Form.Item
              name="standardPricePerKM"
              label="Price Per KM"
              rules={[{ required: true }]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="Price Per KM"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
          <Col {...HalfColumn}>
            <Form.Item
              name="getAllShare"
              label="GetAll Share"
              rules={[
                { required: true },
                {
                  validator: (_, values: string) => {
                    if (Number(values) < 0 || Number(values) > 100) {
                      return Promise.reject(
                        'GetAll Share must be between 0 & Driver',
                      );
                    }
                    return Promise.resolve();
                  },
                  validateTrigger: 'onSubmit',
                },
              ]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="GetAll Share"
                addonBefore="%"
              />
            </Form.Item>
          </Col>

          <Col {...HalfColumn}>
            <Form.Item
              name="driverShare"
              label="Driver Share"
              rules={[
                { required: true },
                {
                  validator: (_, values: string) => {
                    if (Number(values) < 0 || Number(values) > 100) {
                      return Promise.reject(
                        'Driver Share must be between 0 & 100',
                      );
                    }
                    return Promise.resolve();
                  },
                  validateTrigger: 'onSubmit',
                },
              ]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="Driver Share"
                addonBefore="%"
              />
            </Form.Item>
          </Col>
        </Row>

        <Typography.Title level={5}>Add On Rates</Typography.Title>

        <Row gutter={16}>
          <Col {...HalfColumn}>
            <Form.Item
              name="insulatedBox"
              label="Insulated Box"
              rules={[emptyValidator]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="Insulated Box"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
          <Col {...HalfColumn}>
            <Form.Item
              name="premiumServiceFee"
              label="Premium Service"
              rules={[emptyValidator]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="Price Per KM"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
          <Col {...HalfColumn}>
            <Form.Item
              name="cashHandlingFee"
              label="Cash Handling"
              className="cash"
              rules={[emptyValidator]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="Cash Handling"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
          <Col {...HalfColumn}>
            <Form.Item name="additionalStopFee" label="Additional Stop">
              <NumberInput
                disabled={readOnly}
                placeholder="Additional Stop"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col {...HalfColumn}>
            <Form.Item name="remittanceFee" label="Remittance Fee">
              <NumberInput
                disabled={readOnly}
                placeholder="Remittance Fee"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
          <Col {...HalfColumn}>
            <Form.Item
              name="queueingFee"
              label="Queueing Fee"
              rules={[emptyValidator]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="Queueing Fee"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
          <Col {...HalfColumn}>
            <Form.Item
              name="overweightHandlingFee"
              label="Overweight Handling Fee"
              rules={[emptyValidator]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="Overweight Handling Fee"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
          <Col {...HalfColumn}>
            <Form.Item
              name="purchaseServiceFee"
              label="Purchase Service Fee"
              rules={[emptyValidator]}
            >
              <NumberInput
                disabled={readOnly}
                placeholder="Purchase Service Fee"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col {...HalfColumn}>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.discountType !== currentValues.discountType
              }
            >
              {() => (
                <Form.Item
                  name="discount"
                  label="Discount"
                  rules={[
                    isPercentage && {
                      validator: (_, value: string) => {
                        if (Number(value) < 0 || Number(value) > 100) {
                          return Promise.reject(
                            'Discount must be between 0 & 100',
                          );
                        }
                        return Promise.resolve();
                      },
                      validateTrigger: 'onChange',
                    },
                  ]}
                >
                  <NumberInput
                    disabled={readOnly}
                    placeholder="Discount"
                    addonBefore={isPercentage ? '%' : PRICE_UNIT}
                  />
                </Form.Item>
              )}
            </Form.Item>
          </Col>

          <Col {...HalfColumn}>
            <Form.Item name="discountType" label="Discount Type">
              <Select
                placeholder="Discount Type"
                disabled={readOnly}
                options={DiscountTypes as any}
              />
            </Form.Item>
          </Col>

          <Col {...HalfColumn}>
            <Form.Item
              name="afterHoursSurchargeFee"
              label="After Hours Surcharge Fee"
            >
              <NumberInput
                disabled={readOnly}
                placeholder="After Hours Surcharge Fee"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>

          <Col {...HalfColumn}>
            <Form.Item name="holidaySurchargeFee" label="Holiday Surcharge Fee">
              <NumberInput
                disabled={readOnly}
                placeholder="Holiday Surcharge Fee"
                addonBefore={PRICE_UNIT}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider className="my-1" />
        <Typography.Title level={5}>Helper Fee</Typography.Title>
        <Space align="start">
          <Form.Item
            name={['helperFee', 'perStop']}
            label="Per Stop"
            rules={[emptyValidator]}
          >
            <NumberInput
              disabled={readOnly}
              placeholder="Per Stop"
              addonBefore={PRICE_UNIT}
            />
          </Form.Item>
          <Form.Item
            name={['helperFee', 'min']}
            label="Min"
            rules={[
              {
                validator: (_, value) => {
                  const helperFee = form.getFieldValue('helperFee');
                  if (value && helperFee.max <= value) {
                    return Promise.reject('Min must be smaller than max');
                  }
                  return Promise.resolve();
                },
              },
              emptyValidator,
            ]}
          >
            <NumberInput
              disabled={readOnly}
              placeholder="Min"
              addonBefore={PRICE_UNIT}
            />
          </Form.Item>
          <Form.Item
            name={['helperFee', 'max']}
            label="Max"
            rules={[
              {
                validator: (_, value) => {
                  const helperFee = form.getFieldValue('helperFee');
                  if (value && helperFee.min >= value) {
                    return Promise.reject('Max must be greater than min');
                  }
                  return Promise.resolve();
                },
              },
              emptyValidator,
            ]}
          >
            <NumberInput
              disabled={readOnly}
              placeholder="Max"
              addonBefore={PRICE_UNIT}
            />
          </Form.Item>
        </Space>
      </Form>
    </Drawer>
  );
};
