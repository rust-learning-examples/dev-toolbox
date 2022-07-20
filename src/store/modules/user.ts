import { defineStore } from 'pinia'

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

export const useUser = defineStore('user', {
  state: (): User => ({
    authInfo: undefined,
    userInfo: undefined,
  }),
  getters: {
    // isLogin(state) { this.authInfo !== null },
    isLogin: (state) => state.authInfo !== null,
  },
  actions: {
    setAuthInfo(authInfo: AuthInfo | undefined | null): void { this.authInfo = authInfo },
    setUserInfo(userInfo: UserInfo | undefined | null): void { this.userInfo = userInfo },
  },
  persist: {
    key: 'persist:userInfo',
    storage: window.localStorage,
    paths: ['authInfo'], // default all
  }
})