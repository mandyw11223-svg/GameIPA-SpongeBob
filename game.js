const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bg = new Image();
bg.src = "assets/bikini-bottom.png";

const sponge = new Image();
sponge.src = "assets/spongebob.png";

const keys = {};

let started = false;
let paused = false;
let quizOpen = false;
let gameEnded = false;

let level = 1;
let score = 0;
let lives = 3;
let totalCoins = 0;
let cameraX = 0;
let currentQuestion = 0;

const player = {
    x: 100,
    y: 330,
    w: 66,
    h: 82,
    speed: 5,
    vy: 0,
    jump: 13,
    grounded: false
};

// 3 level maps. Level 1 is short; levels 2 and 3 are longer.
const levels = [
    {
        width: 2500,
        start: { x: 100, y: 330 },
        coins: [
            [350, 345], [590, 260], [900, 190], [1260, 330],
            [1570, 250], [1900, 180], [2260, 330], [2420, 260]
        ],
        platforms: [
            [0, 420, 520, 80],
            [620, 330, 190, 22],
            [870, 255, 190, 22],
            [1160, 365, 220, 22],
            [1500, 315, 190, 22],
            [1810, 240, 190, 22],
            [2150, 365, 200, 22],
            [2380, 300, 120, 22]
        ],
        finishX: 2460
    },
    {
        width: 2900,
        start: { x: 100, y: 330 },
        coins: [
            [300, 345], [560, 275], [820, 205], [1080, 330],
            [1350, 250], [1600, 170], [1880, 330], [2150, 260],
            [2420, 190], [2700, 330]
        ],
        platforms: [
            [0, 420, 450, 80],
            [520, 340, 170, 22],
            [770, 275, 180, 22],
            [1020, 365, 200, 22],
            [1300, 315, 180, 22],
            [1550, 235, 180, 22],
            [1820, 365, 210, 22],
            [2100, 305, 190, 22],
            [2380, 250, 190, 22],
            [2630, 365, 270, 22]
        ],
        finishX: 2780
    },
    {
        width: 3300,
        start: { x: 100, y: 330 },
        coins: [
            [300, 340], [600, 250], [900, 170], [1200, 330],
            [1480, 250], [1760, 180], [2050, 320], [2340, 235],
            [2630, 160], [2910, 320], [3150, 250]
        ],
        platforms: [
            [0, 420, 430, 80],
            [500, 330, 170, 22],
            [760, 270, 180, 22],
            [1030, 355, 200, 22],
            [1320, 300, 190, 22],
            [1600, 230, 190, 22],
            [1910, 350, 200, 22],
            [2200, 285, 190, 22],
            [2490, 220, 190, 22],
            [2770, 350, 190, 22],
            [3050, 290, 180, 22]
        ],
        finishX: 3200
    }
];

const questions = [
    ["Hewan yang bernapas dengan insang adalah...", ["Kucing", "Ikan", "Ayam", "Sapi"], 1],
    ["Perubahan air menjadi uap karena panas disebut...", ["Menguap", "Membeku", "Mencair", "Mengembun"], 0],
    ["Sumber energi utama bagi Bumi adalah...", ["Bulan", "Matahari", "Batu", "Tanah"], 1],
    ["Organ untuk memompa darah ke seluruh tubuh adalah...", ["Paru-paru", "Lambung", "Jantung", "Ginjal"], 2],
    ["Tumbuhan membuat makanan terutama melalui proses...", ["Fotosintesis", "Pencernaan", "Pernapasan", "Penguapan"], 0],
    ["Gaya yang menarik benda menuju permukaan Bumi disebut...", ["Gesek", "Magnet", "Gravitasi", "Pegas"], 2],
    ["Planet tempat kita hidup adalah...", ["Mars", "Venus", "Bumi", "Jupiter"], 2],
    ["Alat untuk mengukur suhu adalah...", ["Barometer", "Termometer", "Neraca", "Mikroskop"], 1],
    ["Bagian tumbuhan yang menyerap air dari tanah adalah...", ["Bunga", "Akar", "Buah", "Daun"], 1],
    ["Benda yang dapat ditarik magnet adalah...", ["Kayu", "Kertas", "Besi", "Plastik"], 2],
    ["Manusia membutuhkan gas ... untuk bernapas.", ["Karbon dioksida", "Oksigen", "Nitrogen saja", "Uap air"], 1],
    ["Energi yang berasal dari gerakan udara disebut energi...", ["Angin", "Bunyi", "Kimia", "Cahaya"], 0]
];

let coins = [];
let platforms = [];
let enemies = [];

function resetLevel() {
    const data = levels[level - 1];
    player.x = data.start.x;
    player.y = data.start.y;
    player.vy = 0;
    cameraX = 0;

    coins = data.coins.map(([x, y]) => ({ x, y, got: false }));
    platforms = data.platforms.map(([x, y, w, h]) => ({ x, y, w, h }));

    enemies = [
        { x: 700, y: 295, w: 48, h: 35, vx: 1.2 },
        { x: 1700, y: 280, w: 48, h: 35, vx: -1.4 },
        { x: data.finishX - 250, y: 330, w: 48, h: 35, vx: 1.1 }
    ];
}

