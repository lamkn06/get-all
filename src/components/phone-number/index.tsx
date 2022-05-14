import { Input, InputProps } from 'antd';
import { PhoneNumberPrefix } from 'constants/index';
import { ChangeEvent, useCallback, useEffect } from 'react';

const regex = new RegExp(`\\${PhoneNumberPrefix}`, 'g');

export const PhoneNumber: React.FC<InputProps> = ({ onChange, ...props }) => {
  useEffect(() => {
    props.value && onChange(`${props.value}`.replace(regex, '') as any);
  }, [props.value]);

  const onChangeInput = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      onChange(ev.target.value.replace(/[^0-9]/g, '') as any);
    },
    [onChange],
  );

  return <Input {...props} addonBefore={'+63'} onChange={onChangeInput} />;
};
