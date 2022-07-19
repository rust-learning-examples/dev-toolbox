// https://router.vuejs.org/zh/
import { createRouter, createWebHashHistory, RouteRecord } from 'vue-router'
import { useRoutes } from '@/utils/hooks/useRoutes'
import auth from './auth'

const routes = useRoutes([
  auth
])

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_APP_BASE_URL),
  routes,
})

const proxyRouter = new Proxy(router, {
  get(object, key, ...args) {
    if (key === 'getRoute') {
      return function(routeName: string): any {
        const routes = object.getRoutes()
        return routes.find(route => route.name === routeName)
      }
    } else if (key === 'getParentRoute') {
      return function(route: any): any {
        const parentRouteName = route.name?.split('/').slice(0, -1).join('/')
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
    document.title = to.meta?.fullTitle as string
  } else {
    const title = to.meta?.title
    document.title = `ts-vue - ${title}`
  }
})

export default proxyRouter