function updateHUD() {
    document.getElementById("lives").textContent = lives;
    document.getElementById("coins").textContent = totalCoins;
    document.getElementById("coinTarget").textContent =
        levels.reduce((sum, l) => sum + l.coins.length, 0);
    document.getElementById("score").textContent = score;
    document.getElementById("level").textContent = level;
}

function startGame() {
    started = true;
    level = 1;
    score = 0;
    lives = 3;
    totalCoins = 0;
    currentQuestion = 0;
    gameEnded = false;
    paused = false;
    quizOpen = false;
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("finishOverlay").classList.add("hidden");
    resetLevel();
    updateHUD();
}

document.getElementById("startButton").onclick = startGame;
document.getElementById("restartButton").onclick = startGame;

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;

    if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key.toLowerCase() === "p" && started && !quizOpen && !gameEnded) {
        paused = !paused;
        document.getElementById("pauseOverlay").classList.toggle("hidden", !paused);
    }
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function updatePlayer() {
    if (!started || paused || quizOpen || gameEnded) return;

    if (keys["arrowright"] || keys["d"]) player.x += player.speed;
    if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;

    player.vy += 0.62;
    player.y += player.vy;
    player.grounded = false;

    for (const p of platforms) {
        const fallingOnto =
            player.x < p.x + p.w &&
            player.x + player.w > p.x &&
            player.y + player.h >= p.y &&
            player.y + player.h <= p.y + 32 &&
            player.vy >= 0;

        if (fallingOnto) {
            player.y = p.y - player.h;
            player.vy = 0;
            player.grounded = true;
        }
    }

    if ((keys["arrowup"] || keys["w"] || keys[" "]) && player.grounded) {
        player.vy = -player.jump;
        player.grounded = false;
    }

    const data = levels[level - 1];

    player.x = Math.max(0, Math.min(player.x, data.width - player.w));

    if (player.y > canvas.height + 80) loseLife();
}

function updateEnemies() {
    if (paused || quizOpen || gameEnded || !started) return;

    for (const e of enemies) {
        e.x += e.vx;

        if (e.x < 500 || e.x > levels[level - 1].width - 100) {
            e.vx *= -1;
        }

        const enemyRect = { x: e.x, y: e.y, w: e.w, h: e.h };

        if (rectsOverlap(player, enemyRect)) {
            loseLife();
            return;
        }
    }
}

function loseLife() {
    if (gameEnded) return;

    lives--;
    updateHUD();

    if (lives <= 0) {
        endGame(false);
        return;
    }

    const data = levels[level - 1];
    player.x = data.start.x;
    player.y = data.start.y;
    player.vy = 0;
    cameraX = 0;
}

function collectCoins() {
    if (quizOpen || paused || gameEnded) return;

    for (const coin of coins) {
        if (coin.got) continue;

        const dx = player.x + player.w / 2 - coin.x;
        const dy = player.y + player.h / 2 - coin.y;

        if (Math.hypot(dx, dy) < 48) {
            coin.got = true;
            totalCoins++;
            score += 5;
            updateHUD();
            openQuiz();
            return;
        }
    }
}

function openQuiz() {
    quizOpen = true;

    const q = questions[currentQuestion % questions.length];
    document.getElementById("question").textContent = q[0];
    document.getElementById("quizProgress").textContent =
        `Soal ${currentQuestion + 1}`;
    document.getElementById("answers").innerHTML = "";
    document.getElementById("feedback").textContent = "";

    q[1].forEach((answer, i) => {
        const btn = document.createElement("button");
        btn.className = "answer";
        btn.textContent = answer;

        btn.onclick = () => {
            const feedback = document.getElementById("feedback");

            if (i === q[2]) {
                score += 20;
                feedback.textContent = "✅ Benar! +20 skor";
                feedback.style.color = "#198754";
            } else {
                lives--;
                feedback.textContent = "❌ Kurang tepat. Nyawa -1";
                feedback.style.color = "#c62828";
            }

            updateHUD();

            setTimeout(() => {
                document.getElementById("quizOverlay").classList.add("hidden");
                quizOpen = false;
                currentQuestion++;

                if (lives <= 0) {
                    endGame(false);
                }
            }, 850);
        };

        document.getElementById("answers").appendChild(btn);
    });

    document.getElementById("quizOverlay").classList.remove("hidden");
}

function updateCamera() {
    if (!started) return;

    const data = levels[level - 1];

    cameraX = player.x - canvas.width * 0.35;
    cameraX = Math.max(0, Math.min(cameraX, data.width - canvas.width));
}

