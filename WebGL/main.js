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

class Renderer {
    constructor(canvas, scene) {
        this.isReady = false;

        this.gl = createGLContext(canvas);
        loadAndCompileShaders(this.gl, 'VertexShader.glsl', 'FragmentShader.glsl').then(shaderProgram => {
            this.attributeLocations = this.setUpAttributes(shaderProgram, scene.attributes);
            this.uniformLocations = this.setUpUniforms(shaderProgram, scene.uniforms);

            this.isReady = true;
        });
        this.scene = scene;
        this.scene.createAllBuffers(this);
        this.previousTime = performance.now();

        this.gl.clearColor(0, 0, 0, 1);
    }

    setUpAttributes(shaderProgram, attributes) {
        this.attributes = attributes;
        return this.getLocations(shaderProgram, "Attrib", attributes);
    }

    setUpUniforms(shaderProgram, uniforms) {
        this.uniforms = uniforms;
        return this.getLocations(shaderProgram, "Uniform", { ...uniforms, ...{ uSampler: 0 } });
    }

    getLocations(shaderProgram, type, data) {
        const result = {};
        for (const property in data)
            result[property] = this.gl[`get${type}Location`](shaderProgram, property);

        return result;
    }

    loadTexture(src) {
        const texture = this.gl.createTexture();
        this.loadImage(src).then(img => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            // set parameters for the texture
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            // turn texture off again
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        });
        return texture;
    }

    async loadImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        });
    }

    draw() {
        requestAnimationFrame(() => this.draw());
        if (!this.isReady) return;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        const currentTime = performance.now();
        const deltaTime = currentTime - this.previousTime;
        for (const i in this.scene.renderObjects) {
            const renderObject = this.scene.renderObjects[i];
            this.enableAttributes(renderObject);
            this.setTexture(renderObject)
            this.updateUniforms(currentTime, deltaTime, i);

            this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
        }
        this.previousTime = currentTime;
    }

    enableAttributes(renderObject) {
        for (const attribute in renderObject.attributes) {
            const location = this.attributeLocations[attribute];
            const buffer = renderObject.buffers[attribute];

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(location, 4, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(location);
        }
    }

    setTexture(renderObject) {
        const texture = renderObject.texture;
        if (typeof texture === "string") return;

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.uniformLocations.uSampler, 0);
    }

    updateUniforms(currentTime, deltaTime, index) {
        this.scene.updateUniforms(this, currentTime, deltaTime, index);

        const locations = this.uniformLocations;
        const functionMapper = {
            number: (property, n) => this.gl.uniform1f(locations[property], n),
            object: (property, o) => {
                if (Array.isArray(o))
                    this.gl[`uniform${o.length}fv`](locations[property], o);
                else
                    /* no clue how to handle this type of uniform */;
            }
        };
        for (const property in this.uniforms) {
            const value = this.uniforms[property];
            functionMapper[typeof value](property, value);
        }
    }
}

class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.onSizeChanged();

        this.textures = {
            lena: "lena512.png"
        };

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
        return [new RenderObject(this, "lena", [
            0, 0, 0, 1,
            0, 1, 0, 1,
            1, 1, 0, 1,
            1, 0, 0, 1
        ], [
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1
        ])];
        const segmentCount = 100;
        const step = Math.PI / segmentCount;
        const getRad = n => n * step;

        const o = new Vector2d(0, 0.1);
        const v = new Vector2d(0, 1);
        return [...Array(segmentCount * 2).keys()].filter(n => n % 2 - 1).map(n => {
            const p0 = o.rotate(getRad(n));
            const p1 = v.rotate(getRad(n + 0.5))
            const p2 = v.rotate(getRad(n - 0.5));
            return new RenderObject(this, "lena", [
                p0.x / this.aspectRatio, p0.y, 0,
                p1.x / this.aspectRatio, p1.y, 0,
                p2.x / this.aspectRatio, p2.y, 0
            ], [
                Math.random(), Math.random(), Math.random(), 1,
                Math.random(), Math.random(), Math.random(), 1,
                Math.random(), Math.random(), Math.random(), 1
            ]);
        });
    }
}

class RenderObject {
    constructor(scene, textureName, vertices, color) {
        this.scene = scene;

        this.vertices = vertices;
        this.color = color;
        this.textureName = textureName;
        // this.textureCoords = vertices.filter((_, i) => (i + 1) % 3).map(c => (c + 1) / 2);
        this.textureCoords = [
            0, 1,
            0, 0,
            1, 1,
            0, 0,
            1, 0,
            1, 1,
        ];
    }

    get attributes() {
        return {
            aVertices: this.vertices,
            aTextureCoord: this.textureCoords,
            aColor: this.color
        }
    }

    get texture() {
        return this.scene.textures[this.textureName];
    }

    createAllBuffers(gl) {
        this.buffers = {
            texture: this.createBuffer(gl, this.textureCoords)
        };
        for (const attribute in this.attributes)
            this.buffers[attribute] = this.createBuffer(gl, this.attributes[attribute]);
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
