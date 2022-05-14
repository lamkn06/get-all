import {
  SmileOutlined,
  SolutionOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Empty, notification, Spin, Steps } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Step1 } from 'pages/driver-accreditation/steps/step-1';
import { Step2 } from 'pages/driver-accreditation/steps/step-2';
import { Step3 } from 'pages/driver-accreditation/steps/step-3';
import { DocsProps } from 'pages/driver-accreditation/steps/type';
import { AccreditationsType } from 'types/accreditations';
import { PhoneNumberPrefix } from 'constants/index';
import driverService from 'api/driver.api';
import './index.scss';

const { Step } = Steps;

const Accreditation = () => {
  const { code } = useParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState(undefined);
  const [error, setError] = useState(undefined);

  const docsRef = useRef<DocsProps>({});

  useEffect(() => {
    if (code) {
      (async () => {
        try {
          const res = await driverService.getAccreditations(code);
          setDriver({ ...res.data, ...res.data.driverProfile });
        } catch (_) {
          setError(true);
        }
      })();
    }
  }, [code]);

  const next = async ({ driver }: Partial<{ driver: AccreditationsType }>) => {
    if (driver) {
      setDriver(driver);
    }
    setStep(oldVal => oldVal + 1);
  };

  const prev = async ({ docs }: { docs?: DocsProps }) => {
    if (docs) docsRef.current = docs;
    setStep(oldVal => oldVal - 1);
  };

  const renderForm = useCallback(() => {
    return step === 0 ? (
      <Step1 goNext={next} driver={driver} />
    ) : step === 1 ? (
      <Step2
        goNext={onSubmitAccreditation}
        goPrev={prev}
        docs={docsRef.current}
      />
    ) : (
      <Step3 />
    );
  }, [step, driver]);

  const onSubmitAccreditation = async ({ docs }) => {
    try {
      setLoading(true);
      const formData = new FormData();
      const _docs = docs;
      for (const key in _docs) {
        if (_docs[key]?.length) {
          switch (key) {
            case 'copyOrCr':
              formData.append('copy_or_cr', _docs[key][0].originFileObj);
              break;
            case 'copyDriverLicense':
              formData.append(
                'copy_driver_license',
                _docs[key][0].originFileObj,
              );
              break;
            case 'barangayPolice':
              formData.append(
                'barangay_police_nbi_clearance',
                _docs[key][0].originFileObj,
              );
              break;
            case 'selfieLicense':
              formData.append(
                'selfie_holding_license',
                _docs[key][0].originFileObj,
              );
              break;
            case 'photoPlateNumber':
              formData.append(
                'photo_vehicle_showing_plate_number',
                _docs[key][0].originFileObj,
              );
              break;
            case 'vehicleInsurance':
              formData.append('vehicle_insurance', _docs[key][0].originFileObj);
              break;
            case 'notOwnedLetter':
              formData.append(
                'not_owned_vehicle_authorization_letter',
                _docs[key][0].originFileObj,
              );
              break;
            case 'deedSale':
              formData.append(
                'deed_sale_if_bought_from_pre_owner',
                _docs[key][0].originFileObj,
              );
              break;
            case 'vaccinationCard':
              formData.append('vaccination_card', _docs[key][0].originFileObj);
              break;
            default:
              break;
          }
        }
      }

      await driverService.updateAccreditationsDocs(code, formData);

      await driverService.updateAccreditations(code, {
        ...driver,
        // Add prefix to phone
        phoneNumber: `${PhoneNumberPrefix}${driver.phoneNumber}`,
        emergencyContact: {
          ...driver.emergencyContact,
          contactPhone: `${PhoneNumberPrefix}${driver.emergencyContact.contactPhone}`,
        },
      });
      notification.success({ message: 'Accreditation submitted' });
      setStep(oldVal => oldVal + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (error)
    return (
      <Empty description={<h3>Sorry, the application is not accessible!</h3>} />
    );

  return (
    <div className="accreditation">
      <Spin
        spinning={!driver || loading}
        className="accreditation"
        tip="Loading ..."
      >
        <Steps current={step}>
          <Step
            status={step === 0 ? 'process' : step > 0 ? 'finish' : 'wait'}
            title="Information"
            icon={<UserOutlined />}
          />
          <Step
            status={step === 1 ? 'process' : step > 1 ? 'finish' : 'wait'}
            title="Documents"
            icon={<SolutionOutlined />}
          />
          <Step
            status={step === 2 ? 'finish' : 'wait'}
            title="Done"
            icon={<SmileOutlined />}
          />
        </Steps>
        {renderForm()}
      </Spin>
    </div>
  );
};

export default Accreditation;
