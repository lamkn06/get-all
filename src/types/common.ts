export interface ResType {
  results: any[];
  totalRecords: number;
  next: string;
  previous: null;
}

export interface TableBaseType {
  pageIndex: number;
  pageSize: number;
  total?: number;
  next?: string;
  previous?: null;
  filter?: Record<string, string | string[]>;
}

export const Status = ['active', 'inactive', 'pending'] as const;
export type StatusType = typeof Status[number];
export type ApprovalStatusType = 'pending' | 'approved' | 'rejected';

export type OrderProgressType =
  | 'pending'
  | 'assigned'
  | 'for_pickup'
  | 'picked_up'
  | 'on_going'
  | 'delivered'
  | 'canceled';

export type FoodOrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'for_delivery'
  | 'in_transit'
  | 'for_pickup'
  | 'picked_up'
  | 'delivered'
  | 'canceled';
