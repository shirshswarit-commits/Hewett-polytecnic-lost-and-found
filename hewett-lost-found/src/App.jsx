import { useState } from 'react'
import './App.css'
import Nav from './assets/Components/Nav/Nav'
import SPanel from './assets/Components/SidePanel/SidePanel'
import Foot from './assets/Components/Footer/Footer'
import Home from './assets/Components/Home/Home'
import Login from './assets/Components/Login/Login'

function App() {
  const [activePage, setActivePage] = useState('home')

  return (
    <div className="app-shell">
      <SPanel
        onHome={() => setActivePage('home')}
        onLogin={() => setActivePage('login')}
      />
      <div className="page-layout">
        <Nav
          onHome={() => setActivePage('home')}
          onLogin={() => setActivePage('login')}
        />
        <main className={`page-content ${activePage === 'login' ? 'page-content-login' : ''}`}>
          {activePage === 'login' ? <Login /> : <Home />}
        </main>
        {activePage === 'home' && <Foot />}
      </div>
    </div>
  )
}

export default App
