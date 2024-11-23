// components/HeroHeader.tsx
import React from 'react';
import Header from './Header';
import ImageSlider from './ImageSlider.tsx';
import Link from 'next/link';

const HeroHeader: React.FC = () => {
  return (
    <div className="hero-header" id="dropzone">
      <div className="header__stripe">
        We don't store your documents–Saferlayer runs locally in your browser
      </div>

      <div className="wrapper">
        <Header />

        <div className="hero-header__left-col">
          <h1 className="hero-header__h1">
            Add watermarks to your documents for free and avoid scams
          </h1>
          <Link href="/watermark-flow-1" className="cta cta--primary cta--takephoto">
            Take a photo
          </Link>
          <Link href="/watermark-flow-1" className="cta cta--secondary">
            Select an image
          </Link>
          <div className="drag-n-drop-label">
            Or drag and drop an image anywhere within this header
          </div>
        </div>

        <div className="hero-header__id">
          <ImageSlider />
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;