export enum SortBy {
  Title = "title",
  Date = "date",
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export interface CBQueryParams {
  search?: string;
  skip?: number;
  limit?: number;
  sort_by?: SortBy;
  sort_order?: SortOrder;
}
