/* eslint-disable no-empty */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Typography,
} from 'antd';
import { NumberInput } from 'components/number-input';
import {
  DATE_FORMAT,
  DriverGroup,
  DriverLicenceType,
  VehicleTypes,
} from 'constants/index';
import { EmailValidate, phoneValidator, validateMessages } from 'validators';
import { useEffect } from 'react';
import { PhoneNumber } from 'components/phone-number';
import { AccreditationsType } from 'types/accreditations';
import { isEmpty } from 'lodash';
import moment, { Moment } from 'moment';

const FormItem = Form.Item;
const { Title } = Typography;
const { Option } = Select;
interface Props {
  goNext: ({ driver }: { driver: AccreditationsType }) => void;
  driver?: AccreditationsType;
}

export const Step1: React.FC<Props> = ({ goNext, driver }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (driver) {
      form.setFieldsValue({
        ...driver,
        vehicles: isEmpty(driver.vehicles) ? [''] : driver.vehicles,
        dayOfBirth: driver.dayOfBirth ? moment(driver.dayOfBirth) : '',
      });
    }
  }, [driver]);

  const onGoNext = async () => {
    try {
      const formValues = await form.validateFields();
      goNext({
        driver: {
          ...formValues,
          email: formValues.email || null,
          dayOfBirth: formValues.dayOfBirth
            ? moment(formValues.dayOfBirth).format(DATE_FORMAT)
            : null,
        },
      });
    } catch (_) {}
  };

  const disabledDate = (current: Moment) =>
    current && current > moment().subtract(15, 'years');

  return (
    <>
      <Form form={form} layout="vertical" validateMessages={validateMessages}>
        <Card className="accreditation__card">
          <Title level={5}>PROFILE</Title>

          <Row justify="space-between" align="top" gutter={20}>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name="driverGroup"
                label="Driver Group"
                rules={[{ required: true }]}
              >
                <Select placeholder="Driver Group" allowClear>
                  {DriverGroup.map((item, idx) => (
                    <Option key={idx} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="referralDriverId" label="Referral Driver">
                <Input placeholder="Referral Driver" />
              </FormItem>
            </Col>
          </Row>

          <Row justify="space-between" align="top" gutter={20}>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="First Name" />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="middleName" label="Middle Name">
                <Input placeholder="Middle Name (optional)" />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name="lastName"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="Last Name" />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="dayOfBirth" label="Day Of Birth">
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  format={DATE_FORMAT}
                  defaultPickerValue={moment().subtract(15, 'years')}
                />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name="taxRegistrationNumber"
                label="Tax Identification Number"
                rules={[{ required: true }]}
              >
                <Input placeholder="Tax Identification Number" />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name="driverBackground"
                label="Driver Background"
                rules={[{ required: true }]}
              >
                <Input placeholder="Driver Background" />
              </FormItem>
            </Col>
          </Row>
        </Card>

        <Card className="accreditation__card">
          <Title level={5}>CONTACT DETAILS</Title>

          <Row justify="space-between" align="top" gutter={20}>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="phoneNumber" label="Contact Number">
                <PhoneNumber
                  disabled
                  placeholder="Contact Number"
                  maxLength={10}
                />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name="email"
                label="Email Address"
                rules={[
                  {
                    message: 'Email address is invalid',
                    validateTrigger: 'onSubmit',
                    pattern: EmailValidate,
                  },
                ]}
              >
                <Input placeholder="Email Address" type="email" />
              </FormItem>
            </Col>
          </Row>
        </Card>

        <Card className="accreditation__card">
          <Title level={5}>EMERGENCY CONTACT</Title>
          <Row justify="space-between" align="top" gutter={20}>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name={['emergencyContact', 'name']}
                label="Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="Name" />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name={['emergencyContact', 'contactPhone']}
                label="Contact Number"
                rules={[
                  {
                    required: true,
                    validator: (_, values: string) => phoneValidator(values),
                    validateTrigger: 'onSubmit',
                  },
                ]}
              >
                <PhoneNumber placeholder="Contact Number" maxLength={10} />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name={['emergencyContact', 'relationship']}
                label="Relationship"
                rules={[{ required: true }]}
              >
                <Input placeholder="Relationship" />
              </FormItem>
            </Col>
          </Row>
        </Card>

        <Card className="accreditation__card">
          <Title level={5}>DRIVER LICENCE</Title>

          <Row justify="space-between" align="top" gutter={20}>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name={['driverLicence', 'type']}
                label="Licence Type"
                rules={[{ required: true }]}
              >
                <Select placeholder="Licence Type" allowClear>
                  {DriverLicenceType.map((item, idx) => (
                    <Option key={idx} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name={['driverLicence', 'number']}
                label="Licence Number"
                rules={[{ required: true }]}
              >
                <NumberInput placeholder="Licence Number" />
              </FormItem>
            </Col>
          </Row>
        </Card>

        <Card className="accreditation__card">
          <Title level={5}>ADDRESS</Title>
          <Row justify="space-between" align="top" gutter={20}>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="province" label="Province">
                <Input placeholder="Province" />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="city" label="City">
                <Input placeholder="City" />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="address" label="Street, House No., Barangay">
                <Input placeholder="Street, House No., Barangay" />
              </FormItem>
            </Col>
          </Row>
        </Card>

        <Card className="accreditation__card">
          <Title level={5}>DELIVERY DETAILS</Title>
          <Row justify="space-between" align="top" gutter={20}>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="deliveryCluster" label="Cluster">
                <Input placeholder="Cluster" />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="deliveryCity" label="City">
                <Input placeholder="City" />
              </FormItem>
            </Col>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem name="deliveryArea" label="Area">
                <Input placeholder="Area" />
              </FormItem>
            </Col>
          </Row>
        </Card>

        <Card className="accreditation__card">
          <Title level={5}>REGISTER VEHICLE</Title>

          <Row justify="space-between" align="top" gutter={20}>
            <Col sm={{ span: 24 }} md={{ span: 12 }}>
              <FormItem
                name="licenseRestriction"
                label="Driver's License Restriction"
                rules={[{ required: true }]}
              >
                <Input placeholder="Driver's License Restriction" />
              </FormItem>
            </Col>
          </Row>

          <Form.List name="vehicles">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <div key={field.key}>
                    <Typography.Link> Vehicle {index + 1} </Typography.Link>
                    <FormItem name={[field.name, 'vehicleId']} className="hide">
                      <Input hidden />
                    </FormItem>

                    <Row justify="space-between" align="top" gutter={20}>
                      <Col sm={{ span: 24 }} md={{ span: 12 }}>
                        <FormItem
                          name={[field.name, 'vehicleType']}
                          label="Vehicle Type"
                          rules={[{ required: true }]}
                          style={{ flexGrow: 1 }}
                        >
                          <Select
                            placeholder="Select Vehicle Type"
                            allowClear
                            options={VehicleTypes}
                          />
                        </FormItem>
                      </Col>
                      <Col sm={{ span: 24 }} md={{ span: 12 }}>
                        <FormItem
                          name={[field.name, 'vehicleModel']}
                          label="Vehicle Model"
                          rules={[{ required: true }]}
                          className="mb-0"
                        >
                          <Input placeholder="Vehicle Model" />
                        </FormItem>
                      </Col>
                      <Col sm={{ span: 24 }} md={{ span: 12 }}>
                        <FormItem
                          name={[field.name, 'registeredPlateNumber']}
                          label="Registered Plate Number"
                          rules={[{ required: true }]}
                          className="mb-0"
                        >
                          <Input placeholder="Registered Plate Number" />
                        </FormItem>
                      </Col>
                    </Row>

                    {fields.length > 1 ? (
                      <Popconfirm
                        placement="left"
                        title="Are you sure?"
                        okType="danger"
                        cancelText="No"
                        okText="Delete"
                        onConfirm={() => {
                          remove(field.name);
                        }}
                      >
                        <Button
                          className="float-right my-1"
                          type="ghost"
                          shape="circle"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    ) : null}
                    <Divider />
                  </div>
                ))}
                <Button
                  ghost
                  className="mb-1"
                  type="primary"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  size="small"
                >
                  Add vehicle
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
      <Row gutter={24} justify="end" className="px-2 mt-2">
        <Button onClick={onGoNext} type="primary">
          Next
        </Button>
      </Row>
    </>
  );
};
