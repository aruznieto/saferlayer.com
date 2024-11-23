import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="wrapper">
        Built from NYC and Madrid by Guido Fioravantti{' '}
        <a href="https://x.com/engineerGuido" target="_blank" rel="noreferrer">
          @engineerGuido
        </a>{' '}
        and Carlos Sánchez{' '}
        <a href="https://x.com/chocotuits" target="_blank" rel="noreferrer">
          @chocotuits
        </a>
        {/* Include the script for Ko-fi widget if necessary */}
      </div>
    </footer>
  );
};

export default Footer;