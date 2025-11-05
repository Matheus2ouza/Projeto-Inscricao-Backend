export type FindAllNamesUserRequest = {
  role?: string;
};

export type FindAllNamesUserResponse = {
  id: string;
  username: string;
  role: string;
}[];
