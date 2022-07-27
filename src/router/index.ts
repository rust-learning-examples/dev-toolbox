// https://router.vuejs.org/zh/
import type { RouteRecord } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useRoutes } from '@/utils/hooks/useRoutes'
import auth from './auth'

const routes = useRoutes([
  { ...auth },
  {
    path: '/', redirect: '/home', component: () => import('@/views/index.vue'), children: [
      { path: '/home', name: 'home', meta: { title: '首页' }, component: () => import('@/views/home/index.vue') },
      { path: '/codeSpippets', name: 'codeSpippets', meta: { title: '代码段' }, component: () => import('@/views/codeSpippets/index.vue') },
      { path: '/httpProxy', name: 'httpProxy', meta: { title: 'http代理' }, component: () => import('@/views/httpProxy/index.vue') },
    ]
  },
])

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_APP_BASE_URL),
  routes,
})

const proxyRouter = new Proxy(router, {
  get(object, key, ...args) {
    if (key === 'getRoute') {
      return function(routeName: string): RouteRecord | undefined {
        const routes = object.getRoutes()
        return routes.find(route => route.name === routeName)
      }
    } else if (key === 'getParentRoute') {
      return function(route: RouteRecord): RouteRecord | undefined {
        const parentRouteName = (route.name as string)?.split('/').slice(0, -1).join('/')
        return parentRouteName ? (proxyRouter as any)['getRoute'](parentRouteName) : null
      }
    } else {
      return Reflect.get(object, key, ...args)
    }
  }
})

proxyRouter.beforeEach(async (to, from, next) => {
  // 如果存在孩子，重定向到孩子中有权限的页面
  const routeChildren = (proxyRouter as any).getRoute(to.name)?.children
  if (to.name && routeChildren?.length) {
    const findExistsPermissionRouteName = (children: [any]): any => {
      for (const child of (children || [])) {
        if (child.children?.length) {
          const findChildRoute = findExistsPermissionRouteName(child.children)
          if (findChildRoute) { return findChildRoute }
        } else if (child.meta.hasPermission.value) {
          return child
        }
      }
    }
    const findChildRoute = findExistsPermissionRouteName(routeChildren)
    if (findChildRoute) { return next({name: findChildRoute.name}) }
  }
  next()
})

proxyRouter.beforeResolve(async to => {
  return true
})

proxyRouter.afterEach(async (to, from) => {
  if (to.meta?.fullTitle) {
    document.title = to.meta.fullTitle as string
  } else if (to.meta?.title) {
    document.title = `dev-toolbox ${to.meta.title}`
  } else {
    document.title = `dev-toolbox`
  }
})

export default proxyRouter