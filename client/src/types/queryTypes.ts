export enum SortBy {
  TITLE = "title",
  DATE = "date",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export interface CBQueryParams {
  search?: string;
  skip?: number;
  limit?: number;
  sort_by?: SortBy;
  sort_order?: SortOrder;
}

export enum SortByProduct {
  PRICE = "price",
  DATE = "date",
}

export interface ProductQueryParams {
  search?: string;
  page?: number;
  sort_by?: SortByProduct;
  sort_order?: SortOrder;
  category?: string;
  brand?: string;
  size?: number;
}
