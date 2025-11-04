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
  username: string;
  role: string;
  email: string | null;
  region: Region | null;
  image: string | null;
};

export type Region = {
  id: string;
  Name: string;
};
