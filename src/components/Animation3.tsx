import React, { useEffect, useRef } from 'react';
import { Position } from '../types';
import { absoluteToEarth, xyzToGeo } from '../utils';
import mapImageSrc from '../assets/world_map_with_grid.jpg';

interface Animation3Props {
    initialLongitude: number;
    initialLatitude: number;
    earthRotation: number;
    position: Position;
    isRunning: boolean;
}

const Animation3: React.FC<Animation3Props> = ({ initialLongitude, initialLatitude, isRunning, position, earthRotation }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !isRunning) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.log("Failed to get canvas context");
            return;
        }

        console.log("Loading image");
        const mapImage = new Image();
        mapImage.src = mapImageSrc;  // インポートした画像を使用
        mapImage.onload = () => {
            console.log("Image loaded successfully");

            const aspectRatio = mapImage.width / mapImage.height;

            const resizeCanvas = () => {
                const windowAspectRatio = window.innerWidth / window.innerHeight;
                let width, height;

                if (windowAspectRatio > aspectRatio) {
                    height = window.innerHeight;
                    width = height * aspectRatio;
                } else {
                    width = window.innerWidth;
                    height = width / aspectRatio;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawMap(ctx, mapImage, width, height);
                drawInitialPoint(ctx, initialLatitude, initialLongitude, width, height);
            };

            const drawMap = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) => {
                ctx.drawImage(image, 0, 0, width, height);
            };

            const drawInitialPoint = (ctx: CanvasRenderingContext2D, lat: number, lon: number, width: number, height: number) => {
                const pos = cylindricalProjection(lat, lon, width, height);
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.fill();
            };

            const cylindricalProjection = (lat: number, lon: number, width: number, height: number) => {
                const x = (lon + 180) * (width / 360);
                const y = (90 - lat) * (height / 180);
                return { x, y };
            };

            const drawTrajectory = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
                if (lastPosition) {
                    ctx.beginPath();
                    ctx.moveTo(lastPosition.x, lastPosition.y);
                    ctx.lineTo(x, y);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                lastPosition = { x, y };
            };

            const drawObject = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            };

            let lastPosition: { x: number, y: number } | null = null;

            const animate = () => {
                if (!isRunning) return;
                requestAnimationFrame(animate);

                const { lat, lon } = absoluteToEarth(xyzToGeo(position), earthRotation);
                const pos = cylindricalProjection(lat, lon, canvas.width, canvas.height);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawMap(ctx, mapImage, canvas.width, canvas.height);
                drawTrajectory(ctx, pos.x, pos.y);
                drawObject(ctx, pos.x, pos.y);
                drawInitialPoint(ctx, initialLatitude, initialLongitude, canvas.width, canvas.height);
            };

            animate();
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();  // 初回リサイズを実行

            return () => {
                window.removeEventListener('resize', resizeCanvas);
            };
        };

        mapImage.onerror = () => {
            console.error("Failed to load the image");
        };
    }, [initialLongitude, initialLatitude, isRunning, position]);

    return <canvas id="animation3" ref={canvasRef} style={{ width: '100%', height: 'auto' }}></canvas>;
};

export default Animation3;
