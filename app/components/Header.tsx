import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="header">
      <Link href="/">
        <Image
          className="header__logo"
          src="/img/saferlayer-logo.svg"
          alt="Saferlayer Logo"
          width={150} // Set appropriate width
          height={50} // Set appropriate height
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