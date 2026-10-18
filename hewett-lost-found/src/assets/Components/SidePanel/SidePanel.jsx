import { useState } from "react";
import Icon from "../Icons/Icon";
import "./SidePanel.css";

const SPanel = ({ onHome, onLogin, onTheme, onReport, onLogout, isAuthenticated }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside className={`side-panel ${isExpanded ? "is-expanded" : ""}`} aria-label="Sidebar">
      <div className="panel-content">
        <a className="panel-brand" href="#home" onClick={onHome} aria-label="Home">
          <span className="panel-brand-icon"><Icon name="brand" size={22} /></span>
          <span className="panel-label">Losyt$found</span>
        </a>
        <button
          className="panel-toggle"
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isExpanded}
        >
          <Icon name={isExpanded ? "collapse" : "expand"} size={19} />
          <span className="panel-label">{isExpanded ? "Collapse menu" : "Expand menu"}</span>
        </button>
        <span className="panel-caption panel-label">MENU</span>
        <nav className="panel-links" aria-label="Main menu">
          <a href="#home" onClick={onHome} aria-label="Home">
            <Icon name="home" /><span className="panel-label">Home</span>
          </a>
          <a href="#lost-items" onClick={onHome} aria-label="Lost items">
            <Icon name="search" /><span className="panel-label">Lost items</span>
          </a>
          <a href="#found-items" onClick={onHome} aria-label="Found items">
            <Icon name="check" /><span className="panel-label">Found items</span>
          </a>
          <a href="#report-item" onClick={onReport} aria-label="Report an item">
            <Icon name="plus" /><span className="panel-label">Report an item</span>
          </a>
          {isAuthenticated ? (
            <button className="panel-menu-button" type="button" onClick={onLogout} aria-label="Sign out">
              <Icon name="login" /><span className="panel-label">Sign out</span>
            </button>
          ) : (
            <a href="#login" onClick={onLogin} aria-label="Login">
              <Icon name="login" /><span className="panel-label">Login</span>
            </a>
          )}
          <a href="#theme" onClick={onTheme} aria-label="Theme">
            <Icon name="theme" /><span className="panel-label">Theme</span>
          </a>
        </nav>
        <a className="panel-help" href="#contact" onClick={onHome} aria-label="Help and contact">
          <Icon name="help" /><span className="panel-label">Help desk</span>
        </a>
      </div>
    </aside>
  );
};

export default SPanel;