import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Position } from '../types';
import mapImageSrc from '../assets/world_map_with_grid.jpg'; // ローカルのテクスチャをインポート

interface Animation1Props {
    initialLongitude: number;
    initialLatitude: number;
    earthRotation: number;
    position: Position;
    isRunning: boolean;
}

const Animation1: React.FC<Animation1Props> = ({ initialLongitude, initialLatitude, isRunning, position, earthRotation }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const earthRef = useRef<THREE.Mesh>();
    const objectRef = useRef<THREE.Mesh>();
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const cameraRef = useRef<THREE.PerspectiveCamera>();
    const sceneRef = useRef<THREE.Scene>();

    useEffect(() => {
        if (!mountRef.current) return;

        // シーンを作成
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // カメラを作成
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 3;
        cameraRef.current = camera;

        // レンダラーを作成
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 地球儀を作成
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load(mapImageSrc); // ローカルのテクスチャを使用
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ map: earthTexture, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
        const earth = new THREE.Mesh(geometry, material);
        scene.add(earth);
        earthRef.current = earth;

        // 物体を作成
        const objectGeometry = new THREE.SphereGeometry(0.05, 32, 32);
        const objectMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const object = new THREE.Mesh(objectGeometry, objectMaterial);
        scene.add(object);
        objectRef.current = object;

        // 初期の位置を設定
        const initialPosition = new THREE.Vector3();
        initialPosition.setFromSphericalCoords(1, (90 - initialLatitude) * (Math.PI / 180), initialLongitude * (Math.PI / 180));
        object.position.copy(initialPosition);

        // リサイズイベントに対応
        const handleResize = () => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (renderer && mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, [initialLongitude, initialLatitude]);

    useEffect(() => {
        if (!isRunning) return;

        let animationFrameId: number;

        const animate = () => {
            if (earthRef.current) {
                earthRef.current.rotation.y = earthRotation * Math.PI / 180;
            }

            if (objectRef.current) {
                const { x, y, z } = position;
                objectRef.current.position.set(x, y, z);
            }

            if (rendererRef.current && cameraRef.current && sceneRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isRunning, earthRotation, position]);

    return <div ref={mountRef} />;
};

export default Animation1;
