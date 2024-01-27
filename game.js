
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

    constructor({ position, height, width, color, controller, speed, maxHealth, startingHealth }) {
        super({ position, height, width });
        this.color = color;
        this.controller = controller;
        this.speed = speed;
        this.maxHealth = maxHealth;
        this.health = startingHealth;
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

class LifeBar extends Sprite {
    constructor({ position, height, width, player, orientation, emptyColor, fullColor }) {
        super({ position, height, width });
        this.player = player;
        this.orientation = orientation;
        this.emptyColor = emptyColor;
        this.fullColor = fullColor;
    }

    update(state) {
        this.lifePercentage = this.player.health / this.player.maxHealth;
    }

    render(ctx) {
        // render container
        ctx.fillStyle = this.emptyColor;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        // render life
        ctx.fillStyle = this.fullColor;
        const lifeWidth = Math.ceil(this.width * this.lifePercentage);
        const offset = this.orientation === "right" ? 0 : (this.width - lifeWidth);
        ctx.fillRect(this.position.x + offset, this.position.y, lifeWidth, this.height);
    }
}

function makeGlobalGameState({ width, height }) {
    const char1Controller = new Controller({
        "KeyA": "left",
        "KeyD": "right",
        "KeyS": "duck",
        "Space": "jump",
    });
    const char1 = new Character({ 
        position: new Point({ x: 100, y: 100}), 
        width: 80, 
        height: 150, 
        color: "green", 
        controller: char1Controller,
        speed: 8,
        maxHealth: 1000,
        startingHealth: 648,
    });
    const char1Life = new LifeBar({
        position: new Point({ x: 50, y: 50 }),
        height: 40,
        width: 400,
        player: char1,
        orientation: "left",
        emptyColor: "darkred",
        fullColor: "darkgreen",
    });
    const char2Controller = new Controller({
        "KeyJ": "left",
        "KeyL": "right",
        "KeyK": "duck",
        "KeyI": "jump",
    });
    const char2 = new Character({ 
        position: new Point({ x: 800, y: 100}), 
        width: 80, 
        height: 150, 
        color: "pink", 
        controller: char2Controller,
        speed: 8,
        maxHealth: 1000,
        startingHealth: 893,
    });
    const char2Life = new LifeBar({
        position: new Point({ x: 550, y: 50 }),
        height: 40,
        width: 400,
        player: char2,
        orientation: "right",
        emptyColor: "darkred",
        fullColor: "darkgreen",
    });
    return {
        gravity: 0.75,
        items: [
            new Scene({ position: new Point({ x: 0, y: 0}), width, height, color: "black" }),
            new Platform({ position: new Point({ x: 10, y: height - 30 }), width: width - 20, height: 20, color: "cyan" }),
            char1,
            char2,
            char1Life,
            char2Life,
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