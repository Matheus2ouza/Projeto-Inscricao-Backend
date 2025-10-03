export type LoginUserRequest = {
  username: string;
  password: string;
};

export type LoginUserResponse = {
  authToken: string;
  refreshToken: string;
  role: string;
};
