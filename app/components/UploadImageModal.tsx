import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import styles from '../page.module.css';

interface UploadImageModalProps {
  open: boolean;
  onClose: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({
  open,
  onClose,
  handleImageUpload,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadImageModal;
