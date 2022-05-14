import { Input, InputProps } from 'antd';
import React, { ChangeEvent } from 'react';

export const AlphanumericInput: React.FC<InputProps> = ({
  onChange,
  ...props
}) => {
  const onChangeInput = (ev: ChangeEvent<HTMLInputElement>) =>
    onChange(ev.target.value.replace(/[^a-zA-Z0-9 -]/g, '') as any);
  return <Input {...props} onChange={onChangeInput} />;
};
