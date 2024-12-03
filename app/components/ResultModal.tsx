import React from 'react';
import { Dialog } from '@mui/material';
import Image from 'next/image';

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  watermarkedImage: string | null;
}

const ResultModal: React.FC<ResultModalProps> = ({
  open,
  onClose,
  watermarkedImage,
}) => {

  // Check if the Web Share API with file support is available
  const isShareSupported = typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [new File([], '')] });

  const handleShare = () => {
    if (watermarkedImage) {
      fetch(watermarkedImage)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], 'watermarked_document.png', { type: blob.type });

          navigator.share({
            files: [file],
            title: 'Watermarked Document',
            text: 'Check out this watermarked document.',
          })
          .catch(error => console.error('Error sharing:', error));
        })
        .catch(error => console.error('Error fetching image:', error));
    } else {
      console.error('No document available to share.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        style: { background: '#F7F4F4' },
      }}
    >
      <div className="wrapper">
        <div className="header">
          <a className="header__back-btn" onClick={onClose}>
            <svg
              clipRule="evenodd"
              fillRule="evenodd"
              strokeLinejoin="round"
              strokeMiterlimit="2"
              viewBox="0 0 24 24"
            >
              <path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" />
            </svg>
            Back
          </a>
        </div>
        <div className="watermark-flow">
          <h2 className="watermark-flow__h2">
            Your document is ready to be shared more securely!
          </h2>
          {watermarkedImage && (
            <Image
              className="watermark-flow__doc"
              src={watermarkedImage}
              alt="Your document"
              width={500}
              height={500}
              style={{ width: 'auto', height: 'auto' }}
            />
          )}
          <a
            className="cta cta--primary"
            href={watermarkedImage || '#'}
            download="watermarked_document.png"
          >
            Download
          </a>
          {/* Conditionally render the Share button or an informative message */}
          {isShareSupported ? (
            <a className="cta cta--secondary" onClick={handleShare}>
              Share document
            </a>
          ) : (
            <p className="cta cta--info">
              To share this document, please download it and attach it manually.
            </p>
          )}
          <a className="cta cta--link" onClick={onClose}>
            Watermark another document
          </a>
        </div>
      </div>
    </Dialog>
  );
};

export default ResultModal;
