
class Point {
    x;
    y;

    constructor({ x, y }) {
        this.x = x;
        this.y = y;
    }
}

class Sprite {
    position;
    height;
    width;  

    constructor({ position, height, width }) {
        this.position = position;
        this.height = height;
        this.width = width;
    }

    update() {};
    render(ctx) {};
}

class Scene extends Sprite {
    color;

    constructor({ position, height, width, color }) {
        super({ position, height, width });
        this.color = color;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Character extends Sprite {
    color;

    constructor({ position, height, width, color }) {
        super({ position, height, width });
        this.color = color;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

function makeGlobalGameState({ width, height }) {
    return {
        items: [
            new Scene({ position: new Point({ x: 0, y: 0}), width, height, color: "black" }),
            new Character({ position: new Point({ x: 100, y: 100}), width: 50, height: 100, color: "green" }),
            new Character({ position: new Point({ x: 800, y: 100}), width: 50, height: 100, color: "pink" }),
        ]
    };
}

function updateState(state) {
    for(const item of state.items) {
        item.update();
    }
}

function renderState({ ctx, state }) {
    for(const item of state.items) {
        item.render(ctx);
    }
}

function gameLoop({ ctx, width, height }) {
    const globalState = makeGlobalGameState({ width, height });
    function nextFrame() {
        updateState(globalState);
        renderState({ state: globalState, ctx });
        window.requestAnimationFrame(nextFrame);
    }
    nextFrame();
}

function main(canvas) {
    const ctx = canvas.getContext("2d");
    var positionInfo = canvas.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
    gameLoop({ ctx, width, height });
}

const canvas = document.getElementById("game");
main(canvas);