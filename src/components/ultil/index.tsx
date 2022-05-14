import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, ModalFuncProps, Typography } from 'antd';

export const showConfirm = (props: ModalFuncProps) => {
  Modal.confirm({
    icon: <ExclamationCircleOutlined />,
    content: (
      <Typography.Text type="warning">
        Note: You cannot undo this action
      </Typography.Text>
    ),
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    centered: true,
    ...props,
  });
};
