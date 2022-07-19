import { computed } from 'vue'
import NProgress from 'nprogress'

export const useRoute = (route: object = {}): object => {
  const { component, ...finalRoute } = route as any
  // meta
  finalRoute.meta = {
    ...(finalRoute as any).meta,
    hasPermission: computed(() => true),
  }
  // component
  if (typeof component === 'function') {
    finalRoute['component'] = () => {
      const result = component()
      if (typeof result === 'object' && typeof result.then === 'function') {
        NProgress.start()
        result.finally(() => {
          NProgress.done()
        })
      }
      return result
    }
  } else {
    finalRoute['component'] = component
  }
  return finalRoute
}

export const useRoutes = (routes: [object]) => {
  const iterateUseRoute = (route: any): any => {
    if (route.children?.length) {
      route.children = route.children.map((childRoute: any) => iterateUseRoute(childRoute))
    }
    return useRoute(route)
  }
  return routes.map(route => iterateUseRoute(route))
}