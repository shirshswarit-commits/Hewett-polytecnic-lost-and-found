import { useEffect, useRef, useState } from "react";
import Icon from "../Icons/Icon";
import "./SidePanel.css";

const SPanel = ({
  onHome,
  onLogin,
  onTheme,
  onReport,
  onMyItems,
  onAdmin,
  onChats,
  onProfile,
  onTerms,
  onLogout,
  isAuthenticated,
  isAdmin,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreToggleRef = useRef(null);
  const moreOptionsRef = useRef(null);

  useEffect(() => {
    if (!isMoreOpen) return undefined;

    const closeOnOutsidePointer = (event) => {
      if (
        !moreToggleRef.current?.contains(event.target)
        && !moreOptionsRef.current?.contains(event.target)
      ) {
        setIsMoreOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
        moreToggleRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMoreOpen]);

  const runMoreAction = (action) => () => {
    setIsMoreOpen(false);
    action?.();
  };

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
          <a className="panel-primary-link" href="#home" onClick={onHome} aria-label="Home" data-tooltip="Home">
            <Icon name="home" /><span className="panel-label">Home</span>
          </a>
          <a className="panel-primary-link" href="#lost-items" onClick={onHome} aria-label="Lost items" data-tooltip="Lost">
            <Icon name="search" /><span className="panel-label">Lost</span>
          </a>
          <a className="panel-primary-link" href="#found-items" onClick={onHome} aria-label="Found items" data-tooltip="Found">
            <Icon name="check" /><span className="panel-label">Found</span>
          </a>
          <a className="panel-primary-link" href="#report-item" onClick={onReport} aria-label="Report an item" data-tooltip="Report">
            <Icon name="plus" /><span className="panel-label">Report</span>
          </a>
          <button
            ref={moreToggleRef}
            className="panel-more-toggle"
            type="button"
            onClick={() => setIsMoreOpen((open) => !open)}
            aria-label="Profile and more options"
            aria-expanded={isMoreOpen}
            aria-haspopup="true"
            data-tooltip="Profile"
          >
            <Icon name="profile" /><span className="panel-label">Profile</span>
          </button>
          <div
            ref={moreOptionsRef}
            className={`panel-more-options ${isMoreOpen ? "is-open" : ""}`}
            aria-label="More options"
          >
            {isAuthenticated ? (
              <>
                <button className="panel-menu-button" type="button" onClick={runMoreAction(onMyItems)} aria-label="My items">
                <Icon name="search" /><span className="panel-label">My items</span>
                </button>
                <button className="panel-menu-button" type="button" onClick={runMoreAction(onChats)} aria-label="Chats">
                <Icon name="mail" /><span className="panel-label">Chats</span>
                </button>
                <button className="panel-menu-button" type="button" onClick={runMoreAction(onProfile)} aria-label="Profile">
                <Icon name="profile" /><span className="panel-label">Profile</span>
                </button>
                {isAdmin && (
                  <button className="panel-menu-button" type="button" onClick={runMoreAction(onAdmin)} aria-label="Admin panel">
                  <Icon name="check" /><span className="panel-label">Admin</span>
                  </button>
                )}
                <button className="panel-menu-button" type="button" onClick={runMoreAction(onLogout)} aria-label="Sign out">
                <Icon name="login" /><span className="panel-label">Sign out</span>
                </button>
              </>
            ) : (
              <a href="#login" onClick={runMoreAction(onLogin)} aria-label="Login">
              <Icon name="login" /><span className="panel-label">Login</span>
              </a>
            )}
            <a href="#theme" onClick={runMoreAction(onTheme)} aria-label="Theme">
              <Icon name="theme" /><span className="panel-label">Theme</span>
            </a>
            <a href="#terms" onClick={runMoreAction(onTerms)} aria-label="Terms and conditions">
              <Icon name="terms" /><span className="panel-label">Terms</span>
            </a>
          </div>
        </nav>
        <a className="panel-help" href="#contact" onClick={onHome} aria-label="Help and contact">
          <Icon name="help" /><span className="panel-label">Help desk</span>
        </a>
      </div>
    </aside>
  );
};

export default SPanel;