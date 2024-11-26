import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import saferlayerLogo from '../assets/images/saferlayer-logo.svg';

const Header: React.FC = () => {
  return (
    <header className="header">
      <Link href="/">
        <Image
          className="header__logo"
          src={saferlayerLogo}
          alt="Saferlayer Logo"
          width={150}
        />
      </Link>
      <ul className="header__lang-selection">
        <li>
          <a className="selected" href="#">
            En
          </a>
        </li>
        <li>
          <a href="#">Es</a>
        </li>
      </ul>
    </header>
  );
};

export default Header;