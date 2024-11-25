import React, { useState } from 'react';
import { Dialog } from '@mui/material';

interface WatermarkFlowProps {
    open: boolean;
    onClose: () => void;
}

const WatermarkFlow: React.FC<WatermarkFlowProps> = ({ open, onClose }) => {
    const [watermarkText, setWatermarkText] = useState('');

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{
                style: { background: '#F7F4F4' }
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
                        Enter the text you want to overlay on the document
                    </h2>
                    <textarea
                        className="watermark-flow__textarea"
                        placeholder="Type here"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        rows={4}
                        cols={0}
                    />
                    <a
                        href="#"
                        className="cta cta--primary"
                        onClick={() => {/* Handle continue */ }}
                    >
                        Continue
                    </a>

                    <p className="watermark-flow__tip">
                        <strong>Tip:</strong>
                        Use a unique text each time you share your document. For example: "Valid only for solvency assessment by Phil Dunphy Real Estate."
                    </p>
                </div>
            </div>
        </Dialog>
    );
};

export default WatermarkFlow; 