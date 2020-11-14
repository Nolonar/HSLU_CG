"use strict";

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;

const DEG_TO_RAD = Math.PI / 180;

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
        this.sphere1 = new SphereColored(new Vector3d(-20, 0, 30));
        this.sphere2 = new SphereTextured(new Vector3d(40, 0, 30));
        this.camera.lookAt(new Vector3d(0, 0, 0));

        this.lightColor = [1, 1, 1];
        this.lightDirection = Vector3d.DOWN.rotateX(-30 * DEG_TO_RAD).rotateZ(-30 * DEG_TO_RAD);
    }

    get renderObjects() {
        return super.renderObjects.concat([
            this.cube1,
            this.cube2,
            this.sphere1,
            this.sphere2
        ]);
    }

    updateWorld(delta) {
        this.cube1.rotation = this.cube1.rotation.rotateY(-this.cube1.rotationSpeed * delta);
        this.cube2.rotation = this.cube2.rotation.rotateY(this.cube2.rotationSpeed * delta);
        this.sphere2.rotation = this.sphere2.rotation.rotateY(this.sphere2.rotationSpeed * delta);
    }

    updateUniforms(uniforms) {
        uniforms.uLightDirection = this.lightDirection;
        uniforms.uLightColor = this.lightColor;
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
    constructor(pos) {
        const sphere = new Sphere(20, 20);

        super(sphere.vertices, {
            indices: sphere.indices,
            normals: sphere.normals,
            attributes: {
                color: {
                    dimensions: 4,
                    data: sphere.getColor([1, 0, 0, 1])
                }
            },
            pos: pos,
            scale: new Vector3d(1, 1, 1).scale(10)
        });
    }
}
