import { Avatar } from 'antd';
import './index.scss';

interface Props {
  firstName: string;
  fullName?: string;
  alt?: string;
  photoURL?: string;
}

export const LetterAvatar: React.FC<Props> = ({
  firstName,
  fullName,
  photoURL,
  alt,
}) => {
  const firstCharacter = firstName?.charAt(0);
  return (
    <div className="letter-avatar">
      <Avatar src={photoURL} alt={alt}>
        {firstCharacter}
      </Avatar>
      <span title={fullName} className="letter-avatar__name">
        {fullName?.trimEnd()}
      </span>
    </div>
  );
};
