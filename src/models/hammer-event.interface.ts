export interface HammerEvent<T> {
    additionalEvent: string;
    angle: number;
    center: Coordinates;
    changedPointers: Array<PointerEvent>
    deltaTime: number;
    deltaX: number;
    deltaY: number;
    direction: number
    distance: number
    eventType: number;
    isFinal: boolean;
    isFirst: boolean;
    maxPointers: number;
    offsetDirection: number
    overallVelocity: number;
    overallVelocityX: number;
    overallVelocityY: number;
    pointers: Array<PointerEvent>;
    preventDefault: Function;
    rotation: number;
    scale: number;
    srcEvent: PointerEvent;
    target: T;
    timeStamp: number;
    type: string;
    velocity: number;
    velocityX: number
    velocityY: number;
}

export interface Coordinates{
    x: number;
    y: number;
}
