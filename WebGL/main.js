"use strict";
//
// Computer Graphics
//
// WebGL Exercises
//

window.onload = () => {
    const canvas = document.getElementById("myCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const renderer = new Renderer(canvas, new Scene(canvas));
    requestAnimationFrame(() => renderer.draw());
};

class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.onSizeChanged();

        this.renderObjects = this.getRenderObjects();
    }

    get attributes() {
        return {
            aVertices: 0,
            aTextureCoord: 0,
            aColor: 0
        }
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
        this.aspectRatio = this.canvas.width / this.canvas.height;
    }

    updateUniforms(renderer, now, delta, index) {
        renderer.uniforms.uTime = now * this.rotationsPerSecond / 1000 + index / 4;
    }

    createAllBuffers(renderer) {
        this.renderObjects.forEach(o => o.createAllBuffers(renderer.gl));
        for (const name in this.textures)
            this.textures[name] = renderer.loadTexture(this.textures[name]);
    }

    getRenderObjects() {
        const segmentCount = 100;
        const step = Math.PI / segmentCount;
        const getRad = n => n * step;

        const o = new Vector2d(0, 0.1);
        const v = new Vector2d(0, 1);
        return [...Array(segmentCount * 2).keys()].filter(n => n % 2 - 1).map(n => {
            const p0 = o.rotate(getRad(n));
            const p1 = v.rotate(getRad(n + 0.5))
            const p2 = v.rotate(getRad(n - 0.5));
            return new RenderObject(this, "lena512.png", [
                p0.x / this.aspectRatio, p0.y,
                p1.x / this.aspectRatio, p1.y,
                p2.x / this.aspectRatio, p2.y
            ], [
                Math.random(), Math.random(), Math.random(), 1,
                Math.random(), Math.random(), Math.random(), 1,
                Math.random(), Math.random(), Math.random(), 1
            ]);
        });
    }
}

class RenderObject {
    constructor(scene, textureSrc, vertices, color) {
        this.scene = scene;

        this.vertices = vertices;
        this.color = color;
        this.textureSrc = textureSrc;
        const correctAspectRatio = (c, i) => c * (i % 2 ? 1 : scene.aspectRatio);
        this.textureCoords = vertices.map(correctAspectRatio).map(c => (c + 1) / 2);
    }

    get attributes() {
        return {
            aVertices: {
                dimensions: 2,
                data: this.vertices
            },
            aTextureCoord: {
                dimensions: 2,
                data: this.textureCoords
            },
            aColor: {
                dimensions: 4,
                data: this.color
            }
        }
    }

    createAllBuffers(gl) {
        this.buffers = {
            texture: this.createBuffer(gl, this.textureCoords)
        };
        for (const attribute in this.attributes)
            this.buffers[attribute] = this.createBuffer(gl, this.attributes[attribute].data);
    }

    createBuffer(gl, data) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        return buffer;
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
