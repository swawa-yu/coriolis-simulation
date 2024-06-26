import React from 'react';

interface ControlsProps {
    initialLongitude: number;
    initialLatitude: number;
    direction: number;
    animationSpeed: number;
    onLongitudeChange: (longitude: number) => void;
    onLatitudeChange: (latitude: number) => void;
    onDirectionChange: (direction: number) => void;
    onAnimationSpeedChange: (animationSpeed: number) => void;
    onStartSimulation: () => void;
}

const Controls: React.FC<ControlsProps> = ({
    initialLongitude,
    initialLatitude,
    direction,
    animationSpeed,
    onLongitudeChange,
    onLatitudeChange,
    onDirectionChange,
    onAnimationSpeedChange,
    onStartSimulation
}) => {
    return (
        <div id="controls">
            <h2>初期条件</h2>
            <label>
                経度: <input type="number" value={initialLongitude} onChange={(e) => onLongitudeChange(Number(e.target.value))} min="-180" max="180" />
            </label>
            <label>
                緯度: <input type="number" value={initialLatitude} onChange={(e) => onLatitudeChange(Number(e.target.value))} min="-90" max="90" />
            </label>
            <label>
                方向 (度): <input type="number" value={direction} onChange={(e) => onDirectionChange(Number(e.target.value))} min="0" max="360" />
            </label>
            <label>
                アニメーション速度: <input type="range" value={animationSpeed} onChange={(e) => onAnimationSpeedChange(Number(e.target.value))} min="0.1" max="5" step="0.1" />
            </label>
            <button onClick={onStartSimulation}>シミュレーション開始</button>
        </div>
    );
};

export default Controls;
