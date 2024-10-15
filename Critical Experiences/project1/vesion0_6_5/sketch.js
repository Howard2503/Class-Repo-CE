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
let timerStarted = false; // Flag to check if the timer has started
let collectedCount = 0; // Count of collected spheres
let instructions = document.getElementById('instructions');
let timerDisplay = document.getElementById('timer');
let remainingSpheresDisplay = document.getElementById('remainingSpheres');
let completionMessage = document.getElementById('completionMessage');
let restartButton = document.getElementById('restartBtn');

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
    resetLevel(); // Randomize positions of the cube and spheres

    timer = timeLimit;
    updateTimerDisplay(timer);
    remainingSpheresDisplay.innerText = `Remaining Spheres: ${collectibles.length}`; // Initialize remaining spheres
}

function draw() {
    background(220);

    if (!levelComplete) {
        player.update();
        player.display();
        controlPanel.display();

        // Check for sphere collection in a dedicated function to avoid counting twice
        checkCollectibles();

        // If the timer has started, continue updating the time
        if (timerStarted && frameCount % 60 === 0 && timer > 0) {
            timer--;
            updateTimerDisplay(timer);
        }

        if (timerStarted && collectibles.length === 0) {
            levelComplete = true;
            completionMessage.innerText = 'You win! You collected all spheres!';
            restartButton.style.display = 'block';
        } else if (timer === 0) {
            levelComplete = true;
            completionMessage.innerText = 'You lose! Time ran out.';
            restartButton.style.display = 'block';
        }

        // Update camera position based on player position
        updateCamera();
        
        // Flash the control panel after the timer starts
        if (timerStarted) {
            controlPanel.flash();
        }
    }
}

// Function to check for collectibles
function checkCollectibles() {
    collectibles.forEach(collectible => {
        collectible.display();
        // Check if player hits the collectible only if the timer has started
        if (timerStarted && !collectible.collected && dist(player.position.x, player.position.y, player.position.z, collectible.position.x, collectible.position.y, collectible.position.z) < (player.size + collectible.size)) {
            collectible.collected = true; // Mark as collected
            collectedCount++;
            // Remove collected spheres from the array
            collectibles = collectibles.filter(collectible => !collectible.collected);
            remainingSpheresDisplay.innerText = `Remaining Spheres: ${collectibles.length}`; // Update remaining spheres
        }
    });
}

function updateCamera() {
    const radius = 200; // Distance from the player
    const camX = player.position.x + radius * sin(angleY) * cos(angleX);
    const camY = player.position.y + radius * sin(angleX);
    const camZ = player.position.z + radius * cos(angleY) * cos(angleX);

    camera(camX, camY, camZ, player.position.x, player.position.y, player.position.z, 0, 1, 0);
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

        // Check if the player hits the control panel (cube) to start the timer
        if (!timerStarted && dist(this.position.x, this.position.y, this.position.z, controlPanel.position.x, controlPanel.position.y, controlPanel.position.z) < (this.size + controlPanel.size)) {
            timerStarted = true;
            instructions.innerText = 'Collect all the spheres before time runs out!';
            timerDisplay.innerText = `Time: ${timer}`;
        }
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
        this.flashing = false; // Track if the control panel is flashing
        this.flashCounter = 0; // Counter for flash effect
    }

    display() {
        push();
        translate(this.position.x, this.position.y, this.position.z);
        fill(255, 0, 0);
        box(this.size); // Display the control panel as a box
        pop();
    }

    flash() {
        this.flashing = true;
        if (this.flashCounter < 30) {
            // Flash the control panel
            if (this.flashCounter % 10 < 5) {
                fill(255, 0, 0);
            } else {
                fill(100); // Dim color
            }
            this.display();
            this.flashCounter++;
        }
    }
}

class Collectible {
    constructor(x, y, z) {
        this.position = createVector(x, y, z);
        this.size = 20;
        this.collected = false; // Mark if the sphere has been collected
    }

    display() {
        push();
        translate(this.position.x, this.position.y, this.position.z);
        fill(0, 255, 0);
        sphere(this.size); // Display the collectible as a sphere
        pop();
    }
}

// Function to randomize cube and sphere positions at the start
function resetLevel() {
    controlPanel = new ControlPanel(random(-200, 200), random(-200, 200), random(-200, 200)); // Random position for cube
    collectibles = [];
    for (let i = 0; i < 5; i++) {
        let collectible = new Collectible(random(-200, 200), random(-200, 200), random(-200, 200));
        collectibles.push(collectible);
    }
    remainingSpheresDisplay.innerText = `Remaining Spheres: ${collectibles.length}`; // Initialize remaining spheres
}

function updateTimerDisplay(time) {
    timerDisplay.innerText = `Time: ${time}`;
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

function restartGame() {
    timer = timeLimit;
    timerStarted = false;
    levelComplete = false;
    collectedCount = 0;
    completionMessage.innerText = ''; // Clear completion message
    restartButton.style.display = 'none'; // Hide restart button
    instructions.innerText = 'Use W/A/S/D to move, Q/E to move up/down, and move the mouse to look around.';
    updateTimerDisplay('Hit the red cube to start the timer!');
    player = new Player(); // Reset player position
    resetLevel(); // Randomize positions of cube and spheres
}
