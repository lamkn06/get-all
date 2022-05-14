import { Input, InputProps } from 'antd';
import React, { ChangeEvent } from 'react';

export const NumberInput: React.FC<InputProps> = ({ onChange, ...props }) => {
  const onChangeInput = (ev: ChangeEvent<HTMLInputElement>) =>
    onChange(ev.target.value.replace(/[^0-9.+]+/g, '') as any);
  return <Input {...props} onChange={onChangeInput} />;
};
