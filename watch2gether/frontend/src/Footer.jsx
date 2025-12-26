import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p>&copy; {currentYear} Rupam Roy. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
