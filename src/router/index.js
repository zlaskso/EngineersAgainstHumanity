import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Start',
      component: StartView
    },
      {
      path: '/poll/:id',
      name: 'PollView',
      component: () => import('../views/PollView.vue')
    },
    {
      path: '/lobby/:id',
      name: 'LobbyView',
      component: () => import('../views/LobbyView.vue')
    },
    {
      path: '/create/',
      name: 'CreateRulesView',
      component: () => import('../views/CreateRulesView.vue')
    },
    {
      path: '/result/:id',
      name: 'ResultView',
      component: () => import('../views/ResultView.vue')
    },
    {
      path: '/about/',
      name: 'About',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/join/',
      name: 'Join',
      component: () => import('../views/JoinView.vue')
    },
    {
      path: '/cards/:id',
      name: 'CardView',
      component: () => import('../views/WhiteCardView.vue')
    },
    {
      path: '/black/:id',
      name: 'BlackCardView',
      component: () => import('../views/BlackCardView.vue')
    },
      {
      path: '/vote/:id',
      name: 'VoteView',
      component: () => import('../views/VoteView.vue')
    },
    {
      path: '/final/:id',
      name: 'FinalView',
      component: () => import('../views/HostFinalView.vue')
    },
    {
     path: '/end/:id',
      name: 'EndView',
      component: () => import('../views/PlayerEndView.vue')
    }
  ]
})

export default router
