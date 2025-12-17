import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import Config from './libs/config'

createApp(App)
	.mount('#app')
	.$nextTick(() => {
		// Use contextBridge
		window.ipcRenderer.on('main-process-message', (_event, message) => {})
	})
console.log('App Data Path:', Config.Path.AppRoot())
