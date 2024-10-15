let player;
let controlPanel;
let collectibles = [];
let timeLimit = 30; // 时间限制
let timer;
let levelComplete = false;
let angleX = 0; // 摄像机上下旋转（Pitch）
let angleY = 0; // 摄像机左右旋转（Yaw）
let font; // 字体变量
let isPointerLocked = false; // 追踪鼠标是否被锁定

function preload() {
    font = loadFont('Arial.ttf'); // 加载字体文件
}

function setup() {
    const canvas = createCanvas(800, 600, WEBGL); // 设置画布大小
    canvas.parent('canvasContainer'); // 绑定到HTML中的div元素
    canvas.elt.addEventListener('click', enablePointerLock); // 单击画布锁定鼠标
    document.addEventListener('pointerlockchange', lockChangeAlert, false); // 监听鼠标锁定变化
    textFont(font); // 设置字体

    player = new Player();
    controlPanel = new ControlPanel(0, 0, -200); // 初始化控制面板位置
    // 初始化可收集物
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
        this.position = createVector(0, 0, 200); // 角色初始位置
        this.size = 30;
        this.speed = 5; // 角色移动速度
    }

    update() {
        // 计算基于摄像机视角的移动方向
        let moveDirection = createVector(0, 0, 0); // 初始化移动向量

        if (keyIsDown(87)) { // W 键 - 前进
            moveDirection.z -= this.speed;
        }
        if (keyIsDown(83)) { // S 键 - 后退
            moveDirection.z += this.speed;
        }
        if (keyIsDown(65)) { // A 键 - 左移
            moveDirection.x -= this.speed;
        }
        if (keyIsDown(68)) { // D 键 - 右移
            moveDirection.x += this.speed;
        }

        // 将本地坐标的移动转换为全局坐标，基于摄像机的 Y 轴旋转角度
        let forward = createVector(sin(angleY), 0, cos(angleY)); // 前方向量（基于角度）
        let right = createVector(cos(angleY), 0, -sin(angleY)); // 右方向量（垂直于前方向量）

        // 根据摄像机视角调整玩家移动方向
        this.position.add(p5.Vector.mult(forward, moveDirection.z)); // 前后移动
        this.position.add(p5.Vector.mult(right, moveDirection.x));   // 左右移动

        // 如果鼠标被锁定，使用鼠标移动来控制摄像机旋转
        if (isPointerLocked) {
            angleY -= movedX * 0.002; // 水平旋转（Yaw）
            angleX -= movedY * 0.002; // 垂直旋转（Pitch）
            angleX = constrain(angleX, -PI / 2, PI / 2); // 限制上下旋转角度
        }

        // 更新摄像机位置和朝向
        const radius = 200; // 摄像机与玩家的距离
        const camX = this.position.x + radius * sin(angleY) * cos(angleX);
        const camY = this.position.y + radius * sin(angleX);
        const camZ = this.position.z + radius * cos(angleY) * cos(angleX);

        camera(camX, camY, camZ, this.position.x, this.position.y, this.position.z, 0, 1, 0);
    }

    display() {
        push();
        translate(this.position.x, this.position.y, this.position.z);
        fill(0, 0, 255);
        sphere(this.size); // 显示玩家球体
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
        box(this.size); // 显示控制面板立方体
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
        sphere(this.size); // 显示可收集物
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
        document.getElementById('restartBtn').style.display = 'block'; // 显示重新开始按钮
        disablePointerLock(); // 完成关卡时解除鼠标锁定
    }
}

function displayLevelComplete() {
    // 已处理游戏结束逻辑
}

function restartGame() {
    // 重置游戏状态
    timer = timeLimit;
    levelComplete = false;
    document.getElementById('completionMessage').innerText = ''; // 清除完成信息
    document.getElementById('restartBtn').style.display = 'none'; // 隐藏重新开始按钮
    updateTimerDisplay(timer);
    player = new Player(); // 重置玩家位置
    controlPanel = new ControlPanel(0, 0, -200); // 重置控制面板
    collectibles = []; // 重置可收集物
    for (let i = 0; i < 5; i++) {
        collectibles.push(new Collectible(random(-200, 200), random(-200, 200), random(-200, 0)));
    }
}

function enablePointerLock() {
    let canvas = document.querySelector('canvas');
    canvas.requestPointerLock(); // 锁定鼠标指针到画布
}

function disablePointerLock() {
    document.exitPointerLock(); // 解除鼠标锁定
}

function lockChangeAlert() {
    if (document.pointerLockElement === document.querySelector('canvas')) {
        isPointerLocked = true;
    } else {
        isPointerLocked = false;
    }
}

// 按下 ESC 键时退出鼠标锁定
function keyPressed() {
    if (keyCode === ESCAPE) {
        disablePointerLock();
    }
}
