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
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Set font size and style
      const fontSize = 35; // Adjust as needed
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Transparency
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Calculate the diagonal length of the canvas
      const diagonalLength = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);

      // Rotate the canvas context for diagonal text
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.atan2(canvas.height, canvas.width));

      // Calculate text width and height
      const textWidth = ctx.measureText(watermarkText).width;
      const textHeight = fontSize;

      // Draw the watermark text repeatedly along the diagonal
      for (let y = -diagonalLength / 2, row = 0; y < diagonalLength; y += textHeight, row++) {
          const xOffset = (row % 2) * (textWidth / 2); // Stagger every other line
          for (let x = -diagonalLength / 2 + xOffset; x < diagonalLength; x += textWidth) {
              ctx.fillText(watermarkText, x, y);
          }
      }

      // Reset the canvas transformation
      ctx.setTransform(1, 0, 0, 1, 0, 0);

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
