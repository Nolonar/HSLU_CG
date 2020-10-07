"use strict";

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;

let canvas = null;
window.onload = () => {
    canvas = document.getElementById("myCanvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scene = new Scene();
    requestAnimationFrame(() => scene.update());
};

class Scene {
    constructor() {
        this.previousTime = performance.now();
        this.onSizeChanged();

        this.ball = new Ball();
        this.player1 = new Paddle(0);
        this.player2 = new Paddle(1, true);
        this.allPlayers = [this.player1, this.player2];
        this.refreshPlayers();

        this.renderer = new Renderer(canvas, this.renderObjects, this.attributes, this.uniforms);
        canvas.onmousemove = this.onMouseMove.bind(this);
        canvas.onclick = this.onClick.bind(this);
        document.onkeypress = this.onKeyPress.bind(this);

        this.reset();
    }

    static get scaling() {
        return new Vector2d(canvas.width, canvas.height).inverse().scale(2);
    }

    get attributes() {
        return [];
    }

    get uniforms() {
        return {};
    }

    get renderObjects() {
        return [
            this.player1,
            this.player2,
            this.ball,
            new MidLine()
        ];
    }

    get mousePlayer() {
        return this.humanPlayers[0];
    }

    onSizeChanged() {
        this.aspectRatio = canvas.width / canvas.height;
    }

    getCoordinatesFromMouse(x, y) {
        return {
            x: x - canvas.width / 2,
            y: -(y - canvas.height / 2)
        };
    }

    reset() {
        this.ball.reset();
        if (!this.mousePlayer) {
            setTimeout(() => {
                this.startBall(this.allPlayers[0]);
            }, 1000);
        }
    }

    refreshPlayers() {
        this.cpuPlayers = this.allPlayers.filter(p => p.isCpu);
        this.humanPlayers = this.allPlayers.filter(p => !p.isCpu);
        if (!this.mousePlayer && !this.ball.isMoving)
            this.startBall(this.allPlayers[0]);
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
        if (this.ball.isOut)
            this.reset();

        this.cpuPlayers.forEach(p => p.makeMove(delta, this.ball));

        const playerCollided = this.allPlayers.find(p => this.ball.isCollisionPossible(p));
        if (playerCollided)
            this.ball.bounce(playerCollided);

        this.ball.updatePosition(delta);
    }

    startBall(player) {
        this.ball.direction = this.ball.getBounceDirection(player);
    }

    onMouseMove(e) {
        if (this.mousePlayer)
            this.mousePlayer.pos.y = this.getCoordinatesFromMouse(e.x, e.y).y;
    }

    onClick() {
        if (this.mousePlayer && !this.ball.isMoving)
            this.startBall(this.mousePlayer);
    }

    onKeyPress(e) {
        const command = {
            a: () => {
                this.player1.isCpu = !this.player1.isCpu;
                this.refreshPlayers();
            }
        }[e.key];

        command?.call();
    }
}

class Paddle extends RenderObject {
    constructor(playerNr, isCpu) {
        const playerColors = [
            [1, 0, 0],  // Player 1
            [0, 0, 1]   // Player 2
        ];
        const screenEdge = canvas.width / 2;
        const playerXPos = screenEdge - 200;
        const playerStartingPos = [
            new Vector2d(-playerXPos, 0),   // Player 1
            new Vector2d(playerXPos, 0)     // Player 2
        ];

        const size = new Vector2d(50, 400);
        const halfSize = size.scale(1 / 2);
        const vertices = [
            -halfSize.x, -halfSize.y,
            halfSize.x, -halfSize.y,
            halfSize.x, halfSize.y,
            -halfSize.x, halfSize.y
        ];
        super(2, vertices, {
            color: {
                dimensions: 3,
                data: [...Array(vertices.length / 2)].flatMap(_ => playerColors[playerNr])
            },
            scale: Scene.scaling,
            pos: playerStartingPos[playerNr]
        });

        this.width = size.x;
        this.height = size.y;
        this.isCpu = isCpu ?? false;
    }

    get moveSpeed() {
        return 400 / SECOND;
    }

    makeMove(delta, ball) {
        const targetY = this.isBallApproaching(ball) ? ball.pos.y : 0;
        this.moveTowards(targetY, this.moveSpeed * delta);
    }

    moveTowards(targetY, speed) {
        const diff = targetY - this.pos.y;
        const distance = Math.abs(diff);
        this.pos.y = distance < speed ? targetY : this.pos.y + speed * diff / distance;
    }

    isBallApproaching(ball) {
        const diff = this.pos.x - ball.pos.x;
        // if different signs, multiplication will be negative, otherwise positive.
        const isSameSign = diff * ball.direction.x >= 0;
        return ball.isMoving && isSameSign;
    }
}

class Ball extends RenderObject {
    constructor() {
        const segmentCount = 100;
        const step = 2 * Math.PI / segmentCount;
        const radius = 25;
        const v = new Vector2d(0, radius);
        const vertices = [...Array(segmentCount).keys()].flatMap(n => {
            const p = v.rotate(n * step);
            return [p.x, p.y];
        });

        super(2, vertices, {
            scale: Scene.scaling,
            pos: new Vector2d(0, 0)
        });

        this.radius = radius;
        this.updateScreenEdge();
        this.reset();
    }

    get defaultSpeed() {
        return 300 / SECOND;
    }

    get speedMultiplier() {
        return 1.2;
    }

    get bounceSpread() {
        return 30;
    }

    get randomBounceSpread() {
        return Math.random() * this.bounceSpread - this.bounceSpread / 2;
    }

    get randomBounceSpreadRad() {
        return this.randomBounceSpread * 2 * Math.PI / 360;
    }

    get isOut() {
        return Math.abs(this.pos.x) >= this.screenEdge.x;
    }

    get isMoving() {
        return this.direction.x || this.direction.y;
    }

    reset() {
        this.direction = new Vector2d(0, 0);
        this.pos = new Vector2d(0, 0);
        this.speed = this.defaultSpeed;
    }

    updateScreenEdge() {
        this.screenEdge = new Vector2d(canvas.width / 2 - this.radius, canvas.height / 2 - this.radius);
    }

    updatePosition(delta) {
        if (!this.isMoving) return;

        this.pos = this.pos.scaleAndAdd(this.direction, this.speed * delta);
        this.bounceFromScreenEdge();
    }

    isCollisionPossible(player) {
        const difference = player.pos.subtract(this.pos);
        return Math.abs(difference.x) <= this.radius + player.width / 2
            && Math.abs(difference.y) <= this.radius + player.height / 2;
    }

    bounce(player) {
        this.direction.x = -this.direction.x;
        this.direction = this.direction.add(this.getBounceDirection(player)).normalize();
        this.speed *= this.speedMultiplier;
    }

    getBounceDirection(player) {
        return this.pos.subtract(player.pos).rotate(this.randomBounceSpreadRad).normalize();
    }

    bounceFromScreenEdge() {
        if (this.pos.y < this.screenEdge.y && this.pos.y > -this.screenEdge.y)
            return;

        this.direction.y = -this.direction.y;
        this.pos.y = Math.max(-this.screenEdge.y, Math.min(this.screenEdge.y, this.pos.y));
    }
}

class MidLine extends RenderObject {
    constructor() {
        const screenEdge = canvas.height / 2;
        super(2, [
            -1, -screenEdge,
            1, -screenEdge,
            1, screenEdge,
            -1, screenEdge
        ], {
            scale: Scene.scaling
        });
    }
}
