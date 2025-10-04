export type FindAllPaginatedUsersRequest = {
  page?: string;
  pageSize?: string;
};

export type FindAllPaginatedUsersResponse = {
  users: {
    id: string;
    username: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    regionName: string | undefined;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
