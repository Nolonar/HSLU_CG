"use strict";

class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.camera = new Camera();
        this.projection = this.getIsometricProjection();
        this.previousTime = 0;
    }

    get resolution() {
        return new Vector2d(canvas.width, canvas.height);
    }

    getIsometricProjection() {
        const bounds = this.resolution.scale(1 / 2);
        return Matrix4.ortho(-bounds.x, bounds.x, -bounds.y, bounds.y, 1, 1000);
    }

    getFrustumProjection() {
        const bounds = this.resolution.scale(1 / 2);
        return Matrix4.frustum(-bounds.x, bounds.x, -bounds.y, bounds.y, 100, 1000);
    }

    getPerspectiveProjection(fovy) {
        const res = this.resolution;
        return Matrix4.perspective(fovy ?? Math.PI / 2, res.x / res.y, 1, 1000);
    }

    get renderer() {
        if (!this._renderer) {
            const renderObjects = this.renderObjects.map(o => {
                o.setScene(this);
                return o;
            });
            this._renderer = new Renderer(this.canvas, renderObjects, this.attributes, this.uniforms);
        }

        return this._renderer;
    }

    get attributes() {
        return [];
    }

    get uniforms() {
        return {};
    }

    get renderObjects() {
        return [];
    }

    update(currentTime) {
        requestAnimationFrame(this.update.bind(this));

        const delta = currentTime - this.previousTime;
        this.updateWorld(delta);
        this.renderer.draw(this);
        this.previousTime = currentTime;
    }

    updateWorld(delta) { /* virtual */ }

    updateUniforms(uniforms) { /* virtual */ }
}

class Camera {
    constructor() {
        this.pos = new Vector3d(0, 0, -1);
        this.up = new Vector3d(0, 1, 0);
        this.lookAt(Vector3d.ZERO);
    }

    lookAt(target) {
        this.matrix = Matrix4.lookAt(this.pos, target, this.up);
    }
}

class InputManager {
    constructor() {
        throw new Error("Cannot instantiate static class.");
    }

    static pressed = {};

    static registerKeyEvents() {
        document.onkeydown = e => InputManager.pressed[e.code] = true;
        document.onkeyup = e => InputManager.pressed[e.code] = false;
    }

    static isPressed(keyCode) {
        return !!InputManager.pressed[keyCode];
    }
}

class Renderer {
    constructor(canvas, renderObjects, attributes, uniforms) {
        this.isReady = false;

        this.gl = createGLContext(canvas);
        loadAndCompileShaders(this.gl, 'VertexShader.glsl', 'FragmentShader.glsl').then(shaderProgram => {
            this.attributeLocations = this.setUpAttributes(shaderProgram, attributes);
            this.uniformLocations = this.setUpUniforms(shaderProgram, uniforms);

            this.isReady = true;
        });
        this.resourceManager = new ResourceManager(this);
        this.renderObjects = [];

        this.initialize();
        this.addRenderObjects(renderObjects);
    }

    initialize() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.frontFace(this.gl.CCW);
        this.gl.cullFace(this.gl.BACK);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    setUpAttributes(shaderProgram, attributes) {
        const defaultAttributes = ["vertices", "normals", "textureCoord", "color"];
        return this.getLocations(shaderProgram, "Attrib", [...attributes, ...defaultAttributes]);
    }

    setUpUniforms(shaderProgram, uniforms) {
        this.uniforms = uniforms;
        const defaultUniforms = ["uIsLit", "uLightDirection", "uLightColor", "uHasTexture", "uSampler", "uProjection", "uModel", "uNormals"];
        return this.getLocations(shaderProgram, "Uniform", [...Object.keys(uniforms), ...defaultUniforms]);
    }

    getLocations(shaderProgram, type, names) {
        const result = {};
        for (const name of names)
            result[name] = this.gl[`get${type}Location`](shaderProgram, name);

        return result;
    }

    addRenderObjects(objectsToAdd) {
        this.renderObjects.push(...objectsToAdd);
        objectsToAdd.forEach(o => o.buffers = this.createAllBuffers(o));
    }

    createAllBuffers(renderObject) {
        const attributes = renderObject.attributes;
        const buffers = {};
        for (const attribute in attributes) {
            buffers[attribute] = attribute === "indices"
                ? this.createIndexBuffer(attributes.indices)
                : this.createVertexBuffer(attributes[attribute].data);
        }

        return buffers;
    }

    createVertexBuffer(data) {
        return this.createBuffer(this.gl.ARRAY_BUFFER, new Float32Array(data));
    }

