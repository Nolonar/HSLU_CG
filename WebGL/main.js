"use strict";

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;

let canvas = null;
window.onload = () => {
    canvas = document.getElementById("myCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scene = new Scene();
    requestAnimationFrame(() => scene.update());
};

class Scene {
    constructor() {
        this.previousTime = performance.now();
        this.onSizeChanged();

        this.player1 = new Paddle(0);
        this.player2 = new Paddle(1);
        this.ball = new Ball();

        this.renderer = new Renderer(canvas, this.renderObjects, this.attributes, this.uniforms);
        canvas.onmousemove = this.onMouseMove.bind(this);
        canvas.onclick = this.onClick.bind(this);
    }

    get attributes() {
        return [];
    }

    get uniforms() {
        return {};
    }

    get renderObjects() {
        return [
            this.player1,
            this.player2,
            this.ball,
            new MidLine()
        ];
    }

    static get scaling() {
        return {
            x: 2 / canvas.width,
            y: 2 / canvas.height
        };
    }

    onSizeChanged() {
        this.aspectRatio = canvas.width / canvas.height;
    }

    getCoordinatesFromMouse(x, y) {
        return {
            x: x - canvas.width / 2,
            y: -(y - canvas.height / 2)
        };
    }

    update() {
        requestAnimationFrame(() => this.update());

        const currentTime = performance.now();
        const delta = currentTime - this.previousTime;
        this.updateWorld(delta);
        this.renderer.draw();
        this.previousTime = currentTime;
    }

    updateWorld(delta) {
        this.ball.updatePosition(delta);
    }

    onMouseMove(e) {
        this.player1.pos.y = this.getCoordinatesFromMouse(e.x, e.y).y;
    }

    onClick() {
        this.ball.isMoving = true;
    }
}

class Paddle extends RenderObject {
    constructor(playerNr) {
        const playerColors = [
            [1, 0, 0],  // Player 1
            [0, 0, 1]   // Player 2
        ];
        const screenEdge = canvas.width / 2;
        const playerXPos = screenEdge - 200;
        const playerStartingPos = [
            new Vector2d(-playerXPos, 0),   // Player 1
            new Vector2d(playerXPos, 0)     // Player 2
        ];

        const vertices = [
            -25, -200,
            25, -200,
            25, 200,
            -25, 200
        ];
        super(2, vertices, {
            color: {
                dimensions: 3,
                data: [...Array(vertices.length / 2)].flatMap(_ => playerColors[playerNr])
            },
            scale: Scene.scaling,
            pos: playerStartingPos[playerNr]
        });
    }
}

class Ball extends RenderObject {
    constructor() {
        const segmentCount = 100;
        const step = 2 * Math.PI / segmentCount;
        const v = new Vector2d(0, 25);
        const vertices = [...Array(segmentCount).keys()].flatMap(n => {
            const p = v.rotate(n * step);
            return [p.x, p.y];
        });

        super(2, vertices, {
            scale: Scene.scaling,
            pos: new Vector2d(0, 0)
        });

        this.isMoving = false;
        this.speed = 100 / SECOND;
        this.direction = new Vector2d(1, 0.1);
    }

    updatePosition(delta) {
        if (!this.isMoving) return;

        this.pos = this.pos.scaleAndAdd(this.direction, this.speed * delta);
    }
}

class MidLine extends RenderObject {
    constructor() {
        const screenEdge = canvas.height / 2;
        super(2, [
            -1, -screenEdge,
            1, -screenEdge,
            1, screenEdge,
            -1, screenEdge
        ], {
            scale: Scene.scaling
        });
    }
}

/// Wrapper for gl-matrix vec2
class Vector2d {
    constructor(x, y) {
        this.data = vec2.fromValues(x, y);
    }

    static fromVec2(vec) {
        return new Vector2d(vec[0], vec[1]);
    }

    get x() { return this.data[0]; }
    get y() { return this.data[1]; }
    set x(val) { this.data[0] = val; }
    set y(val) { this.data[1] = val; }

    clone() {
        return vec2.clone(this.data);
    }

    rotate(rad) {
        const rotate = mat2.create();
        mat2.fromRotation(rotate, rad);

        const result = vec2.create();
        vec2.transformMat2(result, this.data, rotate);

        return Vector2d.fromVec2(result);
    }

    scaleAndAdd(other, scalar) {
        const result = vec2.create();
        vec2.scaleAndAdd(result, this.data, other.data, scalar);
        return Vector2d.fromVec2(result);
    }
}
