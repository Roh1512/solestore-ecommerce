export enum SortBy {
  Title = "title",
  Date = "date",
}

export enum AdminRole {
  ADMIN = "ADMIN",
  ORDER_MANAGER = "ORDER_MANAGER",
  PRODUCT_MANAGER = "PRODUCT_MANAGER",
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export enum SortByAdmin {
  username = "username",
  name = "name",
  email = "email",
  date = "date",
}

export interface CBQueryParams {
  search?: string;
  skip?: number;
  limit?: number;
  sort_by?: SortBy;
  sort_order?: SortOrder;
}

export interface AdminQueryParams {
  search?: string;
  skip?: number;
  limit?: number;
  sort_by?: SortByAdmin;
  sort_order?: SortOrder;
  role?: AdminRole;
}
