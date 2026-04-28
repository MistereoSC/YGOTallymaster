import {createRouter, createWebHashHistory} from 'vue-router'
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
		path: '/Decks',
		name: 'Decks',
		component: () => import('../views/DeckListView.vue'),
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
	{
		path: '/Releases',
		name: 'Releases',
		component: () => import('../views/ReleasesView.vue'),
	},
	{
		path: '/Statistics',
		name: 'Statistics',
		component: () => import('../views/OwnedStatsView.vue'),
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
		component: () => import('../views/SettingsView.vue'),
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
	history: createWebHashHistory(),
	routes,
})

export default router
