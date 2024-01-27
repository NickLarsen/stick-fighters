
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

class Input {
    active = false;
}
class Controller {
    mappings;

    inputs = {
        left: new Input(),
        right: new Input(),
        jump: new Input(),
        duck: new Input(),
    };

    constructor(mappings) {
        this.mappings = mappings;
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        const action = this.mappings[event.code];
        if (action !== undefined) {
            const input = this.inputs[action];
            input.active = true;
        }
    }

    handleKeyUp(event) {
        const action = this.mappings[event.code];
        if (action !== undefined) {
            const input = this.inputs[action];
            input.active = false;
        }
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
    motion = new Point({ x: 0, y: 0 });
    grounded = false;

    constructor({ position, height, width, color, controller, speed }) {
        super({ position, height, width });
        this.color = color;
        this.controller = controller;
        this.speed = speed;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    _updateMotion(state) {
        this.motion.y += state.gravity;
        const jump = this.controller.inputs.jump;
        if (jump.active && this.grounded === true) {
            this.motion.y -= 15;
        }
        this.position.add(this.motion);
        const left = this.controller.inputs.left;
        if (left.active) {
            this.position.x -= this.speed;
        }
        const right = this.controller.inputs.right;
        if (right.active) {
            this.position.x += this.speed;
        }
    }

    update(state) {
        this._updateMotion(state);
        this.position.add(this.motion);

        this.grounded = false;
        const overlaps = state.items.find(item => item instanceof Platform && intersects(this, item));
        if (overlaps !== undefined) {
            this.motion.y = 0;
            this.position.y = overlaps.position.y - this.height;
            this.grounded = true;
        }
    }
}

function makeGlobalGameState({ width, height }) {
    const char1Controller = new Controller({
        "KeyA": "left",
        "KeyD": "right",
        "KeyS": "duck",
        "Space": "jump",
    });
    const char2Controller = new Controller({
        "KeyJ": "left",
        "KeyL": "right",
        "KeyK": "duck",
        "KeyI": "jump",
    });
    return {
        gravity: 0.75,
        items: [
            new Scene({ position: new Point({ x: 0, y: 0}), width, height, color: "black" }),
            new Platform({ position: new Point({ x: 10, y: height - 30 }), width: width - 20, height: 20, color: "cyan" }),
            new Character({ 
                position: new Point({ x: 100, y: 100}), 
                width: 80, 
                height: 150, 
                color: "green", 
                controller: char1Controller,
                speed: 5,
            }),
            new Character({ 
                position: new Point({ x: 800, y: 100}), 
                width: 80, 
                height: 150, 
                color: "pink", 
                controller: char2Controller,
                speed: 5,
            }),
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