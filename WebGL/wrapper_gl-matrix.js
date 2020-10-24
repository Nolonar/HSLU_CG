"use strict";

class Vector2d {
    constructor(x, y) {
        this.data = vec2.fromValues(x, y);
    }

    static fromVec(vec) {
        return new Vector2d(vec[0], vec[1]);
    }

    static get ZERO() { return Vector2d.fromVec(vec2.create()); }

    get x() { return this.data[0]; }
    get y() { return this.data[1]; }
    set x(val) { this.data[0] = val; }
    set y(val) { this.data[1] = val; }

    clone() {
        return Vector2d.fromVec(vec2.clone(this.data));
    }

    add(other) {
        return Vector2d.fromVec(vec2.add(vec2.create(), this.data, other.data));
    }

    subtract(other) {
        return Vector2d.fromVec(vec2.subtract(vec2.create(), this.data, other.data));
    }

    negate() {
        return Vector2d.fromVec(vec2.negate(vec2.create(), this.data));
    }

    inverse() {
        return Vector2d.fromVec(vec2.inverse(vec2.create(), this.data));
    }

    normalize() {
        return Vector2d.fromVec(vec2.normalize(vec2.create(), this.data));
    }

    rotate(rad) {
        const rotate = mat2.fromRotation(mat2.create(), rad);
        return Vector2d.fromVec(vec2.transformMat2(vec2.create(), this.data, rotate));
    }

    scale(scalar) {
        return Vector2d.fromVec(vec2.scale(vec2.create(), this.data, scalar));
    }

    scaleAndAdd(other, scalar) {
        return Vector2d.fromVec(vec2.scaleAndAdd(vec2.create(), this.data, other.data, scalar));
    }
}

class Vector3d {
    constructor(x, y, z) {
        this.data = vec3.fromValues(x, y, z);
    }

    static fromVec(vec) {
        return new Vector3d(vec[0], vec[1], vec[2]);
    }

    static get ZERO() { return Vector3d.fromVec(vec3.create()); }

    get x() { return this.data[0]; }
    get y() { return this.data[1]; }
    get z() { return this.data[2]; }
    set x(val) { this.data[0] = val; }
    set y(val) { this.data[1] = val; }
    set z(val) { this.data[2] = val; }

    clone() {
        return Vector3d.fromVec(vec3.clone(this.data));
    }

    add(other) {
        return Vector3d.fromVec(vec3.add(vec3.create(), this.data, other.data));
    }

    subtract(other) {
        return Vector3d.fromVec(vec3.subtract(vec3.create(), this.data, other.data));
    }

    negate() {
        return Vector3d.fromVec(vec3.negate(vec3.create(), this.data));
    }

    inverse() {
        return Vector3d.fromVec(vec3.inverse(vec3.create(), this.data));
    }

    normalize() {
        return Vector3d.fromVec(vec3.normalize(vec3.create(), this.data));
    }

    rotate(rad) {
        const rotate = mat3.fromRotation(mat3.create(), rad);
        return Vector3d.fromVec(vec3.transformMat3(vec3.create(), this.data, rotate));
    }

    scale(scalar) {
        return Vector3d.fromVec(vec3.scale(vec3.create(), this.data, scalar));
    }

    scaleAndAdd(other, scalar) {
        return Vector3d.fromVec(vec3.scaleAndAdd(vec3.create(), this.data, other.data, scalar));
    }
}

class Matrix3 {
    constructor(data) {
        this.data = data;
    }

    static fromScaling(x, y) {
        return new Matrix3(mat3.fromScaling(mat3.create(), [x, y]));
    }

    static fromTranslation(x, y) {
        return new Matrix3(mat3.fromTranslation(mat3.create(), [x, y]));
    }
}

class Matrix4 {
    constructor(data) {
        this.data = data;
    }

    static fromScaling(x, y, z) {
        return new Matrix4(mat4.fromScaling(mat4.create(), [x, y, z]));
    }

    static fromTranslation(x, y, z) {
        return new Matrix4(mat4.fromTranslation(mat4.create(), [x, y, z]));
    }

    static lookAt(pos, target, up) {
        return new Matrix4(mat4.lookAt(mat4.create(), pos.data, target.data, (up ?? new Vector3d(0, 1, 0)).data));
    }

    static ortho(left, right, bottom, top, near, far) {
        return new Matrix4(mat4.ortho(mat4.create(), left, right, bottom, top, near, far));
    }

    static frustum(left, right, bottom, top, near, far) {
        return new Matrix4(mat4.frustum(mat4.create(), left, right, bottom, top, near, far));
    }

    static perspective(fovy, aspect, near, far) {
        return new Matrix4(mat4.perspective(mat4.create(), fovy, aspect, near, far));
    }

    static fromRotationTranslationScale(quaternion, translation, scaling) {
        return new Matrix4(mat4.fromRotationTranslationScale(mat4.create(), quaternion.data, translation.data, scaling.data));
    }
}

class Quaternion {
    constructor(data) {
        this.data = data;
    }

    static get IDENTITY() {
        return new Quaternion(quat.identity(quat.create()));
    }

    rotateX(rad) {
        return new Quaternion(quat.rotateX(quat.create(), this.data, rad));
    }

    rotateY(rad) {
        return new Quaternion(quat.rotateY(quat.create(), this.data, rad));
    }

    rotateZ(rad) {
        return new Quaternion(quat.rotateZ(quat.create(), this.data, rad));
    }
}
