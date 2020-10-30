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
        this.camera.pos = new Vector3d(0, 20, -20);
        this.cube1 = new CubeColored(new Vector3d(0, 0, 50));
        this.cube2 = new CubeTextured(new Vector3d(10, 0, 20));
        this.camera.lookAt(new Vector3d(0, 0, 0));
    }

    get renderObjects() {
        return super.renderObjects.concat([
            this.cube1,
            this.cube2
        ]);
    }

    updateWorld(delta) {
        this.cube1.rotation = this.cube1.rotation.rotateY(-this.cube1.rotationSpeed * delta);
        this.cube2.rotation = this.cube2.rotation.rotateY(this.cube2.rotationSpeed * delta);
    }
}

class CubeTextured extends RenderObject {
    constructor(pos) {
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
                0, 2, 1,
                1, 2, 3,
                0, 4, 2,
                2, 4, 6,
                0, 1, 4,
                1, 5, 4,
                1, 3, 5,
                3, 7, 5,
                2, 6, 3,
                3, 6, 7,
                4, 5, 6,
                5, 7, 6
            ],
            drawMode: "TRIANGLES",
            pos: pos,
            scale: new Vector3d(1, 1, 1).scale(10),
            texture: {
                src: "textures/lena512.png",
                coords: [
                    0, 1,
                    1, 1,
                    0, 0,
                    1, 0,
                    1, 1,
                    0, 1,
                    1, 0,
                    0, 0
                ]
            }
        });
    }

    get rotationSpeed() {
        return 2 * Math.PI / MINUTE;
    }
}

class CubeColored extends RenderObject {
    constructor(pos) {
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
                0, 2, 1,
                1, 2, 3,
                0, 4, 2,
                2, 4, 6,
                0, 1, 4,
                1, 5, 4,
                1, 3, 5,
                3, 7, 5,
                2, 6, 3,
                3, 6, 7,
                4, 5, 6,
                5, 7, 6
            ],
            drawMode: "TRIANGLES",
            pos: pos,
            scale: new Vector3d(1, 1, 1).scale(10),
            attributes: {
                color: {
                    dimensions: 4,
                    data: [
                        0, 0, 0, 1,
                        1, 0, 0, 1,
                        0, 1, 0, 1,
                        1, 1, 0, 1,
                        0, 0, 1, 1,
                        1, 0, 1, 1,
                        0, 1, 1, 1,
                        1, 1, 1, 1
                    ]
                }
            }
        });
    }

    get rotationSpeed() {
        return Math.PI / SECOND;
    }
}
