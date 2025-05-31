const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('../paginas/IndexPage.vue') },
      {
        path: '/agendarEvento/:id?',
        name: 'agendarEvento',
        component: () => import('../paginas/agendarEvento.vue'),
      },
      {
        path: '/agendamentos',
        name: 'agendamentos',
        meta: { requiresAuth: true },
        component: () => import('../componentes/reunioesAgendadas.vue'),
      },
      {
        path: '/tarefasLembretes',
        name: 'tarefasLembretes',
        meta: { requiresAuth: true },
        component: () => import('../paginas/tarefasLembretes.vue'),
      },
      {
        path: '/login',
        name: 'login',
        component: () => import('../paginas/loginUsuario.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('../paginas/ErrorNotFound.vue'),
  },
]

export default routes
