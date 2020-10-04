"use strict";
//
// Computer Graphics
//
// WebGL Exercises
//

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

        this.renderer = new Renderer(canvas, this.renderObjects, this.attributes, this.uniforms);
    }

    get attributes() {
        return [];
    }

    get uniforms() {
        return {
            uColor: [1, 1, 0],
            uTime: 0
        }
    }

    get rotationsPerSecond() {
        return 1;
    }

    onSizeChanged() {
        this.aspectRatio = canvas.width / canvas.height;
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
        // this.renderer.uniforms.uTime = now * this.rotationsPerSecond / 1000 + index / 4;
    }

    get renderObjects() {
        return [
            new Paddle(0),
            new Paddle(1),
            new Ball(),
            new MidLine()
        ];
    }

    static get scaling() {
        return {
            x: 2 / canvas.width,
            y: 2 / canvas.height
        };
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
            { x: -playerXPos, y: 0 },  // Player 1
            { x: playerXPos, y: 0 }    // Player 2
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
            pos: { x: 0, y: 0 }
        });
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

class Vector2d {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    rotate(rad) {
        const sin = Math.sin(rad);
        const cos = Math.cos(rad);
        return new Vector2d(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }
}
