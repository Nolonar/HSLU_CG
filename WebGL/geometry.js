"use strict";

class Cube {
    static vertices = {
        dimensions: 3,
        data: [
            // Front
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0
        ],
        drawMode: "TRIANGLES"
    };

    static indices = [...Array(6).keys()].flatMap(n => [0, 1, 2, 0, 2, 3].map(i => i + n * 4));

    static normals = {
        dimensions: 3,
        data: [
            [0.0, 0.0, 1.0], // Front
            [0.0, 0.0, -1.0], // Back
            [0.0, 1.0, 0.0], // Top
            [0.0, -1.0, 0.0], // Bottom
            [1.0, 0.0, 0.0], // Right
            [-1.0, 0.0, 0.0] // Left
        ].flatMap(n => n.concat(n, n, n))
    };

    static textureCoordinates = [
        // Front
        0, 0,
        1, 0,
        1, 1,
        0, 1,

        // Back
        1, 0,
        1, 1,
        0, 1,
        0, 0,

        // Top
        0, 0,
        1, 0,
        1, 1,
        0, 1,

        // Bottom
        0, 0,
        1, 0,
        1, 1,
        0, 1,

        // Right
        1, 0,
        1, 1,
        0, 1,
        0, 0,

        // Left
        0, 0,
        1, 0,
        1, 1,
        0, 1
    ];

    static getColor(colorFront, colorBack, colorTop, colorBottom, colorRight, colorLeft) {
        return [colorFront, colorBack, colorTop, colorBottom, colorRight, colorLeft].flatMap(c => c.concat(c, c, c))
    }
}

class Sphere {
    constructor(latitudeBands, longitudeBands) {
        const data = this.getData(latitudeBands, longitudeBands);

        this.vertices = {
            dimensions: 3,
            data: data.normals,
            drawMode: "TRIANGLES"
        };
        this.normals = {
            dimensions: 3,
            data: data.normals
        };
        this.indices = data.indices;
        this.textureCoordinates = data.textures;
    }

    getData(latitudeBands, longitudeBands) {
        const normals = [];
        const textures = [];
        const indices = [];

        for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            const theta = latNumber * Math.PI / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                const phi = longNumber * 2 * Math.PI / longitudeBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                // position (and normals as it is a unit sphere)
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                // texture coordinates
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normals.push(x);
                normals.push(y);
                normals.push(z);

                textures.push(u);
                textures.push(v);

                if (latNumber < latitudeBands && longNumber < longitudeBands) {
                    var first = (latNumber * (longitudeBands + 1)) + longNumber;
                    var second = first + longitudeBands + 1;

                    indices.push(first);
                    indices.push(first + 1);
                    indices.push(second);

                    indices.push(second);
                    indices.push(first + 1);
                    indices.push(second + 1);
                }
            }
        }
        return {
            normals: normals,
            textures: textures,
            indices: indices
        }
    }

    getColor(color) {
        return [...Array(this.vertices.data.length / this.vertices.dimensions)].flatMap(_ => color)
    }
}
