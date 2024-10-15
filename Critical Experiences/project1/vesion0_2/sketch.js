let player;
let controlPanel;
let collectibles = [];
let timeLimit = 30; // Time limit for the maze challenge
let timer;
let levelComplete = false;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    player = new Player();
    controlPanel = new ControlPanel(0, 0, -200); // Positioning the control panel in 3D space
    // Initialize collectibles
    for (let i = 0; i < 5; i++) {
        collectibles.push(new Collectible(random(-200, 200), random(-200, 200), random(-200, 0)));
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
        this.position = createVector(0, 0, 200);
        this.size = 30;
        this.speed = 5; // Movement speed
    }

    update() {
        // Check for movement inputs
        if (keyIsDown(87)) this.position.z -= this.speed; // W - Move Forward
        if (keyIsDown(83)) this.position.z += this.speed; // S - Move Backward
        if (keyIsDown(65)) this.position.x -= this.speed; // A - Move Left
        if (keyIsDown(68)) this.position.x += this.speed; // D - Move Right
        if (keyIsDown(32)) this.position.y -= this.speed; // SPACE - Move Up
        if (keyIsDown(16)) this.position.y += this.speed; // SHIFT - Move Down

        // Make the camera follow the player
        camera(this.position.x, this.position.y, this.position.z, 
               this.position.x, this.position.y, this.position.z - 1, 
               0, 1, 0);
    }

    display() {
        push();
        translate(this.position.x, this.position.y, this.position.z);
        fill(0, 0, 255);
        sphere(this.size);
        pop();
    }
}

class ControlPanel {
    constructor(x, y, z) {
        this.position = createVector(x, y, z);
        this.size = 50;
    }

    display() {
        push();
        translate(this.position.x, this.position.y, this.position.z);
        fill(255, 0, 0);
        box(this.size);
        fill(255);
        textSize(12);
        textAlign(CENTER);
        text("Control Panel", 0, -30);
        pop();
    }
}

class Collectible {
    constructor(x, y, z) {
        this.position = createVector(x, y, z);
        this.size = 20;
    }

    display() {
        push();
        translate(this.position.x, this.position.y, this.position.z);
        fill(0, 255, 0);
        sphere(this.size);
        pop();
    }
}

function updateTimer() {
    if (frameCount % 60 === 0 && timer > 0) {
        timer--;
    }
    textSize(32);
    fill(0);
    text(`Time: ${timer}`, -width / 2 + 20, -height / 2 + 40);
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
    text("Level Complete!", 0, 0);
}
