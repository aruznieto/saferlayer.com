import Pica from 'pica';
import { rgbToHsl, hslToRgb } from './colorUtils';
import { drawRoundedRect } from './canvasUtils';

// Calculates canvas dimensions and scaling factor
export const getCanvasDimensions = (img: HTMLImageElement) => {
  const borderSize = 20; // Top, left, and right borders
  const bottomBorderSize = 60; // Bottom border to accommodate text
  const minDim = 600;
  const scaleFactor = Math.max(minDim / img.width, minDim / img.height);

  const canvasWidth = img.width * scaleFactor + 2 * borderSize;
  const canvasHeight = img.height * scaleFactor + borderSize + bottomBorderSize;

  return { canvasWidth, canvasHeight, scaleFactor };
};

// Draws the background with rounded corners
export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const cornerRadius = 10; // Adjusted radius for more visible rounding
  ctx.fillStyle = 'white';
  drawRoundedRect(ctx, 0, 0, width, height, cornerRadius, true);
};

// Draws the clipped image with rounded corners
export const drawClippedImage = (
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

// Draws bottom text on the canvas
export const drawBottomText = (
  ctx: CanvasRenderingContext2D,
  canvasHeight: number
) => {
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

// Creates a separate canvas for the watermark
export const createWatermarkCanvas = (width: number, height: number) => {
  const watermarkCanvas = document.createElement('canvas');
  watermarkCanvas.width = width;
  watermarkCanvas.height = height;
  return watermarkCanvas;
};

// Applies the watermark text onto the watermark canvas
export const applyWatermarkText = (
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

// Blends the watermark onto the original image
export const blendWatermark = (
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

// Resizes and exports the final canvas as an image
export const resizeAndExportCanvas = async (
  canvas: HTMLCanvasElement,
  setWatermarkedImage: (url: string) => void
) => {
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
