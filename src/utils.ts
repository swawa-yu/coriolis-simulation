import { Position, PositionGeo, PositionThree } from "./types";

export function geoToXyz(positionGeo: PositionGeo): Position {
    const latRad = positionGeo.lat * Math.PI / 180;
    const lonRad = positionGeo.lon * Math.PI / 180;
    const x = Math.cos(latRad) * Math.cos(lonRad);
    const y = Math.cos(latRad) * Math.sin(lonRad);
    const z = Math.sin(latRad);
    return { x, y, z };
}

export function xyzToGeo(position: Position): PositionGeo {
    const lat = Math.asin(position.z) * 180 / Math.PI;
    const lon = Math.atan2(position.y, position.x) * 180 / Math.PI;
    return { lat, lon };
}

export function degreeToRadian(degree: number): number {
    return degree * Math.PI / 180;
}

export function radianToDegree(radian: number): number {
    return radian * 180 / Math.PI;
}

export function absoluteToEarth(positionGeo: PositionGeo, earthRotation: number): PositionGeo {
    let lon = positionGeo.lon - earthRotation;
    lon %= 360;
    if (lon < -180) {
        lon += 360;
    } else if (lon > 180) {
        lon -= 360;
    }
    return { lat: positionGeo.lat, lon: lon };
}

export function normalToThree(position: Position): PositionThree {
    return { x: position.x, y: position.z, z: -position.y };
}

// TODO 関数名を適切なものにする
export function rotateAroundPolarAxis(position: Position, degree: number): Position {
    const rad = degreeToRadian(degree);
    const x = position.x * Math.cos(rad) - position.y * Math.sin(rad);
    const y = position.x * Math.sin(rad) + position.y * Math.cos(rad);
    return { x, y, z: position.z };
}