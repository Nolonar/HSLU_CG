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

    static indices = [
        // Front
        0, 1, 2,
        0, 2, 3,

        // Back
        4, 5, 6,
        4, 6, 7,

        // Top
        8, 9, 10,
        8, 10, 11,

        // Bottom
        12, 13, 14,
        12, 14, 15,

        // Right
        16, 17, 18,
        16, 18, 19,

        // Left
        20, 21, 22,
        20, 22, 23
    ];

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
