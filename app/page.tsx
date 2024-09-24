"use client";

import { useState, useCallback } from 'react';
import { Container, Typography, Button, TextField } from '@mui/material';
import Pica from 'pica';

// Converts RGB color values to HSL.
// HSL color space allows easier manipulation of contrast and lightness,
// which is essential for adjusting watermark colors against varying backgrounds.
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
// Necessary after adjusting HSL values to apply the new colors onto the image.
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
// Modified to accept a 'fill' parameter to decide whether to fill the rectangle.
// This allows us to use the path for clipping without filling.
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
    const [image, setImage] = useState<string | null>(null);
    const [watermarkText, setWatermarkText] = useState('');
    const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);

    // useCallback is used to memoize the function and prevent unnecessary re-creations on re-renders.
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    }, []);

    // Main function to apply the watermark and add borders to the image.
    const applyWatermark = useCallback(async () => {
        if (!image) return;

        // Border dimensions and corner radius settings.
        const borderSize = 20; // Top, left, and right borders
        const bottomBorderSize = 60; // Bottom border to accommodate text
        const cornerRadius = 10; // Adjusted radius for more visible rounding

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = image;

        img.onload = async () => {
            // Resizes the image to ensure consistency, regardless of original size.
            const minDim = 600;
            const scaleFactor = Math.max(minDim / img.width, minDim / img.height);

            // Adjust canvas size to include borders.
            canvas.width = img.width * scaleFactor + 2 * borderSize;
            canvas.height = img.height * scaleFactor + borderSize + bottomBorderSize;

            // Draws the white rounded rectangle as the background (border).
            ctx.fillStyle = 'white';
            drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, cornerRadius, true);

            // Set the clipping region to the inner rounded rectangle.
            // This ensures the image is drawn only within this area.
            ctx.save(); // Save the current state
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

            // Draws the image onto the canvas, offset by border sizes.
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

            ctx.restore(); // Restore to remove the clipping region

            // Writes the product name and slogan onto the bottom border area.
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'left';
            const textX = borderSize;
            const textY = canvas.height - borderSize; // Bottom left corner
            ctx.fillText('saferlayer.com - Add traceability to your documents online', textX, textY);

            // Creates a separate canvas for the watermark to manage it independently.
            const watermarkCanvas = document.createElement('canvas');
            const watermarkCtx = watermarkCanvas.getContext('2d');
            watermarkCanvas.width = canvas.width;
            watermarkCanvas.height = canvas.height;

            // Calculates font size for the watermark to ensure it scales with image size.
            const diagonalLength = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
            const fullWatermarkText = ` solo para uso de: "${watermarkText}" |`.toUpperCase();
            const fontSize = Math.floor(diagonalLength / fullWatermarkText.length / 0.6);
            watermarkCtx.font = `${fontSize}px Courier New`;
            watermarkCtx.textAlign = 'center';
            watermarkCtx.textBaseline = 'middle';
            watermarkCtx.fillStyle = 'white';

            // Rotates and positions the watermark text diagonally across the image.
            const centerX = watermarkCanvas.width / 2;
            const centerY = watermarkCanvas.height / 2;
            const rotationAngle = -Math.atan2(canvas.height, canvas.width);

            watermarkCtx.translate(centerX, centerY);
            watermarkCtx.rotate(rotationAngle);

            // Repeats the watermark text across the diagonal.
            for (let x = 0, y = -diagonalLength / 2; y < diagonalLength / 2; x += 5, y += fontSize) {
                const xMod = x % fullWatermarkText.length;
                const firstPart = fullWatermarkText.slice(0, fullWatermarkText.length - xMod);
                const secondPart = fullWatermarkText.slice(fullWatermarkText.length - xMod);

                watermarkCtx.fillText(secondPart + firstPart, 0, y);
            }

            // Resets the transformation matrix to prevent affecting other drawings.
            watermarkCtx.setTransform(1, 0, 0, 1, 0, 0);

            // Blends the watermark onto the original image by adjusting pixel data.
            const watermarkImageData = watermarkCtx.getImageData(0, 0, watermarkCanvas.width, watermarkCanvas.height);
            const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const watermarkPixels = watermarkImageData.data;
            const originalPixels = originalImageData.data;

            // Adjusts the watermark color to ensure it contrasts with the background.
            for (let i = 0; i < watermarkPixels.length; i += 4) {
                const r = originalPixels[i];
                const g = originalPixels[i + 1];
                const b = originalPixels[i + 2];

                const hsl = rgbToHsl(r, g, b);
                const newH = (hsl.h + 0.5) % 1; // Uses complementary hue for contrast.
                const newL = hsl.l > 0.5 ? 0.3 : 0.7; // Adjusts lightness to ensure visibility.
                const newRgb = hslToRgb(newH, hsl.s, newL);

                watermarkPixels[i] = newRgb.r;
                watermarkPixels[i + 1] = newRgb.g;
                watermarkPixels[i + 2] = newRgb.b;
                watermarkPixels[i + 3] *= 0.4; // Applies transparency to the watermark.
            }

            // Places the adjusted watermark back onto the watermark canvas.
            watermarkCtx.putImageData(watermarkImageData, 0, 0);

            // Draws the watermark onto the main canvas.
            ctx.drawImage(watermarkCanvas, 0, 0);

            // Uses Pica library for high-quality resizing of the final image.
            const pica = Pica();
            const resizedCanvas = document.createElement('canvas');
            resizedCanvas.width = canvas.width;
            resizedCanvas.height = canvas.height;

            // Resizes and converts the canvas to a blob for downloading.
            await pica.resize(canvas, resizedCanvas);
            const blob = await pica.toBlob(resizedCanvas, 'image/png');
            if (blob) {
                const url = URL.createObjectURL(blob);
                setWatermarkedImage(url);
            }
        };
    }, [image, watermarkText]);

    return (
        <Container maxWidth="sm" style={{ marginTop: '50px', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                Watermark Your Driver's License
            </Typography>
            <Button variant="contained" component="label" style={{ marginBottom: '20px' }}>
                Upload Image
                <input type="file" hidden onChange={handleImageUpload} />
            </Button>
            {image && (
                <>
                    <img
                        src={image}
                        alt="Uploaded"
                        style={{ maxWidth: '100%', marginBottom: '20px' }}
                    />
                    <TextField
                        label="Watermark Text"
                        variant="outlined"
                        fullWidth
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <Button variant="contained" onClick={applyWatermark}>
                        Apply Watermark
                    </Button>
                    {watermarkedImage && (
                        <>
                            <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                                Watermarked Image:
                            </Typography>
                            <img
                                src={watermarkedImage}
                                alt="Watermarked"
                                style={{ maxWidth: '100%' }}
                            />
                            <Button
                                variant="contained"
                                href={watermarkedImage}
                                download="watermarked-license.png"
                                style={{ marginTop: '20px' }}
                            >
                                Download Image
                            </Button>
                        </>
                    )}
                </>
            )}
        </Container>
    );
}
