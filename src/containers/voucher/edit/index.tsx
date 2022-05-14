/* eslint-disable no-empty */
/* eslint-disable no-console */
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { CUSTOMER_API } from 'api';
import customerService from 'api/customer.api';
import { AlphanumericInput } from 'components/alphanumeric-input';
import { AsyncSearch } from 'components/asynchronous-search';
import { Drawer } from 'components/drawer';
import { NumberInput } from 'components/number-input';
import {
  DATE_FORMAT,
  DiscountTypes,
  PaymentMethod,
  PRICE_UNIT,
  VehicleTypes,
} from 'constants/index';
import { checkIsPercentage, serializeQuery } from 'helpers';
import { joinCustomerName } from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import moment, { Moment } from 'moment';
import {
  setCurrentVoucher,
  setEditing,
  setVisible,
} from 'pages/voucher-management/redux/slice';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CustomerType, VoucherType } from 'types';
import { DiscountType } from 'types/voucher';
import { validateMessages } from 'validators';
import './index.scss';

const { Title } = Typography;

interface Props {
  loading: boolean;
  onSubmit?: (voucher: VoucherType) => void;
  onApply?: (customer: CustomerType) => void;
  onRemove?: (customerIds: number[]) => void;
}

const HHmm = 'HH:mm';
const HalfCol = { sm: 12, xs: 24 };
const ThreeCol = { sm: 8, xs: 12 };

