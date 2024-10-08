import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import styles from '../page.module.css';

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  watermarkedImage: string | null;
}

const ResultModal: React.FC<ResultModalProps> = ({ open, onClose, watermarkedImage }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
        <Button onClick={onClose} color="primary">
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
  );
};

export default ResultModal;
