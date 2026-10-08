import React from "react";
import Icon from "../Icons/Icon";
import "./Footer.css";

const Foot = () => {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-brand">
        <span className="logo-mark"><Icon name="brand" size={20} /></span>
        <span><strong>LOST&amp;FOUND</strong></span>
      </div>
      <p>Helping our campus community reunite with what matters.</p>
      <a className="footer-contact" href="#report-item">
        <Icon name="mail" size={16} />
        <span>Report a lost or found item</span>
      </a>
      <span className="footer-copyright">
        &copy; Hewett Polytechnic
      </span>
    </footer>
  );
};

export default Foot;