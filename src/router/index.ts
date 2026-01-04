import {createRouter, createWebHistory} from 'vue-router'
import StartupUpdateView from '@/views/StartupUpdateView.vue'

const routes = [
	// ---------------------------------------------------------
	// #region Main Routes
	// ---------------------------------------------------------
	{
		path: '/',
		name: 'Home',
		component: StartupUpdateView,
	},
	{
		path: '/Database',
		name: 'Database',
		component: () => import('../views/DatabaseView.vue'),
	},

	{
		path: '/Archetypes',
		name: 'Archetypes',
		component: () => import('../views/ArchetypeListView.vue'),
	},
	{
		path: '/Sets',
		name: 'Sets',
		component: () => import('../views/DefaultView.vue'),
	},
	{
		path: '/Collection',
		name: 'Collection',
		component: () => import('../views/CollectionView.vue'),
	},
	{
		path: '/Decks',
		name: 'Decks',
		component: () => import('../views/DeckList.vue'),
	},
	{
		path: '/Lists',
		name: 'Lists',
		component: () => import('../views/CardListsView.vue'),
	},
	{
		path: '/Banlist',
		name: 'Banlist',
		component: () => import('../views/BanlistView.vue'),
	},

	// #endregion
	// ---------------------------------------------------------
	// #region Option Routes
	// ---------------------------------------------------------
	{
		path: '/About',
		name: 'About',
		component: () => import('../views/DefaultView.vue'),
	},
	{
		path: '/Settings',
		name: 'Settings',
		component: () => import('../views/debug/APITest.vue'),
	},
	// #endregion
	// ---------------------------------------------------------
	// #region Debug Routes
	// ---------------------------------------------------------
	{
		path: '/debug/theme-preview',
		name: 'Debug/ThemePreview',
		component: () => import('../views/debug/ThemePreview.vue'),
	},
	// #endregion
	// ---------------------------------------------------------
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
