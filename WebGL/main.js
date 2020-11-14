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
        super(Cube.vertices, {
            indices: Cube.indices,
            texture: {
                src: "textures/lena512.png",
                coords: Cube.textureCoordinates
            },
            pos: pos,
            scale: new Vector3d(1, 1, 1).scale(10)
        });
    }

    get rotationSpeed() {
        return 2 * Math.PI / MINUTE;
    }
}

class CubeColored extends RenderObject {
    constructor(pos) {
        super(Cube.vertices, {
            indices: Cube.indices,
            attributes: {
                color: {
                    dimensions: 4,
                    data: Cube.getColor(
                        [1, 0, 0, 1],
                        [0, 1, 0, 1],
                        [0, 0, 1, 1],
                        [1, 1, 0, 1],
                        [0, 1, 1, 1],
                        [1, 0, 1, 1]
                    )
                }
            },
            pos: pos,
            scale: new Vector3d(1, 1, 1).scale(10)
        });
    }

    get rotationSpeed() {
        return Math.PI / SECOND;
    }
}
