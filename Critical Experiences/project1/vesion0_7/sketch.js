let player;
let controlPanel;
let collectibles = [];
let timeLimit = 30; // Time limit for the maze challenge
let timer;
let levelComplete = false;
let angleX = 0; // For pitch (up and down)
let angleY = 0; // For yaw (left and right)
let font; // Variable to hold the font
let isPointerLocked = false; // Track if the pointer is locked

function preload() {
    font = loadFont('Arial.ttf'); // Ensure the font file is in the same directory
}

function setup() {
    const canvas = createCanvas(800, 600, WEBGL); // Adjust canvas size
    canvas.parent('canvasContainer'); // Attach canvas to the div with ID canvasContainer
    canvas.elt.addEventListener('click', requestPointerLock); // Request pointer lock on canvas click
    document.addEventListener('pointerlockchange', lockChangeAlert, false); // Monitor pointer lock changes
    textFont(font); // Set the loaded font

    player = new Player();
    controlPanel = new ControlPanel(0, 0, -200); // Positioning the control panel in 3D space
    // Initialize collectibles
    for (let i = 0; i < 5; i++) {
        collectibles.push(new Collectible(random(-200, 200), random(-200, 200), random(-200, 0)));
    }
    timer = timeLimit;
    updateTimerDisplay(timer);
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
        // Calculate movement direction based on camera rotation (local movement)
        let moveDirection = createVector(0, 0, 0);

        if (keyIsDown(65)) { // W - Move forward
            moveDirection.z -= this.speed;
        }
        if (keyIsDown(68)) { // S - Move backward
            moveDirection.z += this.speed;
        }
        if (keyIsDown(87)) { // A - Move left
            moveDirection.x -= this.speed;
        }
        if (keyIsDown(83)) { // D - Move right
            moveDirection.x += this.speed;
        }

        // Convert local movement to global movement based on player's yaw (angleY)
        let forward = createVector(cos(angleY), 0, sin(angleY));
        let right = createVector(-sin(angleY), 0, cos(angleY));

        // Apply movement in the local coordinate system
        this.position.add(p5.Vector.mult(forward, moveDirection.z));
        this.position.add(p5.Vector.mult(right, moveDirection.x));

        // Rotate camera based on mouse movement when pointer is locked
        if (isPointerLocked) {
            angleY -= movedX * 0.002; // Yaw rotation (left/right)
            angleX -= movedY * 0.002; // Pitch rotation (up/down)
            angleX = constrain(angleX, -PI / 2, PI / 2); // Limit pitch to avoid flipping
        }

        // Update camera position and orientation
        const radius = 200; // Distance from the player
        const camX = this.position.x + radius * sin(angleY) * cos(angleX);
        const camY = this.position.y + radius * sin(angleX);
        const camZ = this.position.z + radius * cos(angleY) * cos(angleX);

        camera(camX, camY, camZ, this.position.x, this.position.y, this.position.z, 0, 1, 0);
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
        updateTimerDisplay(timer);
    }
}

function updateTimerDisplay(time) {
    document.getElementById('timer').innerText = `Time: ${time}`;
}

function checkLevelCompletion() {
    if (timer === 0) {
        levelComplete = true;
        document.getElementById('completionMessage').innerText = 'Level Complete!';
        document.getElementById('restartBtn').style.display = 'block'; // Show the restart button
        exitPointerLock(); // Exit pointer lock when the level is complete
    }
}

function displayLevelComplete() {
    // Game over logic already handled
}

function restartGame() {
    // Reset the game state
    timer = timeLimit;
    levelComplete = false;
    document.getElementById('completionMessage').innerText = ''; // Clear completion message
    document.getElementById('restartBtn').style.display = 'none'; // Hide the restart button
    updateTimerDisplay(timer);
    player = new Player(); // Reset player position
    controlPanel = new ControlPanel(0, 0, -200); // Reset control panel
    collectibles = []; // Reset collectibles
    for (let i = 0; i < 5; i++) {
        collectibles.push(new Collectible(random(-200, 200), random(-200, 200), random(-200, 0)));
    }
}

function requestPointerLock() {
    let canvas = document.querySelector('canvas');
    canvas.requestPointerLock(); // Lock the pointer to the canvas
}

function lockChangeAlert() {
    if (document.pointerLockElement === document.querySelector('canvas')) {
        isPointerLocked = true;
    } else {
        isPointerLocked = false;
    }
}

function exitPointerLock() {
    document.exitPointerLock(); // Exit pointer lock
}

// Exit pointer lock when ESC key is pressed
function keyPressed() {
    if (keyCode === ESCAPE) {
        exitPointerLock();
    }
}
