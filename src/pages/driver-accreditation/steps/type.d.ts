import { RcFile } from 'antd/lib/upload';

export type DocsType =
  | 'copyOrCr'
  | 'copyDriverLicense'
  | 'barangayPolice'
  | 'selfieLicense'
  | 'photoPlateNumber'
  | 'vehicleInsurance'
  | 'notOwnedLetter'
  | 'deedSale'
  | 'vaccinationCard';

export interface DocsProps {
  copyOrCr?: RcFile[];
  copyDriverLicense?: RcFile[];
  barangayPolice?: RcFile[];
  selfieLicense?: RcFile[];
  photoPlateNumber?: RcFile[];
  vehicleInsurance?: RcFile[];
  notOwnedLetter?: RcFile[];
  deedSale?: RcFile[];
  vaccinationCard?: RcFile[];
}
