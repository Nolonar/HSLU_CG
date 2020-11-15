"use strict";

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;

const DEG_TO_RAD = Math.PI / 180;

const GRAVITY = Vector3d.DOWN.scale(10 / SECOND / SECOND);

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
        this.camera.pos = new Vector3d(0, 30, -20);
        this.cube1 = new CubeColored(new Vector3d(0, 10, 50));
        this.cube2 = new CubeTextured(new Vector3d(10, 10, 20));
        this.spheres = [...Array(10)].map(_ => SphereColored.random);
        this.camera.lookAt(new Vector3d(0, 0, 30));

        this.lightDirection = Vector3d.UP.rotateX(-30 * DEG_TO_RAD).rotateZ(-30 * DEG_TO_RAD).normalize();
    }

    get renderObjects() {
        return super.renderObjects.concat([
            this.cube1,
            this.cube2
        ], this.spheres);
    }

    updateWorld(delta) {
        this.cube1.rotation = this.cube1.rotation.rotateY(-this.cube1.rotationSpeed * delta);
        this.cube2.rotation = this.cube2.rotation.rotateY(this.cube2.rotationSpeed * delta);
        this.spheres.forEach(sphere => sphere.updatePos(delta));
    }
}

class CubeTextured extends RenderObject {
    constructor(pos) {
        super(Cube.vertices, {
            indices: Cube.indices,
            normals: Cube.normals,
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
            normals: Cube.normals,
            attributes: {
                color: {
                    dimensions: 4,
                    data: Cube.getColorData(
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

class SphereTextured extends RenderObject {
    constructor(pos) {
        const sphere = new Sphere(20, 20);

        super(sphere.vertices, {
            indices: sphere.indices,
            normals: sphere.normals,
            texture: {
                src: "textures/lena512.png",
                coords: Cube.textureCoordinates
            },
            pos: pos,
            scale: new Vector3d(1, 1, 1).scale(10)
        });
    }

    get rotationSpeed() {
        return Math.PI / (2 * SECOND);
    }
}

class SphereColored extends RenderObject {
    constructor(pos, size, color) {
        const sphere = new Sphere(20, 20);

        super(sphere.vertices, {
            indices: sphere.indices,
            normals: sphere.normals,
            attributes: {
                color: {
                    dimensions: 4,
                    data: sphere.getColorData(color)
                }
            },
            isShiny: true,
            shininess: 16,
            pos: pos,
            scale: new Vector3d(1, 1, 1).scale(size)
        });
        this.velocity = Vector3d.ZERO;
        this.size = size;
    }

    static get random() {
        const size = Math.random() * 5;
        const pos = new Vector3d(RandomUtils.getBetween(-80, 80), RandomUtils.getBetween(size, 50), RandomUtils.getBetween(-10, 50));
        const color = ColorUtils.hsvToRgb(Math.random() * 360, 1, 1).concat([1]);
        return new SphereColored(pos, size, color);
    }

    updatePos(delta) {
        this.pos = this.pos.scaleAndAdd(this.velocity, delta);
        if (this.pos.y <= this.size) {
            this.pos.y = this.size;
            this.velocity.y = -this.velocity.y;
        }
        this.velocity = this.velocity.scaleAndAdd(GRAVITY, delta);
    }
}
