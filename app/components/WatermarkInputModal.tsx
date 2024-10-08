import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import styles from '../page.module.css';

interface WatermarkInputModalProps {
  open: boolean;
  onClose: () => void;
  watermarkText: string;
  setWatermarkText: (text: string) => void;
  applyWatermark: () => void;
}

const WatermarkInputModal: React.FC<WatermarkInputModalProps> = ({
  open,
  onClose,
  watermarkText,
  setWatermarkText,
  applyWatermark,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
        <Button onClick={onClose} color="primary">
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
  );
};

export default WatermarkInputModal;
