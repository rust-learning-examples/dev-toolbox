export default {
  path: '/auth',
  name: 'auth',
  // redirect: '/auth/login',
  component: () => import('@/views/auth/index.vue'),
  children: [
    { path: 'login', name: 'auth/login', component: () => import('@/views/auth/login.vue'), },
  ]
}