"use client";

import { useState, useCallback } from 'react';
import { Container, Typography, Button, TextField } from '@mui/material';
import Pica from 'pica';

export default function Home() {
    const [image, setImage] = useState<string | null>(null);
    const [watermarkText, setWatermarkText] = useState('');
    const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);

    // Using useCallback to prevent unnecessary re-creation of the function on re-renders.
    // This improves performance, especially if the component re-renders frequently.
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    }, []);

    // RGB to HSL conversion is necessary because it's easier to determine and manipulate
    // contrast in the HSL color space, which is useful for ensuring the watermark is visible
    // against varying background colors.
    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h, s, l };
    };

    // HSL to RGB conversion is necessary to apply the adjusted watermark color back onto the image.
    // After calculating a high-contrast color in HSL, it needs to be converted back to RGB
    // to modify the pixel data of the image.
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
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    };

    const applyWatermark = useCallback(async () => {
        if (!image) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = image;

        img.onload = async () => {
            // We resize the image to a minimum dimension to ensure consistency in watermark appearance,
            // regardless of the original image's resolution. This helps prevent issues with very large
            // or very small images.
            const minDim = 600;
            const scaleFactor = Math.max(minDim / img.width, minDim / img.height);
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const watermarkCanvas = document.createElement('canvas');
            const watermarkCtx = watermarkCanvas.getContext('2d');
            watermarkCanvas.width = canvas.width;
            watermarkCanvas.height = canvas.height;

            const diagonalLength = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
            const fullWatermarkText = ` solo para uso de: "${watermarkText}" |`.toUpperCase();
            const fontSize = Math.floor(diagonalLength / fullWatermarkText.length / 0.6);
            watermarkCtx.font = `${fontSize}px Courier New`;
            watermarkCtx.textAlign = 'center';
            watermarkCtx.textBaseline = 'middle';
            watermarkCtx.fillStyle = 'white';

            const centerX = watermarkCanvas.width / 2;
            const centerY = watermarkCanvas.height / 2;
            const rotationAngle = -Math.atan2(canvas.height, canvas.width);

            // The watermark is rotated and centered on the canvas diagonally. This ensures
            // that the watermark covers a large portion of the image, making it harder to remove.
            watermarkCtx.translate(centerX, centerY);
            watermarkCtx.rotate(rotationAngle);

            // We repeat the watermark text across the entire diagonal of the image.
            // This creates a 'wall' of watermarks, ensuring that the text is pervasive,
            // even if part of the image is cropped.
            for (let x = 0, y = -diagonalLength / 2; y < diagonalLength / 2; x += 5, y += fontSize) {
                const xMod = x % fullWatermarkText.length;
                const firstPart = fullWatermarkText.slice(0, fullWatermarkText.length - xMod);
                const secondPart = fullWatermarkText.slice(fullWatermarkText.length - xMod);

                watermarkCtx.fillText(secondPart + firstPart, 0, y);
            }

            watermarkCtx.setTransform(1, 0, 0, 1, 0, 0);

            const watermarkImageData = watermarkCtx.getImageData(0, 0, watermarkCanvas.width, watermarkCanvas.height);
            const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const watermarkPixels = watermarkImageData.data;
            const originalPixels = originalImageData.data;

            // To ensure the watermark is visible regardless of the background color,
            // we adjust its color to contrast with the underlying image.
            // This is done by converting the background color to HSL, adjusting the lightness
            // to ensure contrast, and converting back to RGB.
            for (let i = 0; i < watermarkPixels.length; i += 4) {
                const r = originalPixels[i];
                const g = originalPixels[i + 1];
                const b = originalPixels[i + 2];

                const hsl = rgbToHsl(r, g, b);
                const newH = (hsl.h + 0.5) % 1; // Complementary hue
                const newL = hsl.l > 0.5 ? 0.3 : 0.7; // Lightness adjusted for contrast
                const newRgb = hslToRgb(newH, hsl.s, newL);

                watermarkPixels[i] = newRgb.r;
                watermarkPixels[i + 1] = newRgb.g;
                watermarkPixels[i + 2] = newRgb.b;
                watermarkPixels[i + 3] *= 0.4; // Apply transparency to avoid overpowering the image
            }

            watermarkCtx.putImageData(watermarkImageData, 0, 0);
            ctx.drawImage(watermarkCanvas, 0, 0);

            // Pica is used here for high-quality resizing of the final image, ensuring that
            // the watermark and the image remain sharp and clear, even when scaled down.
            const pica = Pica();
            const resizedCanvas = document.createElement('canvas');
            resizedCanvas.width = canvas.width;
            resizedCanvas.height = canvas.height;

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
            <img src={image} alt="Uploaded" style={{ maxWidth: '100%', marginBottom: '20px' }} />
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
                <img src={watermarkedImage} alt="Watermarked" style={{ maxWidth: '100%' }} />
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
