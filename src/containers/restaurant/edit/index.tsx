/* eslint-disable no-empty */
/* eslint-disable no-console */
import { useJsApiLoader } from '@react-google-maps/api';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Spin,
  Switch,
  Typography,
} from 'antd';
import { AlphanumericInput } from 'components/alphanumeric-input';
import { CommonUpload } from 'components/common-upload';
import { NumberInput } from 'components/number-input';
import { PhoneNumber } from 'components/phone-number';
import {
  GG_MAP_LIBS,
  OperationStatus,
  PhoneNumberPrefix,
} from 'constants/index';
import { normFile } from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { RestaurantType } from 'types';
import { useDebouncedCallback } from 'use-debounce';
import { validateMessages } from 'validators';

const OpenDays = [
  {
    label: 'Sun',
    value: 'sun',
  },
  {
    label: 'Mon',
    value: 'mon',
  },
  {
    label: 'Tues',
    value: 'tue',
  },

  {
    label: 'Wed',
    value: 'wed',
  },
  {
    label: 'Thurs',
    value: 'thu',
  },
  {
    label: 'Fri',
    value: 'fri',
  },
  {
    label: 'Sat',
    value: 'sat',
  },
];
const { Title } = Typography;
const { Item: FormItem } = Form;
interface Props {
  onSubmit: (restaurant: RestaurantType) => void;
  loading: boolean;
}

const HHmm = 'HH:mm';

const HalfCol = { xs: { span: 24 }, sm: { span: 12 }, md: { span: 12 } };

