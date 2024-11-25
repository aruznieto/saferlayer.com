// components/HeroHeader.tsx
import React, { useState } from 'react';
import Header from './Header';
import ImageSlider from './ImageSlider';
import WatermarkFlow from './WatermarkFlow';
import Link from 'next/link';

const HeroHeader: React.FC = () => {
  const [isWatermarkFlowOpen, setIsWatermarkFlowOpen] = useState(false);

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
          <Link href="#" className="cta cta--secondary" onClick={(e) => {
            e.preventDefault(); // Prevent navigation since we're using onClick
            setIsWatermarkFlowOpen(true);
          }}>
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

      <WatermarkFlow open={isWatermarkFlowOpen} onClose={() => setIsWatermarkFlowOpen(false)} />
    </div>
  );
};

export default HeroHeader;