function drawBackground() {
    const data = levels[level - 1];

    ctx.fillStyle = "#18bddd";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Repeat the prepared underwater artwork so the world can be longer.
    const offset = -(cameraX * 0.18) % canvas.width;

    for (let x = offset - canvas.width; x < canvas.width + canvas.width; x += canvas.width) {
        if (bg.complete) ctx.drawImage(bg, x, 0, canvas.width, canvas.height);
    }

    // Level banner
    ctx.save();
    ctx.fillStyle = "rgba(67,40,18,.84)";
    ctx.roundRect(18, 18, 245, 44, 12);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px Arial";
    ctx.fillText(`🌊 Level ${level} — Zona ${level === 1 ? "Pantai" : level === 2 ? "Terumbu" : "Dalam Laut"}`, 30, 47);
    ctx.restore();
}

function drawPlatforms() {
    ctx.save();
    ctx.translate(-cameraX, 0);

    for (const p of platforms) {
        ctx.fillStyle = "#6b492e";
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = "#49b84d";
        ctx.fillRect(p.x, p.y, p.w, 9);

        ctx.fillStyle = "rgba(255,255,255,.12)";
        for (let x = p.x + 12; x < p.x + p.w; x += 32) {
            ctx.fillRect(x, p.y + 12, 14, 4);
        }
    }

    ctx.restore();
}

function drawCoins() {
    ctx.save();
    ctx.translate(-cameraX, 0);

    for (const c of coins) {
        if (c.got) continue;

        ctx.fillStyle = "#ffd21f";
        ctx.strokeStyle = "#d18a00";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(c.x, c.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fff7b0";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", c.x, c.y);
    }

    ctx.restore();
}

function drawEnemies() {
    ctx.save();
    ctx.translate(-cameraX, 0);

    for (const e of enemies) {
        // Cute jellyfish enemy, drawn from scratch.
        ctx.fillStyle = "#f184bb";
        ctx.beginPath();
        ctx.arc(e.x + 24, e.y + 17, 23, Math.PI, 0);
        ctx.lineTo(e.x + 47, e.y + 30);
        ctx.lineTo(e.x + 38, e.y + 25);
        ctx.lineTo(e.x + 29, e.y + 33);
        ctx.lineTo(e.x + 20, e.y + 25);
        ctx.lineTo(e.x + 10, e.y + 31);
        ctx.lineTo(e.x + 2, e.y + 22);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(e.x + 16, e.y + 15, 5, 0, Math.PI * 2);
        ctx.arc(e.x + 31, e.y + 15, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(e.x + 16, e.y + 15, 2, 0, Math.PI * 2);
        ctx.arc(e.x + 31, e.y + 15, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawPlayer() {
    if (!sponge.complete) return;

    ctx.save();
    ctx.translate(-cameraX, 0);

    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.beginPath();
    ctx.ellipse(player.x + player.w / 2, player.y + player.h, 25, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(sponge, player.x, player.y, player.w, player.h);
    ctx.restore();
}

function drawFinishFlag() {
    const finishX = levels[level - 1].finishX;

    ctx.save();
    ctx.translate(-cameraX, 0);

    ctx.fillStyle = "#6c4525";
    ctx.fillRect(finishX, 285, 7, 135);

    ctx.fillStyle = "#f3c53d";
    ctx.beginPath();
    ctx.moveTo(finishX + 7, 290);
    ctx.lineTo(finishX + 72, 308);
    ctx.lineTo(finishX + 7, 326);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function nextLevel() {
    if (level < 3) {
        level++;
        score += 50;
        resetLevel();
        updateHUD();
    } else {
        endGame(true);
    }
}

function checkFinish() {
    if (quizOpen || gameEnded) return;

    const finishX = levels[level - 1].finishX;

    if (player.x > finishX - 55) {
        // Level is considered complete only after all its coins are collected.
        const remaining = coins.some(c => !c.got);

        if (!remaining) {
            nextLevel();
        }
    }
}

function endGame(win) {
    gameEnded = true;

    const icon = document.getElementById("finishIcon");
    const title = document.getElementById("finishTitle");
    const text = document.getElementById("finishText");

    if (win) {
        icon.textContent = "🏆";
        title.textContent = "Petualangan Selesai!";
        text.textContent = `Keren! Kamu menaklukkan 3 level dan mendapatkan ${score} skor.`;
    } else {
        icon.textContent = "💦";
        title.textContent = "Nyawa Habis";
        text.textContent = `Skor kamu ${score}. Coba lagi dan jawab soal IPA dengan lebih teliti.`;
    }

    document.getElementById("finishOverlay").classList.remove("hidden");
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!started) return;

    drawBackground();
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawFinishFlag();
    drawPlayer();
}

function loop() {
    if (started && !paused && !quizOpen && !gameEnded) {
        updatePlayer();
        updateEnemies();
        collectCoins();
        updateCamera();
        checkFinish();
    }

    render();
    requestAnimationFrame(loop);
}

updateHUD();
loop();
