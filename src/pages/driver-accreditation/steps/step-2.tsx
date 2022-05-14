import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, message, Row, Upload } from 'antd';
import { RcFile, UploadChangeParam, UploadProps } from 'antd/lib/upload';
import classNames from 'classnames';
import { cleanObject } from 'helpers';
import { checkValidFile } from 'helpers/component.helper';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { validateMessages } from 'validators';
import { DocsProps } from './type';

const FormItem = Form.Item;
interface Props {
  goNext: ({ docs }: { docs: DocsProps }) => void;
  goPrev: ({ docs }: { docs: DocsProps }) => void;
  docs?: DocsProps;
}

export const Step2: React.FC<Props> = ({ goNext, goPrev, docs }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    // It fixes validation each upload input
    if (docs) {
      form.setFields([
        {
          name: 'copyOrCr',
          value: docs.copyOrCr || [],
        },
      ]);
      form.setFields([
        {
          name: 'copyDriverLicense',
          value: docs.copyDriverLicense || [],
        },
      ]);
      form.setFields([
        {
          name: 'barangayPolice',
          value: docs.barangayPolice || [],
        },
      ]);
      form.setFields([
        {
          name: 'selfieLicense',
          value: docs.selfieLicense || [],
        },
      ]);
      form.setFields([
        {
          name: 'photoPlateNumber',
          value: docs.photoPlateNumber || [],
        },
      ]);
      form.setFields([
        {
          name: 'vehicleInsurance',
          value: docs.vehicleInsurance || [],
        },
      ]);
      form.setFields([
        {
          name: 'notOwnedLetter',
          value: docs.notOwnedLetter || [],
        },
      ]);
      form.setFields([
        {
          name: 'deedSale',
          value: docs.deedSale || [],
        },
      ]);
      form.setFields([
        {
          name: 'vaccinationCard',
          value: docs.vaccinationCard || [],
        },
      ]);
    }
  }, [docs]);

  const onGoNext = async () => {
    try {
      const formValues = await form.validateFields();
      const docs: DocsProps = cleanObject(formValues);
      goNext({ docs });
    } catch (error) {
      throw error;
    }
  };

  const onGoPrev = () => {
    const docs: DocsProps = cleanObject(form.getFieldsValue());
    goPrev({ docs });
  };

  const gridLayout = {
    lg: { span: 8 },
    md: { span: 12 },
    xs: { span: 24 },
  };

  const uploadConfig: UploadProps = useMemo(
    () => ({
      maxCount: 1,
      beforeUpload: () => false,
      accept: '.jpg,.jpeg,.png,.pdf',
    }),
    [],
  );

  const normFile = (e: UploadChangeParam) => {
    if (!checkValidFile(e.file as RcFile, false)) {
      return [];
    }
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <>
      <Form form={form} layout="vertical" validateMessages={validateMessages}>
        <Card className="accreditation__card">
          <Row gutter={[40, 4]}>
            <Col {...gridLayout}>
              <FormItem
                name="copyOrCr"
                valuePropName="fileList"
                className={classNames(
                  'text-center',
                  docs?.copyOrCr && 'form-success',
                )}
                getValueFromEvent={normFile}
                rules={[{ required: true, message: 'Copy or CR is required!' }]}
              >
                <Upload {...uploadConfig}>
                  <Button
                    type="dashed"
                    icon={<UploadOutlined />}
                    className="accreditation__upload-btn"
                  >
                    Copy or CR
                  </Button>
                </Upload>
              </FormItem>
            </Col>

            <Col {...gridLayout}>
              <FormItem
                name="copyDriverLicense"
                valuePropName="fileList"
                className={classNames(
                  'text-center',
                  docs?.copyDriverLicense && 'form-success',
                )}
                getValueFromEvent={normFile}
                rules={[
                  {
                    required: true,
                    message: 'Copy Driver License is required!',
                  },
                ]}
              >
                <Upload {...uploadConfig}>
                  <Button
                    type="dashed"
                    icon={<UploadOutlined />}
                    className="accreditation__upload-btn"
                  >
                    Copy Driver License
                  </Button>
                </Upload>
              </FormItem>
            </Col>
            <Col {...gridLayout}>
              <FormItem
                name="barangayPolice"
                valuePropName="fileList"
                className={classNames(
                  'text-center',
                  docs?.barangayPolice && 'form-success',
                )}
                getValueFromEvent={normFile}
                rules={[
                  {
                    required: true,
                    message: 'Barangay Police NBI Clearance is required!',
                  },
                ]}
              >
                <Upload {...uploadConfig}>
                  <Button
                    type="dashed"
                    icon={<UploadOutlined />}
                    className="accreditation__upload-btn"
                  >
                    Barangay Police NBI Clearance
                  </Button>
                </Upload>
              </FormItem>
            </Col>
            <Col {...gridLayout}>
              <FormItem
                name="selfieLicense"
                valuePropName="fileList"
                className={classNames(
                  'text-center',
                  docs?.selfieLicense && 'form-success',
                )}
                getValueFromEvent={normFile}
                rules={[
                  {
                    required: true,
                    message: 'Selfie Holding License is required!',
                  },
                ]}
              >
                <Upload {...uploadConfig}>
                  <Button
                    type="dashed"
                    icon={<UploadOutlined />}
                    className="accreditation__upload-btn"
                  >
                    Selfie Holding License
                  </Button>
                </Upload>
              </FormItem>
            </Col>
            <Col {...gridLayout}>
              <FormItem
                name="photoPlateNumber"
                valuePropName="fileList"
                className={classNames(
                  'text-center',
                  docs?.photoPlateNumber && 'form-success',
                )}
                getValueFromEvent={normFile}
                rules={[
                  { required: true, message: 'Plate Number is required!' },
                ]}
              >
                <Upload {...uploadConfig}>
                  <Button
                    type="dashed"
                    icon={<UploadOutlined />}
                    className="accreditation__upload-btn"
                  >
                    Photo Vehicle Showing Plate Number
                  </Button>
                </Upload>
              </FormItem>
            </Col>
            <Col {...gridLayout}>
              <FormItem
                name="vehicleInsurance"
                valuePropName="fileList"
                className={classNames(
                  'text-center',
                  docs?.vehicleInsurance && 'form-success',
                )}
                getValueFromEvent={normFile}
                rules={[
                  {
                    required: true,
                    message: 'Vehicle Insurance is required!',
                  },
                ]}
              >
                <Upload {...uploadConfig}>
                  <Button
                    type="dashed"
                    icon={<UploadOutlined />}
                    className="accreditation__upload-btn"
                  >
                    Vehicle Insurance
                  </Button>
                </Upload>
              </FormItem>
            </Col>
            <Col {...gridLayout}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.deedSale !== currentValues.deedSale
                }
              >
                {({ getFieldValue }) => {
                  return (
                    <FormItem
                      name="notOwnedLetter"
                      valuePropName="fileList"
                      className={classNames(
                        'text-center',
                        docs?.notOwnedLetter && 'form-success',
                      )}
                      getValueFromEvent={normFile}
                      rules={[
                        {
                          required: isEmpty(getFieldValue('deedSale')),
                          message:
                            'Not Owned Vehicle Authorization Letter is required!',
                        },
                      ]}
                    >
                      <Upload {...uploadConfig}>
                        <Button
                          type="dashed"
                          icon={<UploadOutlined />}
                          className="accreditation__upload-btn"
                        >
                          Not Owned Vehicle Authorization Letter
                        </Button>
                      </Upload>
                    </FormItem>
                  );
                }}
              </Form.Item>
            </Col>

            <Col {...gridLayout}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.notOwnedLetter !== currentValues.notOwnedLetter
                }
              >
                {({ getFieldValue }) => {
                  return (
                    <FormItem
                      name="deedSale"
                      valuePropName="fileList"
                      className={classNames(
                        'text-center',
                        docs?.deedSale && 'form-success',
                      )}
                      getValueFromEvent={normFile}
                      rules={[
                        {
                          required: isEmpty(getFieldValue('notOwnedLetter')),
                          message:
                            'Deed Sale If Bought From Pre Owner is required!',
                        },
                      ]}
                    >
                      <Upload {...uploadConfig}>
                        <Button
                          type="dashed"
                          icon={<UploadOutlined />}
                          className="accreditation__upload-btn"
                        >
                          Deed Sale If Bought From Pre Owner
                        </Button>
                      </Upload>
                    </FormItem>
                  );
                }}
              </Form.Item>
            </Col>

            <Col {...gridLayout}>
              <FormItem
                name="vaccinationCard"
                valuePropName="fileList"
                className={classNames(
                  'text-center',
                  docs?.vaccinationCard && 'form-success',
                )}
                getValueFromEvent={normFile}
                rules={[
                  {
                    required: true,
                    message: 'Vaccination Card is required!',
                  },
                ]}
              >
                <Upload {...uploadConfig}>
                  <Button
                    type="dashed"
                    icon={<UploadOutlined />}
                    className="accreditation__upload-btn"
                  >
                    Vaccination Card
                  </Button>
                </Upload>
              </FormItem>
            </Col>
          </Row>
        </Card>
      </Form>
      <Row gutter={24} justify="space-between" className="px-2 mt-2">
        <Button onClick={onGoPrev}>Previous</Button>
        <Button onClick={onGoNext} type="primary">
          Next
        </Button>
      </Row>
    </>
  );
};
