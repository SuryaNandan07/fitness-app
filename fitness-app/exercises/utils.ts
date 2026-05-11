export type Point = {
    x: number;
    y: number;
};

export function isGoodPoint(point?: Point) {
    if (!point) return false;
    if (point.x <= 0 || point.y <= 0) return false;
    return true;
}

export function calculateAngle(a: Point, b: Point, c: Point) {
    const radians =
        Math.atan2(c.y - b.y, c.x - b.x) -
        Math.atan2(a.y - b.y, a.x - b.x);

    let angle = Math.abs((radians * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;

    return angle;
}

export function arePointsVisible(data: any, points: string[]) {
    for (const pointName of points) {
        if (!isGoodPoint(data[pointName])) {
            return false;
        }
    }

    return true;
}