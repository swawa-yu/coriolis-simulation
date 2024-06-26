import React, { useEffect, useRef } from 'react';
import { Position } from '../types';
import { absoluteToEarth, xyzToGeo } from '../utils';

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
        if (!ctx) return;

        const mapImage = new Image();
        mapImage.src = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
        mapImage.onload = () => {
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
                drawMap(ctx, mapImage, width, height, initialLongitude);
                drawGrid(ctx, width, height);

                // 初期位置を描画
                const initialPos = mercatorProjection(initialLatitude, initialLongitude, width, height);
                drawInitialPoint(ctx, initialPos.x, initialPos.y);
            };

            const drawMap = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number, initialLongitude: number) => {
                const drawWidth = height * aspectRatio;
                const offsetX = (initialLongitude + 180) / 360 * drawWidth;

                ctx.drawImage(image, -offsetX, 0, drawWidth, height);
                ctx.drawImage(image, -offsetX + drawWidth, 0, drawWidth, height);
            };

            const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;

                // 緯度線
                for (let lat = -90; lat <= 90; lat += 15) {
                    const y = mercatorProjection(lat, 0, width, height).y;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }

                // 経度線
                for (let lon = -180; lon <= 180; lon += 15) {
                    const x = mercatorProjection(0, lon, width, height).x;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
            };

            const mercatorProjection = (lat: number, lon: number, width: number, height: number) => {
                const x = (lon + 180) * (width / 360);
                const latRad = lat * (Math.PI / 180);
                const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
                const y = (height / 2) - (width * mercN / (2 * Math.PI));
                return { x, y };
            };

            const drawInitialPoint = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.fill();
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
                const pos = mercatorProjection(lat, lon, canvas.width, canvas.height);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawMap(ctx, mapImage, canvas.width, canvas.height, initialLongitude);
                drawGrid(ctx, canvas.width, canvas.height);
                drawTrajectory(ctx, pos.x, pos.y);
                drawObject(ctx, pos.x, pos.y);
            };

            animate();
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();  // 初回リサイズを実行

            return () => {
                window.removeEventListener('resize', resizeCanvas);
            };
        };
    }, [initialLongitude, initialLatitude, isRunning, position]);

    return <canvas id="animation3" ref={canvasRef} style={{ width: '100%', height: 'auto' }}></canvas>;
};

export default Animation3;