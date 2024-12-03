// components/HeroHeader.tsx
import React, { useState, useCallback, useEffect } from 'react';
import Header from './Header';
import ImageSlider from './ImageSlider';
import WatermarkFlow from './WatermarkFlow';
import ResultModal from './ResultModal';
import {
  getCanvasDimensions,
  drawBackground,
  drawClippedImage,
  drawBottomText,
  createWatermarkCanvas,
  applyWatermarkText,
  blendWatermark,
  resizeAndExportCanvas,
} from '../utils/watermark-utils';
import Link from 'next/link';

const HeroHeader: React.FC = () => {
  const [isWatermarkFlowOpen, setIsWatermarkFlowOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target?.result as string);
          setIsWatermarkFlowOpen(true);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const applyWatermark = useCallback(async () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = image;

    img.onload = async () => {
      const { canvasWidth, canvasHeight, scaleFactor } = getCanvasDimensions(img);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      drawBackground(ctx, canvasWidth, canvasHeight);
      ctx.save();
      drawClippedImage(ctx, img, scaleFactor);
      ctx.restore();

      drawBottomText(ctx, canvasHeight);

      const watermarkCanvas = createWatermarkCanvas(canvasWidth, canvasHeight);
      applyWatermarkText(watermarkCanvas, canvasWidth, canvasHeight, watermarkText);
      blendWatermark(ctx, watermarkCanvas);

      await resizeAndExportCanvas(canvas, setWatermarkedImage);

      setIsWatermarkFlowOpen(false);
      setIsResultModalOpen(true);
    };
  }, [image, watermarkText]);

  const resetState = () => {
    setImage(null);
    setWatermarkText('');
    setWatermarkedImage(null);
  };

  useEffect(() => {
    const dropzone = document.getElementById('dropzone');

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target?.result as string);
          setIsWatermarkFlowOpen(true);
        };
        reader.readAsDataURL(file);
      }
    };

    dropzone?.addEventListener('dragover', handleDragOver);
    dropzone?.addEventListener('drop', handleDrop);

    return () => {
      dropzone?.removeEventListener('dragover', handleDragOver);
      dropzone?.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div className="hero-header" id="dropzone">
      <div className="header__stripe">
        We don&apos;t store your documents–Saferlayer runs locally in your browser
      </div>

      <div className="wrapper">
        <Header />

        <div className="hero-header__left-col">
          <h1 className="hero-header__h1">
            Add watermarks to your documents for free and avoid scams
          </h1>

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="contained-button-file"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="contained-button-file">
            <span className="cta cta--secondary">Select an image</span>
          </label>

          <div className="drag-n-drop-label">
            Or drag and drop an image anywhere within this header
          </div>
        </div>

        <div className="hero-header__id">
          <ImageSlider />
        </div>
      </div>

      <WatermarkFlow
        open={isWatermarkFlowOpen}
        onClose={() => setIsWatermarkFlowOpen(false)}
        watermarkText={watermarkText}
        setWatermarkText={setWatermarkText}
        applyWatermark={applyWatermark}
      />

      <ResultModal
        open={isResultModalOpen}
        onClose={() => {
          setIsResultModalOpen(false);
          resetState();
        }}
        watermarkedImage={watermarkedImage}
      />
    </div>
  );
};

export default HeroHeader;