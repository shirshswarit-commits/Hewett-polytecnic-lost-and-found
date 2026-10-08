import React from "react";
import Icon from "../Icons/Icon";
import "./Nav.css";

const Nav = () => {
  return (
    <header className="topbar">
      <a className="logo" href="#home" aria-label="Lost and Found home">
        <span className="logo-mark"><Icon name="brand" size={22} /></span>
        <span><strong>LOST&amp;FOUND</strong></span>
      </a>
      <div className="nav-links">
        <a href="#home"><Icon name="home" size={17} /><span>Home</span></a>
        <a href="#lost-items"><Icon name="search" size={17} /><span>Lost items</span></a>
        <a href="#found-items"><Icon name="check" size={17} /><span>Found items</span></a>
        <a href="#contact"><Icon name="mail" size={17} /><span>Contact</span></a>
      </div>
    </header>
  );
};

export default Nav;