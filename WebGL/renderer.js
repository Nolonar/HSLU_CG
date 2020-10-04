"use strict";

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

            this.gl.drawArrays(this.gl.TRIANGLES, 0, 4);
        }
        this.previousTime = currentTime;
    }

    enableAttributes(renderObject) {
        for (const attribute in renderObject.attributes) {
            const location = this.attributeLocations[attribute];
            const buffer = renderObject.buffers[attribute];
            const dimensions = renderObject.attributes[attribute].dimensions;

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(location, dimensions, this.gl.FLOAT, false, 0, 0);
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