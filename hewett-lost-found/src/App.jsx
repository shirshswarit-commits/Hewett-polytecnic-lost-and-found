import { useEffect, useState } from 'react'
import './App.css'
import Nav from './assets/Components/Nav/Nav'
import SPanel from './assets/Components/SidePanel/SidePanel'
import Foot from './assets/Components/Footer/Footer'
import Home from './assets/Components/Home/Home'
import Login from './assets/Components/Login/Login'
import Theme from './assets/Components/Theme/Theme'
import ReportItem from './assets/Components/ReportItem/ReportItem'
import Chat from './assets/Components/Chat/Chat'
import ItemDetail from './assets/Components/ItemDetail/ItemDetail'
import Profile from './assets/Components/Profile/Profile'
import Terms from './assets/Components/Terms/Terms'
import {
  createItem,
  deleteItem,
  fetchItem,
  fetchItems,
  fetchMyItems,
  startItemChat,
} from './api'

const readRecoveryToken = () => {
  const hash = window.location.hash.slice(1)
  const params = new URLSearchParams(hash)
  return params.get('type') === 'recovery' ? params.get('access_token') : ''
}

const hasAdminAccess = (user) => (
  user?.is_admin === true
  || user?.isAdmin === true
  || ['admin', 'administrator'].includes(
    String(user?.role || user?.app_metadata?.role || '').toLowerCase(),
  )
)

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
  const [recoveryToken, setRecoveryToken] = useState(readRecoveryToken)
  const [activePage, setActivePage] = useState(() => readRecoveryToken() ? 'reset-password' : 'home')
  const [auth, setAuth] = useState(readStoredAuth)
  const [pendingPage, setPendingPage] = useState('home')
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [itemDetailError, setItemDetailError] = useState('')
  const [selectedThreadId, setSelectedThreadId] = useState('')
  const [pendingChatItem, setPendingChatItem] = useState(null)
  const [myItems, setMyItems] = useState([])
  const [myItemsReady, setMyItemsReady] = useState(false)
  const [itemsReady, setItemsReady] = useState(false)
  const [itemsError, setItemsError] = useState('')
  const isAdmin = hasAdminAccess(auth?.user)
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

  const openItem = async (item) => {
    setSelectedItem(item)
    setItemDetailError('')
    setActivePage('item-detail')
    try {
      const { item: latestItem } = await fetchItem(item.id)
      setSelectedItem(latestItem)
    } catch (error) {
      setItemDetailError(`Could not load item details: ${error.message}`)
    }
  }

  const openChats = () => {
    if (!auth?.token) {
      setPendingPage('chats')
      setActivePage('login')
      return
    }
    setSelectedThreadId('')
    setActivePage('chats')
  }

  const startChatForItem = async (item, token = auth?.token) => {
    if (!token) {
      setPendingChatItem(item)
      setPendingPage('start-chat')
      setActivePage('login')
      return
    }

    setItemDetailError('')
    try {
      const { thread } = await startItemChat(item.id, token)
      setSelectedThreadId(thread.id)
      setActivePage('chats')
    } catch (error) {
      setItemDetailError(`Could not open chat: ${error.message}`)
    }
  }

  const openMyItems = async () => {
    if (!auth?.token) {
      setPendingPage('my-items')
      setActivePage('login')
      return
    }

    setActivePage('my-items')
    setMyItemsReady(false)
    setItemsError('')
    try {
      const { items: loadedItems } = await fetchMyItems(auth.token)
      setMyItems(loadedItems)
    } catch (error) {
      setItemsError(`Could not load your items: ${error.message}`)
    } finally {
      setMyItemsReady(true)
    }
  }

  const openAdmin = () => {
    if (isAdmin) setActivePage('admin')
  }

  const openProfile = () => {
    if (auth?.token) setActivePage('profile')
  }

  const updateAuthenticatedProfile = (user) => {
    const updatedAuth = { ...auth, user }
    setAuth(updatedAuth)
    try {
      const storage = window.localStorage.getItem('hewett-auth')
        ? window.localStorage
        : window.sessionStorage
      storage.setItem('hewett-auth', JSON.stringify(updatedAuth))
    } catch (error) {
      setItemsError(`Could not save your profile session: ${error.message}`)
    }
  }

  const handleAuthenticated = (session, remember) => {
    const authState = { token: session.token, user: session.user }
    setAuth(authState)
    setActivePage(pendingPage)
    if (pendingPage === 'my-items') {
      setMyItemsReady(false)
      fetchMyItems(session.token)
        .then(({ items: loadedItems }) => setMyItems(loadedItems))
        .catch((error) => setItemsError(`Could not load your items: ${error.message}`))
        .finally(() => setMyItemsReady(true))
    }
    if (pendingPage === 'start-chat' && pendingChatItem) {
      startChatForItem(pendingChatItem, session.token)
      setPendingChatItem(null)
    }
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
    setMyItems((currentItems) => [createdItem, ...currentItems])
    setActivePage('home')
    return createdItem
  }

  const removeItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    try {
      await deleteItem(item.id, auth.token)
      setItems((currentItems) => currentItems.filter(({ id }) => id !== item.id))
      setMyItems((currentItems) => currentItems.filter(({ id }) => id !== item.id))
    } catch (error) {
      setItemsError(`Could not delete this item: ${error.message}`)
    }
  }

  const finishPasswordRecovery = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setRecoveryToken('')
    setActivePage('login')
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
        onMyItems={openMyItems}
        onAdmin={openAdmin}
        onChats={openChats}
        onProfile={openProfile}
        onTerms={() => setActivePage('terms')}
        onLogout={logout}
        isAuthenticated={Boolean(auth?.token)}
        isAdmin={isAdmin}
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
          onMyItems={openMyItems}
          onAdmin={openAdmin}
          onChats={openChats}
          onProfile={openProfile}
          onTerms={() => setActivePage('terms')}
          onLogout={logout}
          isAuthenticated={Boolean(auth?.token)}
          isAdmin={isAdmin}
        />
        <main className={`page-content ${activePage === 'login' || activePage === 'reset-password' ? 'page-content-login' : activePage === 'home' || activePage === 'browse' || activePage === 'my-items' || activePage === 'admin' || activePage === 'item-detail' || activePage === 'chats' ? 'page-content-home' : activePage === 'theme' ? 'page-content-theme' : 'page-content-report'}`}>
          {activePage === 'login' ? (
            <Login
              auth={auth}
              onAuthenticated={handleAuthenticated}
              onLogout={logout}
            />
          ) : activePage === 'reset-password' ? (
            <Login
              recoveryToken={recoveryToken}
              onRecoveryComplete={finishPasswordRecovery}
            />
          ) : activePage === 'theme' ? (
            <Theme color={themeColor} onColorChange={setThemeColor} />
          ) : activePage === 'profile' && auth?.token ? (
            <Profile auth={auth} onProfileUpdated={updateAuthenticatedProfile} />
          ) : activePage === 'terms' ? (
            <Terms />
          ) : activePage === 'report' ? (
            <ReportItem
              token={auth?.token}
              onSubmit={submitItem}
            />
          ) : activePage === 'item-detail' ? (
            selectedItem ? (
              <ItemDetail
                item={selectedItem}
                currentUserId={auth?.user?.id}
                onBack={() => setActivePage('home')}
                onStartChat={startChatForItem}
                error={itemDetailError}
              />
            ) : (
              <p className="items-empty" role="status">Loading item details…</p>
            )
          ) : activePage === 'chats' ? (
            <Chat
              token={auth?.token}
              userId={auth?.user?.id}
              initialThreadId={selectedThreadId}
              onBack={() => setActivePage('home')}
              onThreadChange={setSelectedThreadId}
            />
          ) : (
            <Home
              page={activePage}
              items={items}
              itemsReady={itemsReady}
              storageError={itemsError}
              onReport={openReport}
              onBrowseAll={() => setActivePage('browse')}
              myItems={myItems}
              myItemsReady={myItemsReady}
              canManageAllItems={isAdmin}
              isAuthenticated={Boolean(auth?.token)}
              onDeleteItem={removeItem}
              onItemClick={openItem}
            />
          )}
        </main>
        {activePage !== 'login' && activePage !== 'reset-password' && <Foot onReport={openReport} />}
      </div>
    </div>
  )
}

export default App
