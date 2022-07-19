/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

import {App as OriginalApp} from 'vue'
declare module 'vue' {
  export interface App extends OriginalApp {
    // custom properties
    render: (vnode: VNode | null, container: Element) => void;
  }
}


import {AxiosRequestConfig as OriginalAxiosRequestConfig} from 'axios'
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