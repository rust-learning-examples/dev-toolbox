export interface AuthInfo {
  token?: string;
}

export interface UserInfo {
  name?: string;
}

export interface User {
  authInfo: AuthInfo | undefined | null;
  userInfo: UserInfo | undefined | null;
}