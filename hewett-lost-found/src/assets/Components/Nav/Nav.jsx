import React from "react";
import Icon from "../Icons/Icon";
import "./Nav.css";

const Nav = ({ onHome, onLogin, onTheme, onReport, onLogout, isAuthenticated }) => {
  return (
    <header className="topbar">
      <a className="logo" href="#home" onClick={onHome} aria-label="Losyt$found home">
        <span className="logo-mark"><Icon name="brand" size={22} /></span>
        <span><strong>Losyt$found</strong></span>
      </a>
      <div className="nav-links">
        <a href="#home" onClick={onHome}><Icon name="home" size={17} /><span>Home</span></a>
        <a href="#lost-items" onClick={onHome}><Icon name="search" size={17} /><span>Lost items</span></a>
        <a href="#found-items" onClick={onHome}><Icon name="check" size={17} /><span>Found items</span></a>
        <a href="#report-item" onClick={onReport}><Icon name="plus" size={17} /><span>Report item</span></a>
        {isAuthenticated ? (
          <button type="button" onClick={onLogout}><Icon name="login" size={17} /><span>Sign out</span></button>
        ) : (
          <a href="#login" onClick={onLogin}><Icon name="login" size={17} /><span>Login</span></a>
        )}
        <a href="#theme" onClick={onTheme}><Icon name="theme" size={17} /><span>Theme</span></a>
        <a href="#contact" onClick={onHome}><Icon name="mail" size={17} /><span>Contact</span></a>
      </div>
    </header>
  );
};

export default Nav;