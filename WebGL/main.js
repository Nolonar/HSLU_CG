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

    const scene = new Scene(canvas);
    requestAnimationFrame(() => scene.update());
};

class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.onSizeChanged();
        this.previousTime = performance.now();

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
        this.aspectRatio = this.canvas.width / this.canvas.height;
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
        const segmentCount = 100;
        const step = Math.PI / segmentCount;
        const getRad = n => n * step;

        const o = new Vector2d(0, 0.1);
        const v = new Vector2d(0, 1);
        return [...Array(segmentCount * 2).keys()].filter(n => n % 2 - 1).map(n => {
            const vertices = [
                o.rotate(getRad(n + 0.5)),
                v.rotate(getRad(n + 0.5)),
                v.rotate(getRad(n - 0.5)),
                o.rotate(getRad(n - 0.5))
            ].flatMap(p => [p.x / this.aspectRatio, p.y]);
            return new RenderObject(2, vertices, {
                drawMode: "TRIANGLE_FAN",
                scale: [1 / this.aspectRatio, 1],
                texture: {
                    src: "textures/lena512.png",
                    coords: vertices.map((c, i) => c * (i % 2 ? 1 : this.aspectRatio)).map(c => (c + 1) / 2)
                }
            });
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
