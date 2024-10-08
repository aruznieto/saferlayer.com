"use client";

import { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Pica from 'pica';
import styles from './page.module.css';

// Utility Functions
// Converts RGB color values to HSL.
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, l };
};

// Converts HSL color values back to RGB.
const hslToRgb = (h: number, s: number, l: number) => {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // Achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Draws a rounded rectangle on the canvas.
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean = true
) => {
  // Ensure radius doesn't exceed half of the rectangle's dimensions
  radius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + radius, y);

  // Top edge and top-right corner
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);

  // Right edge and bottom-right corner
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);

  // Bottom edge and bottom-left corner
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);

  // Left edge and top-left corner
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);

  ctx.closePath();

  if (fill) {
    ctx.fill();
  }
};

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
      await resizeAndExportCanvas(canvas);

      // Open the result modal after processing
      handleCloseWatermarkModal();
      handleOpenResultModal();
    };
  }, [image, watermarkText]);

  // Helper Functions
  const getCanvasDimensions = (img: HTMLImageElement) => {
    const borderSize = 20; // Top, left, and right borders
    const bottomBorderSize = 60; // Bottom border to accommodate text
    const minDim = 600;
    const scaleFactor = Math.max(minDim / img.width, minDim / img.height);

    const canvasWidth = img.width * scaleFactor + 2 * borderSize;
    const canvasHeight = img.height * scaleFactor + borderSize + bottomBorderSize;

    return { canvasWidth, canvasHeight, scaleFactor };
  };

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const cornerRadius = 10; // Adjusted radius for more visible rounding
    ctx.fillStyle = 'white';
    drawRoundedRect(ctx, 0, 0, width, height, cornerRadius, true);
  };

  const drawClippedImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    scaleFactor: number
  ) => {
    const borderSize = 20;
    const cornerRadius = 10;

    drawRoundedRect(
      ctx,
      borderSize,
      borderSize,
      img.width * scaleFactor,
      img.height * scaleFactor,
      cornerRadius,
      false // Don't fill, just create the path
    );
    ctx.clip(); // Clip to the path just defined

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      borderSize,
      borderSize,
      img.width * scaleFactor,
      img.height * scaleFactor
    );
  };

  const drawBottomText = (ctx: CanvasRenderingContext2D, canvasHeight: number) => {
    const borderSize = 20;
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    const textX = borderSize;
    const textY = canvasHeight - borderSize; // Bottom left corner
    ctx.fillText(
      'Traceable documents, Safer identities - SaferLayer.com',
      textX,
      textY
    );
  };

  const createWatermarkCanvas = (width: number, height: number) => {
    const watermarkCanvas = document.createElement('canvas');
    watermarkCanvas.width = width;
    watermarkCanvas.height = height;
    return watermarkCanvas;
  };

  const applyWatermarkText = (
    watermarkCanvas: HTMLCanvasElement,
    width: number,
    height: number,
    watermarkText: string
  ) => {
    const watermarkCtx = watermarkCanvas.getContext('2d');
    if (!watermarkCtx) return;

    // Calculate font size for the watermark
    const diagonalLength = Math.sqrt(width ** 2 + height ** 2);
    const fullWatermarkText = ` solo para uso de: "${watermarkText}" |`.toUpperCase();
    const fontSize = Math.floor(diagonalLength / fullWatermarkText.length / 0.6);
    watermarkCtx.font = `${fontSize}px Courier New`;
    watermarkCtx.textAlign = 'center';
    watermarkCtx.textBaseline = 'middle';
    watermarkCtx.fillStyle = 'white';

    // Position the watermark text diagonally
    const centerX = width / 2;
    const centerY = height / 2;
    const rotationAngle = -Math.atan2(height, width);

    watermarkCtx.translate(centerX, centerY);
    watermarkCtx.rotate(rotationAngle);

    // Repeat the watermark text across the diagonal
    for (
      let x = 0, y = -diagonalLength / 2;
      y < diagonalLength / 2;
      x += 5, y += fontSize
    ) {
      const xMod = x % fullWatermarkText.length;
      const firstPart = fullWatermarkText.slice(0, fullWatermarkText.length - xMod);
      const secondPart = fullWatermarkText.slice(fullWatermarkText.length - xMod);

      watermarkCtx.fillText(secondPart + firstPart, 0, y);
    }

    // Reset the transformation matrix
    watermarkCtx.setTransform(1, 0, 0, 1, 0, 0);
  };

  const blendWatermark = (
    ctx: CanvasRenderingContext2D,
    watermarkCanvas: HTMLCanvasElement
  ) => {
    const width = watermarkCanvas.width;
    const height = watermarkCanvas.height;
    const watermarkCtx = watermarkCanvas.getContext('2d');
    if (!watermarkCtx) return;

    const watermarkImageData = watermarkCtx.getImageData(0, 0, width, height);
    const originalImageData = ctx.getImageData(0, 0, width, height);
    const watermarkPixels = watermarkImageData.data;
    const originalPixels = originalImageData.data;

    // Adjust the watermark color for contrast
    for (let i = 0; i < watermarkPixels.length; i += 4) {
      const r = originalPixels[i];
      const g = originalPixels[i + 1];
      const b = originalPixels[i + 2];

      const hsl = rgbToHsl(r, g, b);
      const newH = (hsl.h + 0.5) % 1; // Complementary hue
      const newL = hsl.l > 0.5 ? 0.3 : 0.7; // Adjust lightness
      const newRgb = hslToRgb(newH, hsl.s, newL);

      watermarkPixels[i] = newRgb.r;
      watermarkPixels[i + 1] = newRgb.g;
      watermarkPixels[i + 2] = newRgb.b;
      watermarkPixels[i + 3] *= 0.4; // Apply transparency
    }

    // Place the adjusted watermark back onto the canvas
    watermarkCtx.putImageData(watermarkImageData, 0, 0);

    // Draw the watermark onto the main canvas
    ctx.drawImage(watermarkCanvas, 0, 0);
  };

  const resizeAndExportCanvas = async (canvas: HTMLCanvasElement) => {
    // Uses Pica library for high-quality resizing
    const pica = Pica();
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = canvas.width;
    resizedCanvas.height = canvas.height;

    // Resize the canvas
    await pica.resize(canvas, resizedCanvas);

    // Convert resized canvas to a Blob
    const blob = await pica.toBlob(resizedCanvas, 'image/png');
    if (blob) {
      const url = URL.createObjectURL(blob);
      setWatermarkedImage(url);
    }
  };

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
      <Dialog
        open={openUploadModal}
        onClose={handleCloseUploadModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Upload Image</DialogTitle>
        <DialogContent>
          <Button
            variant="contained"
            component="label"
            fullWidth
            className={styles.chooseImageButton}
          >
            Choose Image
            <input type="file" hidden onChange={handleImageUpload} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadModal} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Watermark Input Modal */}
      <Dialog
        open={openWatermarkModal}
        onClose={handleCloseWatermarkModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Enter Watermark Text</DialogTitle>
        <DialogContent>
          <TextField
            label="Who is the document for?"
            variant="outlined"
            fullWidth
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            className={styles.textField}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWatermarkModal} color="primary">
            Cancel
          </Button>
          <Button
            onClick={applyWatermark}
            variant="contained"
            color="primary"
            disabled={!watermarkText}
          >
            Apply Watermark
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Modal */}
      <Dialog
        open={openResultModal}
        onClose={handleCloseResultModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Watermarked Image</DialogTitle>
        <DialogContent className={styles.resultContent}>
          {watermarkedImage && (
            <img
              src={watermarkedImage}
              alt="Watermarked"
              className={styles.watermarkedImage}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResultModal} color="primary">
            Close
          </Button>
          {watermarkedImage && (
            <Button
              variant="contained"
              href={watermarkedImage}
              download="watermarked-document.png"
              color="primary"
            >
              Download Image
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}