export const EditVoucher: React.FC<Props> = ({
  onSubmit,
  onApply,
  onRemove,
  loading,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [selectedCustomer, setSelectedCustomer] = useState<
    undefined | CustomerType
  >(undefined);
  const [listRemoveCustomer, setListRemoveCustomer] = useState([]);
  const { canEdit } = usePermissions({
    module: 'manage_vouchers',
  });

  const { visible, currentVoucher, isEditing } = useAppSelector(
    state => state.voucherManagement,
  );

  const [isPercent, setIsPercent] = useState(false);

  useEffect(() => {
    if (currentVoucher && visible) {
      form.setFieldsValue({
        ...currentVoucher,
        effectiveDate:
          currentVoucher.effectiveDate && moment(currentVoucher.effectiveDate),
        expiryDate:
          currentVoucher.expiryDate && moment(currentVoucher.expiryDate),
        limitNumberOfVoucher:
          currentVoucher.limitNumberOfVoucher !== 0 ? -1 : 0,
        limitPerCustomer: currentVoucher.limitPerCustomer !== 0 ? -1 : 0,
        limitNumberOfVoucherValue: currentVoucher.limitNumberOfVoucher,
        limitPerCustomerTextValue: currentVoucher.limitPerCustomer,
        visibleTimeStart:
          currentVoucher.visibleTimeStart &&
          moment(currentVoucher.visibleTimeStart, HHmm),
        visibleTimeEnd:
          currentVoucher.visibleTimeEnd &&
          moment(currentVoucher.visibleTimeEnd, HHmm),
        discountAmount: isPercent
          ? currentVoucher.discountAmount * 100
          : currentVoucher.discountAmount,
      });
      setIsPercent(checkIsPercentage(currentVoucher.discountType));
    } else {
      form.setFieldsValue({
        minPayment: 0,
        maxDiscount: 0,
        discountAmount: 0,
      });
    }
  }, [currentVoucher, visible, isPercent]);

  useEffect(() => {
    if (currentVoucher?.customerIds && visible) {
      setListRemoveCustomer([]);
      (async () => {
        const { data } = await fetchCustomerDetail();
        dispatch(setCurrentVoucher({ ...currentVoucher, customers: data }));
      })();
    }
  }, [visible]);

  useEffect(() => {
    return () => form.resetFields();
  }, [visible]);

  const fetchCustomerDetail = async () => {
    const params = {
      ids: currentVoucher.customerIds,
      attributes: 'id,firstName,lastName,phoneNumber',
    };
    return await customerService.findByListIds(serializeQuery(params));
  };

  const handleClose = () => dispatch(setVisible(false));

  const handleEdit = () => dispatch(setEditing(true));

  const handleSubmit = async () => {
    const {
      limitNumberOfVoucher,
      limitNumberOfVoucherValue,
      limitPerCustomer,
      limitPerCustomerTextValue,
      ...formValues
    } = await form.validateFields();

    onSubmit({
      ...formValues,
      limitNumberOfVoucher:
        limitNumberOfVoucher === -1
          ? limitNumberOfVoucherValue
          : limitNumberOfVoucher,
      limitPerCustomer:
        limitPerCustomer === -1 ? limitPerCustomerTextValue : limitPerCustomer,
      effectiveDate:
        formValues.effectiveDate &&
        moment(formValues.effectiveDate).format(DATE_FORMAT),
      expiryDate:
        formValues.expiryDate &&
        moment(formValues.expiryDate).format(DATE_FORMAT),
      visibleTimeStart:
        formValues.visibleTimeStart &&
        moment(formValues.visibleTimeStart).format(HHmm),
      visibleTimeEnd:
        formValues.visibleTimeEnd &&
        moment(formValues.visibleTimeEnd).format(HHmm),
      discountAmount: isPercent
        ? +formValues.discountAmount / 100
        : formValues.discountAmount,
      maxDiscount: isPercent ? formValues.maxDiscount : 0,
    });
  };

  const title =
    isEditing && currentVoucher
      ? 'Edit voucher'
      : currentVoucher
      ? 'Voucher info'
      : 'Create a new voucher';

  const readOnly = !isEditing;

  const validatorExpiryDate = useCallback(() => {
    const {
      expiryDate,
      effectiveDate,
    }: { expiryDate: Moment; effectiveDate: Moment } = form.getFieldsValue();
    if (!effectiveDate) return Promise.reject('This is a required field');
    if (expiryDate) {
      if (
        effectiveDate.isAfter(expiryDate) ||
        effectiveDate.isSame(expiryDate, 'day')
      ) {
        return Promise.reject('Effective date must be less than expiry date');
      }
    }
    return Promise.resolve();
  }, [form]);

  const validatorAmount = useCallback(() => {
    const {
      discountAmount,
      maxDiscount,
    }: {
      discountType: DiscountType;
      discountAmount: number;
      maxDiscount: number;
    } = form.getFieldsValue();

    if (isPercent) {
      if (discountAmount > 100) {
        return Promise.reject('Amount must be from 0 to 100');
      }
      if (parseFloat(`${discountAmount}`) > parseFloat(`${maxDiscount}`)) {
        return Promise.reject(
          'The amount of discount can not over max discount',
        );
      }
    }
    return Promise.resolve();
  }, [form, isPercent]);

  const validatorVisibleTime = useCallback(() => {
    const {
      visibleTimeStart,
      visibleTimeEnd,
    }: { visibleTimeStart: Moment; visibleTimeEnd: Moment } =
      form.getFieldsValue();
    if (visibleTimeStart && !visibleTimeEnd) {
      return Promise.reject('Please select visible time end');
    }
    if (visibleTimeEnd) {
      if (visibleTimeStart.isAfter(visibleTimeEnd)) {
        return Promise.reject('Visible time start must be less than');
      }
    }
    return Promise.resolve();
  }, [form]);

  const disabledDate = useCallback(
    (current: Moment) => moment().isAfter(current),
    [],
  );

  const renderOption = (customer: CustomerType) => {
    return (
      <Select.Option
        value={customer.id}
        disabled={(currentVoucher?.customerIds || [])
          .map(item => String(item))
          .includes(`${customer.id}` as any)}
        customer={customer}
      >
        {joinCustomerName(customer)}
      </Select.Option>
    );
  };

  const renderTag = useCallback((customer: CustomerType) => {
    return (
      <span key={customer.id}>
        {customer.firstName ? (
          <>
            <Typography.Link strong>
              {customer.firstName}, {customer.lastName}
            </Typography.Link>
            <br />
            {customer.phoneNumber}
          </>
        ) : (
          <Typography.Link strong>{customer.phoneNumber}</Typography.Link>
        )}
      </span>
    );
  }, []);

  return (
    <div>
      <Drawer
        className="voucher-edit"
        title={title}
        visible={visible}
        onClose={handleClose}
        width={600}
        footer={
          <Space size={16}>
            {isEditing && (
              <Popconfirm
                title="Discard changes made in the voucher information?"
                cancelText="Cancel"
                okText="Discard"
                onConfirm={handleClose}
                disabled={!currentVoucher}
              >
                <Button
                  className="float-right"
                  type="ghost"
                  onClick={() => {
                    if (!currentVoucher) {
                      handleClose();
                    }
                  }}
                >
                  Cancel
                </Button>
              </Popconfirm>
            )}

            {isEditing ? (
              <Button onClick={handleSubmit} type="primary" loading={loading}>
                {currentVoucher?.id ? 'Update voucher' : 'Add voucher'}
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
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            scrollToFirstError
            validateMessages={validateMessages}
          >
            <Form.Item name="id" hidden noStyle>
              <Input hidden />
            </Form.Item>
            <Title level={5}>Voucher info</Title>

            <Row gutter={12}>
              <Col {...HalfCol}>
                <Form.Item
                  name="code"
                  label="Voucher Number"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <AlphanumericInput
                    disabled={readOnly}
                    maxLength={25}
                    placeholder="Voucher Number"
                  />
                </Form.Item>
              </Col>
              <Col {...HalfCol}>
                <Form.Item
                  name="description"
                  label="Voucher Details"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <AlphanumericInput
                    disabled={readOnly}
                    placeholder="Voucher Details"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col {...(isPercent ? ThreeCol : HalfCol)}>
                <Form.Item
                  name="discountType"
                  label="Discount Type"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    disabled={readOnly}
                    options={DiscountTypes as any}
                    placeholder="Discount Type"
                    onChange={value => {
                      setIsPercent(checkIsPercentage(value as string));
                    }}
                  />
                </Form.Item>
              </Col>

              <Col {...(isPercent ? ThreeCol : HalfCol)}>
                <Form.Item
                  name="discountAmount"
                  label="Amount to be Deducted"
                  rules={[
                    {
                      validator: () => validatorAmount(),
                      validateTrigger: 'onSubmit',
                    },
                  ]}
                >
                  <NumberInput
                    maxLength={10}
                    disabled={readOnly}
                    placeholder="Amount to be Deducted"
                    addonAfter={isPercent ? '%' : '₱'}
                  />
                </Form.Item>
              </Col>

              {isPercent && (
                <Col {...ThreeCol}>
                  <Form.Item name="maxDiscount" label="Max Discount">
                    <NumberInput
                      disabled={readOnly}
                      placeholder="Max Discount"
                      addonAfter={PRICE_UNIT}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Row gutter={12}>
              <Col {...HalfCol}>
                <Form.Item
                  name="effectiveDate"
                  label="Effective Date"
                  rules={[
                    {
                      required: true,
                      validator: () => validatorExpiryDate(),
                      validateTrigger: 'onSubmit',
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full"
                    disabled={readOnly}
                    format={DATE_FORMAT}
                    placeholder="Effective Date"
                    allowClear={false}
                    disabledDate={!currentVoucher && disabledDate}
                  />
                </Form.Item>
              </Col>
              <Col {...HalfCol}>
                <Form.Item
                  name="expiryDate"
                  label="Expiry Date"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full"
                    disabled={readOnly}
                    format={DATE_FORMAT}
                    placeholder="Expiry Date"
                    allowClear={false}
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col {...HalfCol}>
                <Form.Item
                  name="visibleTimeStart"
                  label="Visible Time Start"
                  rules={[
                    {
                      validator: () => validatorVisibleTime(),
                      validateTrigger: 'onSubmit',
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full"
                    picker="time"
                    format="HH:mm"
                    disabled={readOnly}
                    placeholder="Visible Time Start"
                  />
                </Form.Item>
              </Col>

              <Col {...HalfCol}>
                <Form.Item name="visibleTimeEnd" label="Visible Time End">
                  <DatePicker
                    className="w-full"
                    picker="time"
                    format="HH:mm"
                    disabled={readOnly}
                    placeholder="Visible Time End"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col {...HalfCol}>
                {/* Start limitNumberOfVoucher */}
                <div className="form-2-column ">
                  <Form.Item
                    name="limitNumberOfVoucher"
                    label="User Limitation"
                  >
                    <Select disabled={readOnly} placeholder="User Limitation">
                      <Select.Option value={0}>
                        Unlimited until expired
                      </Select.Option>
                      <Select.Option value={-1}>Others</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.limitNumberOfVoucher !==
                      currentValues.limitNumberOfVoucher
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('limitNumberOfVoucher') === -1 && (
                        <Form.Item
                          name="limitNumberOfVoucherValue"
                          className="form-number-input"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        >
                          <NumberInput disabled={readOnly} maxLength={5} />
                        </Form.Item>
                      )
                    }
                  </Form.Item>
                </div>
                {/* End limitNumberOfVoucher */}
              </Col>

              <Col {...HalfCol}>
                {/* Start limitPerCustomer */}
                <div className="form-2-column">
                  <Form.Item
                    name="limitPerCustomer"
                    label="Usage Limitation Per Customer"
                  >
                    <Select
                      disabled={readOnly}
                      placeholder="Usage Limitation Per Customer"
                    >
                      <Select.Option value={0}>
                        Unlimited until expired
                      </Select.Option>
                      <Select.Option value={-1}>Others</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.limitPerCustomer !==
                      currentValues.limitPerCustomer
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('limitPerCustomer') === -1 && (
                        <Form.Item
                          name="limitPerCustomerTextValue"
                          className="form-number-input"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        >
                          <NumberInput disabled={readOnly} maxLength={5} />
                        </Form.Item>
                      )
                    }
                  </Form.Item>
                </div>
                {/* End limitPerCustomer */}
              </Col>
            </Row>

            <Row gutter={12}>
              <Col {...ThreeCol}>
                <Form.Item name="vehicleType" label="Vehicle Type">
                  <Select
                    disabled={readOnly}
                    options={[
                      {
                        label: 'None',
                        value: null,
                      },
                      ...VehicleTypes,
                    ]}
                    placeholder="Vehicle Type"
                  />
                </Form.Item>
              </Col>

              <Col {...ThreeCol}>
                <Form.Item name="paymentMethod" label="Payment Method">
                  <Select
                    disabled={readOnly}
                    options={[
                      {
                        label: 'None',
                        value: null,
                      },
                      ...PaymentMethod,
                    ]}
                    placeholder="Payment Method"
                  />
                </Form.Item>
              </Col>

              <Col {...ThreeCol}>
                <Form.Item name="minPayment" label="Min Payment">
                  <NumberInput
                    disabled={readOnly}
                    placeholder="Min Payment"
                    addonAfter={PRICE_UNIT}
                  />
                </Form.Item>
              </Col>
            </Row>

            {currentVoucher && (
              <Row align="middle" gutter={12}>
                <Col {...ThreeCol}>
                  <Typography.Text strong className="mr-1">
                    Voucher used:
                  </Typography.Text>
                  <Tag color="blue" className="text-capitalize">
                    {currentVoucher.numberOfUsed}
                  </Tag>
                </Col>
                <Col {...ThreeCol}>
                  <Typography.Text strong className="mr-1">
                    Status:
                  </Typography.Text>
                  <Tag
                    color={
                      currentVoucher.status === 'pending'
                        ? 'gold'
                        : currentVoucher.status === 'active'
                        ? 'green'
                        : 'red'
                    }
                    className="text-capitalize"
                  >
                    {currentVoucher.status}
                  </Tag>
                </Col>
              </Row>
            )}

            {currentVoucher ? (
              <Row gutter={[12, 12]} align="bottom" className="mt-2">
                <Col {...HalfCol} className="mt-1">
                  <Typography.Text className="block mb-1">
                    Apply customers
                  </Typography.Text>
                  <AsyncSearch
                    placeholder="Apply customers"
                    url={CUSTOMER_API}
                    onSelect={(_, option) =>
                      setSelectedCustomer(option.customer)
                    }
                    pageSize={10}
                    renderOption={renderOption}
                    optionLabelProp={undefined}
                    value={selectedCustomer?.id}
                  />
                </Col>

                <Col {...ThreeCol}>
                  <Tooltip title="Apply voucher for this customer">
                    <Button
                      type="primary"
                      disabled={!selectedCustomer}
                      onClick={() => {
                        onApply(selectedCustomer);
                        setSelectedCustomer(undefined);
                      }}
                    >
                      Apply
                    </Button>
                  </Tooltip>
                </Col>
              </Row>
            ) : null}
          </Form>

          {currentVoucher?.customers && (
            <div className="voucher-edit__table-wrapper">
              <Table
                rowKey="id"
                className="voucher-edit__table"
                rowSelection={{
                  type: 'checkbox',
                  onChange: (selectedRowKeys: React.Key[]) => {
                    setListRemoveCustomer(selectedRowKeys);
                  },
                }}
                columns={[
                  {
                    title: 'Customer',
                    key: 'customer',
                    render: (customer: CustomerType) => renderTag(customer),
                    className: 'p-0',
                  },
                ]}
                size="small"
                dataSource={currentVoucher.customers}
              />

              <Popconfirm
                placement="top"
                title="Are you sure to delete these customers?"
                onConfirm={() => onRemove(listRemoveCustomer)}
                okText="Yes"
                cancelText="No"
                disabled={!listRemoveCustomer.length}
              >
                <Button
                  className="voucher-edit__delete-customer"
                  danger
                  type="primary"
                  size="small"
                  disabled={!listRemoveCustomer.length}
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          )}
        </Spin>
      </Drawer>
    </div>
  );
};
