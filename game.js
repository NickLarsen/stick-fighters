
class Point {
    x;
    y;

    constructor({ x, y }) {
        this.x = x;
        this.y = y;
    }

    add({ x, y }) {
        this.x += x;
        this.y += y;
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

    update(state) {};
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

class Platform extends Sprite {
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
    motion;

    constructor({ position, height, width, color }) {
        super({ position, height, width });
        this.color = color;
        this.motion = new Point({ x: 0, y: 0 });
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(state) {
        this.motion.y += state.gravity;
        this.position.add(this.motion);

        const overlaps = state.items.find(item => item instanceof Platform && intersects(this, item));
        if (overlaps !== undefined) {
            this.motion.y = 0;
            this.position.y = overlaps.position.y - this.height;
        }
    }
}

function makeGlobalGameState({ width, height }) {
    return {
        gravity: 0.75,
        items: [
            new Scene({ position: new Point({ x: 0, y: 0}), width, height, color: "black" }),
            new Platform({ position: new Point({ x: 10, y: height - 30 }), width: width - 20, height: 20, color: "cyan" }),
            new Character({ position: new Point({ x: 100, y: 100}), width: 80, height: 150, color: "green" }),
            new Character({ position: new Point({ x: 800, y: 100}), width: 80, height: 150, color: "pink" }),
        ]
    };
}

function updateState(state) {
    for(const item of state.items) {
        item.update(state);
    }
}

function renderState({ ctx, state }) {
    for(const item of state.items) {
        item.render(ctx);
    }
}

function intersects(sprite1, sprite2) {
    const [left, right] = sprite1.position.x <= sprite2.position.x ? [sprite1, sprite2] : [sprite2, sprite1];
    const overlapsHorizontal = right.position.x < (left.position.x + left.width);
    const [upper, lower] = sprite1.position.y <= sprite2.position.y ? [sprite1, sprite2] : [sprite2, sprite1];
    const overlapsVertical = lower.position.y < (upper.position.y + upper.height);
    return overlapsHorizontal && overlapsVertical;
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