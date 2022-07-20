/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

import type {App as OriginalApp} from 'vue'
declare module 'vue' {
  export interface App extends OriginalApp {
    // custom methods
    render: (vnode: VNode | null, container: Element) => void;
  }
}

import type {Router as OriginalRouter, RouteRecord} from 'axios'
declare module 'vue-router' {
  export interface Router extends OriginalRouter {
    // custom methods
    getRoute: (routeName: string) => RouteRecord;
  }
}


import type {AxiosRequestConfig as OriginalAxiosRequestConfig} from 'axios'
declare module 'axios' {
  export interface AxiosRequestConfig extends OriginalAxiosRequestConfig {
    // custom properties
    meta: {
      retry: number; /*times*/ retryDelay: number; /*ms*/  curRetry: number; /*times*/
      withProgressBar: boolean;
      requestKey?: string;
    }
  }
}