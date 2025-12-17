import {createRouter, createWebHistory} from 'vue-router'
import DefaultView from '../views/DefaultView.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: DefaultView,
	},
	{
		path: '/debug/theme-preview',
		name: 'About',
		component: () => import('../views/debug/ThemePreview.vue'),
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
