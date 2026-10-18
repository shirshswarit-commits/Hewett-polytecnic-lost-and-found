import { useEffect, useState } from 'react'
import './App.css'
import Nav from './assets/Components/Nav/Nav'
import SPanel from './assets/Components/SidePanel/SidePanel'
import Foot from './assets/Components/Footer/Footer'
import Home from './assets/Components/Home/Home'
import Login from './assets/Components/Login/Login'
import Theme from './assets/Components/Theme/Theme'
import ReportItem from './assets/Components/ReportItem/ReportItem'
import { createItem, fetchItems } from './api'

const getLuminance = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16)
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  const linear = channels.map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

const getThemeTextColor = (hex) => getLuminance(hex) > 0.179 ? '#172033' : '#ffffff'

const mixColors = (color, base, colorWeight) => {
  const colorValue = Number.parseInt(color.slice(1), 16)
  const baseValue = Number.parseInt(base.slice(1), 16)
  const channels = [16, 8, 0].map((shift) => {
    const first = (colorValue >> shift) & 255
    const second = (baseValue >> shift) & 255
    return Math.round(first * colorWeight + second * (1 - colorWeight))
  })

  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

const getReadablePanel = (hex) => {
  let weight = 1
  let panelColor = hex

  while (getLuminance(panelColor) > 0.179 && weight > 0.2) {
    weight -= 0.05
    panelColor = mixColors(hex, '#101827', weight)
  }

  return panelColor
}

const readStoredAuth = () => {
  try {
    const savedAuth = window.localStorage.getItem('hewett-auth') || window.sessionStorage.getItem('hewett-auth')
    const auth = savedAuth ? JSON.parse(savedAuth) : null
    return auth?.token ? auth : null
  } catch {
    return null
  }
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [auth, setAuth] = useState(readStoredAuth)
  const [pendingPage, setPendingPage] = useState('home')
  const [items, setItems] = useState([])
  const [itemsReady, setItemsReady] = useState(false)
  const [itemsError, setItemsError] = useState('')
  const [themeColor, setThemeColor] = useState(() => {
    const savedColor = window.localStorage.getItem('hewett-theme-color')
    return /^#[\da-f]{6}$/i.test(savedColor || '') ? savedColor : '#56375f'
  })
  useEffect(() => {
    window.localStorage.setItem('hewett-theme-color', themeColor)
  }, [themeColor])

  useEffect(() => {
    let isActive = true
    fetchItems()
      .then(({ items: loadedItems }) => {
        if (isActive) setItems(loadedItems)
      })
      .catch((error) => {
        if (isActive) setItemsError(`Could not load reported items: ${error.message}`)
      })
      .finally(() => {
        if (isActive) setItemsReady(true)
      })
    return () => {
      isActive = false
    }
  }, [])

  const openReport = () => {
    if (!auth?.token) {
      setPendingPage('report')
      setActivePage('login')
      return
    }
    setActivePage('report')
  }

  const handleAuthenticated = (session, remember) => {
    const authState = { token: session.token, user: session.user }
    setAuth(authState)
    setActivePage(pendingPage)
    try {
      window.localStorage.removeItem('hewett-auth')
      window.sessionStorage.removeItem('hewett-auth')
      const storage = remember ? window.localStorage : window.sessionStorage
      storage.setItem('hewett-auth', JSON.stringify(authState))
    } catch (error) {
      setItemsError(`Could not save your sign-in session: ${error.message}`)
    }
  }

  const submitItem = async (item, token) => {
    const { item: createdItem } = await createItem(item, token)
    setItems((currentItems) => [createdItem, ...currentItems])
    setActivePage('home')
    return createdItem
  }

  const logout = () => {
    setAuth(null)
    setActivePage('home')
    window.localStorage.removeItem('hewett-auth')
    window.sessionStorage.removeItem('hewett-auth')
  }

  const themeStyle = {
    '--theme-primary': themeColor,
    '--theme-on-primary': getThemeTextColor(themeColor),
    '--theme-panel': getReadablePanel(themeColor),
    '--theme-on-panel': getThemeTextColor(getReadablePanel(themeColor)),
    '--theme-accent-text': getReadablePanel(themeColor),
    '--theme-panel-muted': mixColors(
      getThemeTextColor(getReadablePanel(themeColor)),
      getReadablePanel(themeColor),
      0.72,
    ),
  }

  return (
    <div className="app-shell" style={themeStyle}>
      <SPanel
        onHome={() => setActivePage('home')}
        onLogin={() => setActivePage('login')}
        onTheme={() => setActivePage('theme')}
        onReport={openReport}
        onLogout={logout}
        isAuthenticated={Boolean(auth?.token)}
      />
      <div className="page-layout">
        <svg
          className="page-background-shape"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M1000 0H900C745 0 650 125 650 300V1000H1000Z" fill="var(--theme-panel)" />
        </svg>
        <Nav
          onHome={() => setActivePage('home')}
          onLogin={() => setActivePage('login')}
          onTheme={() => setActivePage('theme')}
          onReport={openReport}
          onLogout={logout}
          isAuthenticated={Boolean(auth?.token)}
        />
        <main className={`page-content ${activePage === 'login' ? 'page-content-login' : activePage === 'home' ? 'page-content-home' : activePage === 'theme' ? 'page-content-theme' : 'page-content-report'}`}>
          {activePage === 'login' ? (
            <Login
              auth={auth}
              onAuthenticated={handleAuthenticated}
              onLogout={logout}
            />
          ) : activePage === 'theme' ? (
            <Theme color={themeColor} onColorChange={setThemeColor} />
          ) : activePage === 'report' ? (
            <ReportItem
              token={auth?.token}
              onSubmit={submitItem}
            />
          ) : (
            <Home items={items} itemsReady={itemsReady} storageError={itemsError} onReport={openReport} />
          )}
        </main>
        {activePage !== 'login' && <Foot onReport={() => setActivePage('report')} />}
      </div>
    </div>
  )
}

export default App
