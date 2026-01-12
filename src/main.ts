import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import {vTooltip} from './directives/tooltip'

createApp(App)
	.directive('tooltip', vTooltip)
	.use(router)
	.mount('#app')
	.$nextTick(() => {
		// Use contextBridge
		window.ipcRenderer.on('main-process-message', (_event) => {})
	})
