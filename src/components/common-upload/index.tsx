import { PlusOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import classNames from 'classnames';
import { getBase64 } from 'helpers';
import { checkValidFile } from 'helpers/component.helper';
import { useEffect, useMemo, useState } from 'react';
import './index.scss';

interface Props {
  imgSrc?: string;
  className?: string;
  disabled?: boolean;
  onChange?: (info: UploadChangeParam) => void;
}

export const CommonUpload: React.FC<Props> = ({
  imgSrc,
  className,
  disabled,
  onChange,
}) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    setImageUrl(imgSrc);
  }, [imgSrc]);

  const uploadButton = useMemo(
    () => (
      <div>
        <PlusOutlined />
        <div>Upload</div>
      </div>
    ),
    [],
  );

  const onChangeUpload = async (info: UploadChangeParam) => {
    try {
      const _file = info.file as RcFile;
      if (checkValidFile(_file)) {
        getBase64(_file, (imageUrl: string) => {
          setImageUrl(imageUrl);
        });
        onChange(info);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Upload
      className={classNames('common-upload', className)}
      listType="picture-card"
      showUploadList={false}
      beforeUpload={() => false}
      onChange={onChangeUpload}
      accept=".jpg,.jpeg,.png"
      disabled={disabled}
      maxCount={1}
    >
      {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
    </Upload>
  );
};
