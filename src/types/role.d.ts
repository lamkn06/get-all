import { UserType } from 'types';

export interface RoleType {
  id: string;
  name: string;
  status: string;

  isDefault: boolean;
  roleAccesses: RoleAccesses[];
  createdByUserId: string;
  user?: UserType;

  createdAt: Date;
  updatedAt: Date;

  access?: {
    key: string;
    defaultValue: string[];
  };
}

export interface RoleAccesses {
  moduleId: string;
  key: string;
  module: {
    key: string;
  };
  canApprove: boolean;
  canArchive: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canList: boolean;
}

export interface RoleAccessesRequest {
  key: string;
  info: {
    canApprove: boolean;
    canArchive: boolean;
    canCreate: boolean;
    canDelete: boolean;
    canEdit: boolean;
    canList: boolean;
  };
}
