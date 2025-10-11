export type LoginUserRequest = {
  username: string;
  password: string;
};

export type LoginUserResponse = {
  authToken: string;
  refreshToken: string;
  user: User;
};

export type User = {
  id: string;
  role: string;
};
