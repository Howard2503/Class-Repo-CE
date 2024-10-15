let player;
let controlPanel;
let collectibles = [];
let timeLimit = 30; // Time limit for the maze challenge
let timer;
let levelComplete = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    player = new Player();
    controlPanel = new ControlPanel(width / 2, height / 2);
    // Initialize collectibles
    for (let i = 0; i < 5; i++) {
        collectibles.push(new Collectible(random(width), random(height)));
    }
    timer = timeLimit;
}

function draw() {
    background(220);
    if (!levelComplete) {
        player.update();
        player.display();
        controlPanel.display();
        collectibles.forEach(collectible => collectible.display());
        updateTimer();
        checkLevelCompletion();
    } else {
        displayLevelComplete();
    }
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.size = 30;
    }

    update() {
        if (keyIsDown(87)) this.y -= 5; // W
        if (keyIsDown(83)) this.y += 5; // S
        if (keyIsDown(65)) this.x -= 5; // A
        if (keyIsDown(68)) this.x += 5; // D
    }

    display() {
        fill(0, 0, 255);
        ellipse(this.x, this.y, this.size);
    }
}

class ControlPanel {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 50;
    }

    display() {
        fill(255, 0, 0);
        rect(this.x, this.y, this.size, this.size);
        textSize(16);
        fill(255);
        textAlign(CENTER);
        text("Control Panel", this.x + this.size / 2, this.y - 10);
    }

    isHovered() {
        return mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size;
    }
}

class Collectible {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
    }

    display() {
        fill(0, 255, 0);
        ellipse(this.x, this.y, this.size);
    }
}

function updateTimer() {
    if (frameCount % 60 === 0 && timer > 0) {
        timer--;
    }
    textSize(32);
    fill(0);
    text(`Time: ${timer}`, 10, 30);
}

function checkLevelCompletion() {
    if (timer === 0) {
        levelComplete = true;
    }
}

function displayLevelComplete() {
    background(0);
    fill(255);
    textSize(48);
    textAlign(CENTER);
    text("Level Complete!", width / 2, height / 2);
}
