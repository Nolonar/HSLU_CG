"use strict";

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;

let canvas = null;
window.onload = () => {
    canvas = document.getElementById("myCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    InputManager.registerKeyEvents();

    const scene = new Game();
    requestAnimationFrame(scene.update.bind(scene));
};

class Game extends Scene {
    constructor() {
        super(canvas);
        this.projection = this.getPerspectiveProjection();
        this.cube = new Cube();
    }

    get renderObjects() {
        return super.renderObjects.concat([
            this.cube
        ]);
    }

    updateWorld(delta) {
        this.cube.rotation = this.cube.rotation.rotateY(-this.cube.rotationSpeed * delta);
    }
}

class Cube extends RenderObject {
    constructor() {
        super({
            dimensions: 3,
            data: [
                1, 1, 1,
                1, 1, -1,
                1, -1, 1,
                1, -1, -1,
                -1, 1, 1,
                -1, 1, -1,
                -1, -1, 1,
                -1, -1, -1
            ]
        }, {
            indices: [
                0, 1,
                0, 2,
                0, 4,
                1, 3,
                1, 5,
                2, 3,
                2, 6,
                3, 7,
                4, 5,
                4, 6,
                5, 7,
                6, 7
            ],
            drawMode: "LINES",
            scale: new Vector3d(1, 1, 1).scale(10)
        });
    }

    get rotationSpeed() {
        return (Math.PI / 2) / SECOND;
    }
}
