let player;
let controlPanel;
let collectibles = [];
let timeLimit = 30; // Time limit for the maze challenge
let timer;
let levelComplete = false;
let angleX = 0; // Camera pitch (up and down)
let angleY = 0; // Camera yaw (left and right)
let font; // Font variable
let isPointerLocked = false; // Track if the pointer is locked

function preload() {
    font = loadFont('Arial.ttf'); // Load the font file
}

function setup() {
    const canvas = createCanvas(800, 600, WEBGL); // Adjust canvas size
    canvas.parent('canvasContainer'); // Attach canvas to the div with ID canvasContainer
    canvas.elt.addEventListener('click', enablePointerLock); // Request pointer lock on canvas click
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
        this.position = createVector(0, 0, 200); // Player initial position
        this.size = 30;
        this.speed = 5; // Player movement speed
    }

    update() {
        // Calculate the movement direction based on the camera's view
        let moveDirection = createVector(0, 0, 0); // Initialize movement vector

        if (keyIsDown(87)) { // W - Move forward
            moveDirection.z -= this.speed;
        }
        if (keyIsDown(83)) { // S - Move backward
            moveDirection.z += this.speed;
        }
        if (keyIsDown(65)) { // A - Move left
            moveDirection.x -= this.speed;
        }
        if (keyIsDown(68)) { // D - Move right
            moveDirection.x += this.speed;
        }

        // Add Q and E controls for vertical movement
        if (keyIsDown(81)) { // Q - Move up
            this.position.y -= this.speed;
        }
        if (keyIsDown(69)) { // E - Move down
            this.position.y += this.speed;
        }

        // Convert the local movement to global coordinates based on camera's yaw (angleY)
        let forward = createVector(sin(angleY), 0, cos(angleY)); // Forward vector based on yaw
        let right = createVector(cos(angleY), 0, -sin(angleY)); // Right vector perpendicular to forward

        // Adjust the player's movement direction based on the camera view
        this.position.add(p5.Vector.mult(forward, moveDirection.z)); // Move forward/backward
        this.position.add(p5.Vector.mult(right, moveDirection.x));   // Move left/right

        // If the pointer is locked, use mouse movement to control camera rotation
        if (isPointerLocked) {
            angleY -= movedX * 0.002; // Horizontal rotation (Yaw)
            angleX -= movedY * 0.002; // Vertical rotation (Pitch)
            angleX = constrain(angleX, -PI / 2, PI / 2); // Limit pitch to avoid flipping
        }

        // Update camera position and orientation
        const radius = 200; // Distance between camera and player
        const camX = this.position.x + radius * sin(angleY) * cos(angleX);
        const camY = this.position.y + radius * sin(angleX);
        const camZ = this.position.z + radius * cos(angleY) * cos(angleX);

        camera(camX, camY, camZ, this.position.x, this.position.y, this.position.z, 0, 1, 0);
    }

    display() {
        push();
        translate(this.position.x, this.position.y, this.position.z);
        fill(0, 0, 255);
        sphere(this.size); // Display the player as a sphere
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
        box(this.size); // Display the control panel as a box
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
        sphere(this.size); // Display the collectible as a sphere
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
        disablePointerLock(); // Exit pointer lock when the level is complete
    }
}

function displayLevelComplete() {
    // Game over logic already handled
}

function restartGame() {
    // Reset game state
    timer = timeLimit;
    levelComplete = false;
    document.getElementById('completionMessage').innerText = ''; // Clear completion message
    document.getElementById('restartBtn').style.display = 'none'; // Hide restart button
    updateTimerDisplay(timer);
    player = new Player(); // Reset player position
    controlPanel = new ControlPanel(0, 0, -200); // Reset control panel
    collectibles = []; // Reset collectibles
    for (let i = 0; i < 5; i++) {
        collectibles.push(new Collectible(random(-200, 200), random(-200, 200), random(-200, 0)));
    }
}

function enablePointerLock() {
    let canvas = document.querySelector('canvas');
    canvas.requestPointerLock(); // Lock the pointer to the canvas
}

function disablePointerLock() {
    document.exitPointerLock(); // Exit pointer lock
}

function lockChangeAlert() {
    if (document.pointerLockElement === document.querySelector('canvas')) {
        isPointerLocked = true;
    } else {
        isPointerLocked = false;
    }
}

// Exit pointer lock when ESC key is pressed
function keyPressed() {
    if (keyCode === ESCAPE) {
        disablePointerLock();
    }
}
