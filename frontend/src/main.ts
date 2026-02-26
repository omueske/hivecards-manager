import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles.css'
import './api'
import i18n from './i18n'
import { setToken, clearToken } from './auth/token'
import { scheduleRefresh } from './auth/tokenRefresh'
import { Quasar, Notify, ClosePopup,
	QLayout, QHeader, QFooter, QToolbar, QToolbarTitle, QPageContainer, QPage, QBtn, QBtnToggle, QSpace,
	QCard, QCardSection, QCardActions, QForm, QInput, QSelect, QDialog, QSpinner, QDate, QPopupProxy,
	QSeparator, QTooltip, QTabs, QTab, QRouteTab, QIcon,
	QTimeline, QTimelineEntry, QToggle, QBadge, QTable, QTd, QAvatar, QChip,
	QCheckbox, QItem, QItemSection
} from 'quasar'
import 'quasar/dist/quasar.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Quasar, {
	plugins: { Notify },
	directives: { ClosePopup },
	components: {
		QLayout, QHeader, QFooter, QToolbar, QToolbarTitle, QPageContainer, QPage, QBtn, QBtnToggle, QSpace,
		QCard, QCardSection, QCardActions, QForm, QInput, QSelect, QDialog, QSpinner, QDate, QPopupProxy,
		QSeparator, QTooltip, QTabs, QTab, QRouteTab, QIcon,
		QTimeline, QTimelineEntry, QToggle, QBadge, QTable, QTd, QAvatar, QChip,
		QCheckbox, QItem, QItemSection
	}
})
app.use(i18n)

async function trySilentRefresh() {
	// Only attempt silent refresh if we know a refresh cookie was previously issued
	const hasRefresh = localStorage.getItem('hc_has_refresh') === '1'
	if (!hasRefresh) return
	try {
		const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000'
		const resp = await fetch(base + '/api/v1/auth/refresh', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
		})
		if (!resp.ok) {
			clearToken()
			localStorage.removeItem('hc_has_refresh')
			return
		}
		const body = await resp.json()
		if (body && body.accessToken) {
			setToken(body.accessToken)
			scheduleRefresh(body.accessToken)
		} else {
			clearToken()
			localStorage.removeItem('hc_has_refresh')
		}
	} catch {
		clearToken()
		localStorage.removeItem('hc_has_refresh')
	}
}

async function boot() {
	await trySilentRefresh()
	app.mount('#app')
}

boot()
