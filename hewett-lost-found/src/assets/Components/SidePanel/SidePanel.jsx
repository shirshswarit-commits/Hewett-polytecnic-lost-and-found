import React from "react";
import Icon from "../Icons/Icon";
import "./SidePanel.css";

const SPanel = () => {
  return (
    <aside className="side-panel" aria-label="Sidebar">
      <div className="panel-content">
        <a className="panel-brand" href="#home" aria-label="Home">
          <span className="panel-brand-icon"><Icon name="brand" size={22} /></span>
          <span className="panel-label">LOST&amp;FOUND</span>
        </a>
        <span className="panel-caption panel-label">MENU</span>
        <nav className="panel-links" aria-label="Main menu">
          <a href="#home" aria-label="Home">
            <Icon name="home" /><span className="panel-label">Home</span>
          </a>
          <a href="#lost-items" aria-label="Lost items">
            <Icon name="search" /><span className="panel-label">Lost items</span>
          </a>
          <a href="#found-items" aria-label="Found items">
            <Icon name="check" /><span className="panel-label">Found items</span>
          </a>
          <a href="#report-item" aria-label="Report an item">
            <Icon name="plus" /><span className="panel-label">Report an item</span>
          </a>
        </nav>
        <a className="panel-help" href="#contact" aria-label="Help and contact">
          <Icon name="help" /><span className="panel-label">Help desk</span>
        </a>
      </div>
    </aside>
  );
};

export default SPanel;