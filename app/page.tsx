"use client";

import { useState } from 'react';
import { Container, Typography, Button, TextField } from '@mui/material';
import Pica from 'pica';

export default function Home() {
    const [image, setImage] = useState<string | null>(null);
    const [watermarkText, setWatermarkText] = useState('');
    const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const applyWatermark = async () => {
        if (!image) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = image;

        img.onload = async () => {
            // Determine the minimum target size
            const minDim = 600;  // Minimum target dimension

            // Calculate the scaling factor needed to reach the target size
            const scaleFactor = Math.max(minDim / img.width, minDim / img.height);

            // Set the canvas size to the scaled dimensions
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;

            // Draw the scaled image onto the canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Create a high-resolution canvas for the watermark
            const watermarkCanvas = document.createElement('canvas');
            const watermarkCtx = watermarkCanvas.getContext('2d');

            // Set the watermark canvas to the same dimensions
            watermarkCanvas.width = canvas.width;
            watermarkCanvas.height = canvas.height;

            // Calculate the diagonal length of the canvas
            const diagonalLength = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);

            // Watermark text
            const fullWatermarkText = ` solo para uso de: "${watermarkText}" |`.toUpperCase();

            // Set font size and style on the watermark canvas
            const fontSize = Math.floor(diagonalLength / fullWatermarkText.length / 0.6);
            watermarkCtx.font = `${fontSize}px Courier New`;
            watermarkCtx.textAlign = 'center';
            watermarkCtx.textBaseline = 'middle';
            watermarkCtx.fillStyle = 'white';

            // Calculate rotation and translation for diagonal placement
            const centerX = watermarkCanvas.width / 2;
            const centerY = watermarkCanvas.height / 2;
            const rotationAngle = -Math.atan2(canvas.height, canvas.width);

            // Apply rotation and translation
            watermarkCtx.translate(centerX, centerY);
            watermarkCtx.rotate(rotationAngle);

            // Print wall of watermark text on the watermark layer
            for (let x = 0, y = -diagonalLength / 2; y < diagonalLength / 2; x += 5, y += fontSize) {
                const xMod = x % fullWatermarkText.length;
                const length = fullWatermarkText.length;

                const first = fullWatermarkText.slice(0, length - xMod);
                const last = fullWatermarkText.slice(length - xMod);

                watermarkCtx.fillText(last + first, 0, y);
            }

            // Reset the watermark context transformation
            watermarkCtx.setTransform(1, 0, 0, 1, 0, 0);

            // Get the image data for both the original image and the watermark
            const watermarkImageData = watermarkCtx.getImageData(0, 0, watermarkCanvas.width, watermarkCanvas.height);
            const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const watermarkPixels = watermarkImageData.data;
            const originalPixels = originalImageData.data;

            // Adjust each pixel in the watermark based on the contrast color
            for (let i = 0; i < watermarkPixels.length; i += 4) {
                const r = originalPixels[i];
                const g = originalPixels[i + 1];
                const b = originalPixels[i + 2];

                // Calculate brightness of the background
                const brightness = (r + g + b) / 3;

                // Convert the RGB background color to HSL
                const hsl = rgbToHsl(r, g, b);

                // Pick a contrasting color in HSL
                let newH = (hsl.h + 0.5) % 1; // Complementary hue
                let newL = hsl.l > 0.5 ? 0.3 : 0.7; // Adjust lightness for contrast

                // Convert the new HSL color back to RGB
                const newRgb = hslToRgb(newH, hsl.s, newL);

                // Apply the contrasting RGB color with transparency to the watermark pixel
                watermarkPixels[i] = newRgb.r;
                watermarkPixels[i + 1] = newRgb.g;
                watermarkPixels[i + 2] = newRgb.b;
                watermarkPixels[i + 3] = watermarkPixels[i + 3] * 0.45; // Apply transparency
            }

            // Put the modified image data back onto the watermark canvas
            watermarkCtx.putImageData(watermarkImageData, 0, 0);

            // Now, draw the watermark onto the original image canvas
            ctx.drawImage(watermarkCanvas, 0, 0);

            // Resize and process the final canvas using Pica
            const pica = Pica();
            const resizedCanvas = document.createElement('canvas');
            resizedCanvas.width = canvas.width;
            resizedCanvas.height = canvas.height;

            await pica.resize(canvas, resizedCanvas);
            await pica.toBlob(resizedCanvas, 'image/png').then((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setWatermarkedImage(url);
                }
            });
        };
    };

    // Convert RGB to HSL
    const rgbToHsl = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
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

    // Convert HSL to RGB
    const hslToRgb = (h, s, l) => {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    };

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
