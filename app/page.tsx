"use client";

import { useState, useCallback } from 'react';
import { Container, Typography, Button } from '@mui/material';
import styles from './page.module.css';

// Import helper functions
import {
  getCanvasDimensions,
  drawBackground,
  drawClippedImage,
  drawBottomText,
  createWatermarkCanvas,
  applyWatermarkText,
  blendWatermark,
  resizeAndExportCanvas,
} from './utils/watermark-utils';

// Import extracted components
import UploadImageModal from './components/UploadImageModal';
import WatermarkInputModal from './components/WatermarkInputModal';
import ResultModal from './components/ResultModal';

export default function Home() {
  // State variables
  const [image, setImage] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);

  // State variables for modals
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openWatermarkModal, setOpenWatermarkModal] = useState(false);
  const [openResultModal, setOpenResultModal] = useState(false);

  // Modal Handlers
  const handleOpenUploadModal = () => {
    setOpenUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setOpenUploadModal(false);
  };

  const handleOpenWatermarkModal = () => {
    setOpenWatermarkModal(true);
  };

  const handleCloseWatermarkModal = () => {
    setOpenWatermarkModal(false);
  };

  const handleOpenResultModal = () => {
    setOpenResultModal(true);
  };

  const handleCloseResultModal = () => {
    setOpenResultModal(false);
    // Reset state if needed
    setImage(null);
    setWatermarkText('');
    setWatermarkedImage(null);
  };

  // Handles the image upload and transitions to the next modal
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target?.result as string);
          handleCloseUploadModal();
          handleOpenWatermarkModal();
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Main function to apply the watermark and add borders to the image.
  const applyWatermark = useCallback(async () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = image;

    img.onload = async () => {
      // Step 1: Set up canvas dimensions
      const { canvasWidth, canvasHeight, scaleFactor } = getCanvasDimensions(img);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Step 2: Draw background and image
      drawBackground(ctx, canvasWidth, canvasHeight);
      ctx.save(); // Save the current state before clipping
      drawClippedImage(ctx, img, scaleFactor);
      ctx.restore(); // Restore after clipping

      // Step 3: Add bottom text
      drawBottomText(ctx, canvasHeight);

      // Step 4: Create and apply watermark
      const watermarkCanvas = createWatermarkCanvas(canvasWidth, canvasHeight);
      applyWatermarkText(watermarkCanvas, canvasWidth, canvasHeight, watermarkText);
      blendWatermark(ctx, watermarkCanvas);

      // Step 5: Resize and export the canvas
      await resizeAndExportCanvas(canvas, setWatermarkedImage);

      // Open the result modal after processing
      handleCloseWatermarkModal();
      handleOpenResultModal();
    };
  }, [image, watermarkText]);

  // JSX Return
  return (
    <Container maxWidth="sm" className={styles.container}>
      <Typography variant="h4" gutterBottom>
        Watermark Your Document
      </Typography>
      <Button
        variant="contained"
        onClick={handleOpenUploadModal}
        className={styles.startButton}
      >
        Start
      </Button>

      {/* Upload Image Modal */}
      <UploadImageModal
        open={openUploadModal}
        onClose={handleCloseUploadModal}
        handleImageUpload={handleImageUpload}
      />

      {/* Watermark Input Modal */}
      <WatermarkInputModal
        open={openWatermarkModal}
        onClose={handleCloseWatermarkModal}
        watermarkText={watermarkText}
        setWatermarkText={setWatermarkText}
        applyWatermark={applyWatermark}
      />

      {/* Result Modal */}
      <ResultModal
        open={openResultModal}
        onClose={handleCloseResultModal}
        watermarkedImage={watermarkedImage}
      />
    </Container>
  );
}