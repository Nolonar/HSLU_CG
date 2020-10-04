"use strict";

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

        this.gl.clearColor(0, 0, 0, 1);
        this.addRenderObjects(renderObjects);
    }

    setUpAttributes(shaderProgram, attributes) {
        const defaultAttributes = ["aVertices", "aTextureCoord", "aColor"];
        return this.getLocations(shaderProgram, "Attrib", [...attributes, ...defaultAttributes]);
    }

    setUpUniforms(shaderProgram, uniforms) {
        this.uniforms = uniforms;
        const defaultUniforms = ["uSampler", "uProjection", "uTransformation"];
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
        const buffers = {};
        for (const attribute in renderObject.attributes)
            buffers[attribute] = this.createBuffer(renderObject.attributes[attribute].data);

        return buffers;
    }

    createBuffer(data) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        return buffer;
    }

    draw() {
        if (!this.isReady) return;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        for (const renderObject of this.renderObjects) {
            this.setAttributes(renderObject);
            this.setTexture(renderObject.textureSrc)

            renderObject.updateUniforms(this.uniforms);
            this.setUniforms();

            const verticesAttr = renderObject.attributes.aVertices;
            const verticesCount = verticesAttr.data.length / verticesAttr.dimensions;
            this.gl.drawArrays(this.gl[renderObject.drawMode], 0, verticesCount);
        }
    }

    setAttributes(renderObject) {
        for (const attribute in renderObject.attributes) {
            const location = this.attributeLocations[attribute];
            const buffer = renderObject.buffers[attribute];
            const dimensions = renderObject.attributes[attribute].dimensions;

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(location, dimensions, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(location);
        }
    }

    setTexture(textureSrc) {
        if (!textureSrc) return;
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.resourceManager.getTexture(textureSrc));
        this.gl.uniform1i(this.uniformLocations.uSampler, 0);
    }

    setUniforms() {
        const locations = this.uniformLocations;
        const functionMapper = {
            number: (property, n) => this.gl.uniform1f(locations[property], n),
            object: (property, o) => {
                if (Array.isArray(o))
                    this.gl[`uniform${o.length}fv`](locations[property], o);
                if (o instanceof Matrix3)
                    this.gl.uniformMatrix3fv(locations[property], false, o.data);
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
    constructor(dimensions, vertices, options) {
        this.attributes = {
            aVertices: {
                dimensions: dimensions,
                data: vertices
            },
            aColor: options?.color ?? {
                dimensions: 4,
                data: [...Array(vertices.length / dimensions)].flatMap(_ => [1, 1, 1, 1])
            }
        };
        this.textureSrc = options?.texture?.src;
        if (this.textureSrc) {
            this.attributes.aTextureCoord = {
                dimensions: 2,
                data: options.texture.coords
            };
        }
        this.drawMode = options?.drawMode ?? "TRIANGLE_FAN";
        this.pos = options?.pos ?? {
            x: 0, y: 0
        };
        this.scaling = options?.scale ?? {
            x: 1, y: 1
        };

        this.attributes = { ...options?.attributes, ...this.attributes };
    }

    updateUniforms(uniforms) {
        uniforms.uProjection = Matrix3.fromScaling(this.scaling.x, this.scaling.y);
        uniforms.uTransformation = Matrix3.fromTranslation(this.pos.x, this.pos.y);
    }
}

class Matrix3 {
    constructor(data) {
        this.data = data;
    }

    static fromScaling(x, y) {
        const data = mat3.create();
        mat3.fromScaling(data, [x, y]);
        return new Matrix3(data);
    }

    static fromTranslation(x, y) {
        const data = mat3.create();
        mat3.fromTranslation(data, [x, y]);
        return new Matrix3(data);
    }
}