export const EditRestaurant: React.FC<Props> = ({ onSubmit, loading }) => {
  const navigate = useNavigate();
  const { canEdit, canCreate } = usePermissions({
    module: 'manage_restaurants',
  });

  useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_API_KEY,
    libraries: GG_MAP_LIBS as any,
  });
  const [form] = Form.useForm();

  const [suggestedPlaces, setSuggestedPlaces] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const { currentRestaurant, restaurantCategories } = useAppSelector(
    state => state.restaurantManagement,
  );

  const readOnly =
    (currentRestaurant && !canEdit) || (!currentRestaurant && !canCreate);

  useEffect(() => {
    if (currentRestaurant) {
      form.setFieldsValue({
        ...currentRestaurant,
        openHour:
          currentRestaurant.openHour &&
          moment(currentRestaurant.openHour, HHmm),
        closeHour:
          currentRestaurant.closeHour &&
          moment(currentRestaurant.closeHour, HHmm),
        address: {
          label: currentRestaurant.address,
          key: Date.now(),
        },
        openDay: currentRestaurant.openDay
          ? currentRestaurant.openDay
          : undefined,
        status: currentRestaurant.status === 'active',
        restaurantCategories: currentRestaurant.restaurantCategories.map(
          cat => cat.id,
        ),
      });
    } else {
      form.setFieldsValue({
        status: true,
      });
    }
  }, [currentRestaurant]);

  const handleCancel = async () => {
    navigate(-1);
  };

  const onSearchAddress = useDebouncedCallback((searchAddress: string) => {
    if (!searchAddress) {
      return;
    }
    const autocompleteService = new google.maps.places.AutocompleteService();
    const options = {
      input: searchAddress,
      componentRestrictions: { country: 'phl' },
    };

    autocompleteService.getPlacePredictions(options, suggestsGoogle => {
      if (!suggestsGoogle) return;
      const suggests = suggestsGoogle.map(item => ({
        label: item.description,
        value: item.place_id,
      }));
      setSuggestedPlaces(suggests);
    });
  }, 500);

  const getLatLng = useCallback((placeId: string) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId }, rs => {
      if (rs) {
        const [place] = rs;
        const { location } = place.geometry;
        form.setFieldsValue({
          location: { lat: location.lat(), lng: location.lng() },
        });
      }
    });
  }, []);

  const onFinish = (formValues: any) => {
    onSubmit({
      ...formValues,
      address: formValues.address.label,
      contactNumber: formValues.contactNumber
        ? `${PhoneNumberPrefix}${formValues.contactNumber}`
        : '',
      status: formValues.status ? 'active' : 'inactive',
      openHour: formValues.openHour && moment(formValues.openHour).format(HHmm),
      closeHour:
        formValues.closeHour && moment(formValues.closeHour).format(HHmm),
    });
  };

  return (
    <Spin className="restaurant-edit" spinning={loading}>
      <Row>
        <Col md={{ span: 24 }} lg={{ span: 16 }} xl={{ span: 12 }}>
          <Form
            form={form}
            layout="vertical"
            scrollToFirstError
            validateMessages={validateMessages}
            onFinish={onFinish}
          >
            <Form.Item name="id" hidden noStyle>
              <Input hidden />
            </Form.Item>
            <Title level={5}>Restaurant info</Title>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.bannerImage !== currentValues.bannerImage
              }
            >
              {({ getFieldValue }) => (
                <FormItem
                  name="bannerImage"
                  valuePropName="fileList"
                  className="mb-2"
                  getValueFromEvent={normFile}
                  label="Restaurant Banner"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <CommonUpload
                    imgSrc={getFieldValue('bannerImage')}
                    disabled={readOnly}
                  />
                </FormItem>
              )}
            </Form.Item>

            <Row gutter={12}>
              <Col {...HalfCol}>
                <FormItem
                  name="name"
                  label="Restaurant Name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <AlphanumericInput
                    placeholder="Restaurant Name"
                    disabled={readOnly}
                  />
                </FormItem>
              </Col>

              <Col {...HalfCol}>
                <FormItem
                  name="brandName"
                  label="Restaurant Brand"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <AlphanumericInput
                    placeholder="Restaurant Brand"
                    disabled={readOnly}
                  />
                </FormItem>
              </Col>

              <Col {...HalfCol}>
                <FormItem
                  name="restaurantCategories"
                  label="Category"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    disabled={readOnly}
                    showSearch
                    placeholder="Category"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {restaurantCategories.map(item => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>

              <Col {...HalfCol}>
                <Form.Item label="Active" valuePropName="checked" name="status">
                  <Switch
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                    disabled={readOnly}
                  />
                </Form.Item>
              </Col>

              <Col {...HalfCol}>
                <FormItem
                  name="operationStatus"
                  label="Operation Status"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    options={OperationStatus as any}
                    placeholder="Operation Status"
                    disabled={readOnly}
                  />
                </FormItem>
              </Col>

              <Col {...HalfCol}>
                <FormItem name="openDay" label="Open Day">
                  <Select
                    mode="multiple"
                    allowClear
                    options={OpenDays}
                    placeholder="Open Day"
                    disabled={readOnly}
                  />
                </FormItem>
              </Col>

              <Col {...HalfCol}>
                <FormItem name="openHour" label="Open Hour">
                  <DatePicker
                    className="w-full"
                    picker="time"
                    format={HHmm}
                    disabled={readOnly}
                  />
                </FormItem>
              </Col>

              <Col {...HalfCol}>
                <FormItem name="closeHour" label="Close Hour">
                  <DatePicker
                    className="w-full"
                    picker="time"
                    format={HHmm}
                    disabled={readOnly}
                  />
                </FormItem>
              </Col>

              <Col {...HalfCol}>
                <FormItem
                  name="address"
                  label="Address"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Address"
                    onSearch={onSearchAddress}
                    options={suggestedPlaces}
                    onSelect={(item: any) => getLatLng(item.key)}
                    labelInValue
                    showArrow={false}
                    filterOption={false}
                    notFoundContent={null}
                    disabled={readOnly}
                  />
                </FormItem>
              </Col>

              <Col {...HalfCol}>
                <Row gutter={12}>
                  <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                    <FormItem
                      name={['location', 'lat']}
                      label="Latitude"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input placeholder="Latitude" disabled={readOnly} />
                    </FormItem>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }}>
                    <FormItem
                      name={['location', 'lng']}
                      label="Longitude"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input placeholder="Longitude" disabled={readOnly} />
                    </FormItem>
                  </Col>
                </Row>
              </Col>

              <Col {...HalfCol}>
                <FormItem name="contactName" label="Contact Name">
                  <Input placeholder="Contact Name" disabled={readOnly} />
                </FormItem>
              </Col>

              <Col {...HalfCol}>
                <FormItem name="contactNumber" label="Contact Number">
                  <PhoneNumber
                    placeholder="Contact Number"
                    maxLength={10}
                    disabled={readOnly}
                  />
                </FormItem>
              </Col>

              {/* <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }}>
                <FormItem name="prepareTime" label="Prepare Time">
                  <NumberInput placeholder="Prepare Time" disabled={readOnly} />
                </FormItem>
              </Col> */}

              {/* <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }}>
            <FormItem name="approxPriceForTwo" label="Approx Pricefor Two">
              <NumberInput
                placeholder="Approx Pricefor Two"
                disabled={readOnly}
              />
            </FormItem>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }}>
            <FormItem name="landMark" label="Land Mark">
              <Input placeholder="Land Mark" disabled={readOnly} />
            </FormItem>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }}>
            <FormItem name="minPriceOrder" label="Min Price Order">
              <NumberInput placeholder="Min Price Order" disabled={readOnly} />
            </FormItem>
          </Col> */}
            </Row>
            {(canCreate || canEdit) && (
              <div className="mt-3 text-right">
                <Popconfirm
                  title="Discard changes made in the restaurant information?"
                  cancelText="Cancel"
                  okText="Discard"
                  onConfirm={handleCancel}
                >
                  <Button type="ghost" className="mr-1">
                    Cancel
                  </Button>
                </Popconfirm>

                <Button
                  type="primary"
                  loading={loading}
                  htmlType="submit"
                  disabled={readOnly}
                >
                  {currentRestaurant?.id
                    ? 'Update restaurant'
                    : 'Add restaurant'}
                </Button>
              </div>
            )}
          </Form>
        </Col>
      </Row>
    </Spin>
  );
};
