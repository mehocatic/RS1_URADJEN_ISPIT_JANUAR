import { BasePagedQuery } from '../../core/models/paging/base-paged-query';
import { PageResult } from '../../core/models/paging/page-result';

// === ENUMS ===
export enum DelivererType {
  External = 0,
  Internal = 1,
  Freelancer = 2
}

// === QUERIES (READ) ===
export class ListDeliverersRequest extends BasePagedQuery {
  search?: string | null;
}

export interface ListDeliverersQueryDto {
  id: number;
  name: string;
  type: DelivererType;
  code: string;
  isActive: boolean;
}

export interface GetDelivererByIdQueryDto {
  id: number;
  name: string;
  type: DelivererType;
  code: string;
  isActive: boolean;
}

export type ListDeliverersResponse = PageResult<ListDeliverersQueryDto>;

// === COMMANDS (WRITE) ===
export interface CreateDelivererCommand {
  name: string;
  type: DelivererType;
  code: string;
  isActive: boolean;
}

export interface UpdateDelivererCommand {
  name: string;
  type: DelivererType;
  code: string;
  isActive: boolean;
}
