export class QueryDto {
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc';
  sortBy?: string;
  search?: string;
}
