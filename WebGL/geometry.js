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

    }
}
