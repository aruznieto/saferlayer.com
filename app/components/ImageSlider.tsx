import React, { useState, useRef, useEffect } from 'react';

const ImageSlider: React.FC = () => {
    const [sliderPos, setSliderPos] = useState(50);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderPos(Number(e.target.value));
    };

    return (
        <div className="before-after-slider">
            <div className="img background-img" />
            <div
                className="img foreground-img"
                style={{ width: `${sliderPos}%` }}
            />
            <input
                type="range"
                min="1"
                max="100"
                value={sliderPos}
                className="slider"
                name="slider"
                id="slider"
                onChange={handleSliderChange}
            />
            <div
                className="slider-button"
                style={{ left: `calc(${sliderPos}% - 18px)` }}
            />
        </div>
    );
};

export default ImageSlider;