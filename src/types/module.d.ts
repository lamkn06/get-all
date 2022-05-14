export interface ModuleType {
  id: string;
  key: string;
  rolesList: string[];
  accesses?: string[];

  createdAt: Date;
  updatedAt: Date;
}
