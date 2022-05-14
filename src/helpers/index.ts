/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prefer-const */
import { PATHS } from 'constants/paths';
import { OrderProgressType, FoodOrderStatus } from 'types';
import moment from 'moment';

export const serializeQuery = (obj: Record<string, any>) => {
  const recursive = (data: Record<string, any>): string[] => {
    return Object.entries(data).reduce((acc, [key, val]) => {
      if (Array.isArray(val)) {
        acc.push(val.map(item => `${key}[]=${item}`).join('&'));
      } else if (typeof val === 'object') {
        acc = [...acc, ...recursive(val)];
      } else {
        if (Boolean(val)) acc.push(`${key}=${encodeURIComponent(val)}`);
      }
      return acc;
    }, []);
  };
  const listParams = recursive(obj);
  return listParams.filter(Boolean).join('&').replace('&&', '&');
};

export const formatDateTime = (value?: string | Date) =>
  value
    ? moment.tz(new Date(value), 'Asia/Manila').format('MM-DD-y, hh:mm a')
    : ''; // moment.tz(new Date(value)).format('MM-DD-y, hh:mm a') : '';

export const isAccreditationPage = location.pathname.includes(
  PATHS.Accreditation.split('/')[1],
);

export const cleanObject = (obj: Record<string | number, any>) => {
  for (let propName in obj) {
    if ([undefined, null, ''].includes(obj[propName])) delete obj[propName];
  }
  return { ...obj };
};

export const getBase64 = (img: Blob, callback: Function) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

export const removeSnakeCase = (value: string) =>
  value ? `${value}`.replace(/_/g, ' ') : '';

export const checkAcceptedText = (
  string: OrderProgressType | FoodOrderStatus,
) => (string === 'picked_up' ? 'accepted' : string);

export const downloadCSVFile = (data: Blob) => {
  const url = window.URL.createObjectURL(new Blob(['\ufeff' + data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'drivers.csv'); //or any other extension
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const checkIsPercentage = (type: string) => type === 'percentage';

export const buildMessage = ({
  name,
  isCreate,
  isDelete,
}: {
  name: string;
  isCreate?: boolean;
  isDelete?: boolean;
}) => {
  return `${
    isDelete ? 'Delete' : isCreate ? 'Create' : 'Update'
  } ${name} successful!`;
};
