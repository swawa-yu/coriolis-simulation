import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Position, PositionGeo } from '../types';
import { normalToThree, rotateAroundPolarAxis } from '../utils';
import mapImageSrc from '../assets/world_map_with_grid.jpg';

interface Animation1Props {
    initialPosition: Position;
    initialPositionGeo: PositionGeo;
    earthRotation: number;
    position: Position;
    isRunning: boolean;
    isAbsolute: boolean;
}


const Animation1: React.FC<Animation1Props> = ({ initialPosition, initialPositionGeo, isRunning, position, earthRotation, isAbsolute }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const earthRef = useRef<THREE.Mesh>();
    const objectRef = useRef<THREE.Mesh>();
    const initialPositionRef = useRef<THREE.Mesh>(); // 初期位置のマーカー参照を追加
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

        // 初期位置マーカーを作成
        const initialPositionMarkerGeometry = new THREE.SphereGeometry(0.05, 32, 32);
        const initialPositionMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const initialPositoinMarker = new THREE.Mesh(initialPositionMarkerGeometry, initialPositionMarkerMaterial);
        scene.add(initialPositoinMarker);
        initialPositionRef.current = initialPositoinMarker;

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
    }, [initialPosition]);

    useEffect(() => {
        if (!isRunning) return;

        let animationFrameId: number;

        const animate = () => {
            if (earthRef.current) {
                if (isAbsolute) {
                    earthRef.current.rotation.y = earthRotation * Math.PI / 180;
                }
                earthRef.current.rotation.y += initialPositionGeo.lon * Math.PI / 180;
            }

            if (objectRef.current) {
                const pos = !isAbsolute ?
                    rotateAroundPolarAxis(position, earthRotation + initialPositionGeo.lon) :
                    rotateAroundPolarAxis(position, initialPositionGeo.lon);
                const { x, y, z } = normalToThree(pos);
                objectRef.current.position.set(x, y, z);
            }

            if (initialPositionRef.current) {
                const pos = isAbsolute ?
                    rotateAroundPolarAxis(initialPosition, earthRotation + initialPositionGeo.lon) :
                    rotateAroundPolarAxis(initialPosition, +initialPositionGeo.lon);
                const { x, y, z } = normalToThree(pos);
                initialPositionRef.current.position.set(x, y, z);
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
    }, [isRunning, initialPosition, earthRotation, position]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default Animation1;
