import { Button, ButtonProps } from 'antd';
import classNames from 'classnames';
import './index.scss';

export const GreenButton: React.FC<ButtonProps> = props => (
  <Button {...props} className={classNames('green-button', props.className)}>
    {props.children}
  </Button>
);
