/* eslint-disable no-empty */
/* eslint-disable no-console */
import {
  ClockCircleOutlined,
  DeleteOutlined,
  LinkOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  List,
  notification,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import driverService from 'api/driver.api';
import vehicleService from 'api/vehicle.api';
import classNames from 'classnames';
import { CommonUpload } from 'components/common-upload';
import { Drawer } from 'components/drawer';
import { PhoneNumber } from 'components/phone-number';
import {
  DriverGroup,
  MODULES,
  PhoneNumberPrefix,
  VehicleTypes,
} from 'constants/index';
import { buildMessage, removeSnakeCase } from 'helpers';
import { normFile } from 'helpers/component.helper';
import { useAppSelector } from 'hooks/app-hooks';
import { usePermissions } from 'hooks/usePermission';
import { isEmpty } from 'lodash';
import { setEditing, setVisible } from 'pages/driver-management/redux/slice';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DriverType } from 'types';
import { VehicleType } from 'types/driver';
import { EmailValidate, phoneValidator, validateMessages } from 'validators';
import './index.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const NameRegexValidate = new RegExp(`^[^-\\s][a-zA-Z'\\s.-]*$`);
interface Props {
  onSuccess?: () => void;
}

export const EditDriver: React.FC<Props> = ({ onSuccess }) => {
  const { canEdit } = usePermissions({
    module: MODULES.MANAGE_DRIVERS,
  });

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const hasEditVehicle = useRef(false);
  const vehiclesPrepareDelete = useRef<string[]>([]);
  const dispatch = useDispatch();

  const { visible, currentDriver, isEditing } = useAppSelector(
    state => state.driverManagement,
  );

  useEffect(() => {
    if (currentDriver && visible) {
      form.setFieldsValue({
        ...currentDriver,
        status: currentDriver.status === 'active',
      });
    } else {
      form.setFieldsValue({
        vehicles: [''],
      });
    }
  }, [currentDriver, visible]);

  useEffect(() => {
    return () => {
      form.resetFields();
      hasEditVehicle.current = false;
      vehiclesPrepareDelete.current = [];
    };
  }, [visible]);

  const handleClose = () => dispatch(setVisible(false));

  const handleEdit = () => dispatch(setEditing(true));

  const handleSubmit = useCallback(async () => {
    try {
      const formValues = await form.validateFields();
      const driverFormValue = {
        ...formValues,
        status: formValues.status === true ? 'active' : 'inactive',
        email: formValues.email ? formValues.email : null,
        phoneNumber: `${PhoneNumberPrefix}${formValues.phoneNumber}`,
      } as DriverType;
      setLoading(true);
      let _driver: DriverType = currentDriver;
      if (_driver?.driverId) {
        // Update
        await driverService.update(driverFormValue);
        !isEmpty(vehiclesPrepareDelete.current) &&
          (await handleDeleteVehicles(vehiclesPrepareDelete.current));

        hasEditVehicle.current &&
          (await handleUpdateVehicles(
            driverFormValue.vehicles,
            _driver.driverId,
          ));
      } else {
        // Create new
        driverFormValue.driverStatus = 'inactive';
        const res = await driverService.create(driverFormValue);
        _driver = res.data;
      }

      formValues.avatar &&
        (await uploadProfileAvatar(
          (formValues.avatar as UploadFile).originFileObj,
          _driver.driverId,
        ));

      notification.success({
        message: buildMessage({
          isCreate: !_driver?.driverId,
          name: formValues.lastName,
        }),
      });

      handleClose();
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentDriver]);

  const handleDeleteVehicles = useCallback(async (vehicles: string[]) => {
    try {
      await Promise.all(
        vehicles.map(vehicleId => vehicleService.deleteVehicle(vehicleId)),
      );
    } catch (error) {
      throw error;
    }
  }, []);

  const handleUpdateVehicles = useCallback(
    async (vehicles: VehicleType[] = [], driverId: string) => {
      try {
        // Create
        await Promise.all<any>([
          ...vehicles
            .filter(item => !item.vehicleId)
            .map(vehicle => driverService.addVehicle(driverId, vehicle)),
          ...vehicles
            .filter(item => item.vehicleId)
            .map(vehicle => vehicleService.updateVehicle(vehicle)),
        ]);
      } catch (error) {
        throw error;
      }
    },
    [currentDriver],
  );

  const uploadProfileAvatar = async (file: File, driverId: string) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const data = new FormData();
      data.append('file', file);
      await driverService.updateProfileImage(driverId, data);
    } catch (error) {
      throw error;
    }
  };

  const title =
    isEditing && currentDriver
      ? 'Edit driver'
      : currentDriver
      ? 'Driver info'
      : 'Create a new driver';

  const readOnly = !isEditing;

  const onValuesChange = (formInput: DriverType) => {
    if (!hasEditVehicle.current && !isEmpty(formInput.vehicles)) {
      hasEditVehicle.current = true;
    }
  };

  const onChangeVehicleStatus = useCallback(
    (fieldIndex: number) => {
      const currentVehicle = getVehicleByIndex(fieldIndex);
      if (currentVehicle.status === 'inactive') return;

      const vehicles = form.getFieldValue('vehicles') as VehicleType[];
      form.setFieldsValue({
        vehicles: vehicles.map((item, idx) => ({
          ...item,
          status: fieldIndex === idx ? 'active' : 'inactive',
        })),
      });
    },
    [form],
  );

  const getVehicleByIndex = (
    fieldIndex: number,
  ): VehicleType | Partial<VehicleType> =>
    form.getFieldValue(['vehicles', fieldIndex]) || {
      status: 'inactive',
    };

  const renderDriverStatus = useMemo(() => {
    return currentDriver ? (
      currentDriver.isBusy ? (
        <Tag
          color="error"
          className="text-capitalize"
          icon={<ClockCircleOutlined />}
        >
          <Typography.Text style={{ color: 'currentcolor' }} strong>
            Busy
          </Typography.Text>
        </Tag>
      ) : (
        <Tag
          color={currentDriver.driverStatus === 'active' ? 'green' : 'red'}
          className="text-capitalize"
        >
          {currentDriver.driverStatus}
        </Tag>
      )
    ) : null;
  }, [currentDriver]);

  return (
    <div className="driver-edit">
      <Drawer
        title={title}
        width={500}
        visible={visible}
        onClose={handleClose}
        footer={
          <Space size={16}>
            {isEditing && (
              <Popconfirm
                title="Discard changes made in the profile information?"
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
                {currentDriver?.driverId ? 'Update driver' : 'Add driver'}
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
          layout="vertical"
          hideRequiredMark
          scrollToFirstError
          validateMessages={validateMessages}
          onValuesChange={onValuesChange}
        >
          <Form.Item name="driverId" className="driver-edit__hidden" noStyle>
            <Input hidden />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues: DriverType, currentValues: DriverType) =>
              prevValues.driverProfile?.picture !==
              currentValues.driverProfile?.picture
            }
          >
            {({ getFieldValue }) => (
              <Form.Item
                name="avatar"
                valuePropName="fileList"
                className="driver-edit__upload mb-2"
                getValueFromEvent={normFile}
              >
                <CommonUpload
                  imgSrc={getFieldValue(['driverProfile', 'picture'])}
                  disabled={readOnly}
                />
              </Form.Item>
            )}
          </Form.Item>

          <Card className="mb-2" size="small">
            {currentDriver && currentDriver.driverStatus && (
              <Row align="middle" justify="space-between" className="mb-1">
                <Text>Driver Status</Text>
                {renderDriverStatus}
              </Row>
            )}
            <Row align="middle" justify="space-between">
              <Text>System Status</Text>
              <Form.Item
                valuePropName={
                  currentDriver && currentDriver.status === 'active'
                    ? 'checked'
                    : ''
                }
                name="status"
                className="mb-0"
              >
                <Switch
                  disabled={readOnly}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>
            </Row>
          </Card>

          <Title level={5}>PROFILE</Title>
          <Form.Item
            name="driverGroup"
            label="Driver Group"
            rules={[{ required: true }]}
          >
            <Select placeholder="Driver Group" allowClear disabled={readOnly}>
              {DriverGroup.map((item, idx) => (
                <Option key={idx} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {currentDriver && (
            <Form.Item name="referralDriverId" label="Referral Driver">
              <Input placeholder="Referral Driver" disabled />
            </Form.Item>
          )}

          <Form.Item
            name="firstName"
            label="First Name"
            rules={[
              {
                required: true,
                pattern: NameRegexValidate,
                message: `Only alphabets are allowed and ., -, and '`,
              },
            ]}
          >
            <Input disabled={readOnly} placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="middleName"
            label="Middle Name"
            rules={[
              {
                pattern: NameRegexValidate,
                message: `Only alphabets are allowed and ., -, and '`,
              },
            ]}
          >
            <Input disabled={readOnly} placeholder="Middle Name (optional)" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[
              {
                required: true,
                pattern: NameRegexValidate,
                message: `Only alphabets are allowed and ., -, and '`,
              },
            ]}
          >
            <Input disabled={readOnly} placeholder="Last Name" />
          </Form.Item>

          <Title level={5}>CONTACT DETAILS</Title>
          <Form.Item
            name="phoneNumber"
            label="Mobile Number"
            rules={[
              {
                validator: (_, values: string) => phoneValidator(values),
                validateTrigger: 'onSubmit',
              },
            ]}
          >
            <PhoneNumber
              placeholder="Mobile Number"
              maxLength={10}
              disabled={!!currentDriver}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              {
                type: 'email',
                message: 'Email address is invalid',
                validateTrigger: 'onSubmit',
                pattern: EmailValidate,
              },
            ]}
          >
            <Input
              disabled={readOnly}
              placeholder="Email Address"
              type="email"
            />
          </Form.Item>

          <Title level={5}>ADDRESS</Title>
          <Form.Item name="province" label="Province">
            <Input disabled={readOnly} placeholder="Province" />
          </Form.Item>
          <Form.Item name="city" label="City">
            <Input disabled={readOnly} placeholder="City" />
          </Form.Item>
          <Form.Item name="address" label="Street, House No., Barangay">
            <Input
              disabled={readOnly}
              placeholder="Street, House No., Barangay"
            />
          </Form.Item>

          <Title level={5}>DELIVERY DETAILS</Title>
          <Form.Item name="deliveryCluster" label="Cluster">
            <Input disabled={readOnly} placeholder="Cluster" />
          </Form.Item>
          <Form.Item name="deliveryCity" label="City">
            <Input disabled={readOnly} placeholder="City" />
          </Form.Item>
          <Form.Item name="deliveryArea" label="Area">
            <Input disabled={readOnly} placeholder="Area" />
          </Form.Item>

          <Title level={5}>REGISTERED VEHICLE</Title>
          <Form.Item
            name="licenseRestriction"
            label="Driver's License Restriction"
            rules={[{ required: true }]}
          >
            <Input
              disabled={readOnly}
              placeholder="Driver's License Restriction"
            />
          </Form.Item>

          <Card
            size="small"
            className={classNames(
              isEmpty(currentDriver?.vehicles) && !isEditing && 'hide',
            )}
          >
            <Form.List name="vehicles">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, fieldIndex) => (
                    <div key={field.key}>
                      <Typography.Link>
                        {' '}
                        Vehicle {fieldIndex + 1}{' '}
                      </Typography.Link>
                      <Form.Item
                        name={[field.name, 'vehicleId']}
                        className="driver-edit__hidden"
                      >
                        <Input hidden />
                      </Form.Item>

                      <Row justify="space-between" align="middle" gutter={20}>
                        <Col sm={{ span: 24 }} md={{ span: 12 }}>
                          <Form.Item
                            name={[field.name, 'vehicleType']}
                            label="Vehicle Type"
                            rules={[{ required: true }]}
                            style={{ flexGrow: 1 }}
                          >
                            <Select
                              placeholder="Select Vehicle Type"
                              allowClear
                              disabled={readOnly}
                              options={VehicleTypes}
                            />
                          </Form.Item>
                        </Col>
                        <Col sm={{ span: 24 }} md={{ span: 12 }}>
                          <Form.Item
                            name={[field.name, 'status']}
                            label="Status"
                            rules={[{ required: true }]}
                          >
                            <Select
                              placeholder="Status"
                              allowClear
                              disabled={
                                readOnly ||
                                getVehicleByIndex(fieldIndex).status ===
                                  'active'
                              }
                              onChange={() => onChangeVehicleStatus(fieldIndex)}
                            >
                              <Option value="active">Active</Option>
                              <Option value="inactive">Inactive</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col sm={{ span: 24 }} md={{ span: 12 }}>
                          <Form.Item
                            name={[field.name, 'vehicleModel']}
                            label="Vehicle Model"
                            rules={[{ required: true }]}
                            className="mb-0"
                          >
                            <Input
                              disabled={readOnly}
                              placeholder="Vehicle Model"
                            />
                          </Form.Item>
                        </Col>
                        <Col sm={{ span: 24 }} md={{ span: 12 }}>
                          <Form.Item
                            name={[field.name, 'registeredPlateNumber']}
                            label="Registered Plate Number"
                            rules={[{ required: true }]}
                            className="mb-0"
                          >
                            <Input
                              disabled={readOnly}
                              placeholder="Registered Plate Number"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {fields.length > 1 && !readOnly ? (
                        <Popconfirm
                          placement="left"
                          title="Are you sure?"
                          okType="danger"
                          cancelText="No"
                          okText="Delete"
                          onConfirm={() => {
                            const { vehicleId } = getVehicleByIndex(fieldIndex);
                            !!vehicleId &&
                              vehiclesPrepareDelete.current.push(vehicleId);
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
                  {!readOnly && (
                    <Button
                      ghost
                      className="mb-1"
                      type="primary"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      disabled={readOnly}
                    >
                      Add vehicle
                    </Button>
                  )}
                </>
              )}
            </Form.List>
          </Card>
          {!isEmpty(currentDriver?.driverDocuments) && (
            <>
              <Title level={5} className="mt-2">
                DRIVER DOCUMENTS
              </Title>
              <List
                size="small"
                bordered
                dataSource={currentDriver?.driverDocuments}
                renderItem={item => (
                  <List.Item
                    className="driver-edit__doc-item"
                    onClick={() => window.open(item.filePath, '_blank')}
                  >
                    <span>{removeSnakeCase(item.docType)}</span>
                    <LinkOutlined />
                  </List.Item>
                )}
              />
            </>
          )}
        </Form>
      </Drawer>
    </div>
  );
};
