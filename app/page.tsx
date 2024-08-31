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

      // Calculate the diagonal length of the canvas
      const diagonalLength = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);

      // Watermark text
      const fullWatermarkText = ` solo para uso de: "${watermarkText}" |`.toUpperCase();

      // Set font size and style
      const fontSize = Math.floor(diagonalLength/fullWatermarkText.length/0.6);
      ctx.font = `${fontSize}px Courier New`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; // Transparency
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Rotate the canvas context for diagonal text
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.atan2(canvas.height, canvas.width));

      // Print wall of watermark text
      for (let x = 0, y = -diagonalLength/2; y < diagonalLength/2; x += 5, y += fontSize) {
          const xMod = x % fullWatermarkText.length;
          const length = fullWatermarkText.length;

          // Rotate text so FOOBAR becomes RFOOBA by x characters
          const first: string = fullWatermarkText.slice(0, length - xMod);
          const last: string = fullWatermarkText.slice(length - xMod);

          ctx.fillText(last + first, 0, y);
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
