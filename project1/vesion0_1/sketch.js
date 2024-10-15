let player;
let controlPanel;
let collectibles = [];
let timeLimit = 30; // Time limit for the maze challenge
let timer;
let levelComplete = false;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    player = new Player();
    controlPanel = new ControlPanel(0, 0, -200); // Positioning the control panel in the 3D space
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
    }

    update() {
        if (keyIsDown(87)) this.position.z -= 5; // W
        if (keyIsDown(83)) this.position.z += 5; // S
        if (keyIsDown(65)) this.position.x -= 5; // A
        if (keyIsDown(68)) this.position.x += 5; // D
        // Make the player rotate to face the camera
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

    isHovered() {
        let d = dist(this.position.x, this.position.y, this.position.z, 
                     player.position.x, player.position.y, player.position.z);
        return d < this.size;
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
