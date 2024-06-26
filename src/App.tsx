import React, { useState, useEffect } from 'react';
import Controls from './components/Controls';
import CoordinatesDisplay from './components/CoordinatesDisplay';
import { Position } from './types';
import Animation3 from './components/Animation3';
import Animation1 from './components/Animation1';
import { geoToXyz } from './utils';

export const calculatePosition = (initialLatitude: number, initialLongitude: number, direction: number, time: number): Position => {
  const theta = time;
  const latRad = initialLatitude * Math.PI / 180;
  const lonRad = initialLongitude * Math.PI / 180;
  const thetaRad = direction * Math.PI / 180;
  const R = 1;
  const x = R * (Math.cos(theta) * Math.cos(lonRad) * Math.cos(latRad) + Math.sin(theta) * (-Math.sin(lonRad) * Math.cos(thetaRad) - Math.cos(lonRad) * Math.sin(latRad) * Math.sin(thetaRad)));
  const y = R * (Math.cos(theta) * Math.sin(lonRad) * Math.cos(latRad) + Math.sin(theta) * (Math.cos(lonRad) * Math.cos(thetaRad) - Math.sin(lonRad) * Math.sin(latRad) * Math.sin(thetaRad)));
  const z = R * (Math.cos(theta) * Math.sin(latRad) + Math.sin(theta) * Math.cos(latRad) * Math.sin(thetaRad));
  return { x, y, z };
}

const App: React.FC = () => {
  const [initialLongitude, setInitialLongitude] = useState(135);
  const [initialLatitude, setInitialLatitude] = useState(0);
  const [direction, setDirection] = useState(30);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [globalTime, setGlobalTime] = useState(0);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, z: 0 });
  const [earthRotation, setEarthRotation] = useState(0);

  const handleStartSimulation = () => {
    setIsRunning(true);
  };

  const handleAnimationSpeedChange = (newSpeed: number) => {
    setAnimationSpeed(newSpeed);
  };

  useEffect(() => {
    if (!isRunning) return;

    let lastTime = performance.now();
    let animationFrameId: number;

    const updateGlobalTime = (now: number) => {
      const deltaTime = now - lastTime;
      lastTime = now;

      setGlobalTime(prevTime => {
        const newTime = prevTime + (animationSpeed * deltaTime) / 1000;
        setPosition(calculatePosition(initialLatitude, initialLongitude, direction, newTime));
        setEarthRotation(newTime * 10);
        return newTime;
      });

      animationFrameId = requestAnimationFrame(updateGlobalTime);
    };

    animationFrameId = requestAnimationFrame(updateGlobalTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, initialLongitude, initialLatitude, direction, animationSpeed]);

  return (
    <div>
      <Controls
        initialLongitude={initialLongitude}
        initialLatitude={initialLatitude}
        direction={direction}
        animationSpeed={animationSpeed}
        onLongitudeChange={setInitialLongitude}
        onLatitudeChange={setInitialLatitude}
        onDirectionChange={setDirection}
        onAnimationSpeedChange={handleAnimationSpeedChange}
        onStartSimulation={handleStartSimulation}
      />
      <CoordinatesDisplay
        position={position}
        earthRotation={earthRotation}
        globalTime={globalTime}
      />
      <Animation1
        initialPosition={geoToXyz({ lat: initialLatitude, lon: initialLongitude })}
        initialPositionGeo={{ lat: initialLatitude, lon: initialLongitude }}
        position={position}
        earthRotation={earthRotation}
        isRunning={isRunning}
        isAbsolute={true}>
      </Animation1>
      <Animation1
        initialPosition={geoToXyz({ lat: initialLatitude, lon: initialLongitude })}
        initialPositionGeo={{ lat: initialLatitude, lon: initialLongitude }}
        position={position}
        earthRotation={earthRotation}
        isRunning={isRunning}
        isAbsolute={false}
      >
      </Animation1>
      <Animation3
        initialLongitude={initialLongitude}
        initialLatitude={initialLatitude}
        position={position}
        earthRotation={earthRotation}
        isRunning={isRunning}>
      </Animation3>
    </div>
  );
};

export default App;