    createIndexBuffer(data) {
        return this.createBuffer(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data));
    }

    createBuffer(target, srcData) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(target, buffer);
        this.gl.bufferData(target, srcData, this.gl.STATIC_DRAW);
        return buffer;
    }

    draw(scene) {
        if (!this.isReady) return;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        scene.updateUniforms(this.uniforms);
        this.renderObjects.forEach(o => this.drawObject(o));
    }

    drawObject(renderObject) {
        this.setAttributes(renderObject);
        this.setTexture(renderObject.textureSrc);
        renderObject.updateUniforms(this.uniforms);
        this.setUniforms();

        if (renderObject.attributes.indices)
            this.drawIndices(renderObject);
        else
            this.drawVertices(renderObject);
    }

    drawVertices(renderObject) {
        const verticesAttr = renderObject.attributes.aVertices;
        const verticesCount = verticesAttr.data.length / verticesAttr.dimensions;
        this.gl.drawArrays(this.getDrawMode(renderObject), 0, verticesCount);
    }

    drawIndices(renderObject) {
        const indicesCount = renderObject.attributes.indices.length;
        this.gl.drawElements(this.getDrawMode(renderObject), indicesCount, this.gl.UNSIGNED_SHORT, 0);
    }

    getDrawMode(renderObject) {
        return this.gl[renderObject.drawMode];
    }

    setAttributes(renderObject) {
        for (const attr in renderObject.attributes) {
            if (attr === "indices")
                this.setIndexAttribute(renderObject.buffers.indices);
            else
                this.setVertexAttribute(this.attributeLocations[attr], renderObject.buffers[attr], renderObject.attributes[attr].dimensions);
        }
    }

    setVertexAttribute(location, buffer, dimensions) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(location, dimensions, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(location);
    }

    setIndexAttribute(buffer) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    }

    setTexture(textureSrc) {
        this.gl.uniform1i(this.uniformLocations.uHasTexture, !!textureSrc);
        if (!textureSrc) return;

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.resourceManager.getTexture(textureSrc));
        this.gl.uniform1i(this.uniformLocations.uSampler, 0);
    }

    setUniforms() {
        const locations = this.uniformLocations;
        const functionMapper = {
            boolean: (property, b) => this.gl.uniform1i(locations[property], b),
            number: (property, n) => this.gl.uniform1f(locations[property], n),
            object: (property, o) => {
                if (Array.isArray(o))
                    this.gl[`uniform${o.length}fv`](locations[property], o);
                if (o instanceof Vector2d)
                    this.gl.uniform2fv(locations[property], o.data);
                if (o instanceof Vector3d)
                    this.gl.uniform3fv(locations[property], o.data);
                if (o instanceof Matrix3)
                    this.gl.uniformMatrix3fv(locations[property], false, o.data);
                if (o instanceof Matrix4)
                    this.gl.uniformMatrix4fv(locations[property], false, o.data);
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

class ResourceManager {
    constructor(parent) {
        this.parent = parent;
        this.textures = {};
    }

    preloadTextures(sources) {
        for (const src of sources)
            this.textures[src] = this.loadTexture(src);
    }

    loadTexture(src) {
        const gl = this.parent.gl;
        const texture = gl.createTexture();
        const img = new Image();
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            // set parameters for the texture
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            // turn texture off again
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        img.src = src;
        return texture;
    }

    getTexture(src) {
        if (!this.textures[src])
            this.textures[src] = this.loadTexture(src);

        return this.textures[src];
    }
}

class RenderObject {
    constructor(vertices, options) {
        this.drawMode = vertices.drawMode;
        this.setAttributes(vertices, options);
        this.setTexture(options?.texture);
        this.isLit = options?.isLit ?? true;

        this.pos = options?.pos ?? new Vector3d(0, 0, 0);
        this.scaling = options?.scale ?? new Vector3d(1, 1, 1);
        this.rotation = Quaternion.IDENTITY;
    }

    setScene(scene) {
        this.scene = scene;
    }

    setAttributes(vertices, options) {
        this.attributes = {
            ...options?.attributes,
            ...{
                vertices: vertices,
                indices: options?.indices,
                normals: options?.normals ?? {
                    dimensions: 3,
                    data: [...Array(vertices.data.length / vertices.dimensions)].flatMap(_ => [0, 0, 1])
                }
            }
        };
        if (!this.attributes.color) {
            this.attributes.color = {
                dimensions: 4,
                data: [...Array(vertices.data.length / vertices.dimensions)].flatMap(_ => [1, 1, 1, 1])
            };
        }
    }

    setTexture(texture) {
        if (!texture) return;

        this.textureSrc = texture.src;
        this.attributes.textureCoord = {
            dimensions: 2,
            data: texture.coords
        };
    }

    updateUniforms(uniforms) {
        const modelMat = Matrix4.fromRotationTranslationScale(this.rotation, this.pos, this.scaling)

        uniforms.uIsLit = this.isLit;
        uniforms.uProjection = this.scene.projection;
        uniforms.uModel = this.scene.camera.matrix.mul(modelMat);
        uniforms.uNormals = Matrix3.normalFromMat4(modelMat);
    }
}
