/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/** Pagination parameters */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Test metadata attached to test results */
export interface TestMeta {
  severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
  feature: string;
  story?: string;
  owner?: string;
}
