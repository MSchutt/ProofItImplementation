import { createApp } from 'vue'
import router from './plugins/router'
import i18n from './plugins/i18n'
import config from './plugins/config'
import App from "./App.vue"
import {createPinia} from "pinia";
import Ethereum from "./plugins/Ethereum";
import './index.css'

// Setup App
const app = createApp(App)

app.use(i18n)
app.use(router)
app.use(createPinia())

// Global Ethereum instance
app.provide('eth', new Ethereum())

// Provide config to components
app.provide('config', config)

app.mount('#app')
