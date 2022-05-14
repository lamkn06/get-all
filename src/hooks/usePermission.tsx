import { useEffect, useState } from 'react';
import { MODULES } from 'constants/index';
import { useAppSelector } from 'hooks/app-hooks';

export const usePermissions = ({ module }: { module: `${MODULES}` }) => {
  const { role } = useAppSelector(state => state.user);
  const [permission, setPermission] = useState({
    canArchive: false,
    canCreate: false,
    canDelete: false,
    canEdit: false,
    canList: false,
    canApprove: false,
  });
  useEffect(() => {
    if (role && module) {
      const rolePermission = role.roleAccesses.find(
        access => access.module.key === module,
      );
      if (rolePermission) setPermission(rolePermission);
    }
  }, [role, module]);

  return { ...permission };
};
