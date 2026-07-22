export type FindAllPaginatedUsersRequest = {
  page?: string;
  pageSize?: string;
};

export type FindAllPaginatedUsersResponse = {
  users: User[];
  total: number;
  page: number;
  pageCount: number;
};

export type User = {
  id: string;
  username: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  regionName?: string;
};
