"use strict";

/* =========================================================
   DOM
========================================================= */

const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const levelElement = document.getElementById("level");

const overlay = document.getElementById("game-overlay");
const overlayIcon = document.getElementById("overlay-icon");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");

const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");

const coinsValue = document.getElementById("coins-value");

const shopButton = document.getElementById("shop-button");
const shopModal = document.getElementById("shop-modal");
const closeShopButton = document.getElementById("close-shop");
const shopBalance = document.getElementById("shop-balance");
const skinList = document.getElementById("skin-list");
const effectList = document.getElementById("effect-list");

const statisticsButton = document.getElementById("statistics-button");
const statisticsModal = document.getElementById("statistics-modal");
const closeStatisticsButton =
    document.getElementById("close-statistics");

const achievementButton =
    document.getElementById("achievements-button");

const achievementModal =
    document.getElementById("achievement-modal");

const closeAchievementsButton =
    document.getElementById("close-achievements");

const achievementList =
    document.getElementById("achievement-list");

const achievementCount =
    document.getElementById("achievement-count");

const achievementNotification =
    document.getElementById("achievement-notification");

const achievementNotificationIcon =
    document.getElementById("achievement-notification-icon");

const achievementNotificationTitle =
    document.getElementById("achievement-notification-title");

const achievementNotificationMessage =
    document.getElementById("achievement-notification-message");

const missionNotification =
    document.getElementById("mission-notification");

const missionNotificationTitle =
    document.getElementById("mission-notification-title");

const missionNotificationMessage =
    document.getElementById("mission-notification-message");

const playerLevelElement =
    document.getElementById("player-level");

const xpText =
    document.getElementById("xp-text");

const xpFill =
    document.getElementById("xp-fill");

const dailyMissionsDate =
    document.getElementById("daily-missions-date");

const dailyMissionsCount =
    document.getElementById("daily-missions-count");

const dailyMissionsList =
    document.getElementById("daily-missions-list");

/* Statistics DOM */

const statsGames =
    document.getElementById("stats-games");

const statsBestScore =
    document.getElementById("stats-best-score");

const statsHighestLevel =
    document.getElementById("stats-highest-level");

const statsFood =
    document.getElementById("stats-food");

const statsCoins =
    document.getElementById("stats-coins");

const statsPowerups =
    document.getElementById("stats-powerups");

const statsTime =
    document.getElementById("stats-time");

const statsAchievements =
    document.getElementById("stats-achievements");

const statsSkins =
    document.getElementById("stats-skins");

const statsPowerupTypes =
    document.getElementById("stats-powerup-types");

/* =========================================================
   CONFIG
========================================================= */

const GRID_SIZE = 20;
const TILE_SIZE = canvas.width / GRID_SIZE;

const INITIAL_SPEED = 120;
const MIN_SPEED = 55;

const MAX_OBSTACLES = 12;

const POWER_UP_DURATION = 5000;
const POWER_UP_LIFETIME = 8000;

const POWER_UP_CHANCE = 0.20;

const SPEED_BOOST_MULTIPLIER = 0.65;
const SLOW_MOTION_MULTIPLIER = 1.6;


/* =========================================================
   PROFESSIONAL AUDIO SYSTEM
========================================================= */

let audioContext = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;

let musicTimer = null;
let musicStep = 0;

let audioEnabled =
    localStorage.getItem("snakeAudioEnabled") !== "false";

let lastTurnSound = 0;

const AUDIO_CONFIG = {
    masterVolume: 0.34,
    musicVolume: 0.045,
    sfxVolume: 0.18,
    musicInterval: 360
};

function initAudio() {
    if (audioContext) return;

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass) return;

    audioContext =
        new AudioContextClass();

    masterGain =
        audioContext.createGain();

    musicGain =
        audioContext.createGain();

    sfxGain =
        audioContext.createGain();

    masterGain.gain.value =
        audioEnabled
            ? AUDIO_CONFIG.masterVolume
            : 0;

    musicGain.gain.value =
        AUDIO_CONFIG.musicVolume;

    sfxGain.gain.value =
        AUDIO_CONFIG.sfxVolume;

    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);

    masterGain.connect(
        audioContext.destination
    );
}

function unlockAudio() {
    if (!audioEnabled) return;

    initAudio();

    if (!audioContext) return;

    if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
    }
}

function setAudioEnabled(enabled) {
    audioEnabled = Boolean(enabled);

    localStorage.setItem(
        "snakeAudioEnabled",
        String(audioEnabled)
    );

    initAudio();

    if (!masterGain) return;

    masterGain.gain.setTargetAtTime(
        audioEnabled
            ? AUDIO_CONFIG.masterVolume
            : 0,
        audioContext.currentTime,
        0.03
    );

    if (!audioEnabled) {
        stopBackgroundMusic();
    } else if (
        gameRunning &&
        !gamePaused
    ) {
        startBackgroundMusic();
    }

    updateAudioButton();
}

function ensureAudioButton() {
    let button =
        document.getElementById(
            "audio-button"
        );

    if (!button) {
        button =
            document.createElement("button");

        button.id = "audio-button";
        button.type = "button";

        button.setAttribute(
            "aria-label",
            "Ativar ou desativar som"
        );

        button.style.cssText = [
            "position:fixed",
            "right:18px",
            "bottom:18px",
            "z-index:9999",
            "width:46px",
            "height:46px",
            "border:1px solid rgba(255,255,255,.16)",
            "border-radius:14px",
            "background:rgba(15,23,42,.88)",
            "color:#fff",
            "font-size:20px",
            "cursor:pointer",
            "backdrop-filter:blur(12px)",
            "box-shadow:0 10px 30px rgba(0,0,0,.25)"
        ].join(";");

        document.body.appendChild(button);

        button.addEventListener(
            "click",
            () => {
                unlockAudio();

                setAudioEnabled(
                    !audioEnabled
                );
            }
        );
    }

    updateAudioButton();
}

function updateAudioButton() {
    const button =
        document.getElementById(
            "audio-button"
        );

    if (!button) return;

    button.textContent =
        audioEnabled
            ? "🔊"
            : "🔇";

    button.title =
        audioEnabled
            ? "Desativar som"
            : "Ativar som";
}

function midiToFrequency(note) {
    return 440 *
        Math.pow(
            2,
            (note - 69) / 12
        );
}

function createTone({
    frequency = 440,
    duration = 0.08,
    type = "sine",
    volume = 0.15,
    slideTo = null,
    target = "sfx",
    when = 0
} = {}) {
    if (!audioEnabled) return;

    unlockAudio();

    if (!audioContext) return;

    const output =
        target === "music"
            ? musicGain
            : sfxGain;

    if (!output) return;

    const now =
        audioContext.currentTime +
        when;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
        frequency,
        now
    );

    if (slideTo !== null) {
        oscillator.frequency
            .exponentialRampToValueAtTime(
                Math.max(20, slideTo),
                now + duration
            );
    }

    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, volume),
        now + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
    );

    oscillator.connect(gain);
    gain.connect(output);

    oscillator.start(now);

    oscillator.stop(
        now +
        duration +
        0.02
    );
}

function createSweep({
    from = 220,
    to = 660,
    duration = 0.18,
    type = "sine",
    volume = 0.16
} = {}) {
    createTone({
        frequency: from,
        slideTo: to,
        duration,
        type,
        volume
    });
}

function playSound(name) {
    if (!audioEnabled) return;

    switch (name) {

        case "click":
            createTone({
                frequency: 520,
                duration: 0.045,
                type: "square",
                volume: 0.09
            });
            break;

        case "start":
            createTone({
                frequency:
                    midiToFrequency(60),
                duration: 0.08,
                volume: 0.12
            });

            createTone({
                frequency:
                    midiToFrequency(64),
                duration: 0.08,
                volume: 0.10,
                when: 0.07
            });

            createTone({
                frequency:
                    midiToFrequency(67),
                duration: 0.16,
                volume: 0.12,
                when: 0.14
            });
            break;

        case "eat":
            createTone({
                frequency: 660,
                duration: 0.07,
                type: "triangle",
                volume: 0.13
            });

            createTone({
                frequency: 880,
                duration: 0.09,
                type: "triangle",
                volume: 0.10,
                when: 0.045
            });
            break;

        case "combo":
            createTone({
                frequency: 740,
                duration: 0.06,
                type: "triangle",
                volume: 0.11
            });

            createTone({
                frequency: 988,
                duration: 0.06,
                type: "triangle",
                volume: 0.11,
                when: 0.045
            });

            createTone({
                frequency: 1175,
                duration: 0.10,
                type: "triangle",
                volume: 0.12,
                when: 0.09
            });
            break;

        case "levelup":
            [60, 64, 67, 72]
                .forEach(
                    (note, index) => {
                        createTone({
                            frequency:
                                midiToFrequency(note),
                            duration: 0.12,
                            type: "triangle",
                            volume: 0.12,
                            when:
                                index * 0.08
                        });
                    }
                );
            break;

        case "powerup":
            createSweep({
                from: 260,
                to: 920,
                duration: 0.22,
                type: "sawtooth",
                volume: 0.09
            });
            break;

        case "shield":
            createTone({
                frequency: 420,
                duration: 0.10,
                type: "sine",
                volume: 0.10
            });

            createTone({
                frequency: 630,
                duration: 0.14,
                type: "sine",
                volume: 0.08,
                when: 0.07
            });
            break;

        case "achievement":
            [67, 71, 74, 79]
                .forEach(
                    (note, index) => {
                        createTone({
                            frequency:
                                midiToFrequency(note),
                            duration: 0.14,
                            type: "triangle",
                            volume: 0.11,
                            when:
                                index * 0.07
                        });
                    }
                );
            break;

        case "mission":
            createTone({
                frequency:
                    midiToFrequency(72),
                duration: 0.10,
                type: "triangle",
                volume: 0.10
            });

            createTone({
                frequency:
                    midiToFrequency(76),
                duration: 0.14,
                type: "triangle",
                volume: 0.10,
                when: 0.08
            });
            break;

        case "pause":
            createTone({
                frequency: 340,
                duration: 0.10,
                type: "sine",
                volume: 0.08
            });
            break;

        case "gameover":
            createTone({
                frequency: 320,
                duration: 0.16,
                type: "sawtooth",
                volume: 0.10,
                slideTo: 180
            });

            createTone({
                frequency: 180,
                duration: 0.30,
                type: "triangle",
                volume: 0.08,
                when: 0.12,
                slideTo: 90
            });
            break;

        case "record":
            createSweep({
                from: 420,
                to: 1100,
                duration: 0.28,
                type: "triangle",
                volume: 0.12
            });
            break;

        case "turn":
            createTone({
                frequency: 250,
                duration: 0.025,
                type: "square",
                volume: 0.035
            });
            break;
    }
}

function playMusicNote(note) {
    createTone({
        frequency:
            midiToFrequency(note),
        duration: 0.24,
        type: "sine",
        volume: 0.55,
        target: "music"
    });
}

function musicTick() {
    if (!audioEnabled) return;

    const melody = [
        60,
        64,
        67,
        64,
        62,
        65,
        69,
        65,
        60,
        64,
        67,
        72,
        67,
        64,
        62,
        59
    ];

    const note =
        melody[
            musicStep %
            melody.length
        ];

    const octave =
        Math.floor(
            musicStep / melody.length
        ) % 2
            ? 12
            : 0;

    playMusicNote(
        note + octave
    );

    musicStep++;
}

function startBackgroundMusic() {
    if (!audioEnabled) return;

    unlockAudio();

    stopBackgroundMusic();

    musicStep = 0;

    musicTick();

    musicTimer =
        setInterval(
            musicTick,
            AUDIO_CONFIG.musicInterval
        );
}

function stopBackgroundMusic() {
    if (musicTimer) {
        clearInterval(
            musicTimer
        );

        musicTimer = null;
    }
}


/* =========================================================
   THEMES
========================================================= */

const THEMES = {
    neon: {
        name: "Neon",
        background: "#020617",
        grid: "rgba(255, 255, 255, 0.04)",
        snakeHead: "#a3e635",
        snakeBody: "#22c55e",
        food: "#ef4444",
        obstacle: "#334155",
        obstacleBorder: "#64748b",
        text: "#ffffff",
        panel: "#0f172a",
        glow: "#a3e635"
    },

    dark: {
        name: "Dark",
        background: "#09090b",
        grid: "rgba(255, 255, 255, 0.035)",
        snakeHead: "#e4e4e7",
        snakeBody: "#71717a",
        food: "#f43f5e",
        obstacle: "#27272a",
        obstacleBorder: "#52525b",
        text: "#f4f4f5",
        panel: "#18181b",
        glow: "#e4e4e7"
    },

    light: {
        name: "Light",
        background: "#f1f5f9",
        grid: "rgba(15, 23, 42, 0.08)",
        snakeHead: "#16a34a",
        snakeBody: "#22c55e",
        food: "#dc2626",
        obstacle: "#cbd5e1",
        obstacleBorder: "#64748b",
        text: "#0f172a",
        panel: "#ffffff",
        glow: "#16a34a"
    },

    forest: {
        name: "Forest",
        background: "#052e16",
        grid: "rgba(134, 239, 172, 0.08)",
        snakeHead: "#bef264",
        snakeBody: "#4ade80",
        food: "#f97316",
        obstacle: "#422006",
        obstacleBorder: "#a16207",
        text: "#dcfce7",
        panel: "#064e3b",
        glow: "#4ade80"
    },

    lava: {
        name: "Lava",
        background: "#1c0505",
        grid: "rgba(248, 113, 113, 0.08)",
        snakeHead: "#facc15",
        snakeBody: "#ef4444",
        food: "#fb923c",
        obstacle: "#451a03",
        obstacleBorder: "#ea580c",
        text: "#fee2e2",
        panel: "#450a0a",
        glow: "#f97316"
    },

    ice: {
        name: "Ice",
        background: "#082f49",
        grid: "rgba(125, 211, 252, 0.10)",
        snakeHead: "#e0f2fe",
        snakeBody: "#38bdf8",
        food: "#f472b6",
        obstacle: "#164e63",
        obstacleBorder: "#67e8f9",
        text: "#e0f2fe",
        panel: "#0c4a6e",
        glow: "#67e8f9"
    }
};


/* =========================================================
   GAME STATE
========================================================= */

let snake = [];

let food = {
    x: 15,
    y: 10
};

let powerUp = null;
let obstacles = [];

let powerUpTimer = null;
let speedBoostTimer = null;
let doublePointsTimer = null;
let slowMotionTimer = null;
let ghostTimer = null;
let magnetTimer = null;

let speedBoostActive = false;
let doublePointsActive = false;
let shieldActive = false;
let magnetActive = false;
let slowMotionActive = false;
let ghostActive = false;
let extraLifeActive = false;

let direction = {
    x: 1,
    y: 0
};

let nextDirection = {
    x: 1,
    y: 0
};

let score = 0;
let level = 1;

let highScore =
    Number(
        localStorage.getItem(
            "snakeHighScore"
        )
    ) || 0;

let gameRunning = false;
let gamePaused = false;
let gameOverState = false;

let gameLoop = null;
let lastUpdateTime = 0;

let particles = [];
let foodPulse = 0;
let powerUpPulse = 0;

let currentTheme =
    localStorage.getItem(
        "snakeTheme"
    ) || "neon";

let ghostStartTime = null;


/* =========================================================
   PLAYER PROFILE
========================================================= */

const DEFAULT_PLAYER_PROFILE = {
    coins: 0,
    totalCoins: 0,

    xp: 0,
    playerLevel: 1,

    ownedSkins: ["classic"],
    equippedSkin: "classic",

    ownedEffects: ["none"],
    equippedEffect: "none"
};

function loadJSON(
    key,
    fallback
) {
    try {
        const saved =
            JSON.parse(
                localStorage.getItem(
                    key
                )
            );

        if (
            saved &&
            typeof saved === "object"
        ) {
            return saved;
        }
    } catch {
        return fallback;
    }

    return fallback;
}

let playerProfile = {
    ...DEFAULT_PLAYER_PROFILE,

    ...loadJSON(
        "snakePlayerProfile",
        DEFAULT_PLAYER_PROFILE
    )
};

if (
    !Array.isArray(
        playerProfile.ownedSkins
    )
) {
    playerProfile.ownedSkins =
        ["classic"];
}

if (
    !playerProfile.ownedSkins.includes(
        "classic"
    )
) {
    playerProfile.ownedSkins.push(
        "classic"
    );
}

if (
    !Array.isArray(
        playerProfile.ownedEffects
    )
) {
    playerProfile.ownedEffects =
        ["none"];
}

if (
    !playerProfile.ownedEffects.includes(
        "none"
    )
) {
    playerProfile.ownedEffects.push(
        "none"
    );
}

function savePlayerProfile() {
    localStorage.setItem(
        "snakePlayerProfile",
        JSON.stringify(
            playerProfile
        )
    );
}


/* =========================================================
   STATISTICS
========================================================= */

const DEFAULT_STATISTICS = {
    gamesPlayed: 0,
    bestScore: 0,
    highestLevel: 1,
    foodCollected: 0,
    coinsEarned: 0,
    powerUpsCollected: 0,
    playTime: 0
};

let statisticsExists =
    localStorage.getItem(
        "snakeStatistics"
    ) !== null;

let statistics = {
    ...DEFAULT_STATISTICS,

    ...loadJSON(
        "snakeStatistics",
        DEFAULT_STATISTICS
    )
};

if (
    !statisticsExists &&
    playerProfile.totalCoins > 0
) {
    statistics.coinsEarned =
        playerProfile.totalCoins;
}

function saveStatistics() {
    localStorage.setItem(
        "snakeStatistics",
        JSON.stringify(
            statistics
        )
    );
}


/* =========================================================
   PLAYER XP
========================================================= */

const PLAYER_XP_REWARDS = {
    food: 10,
    mission: 100,
    achievement: 150,
    levelUp: 30,
    record: 200
};

function getXPRequiredForLevel(
    levelNumber
) {
    return (
        400 +
        (levelNumber - 1) * 100
    );
}

function addPlayerXP(amount) {
    if (
        !amount ||
        amount <= 0
    ) {
        return;
    }

    playerProfile.xp += amount;

    while (
        playerProfile.xp >=
        getXPRequiredForLevel(
            playerProfile.playerLevel
        )
    ) {
        playerProfile.xp -=
            getXPRequiredForLevel(
                playerProfile.playerLevel
            );

        playerProfile.playerLevel++;

        addCoins(
            25,
            false
        );

        showToast(
            "⭐ Novo nível!",
            `Você alcançou o Player Level ${playerProfile.playerLevel}.`
        );
    }

    savePlayerProfile();

    updatePlayerProgressUI();
}

function updatePlayerProgressUI() {
    const required =
        getXPRequiredForLevel(
            playerProfile.playerLevel
        );

    const percentage =
        Math.min(
            100,
            (
                playerProfile.xp /
                required
            ) * 100
        );

    playerLevelElement.textContent =
        playerProfile.playerLevel;

    xpText.textContent =
        `${playerProfile.xp.toLocaleString("pt-BR")} / ${required.toLocaleString("pt-BR")} XP`;

    xpFill.style.width =
        `${percentage}%`;
}


/* =========================================================
   COINS
========================================================= */

function addCoins(
    amount,
    trackStatistics = true
) {
    if (
        !amount ||
        amount <= 0
    ) {
        return;
    }

    playerProfile.coins += amount;

    playerProfile.totalCoins +=
        amount;

    if (trackStatistics) {
        statistics.coinsEarned +=
            amount;

        saveStatistics();
    }

    savePlayerProfile();

    updateUI();
    updateStatisticsUI();
}

function spendCoins(amount) {
    if (
        !amount ||
        amount <= 0 ||
        playerProfile.coins <
            amount
    ) {
        return false;
    }

    playerProfile.coins -= amount;

    savePlayerProfile();

    updateUI();

    return true;
}


/* =========================================================
   SHOP
========================================================= */

const SKINS = {
    classic: {
        name: "Classic",
        description:
            "A cobra clássica do tema atual.",
        price: 0,
        icon: "🐍"
    },

    fire: {
        name: "Fire",
        description:
            "Uma cobra com visual flamejante.",
        price: 150,
        icon: "🔥"
    },

    ocean: {
        name: "Ocean",
        description:
            "Visual inspirado no oceano.",
        price: 200,
        icon: "🌊"
    },

    shadow: {
        name: "Shadow",
        description:
            "Escura e misteriosa.",
        price: 250,
        icon: "🌑"
    },

    toxic: {
        name: "Toxic",
        description:
            "Verde radioativo.",
        price: 300,
        icon: "☢️"
    },

    rainbow: {
        name: "Rainbow",
        description:
            "Cores que mudam continuamente.",
        price: 500,
        icon: "🌈"
    },

    gold: {
        name: "Gold",
        description:
            "Uma cobra dourada premium.",
        price: 750,
        icon: "👑"
    }
};

const EFFECTS = {
    none: {
        name: "Nenhum",
        description:
            "Sem efeito adicional.",
        price: 0,
        icon: "⭕"
    },

    sparkle: {
        name: "Sparkle",
        description:
            "Pequenas partículas brilhantes.",
        price: 250,
        icon: "✨"
    },

    trail: {
        name: "Trail",
        description:
            "Deixa um rastro atrás da cobra.",
        price: 300,
        icon: "💫"
    },

    aura: {
        name: "Aura",
        description:
            "Adiciona um brilho intenso.",
        price: 350,
        icon: "🔆"
    },

    rainbowTrail: {
        name: "Rainbow Trail",
        description:
            "Rastro colorido animado.",
        price: 450,
        icon: "🌈"
    }
};

function buySkin(id) {
    const skin = SKINS[id];

    if (!skin) return;

    if (
        playerProfile.ownedSkins
            .includes(id)
    ) {
        playerProfile.equippedSkin =
            id;

        savePlayerProfile();
        renderShop();
        drawGame();

        return;
    }

    if (
        !spendCoins(
            skin.price
        )
    ) {
        showToast(
            "🪙 Moedas insuficientes",
            `Você precisa de ${skin.price} moedas.`
        );

        return;
    }

    playerProfile.ownedSkins.push(
        id
    );

    playerProfile.equippedSkin =
        id;

    savePlayerProfile();

    renderShop();
    drawGame();
    updateStatisticsUI();
}

function buyEffect(id) {
    const effect =
        EFFECTS[id];

    if (!effect) return;

    if (
        playerProfile.ownedEffects
            .includes(id)
    ) {
        playerProfile.equippedEffect =
            id;

        savePlayerProfile();
        renderShop();
        drawGame();

        return;
    }

    if (
        !spendCoins(
            effect.price
        )
    ) {
        showToast(
            "🪙 Moedas insuficientes",
            `Você precisa de ${effect.price} moedas.`
        );

        return;
    }

    playerProfile.ownedEffects.push(
        id
    );

    playerProfile.equippedEffect =
        id;

    savePlayerProfile();

    renderShop();
    drawGame();
    updateStatisticsUI();
}

function renderShop() {
    shopBalance.textContent =
        playerProfile.coins.toLocaleString(
            "pt-BR"
        );

    skinList.innerHTML = "";

    Object.entries(
        SKINS
    ).forEach(
        ([id, skin]) => {

            const owned =
                playerProfile
                    .ownedSkins
                    .includes(id);

            const equipped =
                playerProfile
                    .equippedSkin ===
                id;

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                `shop-card ${equipped ? "equipped" : ""}`;

            let buttonText =
                "Comprar";

            if (equipped) {
                buttonText =
                    "Equipado";
            } else if (owned) {
                buttonText =
                    "Equipar";
            }

            card.innerHTML = `
                <div class="shop-card-icon">
                    ${skin.icon}
                </div>

                <div class="shop-card-info">
                    <span class="shop-card-name">
                        ${skin.name}
                    </span>

                    <span class="shop-card-description">
                        ${skin.description}
                    </span>

                    <span class="shop-card-price">
                        ${
                            skin.price === 0
                                ? "GRÁTIS"
                                : `🪙 ${skin.price}`
                        }
                    </span>
                </div>

                <button
                    class="shop-card-button ${equipped ? "equipped" : ""}"
                    data-skin="${id}"
                    ${equipped ? "disabled" : ""}
                >
                    ${buttonText}
                </button>
            `;

            skinList.appendChild(
                card
            );
        }
    );

    effectList.innerHTML = "";

    Object.entries(
        EFFECTS
    ).forEach(
        ([id, effect]) => {

            const owned =
                playerProfile
                    .ownedEffects
                    .includes(id);

            const equipped =
                playerProfile
                    .equippedEffect ===
                id;

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                `shop-card ${equipped ? "equipped" : ""}`;

            let buttonText =
                "Comprar";

            if (equipped) {
                buttonText =
                    "Equipado";
            } else if (owned) {
                buttonText =
                    "Equipar";
            }

            card.innerHTML = `
                <div class="shop-card-icon">
                    ${effect.icon}
                </div>

                <div class="shop-card-info">
                    <span class="shop-card-name">
                        ${effect.name}
                    </span>

                    <span class="shop-card-description">
                        ${effect.description}
                    </span>

                    <span class="shop-card-price">
                        ${
                            effect.price === 0
                                ? "GRÁTIS"
                                : `🪙 ${effect.price}`
                        }
                    </span>
                </div>

                <button
                    class="shop-card-button ${equipped ? "equipped" : ""}"
                    data-effect="${id}"
                    ${equipped ? "disabled" : ""}
                >
                    ${buttonText}
                </button>
            `;

            effectList.appendChild(
                card
            );
        }
    );

    document
        .querySelectorAll(
            "[data-skin]"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        playSound("click");

                        buySkin(
                            button.dataset.skin
                        );
                    }
                );
            }
        );

    document
        .querySelectorAll(
            "[data-effect]"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        playSound("click");

                        buyEffect(
                            button.dataset.effect
                        );
                    }
                );
            }
        );
}


/* =========================================================
   DAILY MISSIONS
========================================================= */

const DAILY_MISSION_POOL = [
    {
        id: "eat",
        title: "Fome de cobra",
        description:
            "Coma 20 comidas.",
        type: "food",
        target: 20,
        reward: 30,
        icon: "🍎"
    },

    {
        id: "score",
        title: "Pontuação",
        description:
            "Faça 50 pontos em partidas.",
        type: "score",
        target: 50,
        reward: 50,
        icon: "🎯"
    },

    {
        id: "speed",
        title: "Velocidade máxima",
        description:
            "Colete 3 Speed Boosts.",
        type: "speed",
        target: 3,
        reward: 40,
        icon: "⚡"
    },

    {
        id: "shield",
        title: "Sobrevivente",
        description:
            "Use o Shield 2 vezes.",
        type: "shield",
        target: 2,
        reward: 35,
        icon: "🛡️"
    },

    {
        id: "level",
        title: "Subindo de nível",
        description:
            "Alcance o nível 5.",
        type: "level",
        target: 5,
        reward: 60,
        icon: "📈"
    },

    {
        id: "games",
        title: "Maratonista",
        description:
            "Jogue 3 partidas.",
        type: "games",
        target: 3,
        reward: 25,
        icon: "🎮"
    },

    {
        id: "powerups",
        title: "Colecionador",
        description:
            "Colete 5 power-ups.",
        type: "powerups",
        target: 5,
        reward: 45,
        icon: "✨"
    }
];

function getLocalDateKey() {
    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

let dailyMissionData =
    loadJSON(
        "snakeDailyMissions",
        null
    );

function generateDailyMissions() {
    const date =
        getLocalDateKey();

    const shuffled = [
        ...DAILY_MISSION_POOL
    ].sort(
        () =>
            Math.random() -
            0.5
    );

    const missions =
        shuffled
            .slice(0, 3)
            .map(
                mission => ({
                    ...mission,
                    progress: 0,
                    completed: false,
                    claimed: false
                })
            );

    dailyMissionData = {
        date,
        missions
    };

    saveDailyMissions();
}

function saveDailyMissions() {
    localStorage.setItem(
        "snakeDailyMissions",
        JSON.stringify(
            dailyMissionData
        )
    );
}

function ensureDailyMissions() {
    const today =
        getLocalDateKey();

    if (
        !dailyMissionData ||
        dailyMissionData.date !==
            today ||
        !Array.isArray(
            dailyMissionData.missions
        ) ||
        dailyMissionData
            .missions.length !== 3
    ) {
        generateDailyMissions();
    }
}

function updateDailyMission(
    type,
    amount = 1
) {
    ensureDailyMissions();

    dailyMissionData.missions
        .forEach(
            mission => {

                if (
                    mission.type !==
                        type ||
                    mission.completed
                ) {
                    return;
                }

                mission.progress =
                    Math.min(
                        mission.target,
                        mission.progress +
                            amount
                    );

                if (
                    mission.progress >=
                    mission.target
                ) {
                    mission.progress =
                        mission.target;

                    mission.completed =
                        true;

                    if (
                        !mission.claimed
                    ) {
                        mission.claimed =
                            true;

                        addCoins(
                            mission.reward
                        );

                        addPlayerXP(
                            PLAYER_XP_REWARDS
                                .mission
                        );

                        showMissionRewardNotification(
                            mission
                        );
                    }
                }
            }
        );

    saveDailyMissions();

    renderDailyMissions();
}

function renderDailyMissions() {
    ensureDailyMissions();

    const completed =
        dailyMissionData
            .missions
            .filter(
                mission =>
                    mission.completed
            )
            .length;

    dailyMissionsCount.textContent =
        `${completed}/3`;

    dailyMissionsDate.textContent =
        `Renova em ${getTomorrowText()}`;

    dailyMissionsList.innerHTML =
        "";

    dailyMissionData.missions
        .forEach(
            mission => {

                const percentage =
                    (
                        mission.progress /
                        mission.target
                    ) * 100;

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    `daily-mission-card ${mission.completed ? "completed" : ""}`;

                card.innerHTML = `
                    <div class="daily-mission-icon">
                        ${mission.icon}
                    </div>

                    <div class="daily-mission-info">
                        <strong>
                            ${mission.title}
                        </strong>

                        <span>
                            ${mission.description}
                        </span>

                        <div class="mission-progress-bar">
                            <div
                                style="width:${percentage}%"
                            ></div>
                        </div>

                        <small>
                            ${mission.progress} / ${mission.target}
                        </small>
                    </div>

                    <div class="daily-mission-reward">
                        ${
                            mission.completed
                                ? "✓ "
                                : ""
                        }
                        🪙 +${mission.reward}
                    </div>
                `;

                dailyMissionsList.appendChild(
                    card
                );
            }
        );
}

function getTomorrowText() {
    return "amanhã";
}

/* =========================================================
   ACHIEVEMENTS
========================================================= */

const ACHIEVEMENTS = {
    firstGame: {
        id: "firstGame",
        title: "Primeira partida",
        description:
            "Jogue sua primeira partida.",
        icon: "🎮",
        reward: 20
    },

    hundredPoints: {
        id: "hundredPoints",
        title: "Centena",
        description:
            "Alcance 100 pontos em uma partida.",
        icon: "💯",
        reward: 50
    },

    foodStreak: {
        id: "foodStreak",
        title: "Combo monstruoso",
        description:
            "Consiga um combo de 10 comidas.",
        icon: "🔥",
        reward: 75
    },

    speedBoost: {
        id: "speedBoost",
        title: "Velocidade da luz",
        description:
            "Colete um Speed Boost.",
        icon: "⚡",
        reward: 30
    },

    ghost: {
        id: "ghost",
        title: "Fantasma",
        description:
            "Use o Ghost Power-up.",
        icon: "👻",
        reward: 35
    },

    shield: {
        id: "shield",
        title: "Indestrutível",
        description:
            "Use o Shield para sobreviver a uma colisão.",
        icon: "🛡️",
        reward: 50
    },

    level10: {
        id: "level10",
        title: "Nível 10",
        description:
            "Alcance o nível 10.",
        icon: "🏆",
        reward: 100
    },

    collector: {
        id: "collector",
        title: "Colecionador",
        description:
            "Possua pelo menos 5 skins.",
        icon: "👑",
        reward: 100
    }
};

let unlockedAchievements =
    loadJSON(
        "snakeAchievements",
        {}
    );

function saveAchievements() {
    localStorage.setItem(
        "snakeAchievements",
        JSON.stringify(
            unlockedAchievements
        )
    );
}

function isAchievementUnlocked(id) {
    return Boolean(
        unlockedAchievements[id]
    );
}

function unlockAchievement(id) {
    const achievement =
        ACHIEVEMENTS[id];

    if (!achievement) return;

    if (
        isAchievementUnlocked(id)
    ) {
        return;
    }

    unlockedAchievements[id] = {
        unlockedAt:
            new Date().toISOString()
    };

    saveAchievements();

    addCoins(
        achievement.reward
    );

    addPlayerXP(
        PLAYER_XP_REWARDS.achievement
    );

    showAchievementNotification(
        achievement
    );

    renderAchievements();
    updateStatisticsUI();
}

function checkAchievements() {
    if (
        statistics.gamesPlayed >= 1
    ) {
        unlockAchievement(
            "firstGame"
        );
    }

    if (score >= 100) {
        unlockAchievement(
            "hundredPoints"
        );
    }

    if (currentFoodStreak >= 10) {
        unlockAchievement(
            "foodStreak"
        );
    }

    if (
        speedBoostActive ||
        powerUp?.type === "speed"
    ) {
        unlockAchievement(
            "speedBoost"
        );
    }

    if (
        ghostActive ||
        powerUp?.type === "ghost"
    ) {
        unlockAchievement(
            "ghost"
        );
    }

    if (level >= 10) {
        unlockAchievement(
            "level10"
        );
    }

    if (
        playerProfile.ownedSkins.length >=
        5
    ) {
        unlockAchievement(
            "collector"
        );
    }
}

function renderAchievements() {
    if (!achievementList) {
        return;
    }

    const achievementEntries =
        Object.values(
            ACHIEVEMENTS
        );

    const unlockedCount =
        achievementEntries.filter(
            achievement =>
                isAchievementUnlocked(
                    achievement.id
                )
        ).length;

    if (achievementCount) {
        achievementCount.textContent =
            `${unlockedCount}/${achievementEntries.length}`;
    }

    achievementList.innerHTML = "";

    achievementEntries.forEach(
        achievement => {

            const unlocked =
                isAchievementUnlocked(
                    achievement.id
                );

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                `achievement-card ${unlocked ? "unlocked" : "locked"}`;

            card.innerHTML = `
                <div class="achievement-icon">
                    ${
                        unlocked
                            ? achievement.icon
                            : "🔒"
                    }
                </div>

                <div class="achievement-info">
                    <strong>
                        ${achievement.title}
                    </strong>

                    <span>
                        ${achievement.description}
                    </span>

                    <small>
                        🪙 +${achievement.reward}
                    </small>
                </div>

                <div class="achievement-status">
                    ${
                        unlocked
                            ? "✓"
                            : "—"
                    }
                </div>
            `;

            achievementList.appendChild(
                card
            );
        }
    );
}

function showAchievementNotification(
    achievement
) {
    playSound(
        "achievement"
    );

    if (
        achievementNotificationIcon
    ) {
        achievementNotificationIcon.textContent =
            achievement.icon;
    }

    if (
        achievementNotificationTitle
    ) {
        achievementNotificationTitle.textContent =
            achievement.title;
    }

    if (
        achievementNotificationMessage
    ) {
        achievementNotificationMessage.textContent =
            `Conquista desbloqueada! +${achievement.reward} moedas`;
    }

    if (
        achievementNotification
    ) {
        achievementNotification.classList.add(
            "show"
        );

        clearTimeout(
            showAchievementNotification.timer
        );

        showAchievementNotification.timer =
            setTimeout(
                () => {
                    achievementNotification.classList.remove(
                        "show"
                    );
                },
                4000
            );
    }
}


/* =========================================================
   GAME VARIABLES
========================================================= */

let currentFoodStreak = 0;
let bestFoodStreak = 0;

let lastScoreForRecord =
    highScore;

let extraLifeUsed = false;

let playTimeStartedAt = null;


/* =========================================================
   PLAY TIME
========================================================= */

function startPlayTimeTracking() {
    if (playTimeStartedAt !== null) {
        return;
    }

    playTimeStartedAt =
        Date.now();
}

function flushPlayTime() {
    if (
        playTimeStartedAt === null
    ) {
        return;
    }

    const elapsed =
        Date.now() -
        playTimeStartedAt;

    if (elapsed > 0) {
        statistics.playTime +=
            Math.floor(
                elapsed / 1000
            );

        saveStatistics();
    }

    playTimeStartedAt = null;
}

function formatPlayTime(seconds) {
    seconds =
        Math.max(
            0,
            Number(seconds) || 0
        );

    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) /
            60
        );

    const secs =
        seconds % 60;

    if (hours > 0) {
        return `${hours}h ${String(minutes).padStart(2, "0")}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${String(secs).padStart(2, "0")}s`;
    }

    return `${secs}s`;
}


/* =========================================================
   PARTICLES
========================================================= */

function createParticles(
    x,
    y,
    options = {}
) {
    const count =
        options.count ?? 12;

    const color =
        options.color ??
        getTheme().food;

    const speed =
        options.speed ?? 2.5;

    for (
        let i = 0;
        i < count;
        i++
    ) {
        const angle =
            Math.random() *
            Math.PI *
            2;

        const velocity =
            Math.random() *
                speed +
            0.5;

        particles.push({
            x:
                x * TILE_SIZE +
                TILE_SIZE / 2,

            y:
                y * TILE_SIZE +
                TILE_SIZE / 2,

            vx:
                Math.cos(angle) *
                velocity,

            vy:
                Math.sin(angle) *
                velocity,

            life: 1,

            decay:
                Math.random() *
                    0.025 +
                0.018,

            size:
                Math.random() *
                    3 +
                2,

            color
        });
    }
}

function updateParticles() {
    particles =
        particles.filter(
            particle => {

                particle.x +=
                    particle.vx;

                particle.y +=
                    particle.vy;

                particle.vx *= 0.98;
                particle.vy *= 0.98;

                particle.life -=
                    particle.decay;

                return (
                    particle.life > 0
                );
            }
        );
}

function drawParticles() {
    particles.forEach(
        particle => {

            ctx.save();

            ctx.globalAlpha =
                Math.max(
                    0,
                    particle.life
                );

            ctx.fillStyle =
                particle.color;

            ctx.shadowBlur = 10;
            ctx.shadowColor =
                particle.color;

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size *
                    particle.life,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();
        }
    );
}


/* =========================================================
   THEME
========================================================= */

function getTheme() {
    return (
        THEMES[currentTheme] ||
        THEMES.neon
    );
}

function applyTheme(
    themeName
) {
    if (
        !THEMES[themeName]
    ) {
        themeName = "neon";
    }

    currentTheme =
        themeName;

    localStorage.setItem(
        "snakeTheme",
        currentTheme
    );

    const theme =
        getTheme();

    document.documentElement.style.setProperty(
        "--game-background",
        theme.background
    );

    document.documentElement.style.setProperty(
        "--game-grid",
        theme.grid
    );

    document.documentElement.style.setProperty(
        "--game-snake-head",
        theme.snakeHead
    );

    document.documentElement.style.setProperty(
        "--game-snake-body",
        theme.snakeBody
    );

    document.documentElement.style.setProperty(
        "--game-food",
        theme.food
    );

    document.documentElement.style.setProperty(
        "--game-obstacle",
        theme.obstacle
    );

    document.documentElement.style.setProperty(
        "--game-obstacle-border",
        theme.obstacleBorder
    );

    document.documentElement.style.setProperty(
        "--game-text",
        theme.text
    );

    document.documentElement.style.setProperty(
        "--game-panel",
        theme.panel
    );

    document.documentElement.style.setProperty(
        "--game-glow",
        theme.glow
    );

    drawGame();
}


/* =========================================================
   GAME RESET
========================================================= */

function resetGame() {
    snake = [
        {
            x: 10,
            y: 10
        },

        {
            x: 9,
            y: 10
        },

        {
            x: 8,
            y: 10
        }
    ];

    direction = {
        x: 1,
        y: 0
    };

    nextDirection = {
        x: 1,
        y: 0
    };

    score = 0;
    level = 1;

    food = {
        x: 15,
        y: 10
    };

    powerUp = null;

    obstacles = [];

    particles = [];

    foodPulse = 0;
    powerUpPulse = 0;

    currentFoodStreak = 0;

    speedBoostActive = false;
    doublePointsActive = false;
    shieldActive = false;
    magnetActive = false;
    slowMotionActive = false;
    ghostActive = false;
    extraLifeActive = false;

    extraLifeUsed = false;

    clearPowerUpTimers();

    generateFood();

    generateObstacles();

    updateUI();

    updatePowerStatus();

    drawGame();
}


/* =========================================================
   GAME START
========================================================= */

function startGame() {
    unlockAudio();

    resetGame();

    gameRunning = true;
    gamePaused = false;
    gameOverState = false;

    playSound("start");

    if (overlay) {
        overlay.classList.remove(
            "show"
        );
    }

    if (startButton) {
        startButton.style.display =
            "none";

        startButton.textContent =
            "▶ Iniciar";
    }

    if (restartButton) {
        restartButton.style.display =
            "none";
    }

    if (pauseButton) {
        pauseButton.disabled =
            false;

        pauseButton.textContent =
            "⏸ Pausar";
    }

    statistics.gamesPlayed++;

    updateDailyMission(
        "games",
        1
    );

    saveStatistics();

    checkAchievements();

    startPlayTimeTracking();

    startBackgroundMusic();

    restartGameLoop();

    drawGame();
}


/* =========================================================
   GAME LOOP
========================================================= */

/*
   CORREÇÃO IMPORTANTE:

   O jogo agora usa requestAnimationFrame
   + acumulador de tempo.

   Isso evita problemas de movimento causados
   por setInterval e mantém a velocidade
   consistente mesmo quando o navegador
   reduz a taxa de atualização.
*/

function restartGameLoop() {
    stopGameLoop();

    lastUpdateTime =
        performance.now();

    requestAnimationFrame(
        gameLoopFrame
    );
}

function stopGameLoop() {
    if (gameLoop !== null) {
        cancelAnimationFrame(
            gameLoop
        );

        gameLoop = null;
    }
}

function gameLoopFrame(
    currentTime
) {
    if (
        !gameRunning
    ) {
        gameLoop = null;
        return;
    }

    if (
        gamePaused
    ) {
        lastUpdateTime =
            currentTime;

        gameLoop =
            requestAnimationFrame(
                gameLoopFrame
            );

        return;
    }

    let delta =
        currentTime -
        lastUpdateTime;

    /*
       Evita que a cobra dê vários
       passos instantâneos depois que
       a aba volta a ficar ativa.
    */
    if (delta > 250) {
        delta = 250;
    }

    lastUpdateTime =
        currentTime;

    gameAccumulator += delta;

    const speed =
        getGameSpeed();

    while (
        gameAccumulator >=
        speed
    ) {
        updateGame();

        gameAccumulator -=
            speed;

        if (!gameRunning) {
            break;
        }
    }

    if (gameRunning) {
        drawGame();

        gameLoop =
            requestAnimationFrame(
                gameLoopFrame
            );
    } else {
        gameLoop = null;
    }
}

let gameAccumulator = 0;


/* =========================================================
   GAME SPEED
========================================================= */

function getGameSpeed() {
    let speed =
        INITIAL_SPEED -
        (level - 1) * 5;

    speed =
        Math.max(
            MIN_SPEED,
            speed
        );

    if (
        speedBoostActive
    ) {
        speed *=
            SPEED_BOOST_MULTIPLIER;
    }

    if (
        slowMotionActive
    ) {
        speed *=
            SLOW_MOTION_MULTIPLIER;
    }

    return Math.max(
        30,
        speed
    );
}


/* =========================================================
   MAIN UPDATE
========================================================= */

function updateGame() {
    if (
        !gameRunning ||
        gamePaused
    ) {
        return;
    }

    /*
       Aplica a próxima direção
       somente no momento em que
       a cobra realmente vai andar.
    */
    direction = {
        ...nextDirection
    };

    const head =
        snake[0];

    const newHead = {
        x:
            head.x +
            direction.x,

        y:
            head.y +
            direction.y
    };

    /*
       COLISÃO COM PAREDES
    */

    const hitWall =
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE;

    if (
        hitWall &&
        !ghostActive
    ) {
        if (
            shieldActive
        ) {
            consumeShield(
                newHead
            );

            return;
        }

        if (
            extraLifeActive &&
            !extraLifeUsed
        ) {
            useExtraLife();

            return;
        }

        gameOver();
        return;
    }

    /*
       Se Ghost estiver ativo,
       a cobra atravessa as paredes.
    */

    if (ghostActive) {
        newHead.x =
            (
                newHead.x +
                GRID_SIZE
            ) %
            GRID_SIZE;

        newHead.y =
            (
                newHead.y +
                GRID_SIZE
            ) %
            GRID_SIZE;
    }

    /*
       COLISÃO COM OBSTÁCULOS
    */

    const hitObstacle =
        obstacles.some(
            obstacle =>
                obstacle.x ===
                    newHead.x &&
                obstacle.y ===
                    newHead.y
        );

    if (
        hitObstacle &&
        !ghostActive
    ) {
        if (
            shieldActive
        ) {
            consumeShield(
                newHead
            );

            return;
        }

        if (
            extraLifeActive &&
            !extraLifeUsed
        ) {
            useExtraLife();

            return;
        }

        gameOver();
        return;
    }

    /*
       COLISÃO COM A PRÓPRIA COBRA

       A última parte da cobra pode
       desaparecer neste mesmo movimento
       caso não coma a comida.

       Por isso não consideramos a cauda
       quando não haverá crescimento.
    */

    const willEatFood =
        newHead.x === food.x &&
        newHead.y === food.y;

    const bodyToCheck =
        willEatFood
            ? snake
            : snake.slice(
                  0,
                  -1
              );

    const hitSelf =
        bodyToCheck.some(
            segment =>
                segment.x ===
                    newHead.x &&
                segment.y ===
                    newHead.y
        );

    if (
        hitSelf &&
        !ghostActive
    ) {
        if (
            shieldActive
        ) {
            consumeShield(
                newHead
            );

            return;
        }

        if (
            extraLifeActive &&
            !extraLifeUsed
        ) {
            useExtraLife();

            return;
        }

        gameOver();
        return;
    }

    /*
       MOVE A COBRA
    */

    snake.unshift(
        newHead
    );

    /*
       MAGNET
    */

    if (
        magnetActive &&
        !willEatFood
    ) {
        const distance =
            Math.abs(
                newHead.x -
                    food.x
            ) +
            Math.abs(
                newHead.y -
                    food.y
            );

        if (
            distance <= 5
        ) {
            food.x =
                newHead.x;

            food.y =
                newHead.y;
        }
    }

    /*
       COMIDA
    */

    if (
        newHead.x === food.x &&
        newHead.y === food.y
    ) {
        eatFood();
    } else {
        snake.pop();
    }

    /*
       POWER-UP
    */

    if (
        powerUp &&
        newHead.x ===
            powerUp.x &&
        newHead.y ===
            powerUp.y
    ) {
        collectPowerUp();
    }

    /*
       ANIMAÇÕES
    */

    updateParticles();

    foodPulse += 0.08;
    powerUpPulse += 0.10;

    updateUI();

    updatePowerStatus();
}


/* =========================================================
   EAT FOOD
========================================================= */

function eatFood() {
    currentFoodStreak++;

    bestFoodStreak =
        Math.max(
            bestFoodStreak,
            currentFoodStreak
        );

    let points = 1;

    if (
        doublePointsActive
    ) {
        points *= 2;
    }

    score += points;

    statistics.foodCollected++;

    addPlayerXP(
        PLAYER_XP_REWARDS.food
    );

    /*
       Cada comida gera moedas.
    */

    addCoins(
        doublePointsActive
            ? 2
            : 1
    );

    createParticles(
        food.x,
        food.y,
        {
            count: 18,
            color:
                getTheme().food,
            speed: 3
        }
    );

    if (
        currentFoodStreak >= 5
    ) {
        playSound("combo");
    } else {
        playSound("eat");
    }

    updateDailyMission(
        "food",
        1
    );

    updateDailyMission(
        "score",
        points
    );

    if (
        score > highScore
    ) {
        const isNewRecord =
            highScore > 0;

        highScore =
            score;

        localStorage.setItem(
            "snakeHighScore",
            String(highScore)
        );

        if (
            isNewRecord &&
            score === highScore
        ) {
            playSound("record");
        }
    }

    if (
        score >= 100
    ) {
        unlockAchievement(
            "hundredPoints"
        );
    }

    generateFood();

    maybeGeneratePowerUp();

    updateLevel();

    saveStatistics();

    checkAchievements();

    updateUI();
}


/* =========================================================
   LEVEL
========================================================= */

function updateLevel() {
    const newLevel =
        Math.floor(
            score / 10
        ) + 1;

    if (
        newLevel <= level
    ) {
        return;
    }

    const levelsGained =
        newLevel -
        level;

    level =
        newLevel;

    addCoins(
        3 *
        levelsGained
    );

    addPlayerXP(
        PLAYER_XP_REWARDS.levelUp *
        levelsGained
    );

    playSound("levelup");

    showToast(
        `🚀 Nível ${level}`,
        "A velocidade da cobra aumentou!"
    );

    updateDailyMission(
        "level",
        0
    );

    if (
        level >= 10
    ) {
        unlockAchievement(
            "level10"
        );
    }

    statistics.highestLevel =
        Math.max(
            statistics.highestLevel,
            level
        );

    saveStatistics();

    /*
       A cada novo nível,
       alguns obstáculos podem
       ser adicionados.
    */

    generateObstacles();

    /*
       Não usamos mais setInterval.
       O requestAnimationFrame já
       lê getGameSpeed() continuamente.
    */

    updateUI();
}


/* =========================================================
   FOOD GENERATION
========================================================= */

function generateFood() {
    let attempts = 0;

    do {
        food = {
            x:
                Math.floor(
                    Math.random() *
                    GRID_SIZE
                ),

            y:
                Math.floor(
                    Math.random() *
                    GRID_SIZE
                )
        };

        attempts++;

        if (
            attempts > 500
        ) {
            break;
        }

    } while (
        isPositionBlocked(
            food.x,
            food.y
        )
    );
}

function isPositionBlocked(
    x,
    y
) {
    const snakeBlocked =
        snake.some(
            segment =>
                segment.x === x &&
                segment.y === y
        );

    if (
        snakeBlocked
    ) {
        return true;
    }

    const obstacleBlocked =
        obstacles.some(
            obstacle =>
                obstacle.x === x &&
                obstacle.y === y
        );

    if (
        obstacleBlocked
    ) {
        return true;
    }

    if (
        powerUp &&
        powerUp.x === x &&
        powerUp.y === y
    ) {
        return true;
    }

    return false;
}


/* =========================================================
   OBSTACLES
========================================================= */

function generateObstacles() {
    const desiredCount =
        Math.min(
            MAX_OBSTACLES,
            Math.max(
                0,
                level - 1
            )
        );

    while (
        obstacles.length <
        desiredCount
    ) {
        let attempts = 0;

        let obstacle;

        do {
            obstacle = {
                x:
                    Math.floor(
                        Math.random() *
                        GRID_SIZE
                    ),

                y:
                    Math.floor(
                        Math.random() *
                        GRID_SIZE
                    )
            };

            attempts++;

            if (
                attempts > 500
            ) {
                break;
            }

        } while (
            isPositionBlockedForObstacle(
                obstacle.x,
                obstacle.y
            )
        );

        if (
            attempts > 500
        ) {
            break;
        }

        obstacles.push(
            obstacle
        );
    }
}

function isPositionBlockedForObstacle(
    x,
    y
) {
    /*
       Mantém uma área inicial
       segura para a cobra.
    */

    if (
        x >= 6 &&
        x <= 12 &&
        y >= 7 &&
        y <= 13
    ) {
        return true;
    }

    if (
        snake.some(
            segment =>
                segment.x === x &&
                segment.y === y
        )
    ) {
        return true;
    }

    if (
        food.x === x &&
        food.y === y
    ) {
        return true;
    }

    if (
        powerUp &&
        powerUp.x === x &&
        powerUp.y === y
    ) {
        return true;
    }

    return obstacles.some(
        obstacle =>
            obstacle.x === x &&
            obstacle.y === y
    );
}


/* =========================================================
   POWER-UPS
========================================================= */

const POWER_UP_TYPES = {
    speed: {
        name: "Speed Boost",
        icon: "⚡",
        color: "#facc15",
        duration:
            POWER_UP_DURATION
    },

    double: {
        name: "Double Points",
        icon: "✖2",
        color: "#c084fc",
        duration:
            POWER_UP_DURATION
    },

    shield: {
        name: "Shield",
        icon: "🛡️",
        color: "#38bdf8",
        duration:
            POWER_UP_DURATION
    },

    magnet: {
        name: "Magnet",
        icon: "🧲",
        color: "#fb7185",
        duration:
            POWER_UP_DURATION
    },

    slow: {
        name: "Slow Motion",
        icon: "🐌",
        color: "#60a5fa",
        duration:
            POWER_UP_DURATION
    },

    ghost: {
        name: "Ghost",
        icon: "👻",
        color: "#e879f9",
        duration:
            POWER_UP_DURATION
    },

    life: {
        name: "Extra Life",
        icon: "❤️",
        color: "#f43f5e",
        duration:
            POWER_UP_DURATION
    }
};

function maybeGeneratePowerUp() {
    if (
        powerUp ||
        Math.random() >
            POWER_UP_CHANCE
    ) {
        return;
    }

    generatePowerUp();
}

function generatePowerUp() {
    let attempts = 0;

    let position;

    do {
        position = {
            x:
                Math.floor(
                    Math.random() *
                    GRID_SIZE
                ),

            y:
                Math.floor(
                    Math.random() *
                    GRID_SIZE
                )
        };

        attempts++;

        if (
            attempts > 500
        ) {
            return;
        }

    } while (
        isPositionBlocked(
            position.x,
            position.y
        )
    );

    const types =
        Object.keys(
            POWER_UP_TYPES
        );

    const type =
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ];

    powerUp = {
        x: position.x,
        y: position.y,
        type,
        createdAt:
            Date.now()
    };

    clearTimeout(
        powerUpTimer
    );

    powerUpTimer =
        setTimeout(
            () => {
                powerUp = null;
                drawGame();
            },
            POWER_UP_LIFETIME
        );
}

function collectPowerUp() {
    if (!powerUp) {
        return;
    }

    const type =
        powerUp.type;

    const data =
        POWER_UP_TYPES[type];

    if (!data) {
        powerUp = null;
        return;
    }

    statistics.powerUpsCollected++;

    addCoins(5);

    addPlayerXP(25);

    updateDailyMission(
        "powerups",
        1
    );

    if (
        type === "speed"
    ) {
        updateDailyMission(
            "speed",
            1
        );

        unlockAchievement(
            "speedBoost"
        );
    }

    if (
        type === "shield"
    ) {
        updateDailyMission(
            "shield",
            1
        );
    }

    if (
        type === "ghost"
    ) {
        unlockAchievement(
            "ghost"
        );
    }

    playSound(
        "powerup"
    );

    createParticles(
        powerUp.x,
        powerUp.y,
        {
            count: 28,
            color: data.color,
            speed: 4
        }
    );

    activatePowerUp(
        type
    );

    powerUp = null;

    clearTimeout(
        powerUpTimer
    );

    saveStatistics();

    updateUI();
    updatePowerStatus();
}

function activatePowerUp(
    type
) {
    clearPowerUpTimers();

    switch (type) {

        case "speed":
            speedBoostActive =
                true;

            speedBoostTimer =
                setTimeout(
                    () => {
                        speedBoostActive =
                            false;

                        updatePowerStatus();
                    },
                    POWER_UP_DURATION
                );
            break;

        case "double":
            doublePointsActive =
                true;

            doublePointsTimer =
                setTimeout(
                    () => {
                        doublePointsActive =
                            false;

                        updatePowerStatus();
                    },
                    POWER_UP_DURATION
                );
            break;

        case "shield":
            shieldActive =
                true;

            break;

        case "magnet":
            magnetActive =
                true;

            magnetTimer =
                setTimeout(
                    () => {
                        magnetActive =
                            false;

                        updatePowerStatus();
                    },
                    POWER_UP_DURATION
                );
            break;

        case "slow":
            slowMotionActive =
                true;

            slowMotionTimer =
                setTimeout(
                    () => {
                        slowMotionActive =
                            false;

                        updatePowerStatus();
                    },
                    POWER_UP_DURATION
                );
            break;

        case "ghost":
            ghostActive =
                true;

            ghostStartTime =
                Date.now();

            ghostTimer =
                setTimeout(
                    () => {
                        ghostActive =
                            false;

                        ghostStartTime =
                            null;

                        updatePowerStatus();
                    },
                    POWER_UP_DURATION
                );
            break;

        case "life":
            extraLifeActive =
                true;

            extraLifeUsed =
                false;

            break;
    }

    updatePowerStatus();
}

function clearPowerUpTimers() {
    clearTimeout(
        powerUpTimer
    );

    clearTimeout(
        speedBoostTimer
    );

    clearTimeout(
        doublePointsTimer
    );

    clearTimeout(
        slowMotionTimer
    );

    clearTimeout(
        ghostTimer
    );

    clearTimeout(
        magnetTimer
    );

    powerUpTimer = null;
    speedBoostTimer = null;
    doublePointsTimer = null;
    slowMotionTimer = null;
    ghostTimer = null;
    magnetTimer = null;
}


/* =========================================================
   SHIELD / EXTRA LIFE
========================================================= */

function consumeShield(
    collisionPosition
) {
    shieldActive = false;

    playSound(
        "shield"
    );

    createParticles(
        collisionPosition.x,
        collisionPosition.y,
        {
            count: 30,
            color:
                POWER_UP_TYPES
                    .shield
                    .color,
            speed: 4
        }
    );

    showToast(
        "🛡️ Shield ativado",
        "A colisão foi bloqueada!"
    );

    /*
       Reposiciona a cabeça para
       a direção oposta da colisão.
    */

    const safeHead = {
        x:
            snake[0].x,
        y:
            snake[0].y
    };

    direction = {
        ...direction
    };

    nextDirection = {
        ...direction
    };

    snake[0] = safeHead;

    updatePowerStatus();

    drawGame();
}

function useExtraLife() {
    extraLifeUsed = true;
    extraLifeActive = false;

    playSound(
        "shield"
    );

    createParticles(
        snake[0].x,
        snake[0].y,
        {
            count: 35,
            color:
                POWER_UP_TYPES
                    .life
                    .color,
            speed: 4
        }
    );

    showToast(
        "❤️ Vida extra!",
        "Você sobreviveu à colisão."
    );

    /*
       Reposiciona a cobra no centro
       com a direção atual.
    */

    snake = [
        {
            x: 10,
            y: 10
        },

        {
            x: 9,
            y: 10
        },

        {
            x: 8,
            y: 10
        }
    ];

    direction = {
        x: 1,
        y: 0
    };

    nextDirection = {
        x: 1,
        y: 0
    };

    updatePowerStatus();

    drawGame();
}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {
    if (
        !gameRunning
    ) {
        return;
    }

    gameRunning = false;
    gamePaused = false;
    gameOverState = true;

    stopGameLoop();

    stopBackgroundMusic();

    playSound(
        "gameover"
    );

    /*
       Registra tempo de Ghost.
    */

    if (
        ghostStartTime !== null
    ) {
        const ghostTime =
            Date.now() -
            ghostStartTime;

        if (
            ghostTime > 0
        ) {
            statistics.playTime +=
                Math.floor(
                    ghostTime /
                        1000
                );
        }

        ghostStartTime =
            null;
    }

    flushPlayTime();

    currentFoodStreak = 0;

    statistics.bestScore =
        Math.max(
            statistics.bestScore,
            score
        );

    statistics.highestLevel =
        Math.max(
            statistics.highestLevel,
            level
        );

    saveStatistics();

    checkAchievements();

    updateUI();
    updateStatisticsUI();

    renderAchievements();
    renderDailyMissions();

    if (overlay) {
        overlay.classList.add(
            "show"
        );
    }

    if (overlayIcon) {
        overlayIcon.textContent =
            "💀";
    }

    if (overlayTitle) {
        overlayTitle.textContent =
            "Game Over";
    }

    if (overlayMessage) {
        overlayMessage.innerHTML =
            `
                Pontuação:
                <strong>${score}</strong>
                <br>
                Nível:
                <strong>${level}</strong>
            `;
    }

    if (startButton) {
        startButton.style.display =
            "none";
    }

    if (restartButton) {
        restartButton.style.display =
            "inline-flex";

        restartButton.textContent =
            "🔄 Jogar novamente";
    }

    if (pauseButton) {
        pauseButton.disabled =
            true;

        pauseButton.textContent =
            "⏸ Pausar";
    }

    drawGame();
}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {
    if (
        !gameRunning
    ) {
        return;
    }

    unlockAudio();

    gamePaused =
        !gamePaused;

    if (
        gamePaused
    ) {
        flushPlayTime();

        stopBackgroundMusic();

        playSound(
            "pause"
        );

        if (pauseButton) {
            pauseButton.textContent =
                "▶ Continuar";
        }

        if (overlay) {
            overlay.classList.add(
                "show"
            );
        }

        if (overlayIcon) {
            overlayIcon.textContent =
                "⏸️";
        }

        if (overlayTitle) {
            overlayTitle.textContent =
                "Jogo pausado";
        }

        if (overlayMessage) {
            overlayMessage.textContent =
                "Pressione Continuar ou Espaço para voltar.";
        }

    } else {
        startPlayTimeTracking();

        startBackgroundMusic();

        playSound(
            "pause"
        );

        if (pauseButton) {
            pauseButton.textContent =
                "⏸ Pausar";
        }

        if (overlay) {
            overlay.classList.remove(
                "show"
            );
        }

        lastUpdateTime =
            performance.now();
    }

    drawGame();
}

function resumeFromOverlay() {
    if (
        gameOverState
    ) {
        startGame();
        return;
    }

    if (
        gamePaused
    ) {
        togglePause();
    }
}

    gamePaused = false;
    gameOverState = false;

    achievementStats.gamesPlayed++;
    updateDailyMission("games");

    saveAchievements();

    overlay.classList.add("hidden");

    pauseButton.textContent =
        "⏸ Pausar";

    lastUpdateTime = performance.now();
    startBackgroundMusic();
    playSound("start");

    startGameLoop();


function startGameLoop() {
    cancelAnimationFrame(gameLoop);

    let accumulator = 0;
    let previousTimestamp = performance.now();

    function loop(timestamp) {
        if (!gameRunning) {
            return;
        }

        const delta = Math.min(
            timestamp - previousTimestamp,
            100
        );

        previousTimestamp = timestamp;

        if (!gamePaused) {
            updatePlayTime(delta);
            accumulator += delta;

            let speed = getGameSpeed();

            while (
                accumulator >= speed &&
                gameRunning &&
                !gamePaused
            ) {
                updateGame();
                accumulator -= speed;
                speed = getGameSpeed();
            }

            updateParticles();
            foodPulse += delta * 0.006;
            powerUpPulse += delta * 0.006;
            drawGame();
        } else {
            drawGame();
        }

        gameLoop = requestAnimationFrame(loop);
    }

    gameLoop = requestAnimationFrame(loop);
}

/* =========================================================
   PLAY TIME
========================================================= */

let playTimeSaveAccumulator = 0;

function updatePlayTime(delta) {
    const seconds = delta / 1000;

    statistics.playTime += seconds;

    playTimeSaveAccumulator += delta;

    if (playTimeSaveAccumulator >= 5000) {
        saveStatistics();
        updateStatisticsUI();

        playTimeSaveAccumulator = 0;
    }
}

function formatPlayTime(seconds) {
    const totalSeconds =
        Math.floor(seconds);

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}

/* =========================================================
   SPEED
========================================================= */

function getGameSpeed() {
    let speed =
        INITIAL_SPEED -
        (level - 1) * 5;

    speed =
        Math.max(
            MIN_SPEED,
            speed
        );

    if (speedBoostActive) {
        speed *=
            SPEED_BOOST_MULTIPLIER;
    }

    if (slowMotionActive) {
        speed *=
            SLOW_MOTION_MULTIPLIER;
    }

    return speed;
}

/* =========================================================
   UPDATE GAME
========================================================= */

function updateGame() {
    direction = {
        ...nextDirection
    };

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    /* Wall collision */

    if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
    ) {
        if (useShield()) {
            respawnSnake();
            return;
        }

        gameOver("Você bateu na parede!");
        return;
    }

    /* Obstacle collision */

    if (
        obstacles.some(
            obstacle =>
                obstacle.x === head.x &&
                obstacle.y === head.y
        )
    ) {
        if (useShield()) {
            respawnSnake();
            return;
        }

        gameOver("Você bateu em um obstáculo!");
        return;
    }

    /* Self collision */

    if (!ghostActive) {
        const hitSelf =
            snake.some(
                segment =>
                    segment.x === head.x &&
                    segment.y === head.y
            );

        if (hitSelf) {
            if (useShield()) {
                respawnSnake();
                return;
            }

            gameOver(
                "Você bateu no próprio corpo!"
            );

            return;
        }
    }

    snake.unshift(head);

    let ateFood = false;

    if (
        head.x === food.x &&
        head.y === food.y
    ) {
        ateFood = true;

        const points =
            doublePointsActive
                ? 2
                : 1;

        score += points;

        playSound(
            achievementStats.currentFoodStreak + 1 >= 5
                ? "combo"
                : "eat"
        );

        achievementStats.currentFoodStreak++;

        achievementStats.bestFoodStreak =
            Math.max(
                achievementStats.bestFoodStreak,
                achievementStats.currentFoodStreak
            );

        achievementStats.bestScore =
            Math.max(
                achievementStats.bestScore,
                score
            );

        statistics.foodCollected++;

        statistics.bestScore =
            Math.max(
                statistics.bestScore,
                score
            );

        addCoins(1);

        addPlayerXP(
            PLAYER_XP_REWARDS.food
        );

        updateDailyMission(
            "food"
        );

        updateDailyMission(
            "score",
            points
        );

        createFoodParticles(
            food.x,
            food.y
        );

        const previousHighScore =
            Number(
                localStorage.getItem(
                    "snakeHighScore"
                )
            ) || 0;

        if (score > previousHighScore) {
            highScore = score;

            localStorage.setItem(
                "snakeHighScore",
                highScore
            );

            if (
                score ===
                previousHighScore + 1
            ) {
                addPlayerXP(
                    PLAYER_XP_REWARDS.record
                );
            }
        }

        generateFood();

        maybeGeneratePowerUp();

        updateLevel();

        saveAchievements();
        saveStatistics();

        checkAchievements();
    }

    if (!ateFood) {
        snake.pop();
    }

    /* Magnet */

    if (magnetActive) {
        const distance =
            Math.abs(food.x - head.x) +
            Math.abs(food.y - head.y);

        if (distance <= 4) {
            food = {
                ...head
            };
        }
    }
}

/* =========================================================
   LEVEL
========================================================= */

function updateLevel() {
    const newLevel =
        Math.floor(score / 10) + 1;

    if (newLevel !== level) {
        const levelsGained =
            newLevel - level;

        level = newLevel;

        addCoins(
            levelsGained * 3
        );

        addPlayerXP(
            levelsGained *
            PLAYER_XP_REWARDS.levelUp
        );

        updateDailyMission(
            "level",
            level
        );

        statistics.highestLevel =
            Math.max(
                statistics.highestLevel,
                level
            );

        achievementStats.highestLevel =
            Math.max(
                achievementStats.highestLevel,
                level
            );

        generateObstacles();

        saveStatistics();
        saveAchievements();

        checkAchievements();
    }
}

/* =========================================================
   FOOD
========================================================= */

function generateFood() {
    let attempts = 0;

    do {
        food = {
            x: Math.floor(
                Math.random() * GRID_SIZE
            ),

            y: Math.floor(
                Math.random() * GRID_SIZE
            )
        };

        attempts++;
    } while (
        attempts < 100 &&
        (
            snake.some(
                segment =>
                    segment.x === food.x &&
                    segment.y === food.y
            ) ||
            obstacles.some(
                obstacle =>
                    obstacle.x === food.x &&
                    obstacle.y === food.y
            )
        )
    );
}

/* =========================================================
   OBSTACLES
========================================================= */

function getObstacleCount() {
    if (level <= 2) {
        return 0;
    }

    return Math.min(
        MAX_OBSTACLES,
        level - 2
    );
}

function generateObstacles() {
    obstacles = [];

    const count =
        getObstacleCount();

    let attempts = 0;

    while (
        obstacles.length < count &&
        attempts < 500
    ) {
        attempts++;

        const obstacle = {
            x: Math.floor(
                Math.random() * GRID_SIZE
            ),

            y: Math.floor(
                Math.random() * GRID_SIZE
            )
        };

        const nearSnake =
            Math.abs(
                obstacle.x - snake[0].x
            ) < 4 &&
            Math.abs(
                obstacle.y - snake[0].y
            ) < 4;

        if (nearSnake) {
            continue;
        }

        const duplicate =
            obstacles.some(
                item =>
                    item.x === obstacle.x &&
                    item.y === obstacle.y
            );

        if (duplicate) {
            continue;
        }

        if (
            obstacle.x === food.x &&
            obstacle.y === food.y
        ) {
            continue;
        }

        obstacles.push(obstacle);
    }
}

/* =========================================================
   POWER UPS
========================================================= */

const POWER_UP_TYPES = [
    "speed",
    "double",
    "shield",
    "magnet",
    "slow",
    "ghost",
    "life"
];

const POWER_UP_INFO = {
    speed: {
        icon: "⚡",
        color: "#facc15"
    },

    double: {
        icon: "2️⃣",
        color: "#60a5fa"
    },

    shield: {
        icon: "🛡️",
        color: "#38bdf8"
    },

    magnet: {
        icon: "🧲",
        color: "#c084fc"
    },

    slow: {
        icon: "🐌",
        color: "#f59e0b"
    },

    ghost: {
        icon: "👻",
        color: "#e879f9"
    },

    life: {
        icon: "❤️",
        color: "#fb7185"
    }
};

function maybeGeneratePowerUp() {
    if (
        powerUp ||
        Math.random() > POWER_UP_CHANCE
    ) {
        return;
    }

    const type =
        POWER_UP_TYPES[
            Math.floor(
                Math.random() *
                POWER_UP_TYPES.length
            )
        ];

    powerUp = {
        x: Math.floor(
            Math.random() * GRID_SIZE
        ),

        y: Math.floor(
            Math.random() * GRID_SIZE
        ),

        type
    };

    clearTimeout(powerUpTimer);

    powerUpTimer =
        setTimeout(() => {
            powerUp = null;
        }, POWER_UP_LIFETIME);
}

function collectPowerUp() {
    if (!powerUp) {
        return;
    }

    const type =
        powerUp.type;

    playSound("powerup");

    if (
        !achievementStats.powerUpsCollected.includes(
            type
        )
    ) {
        achievementStats.powerUpsCollected.push(
            type
        );
    }

    statistics.powerUpsCollected++;

    updateDailyMission(
        "powerups"
    );

    updateDailyMission(
        type
    );

    createPowerUpParticles(
        powerUp.x,
        powerUp.y
    );

    activatePowerUp(type);

    powerUp = null;

    clearTimeout(powerUpTimer);

    saveAchievements();
    saveStatistics();

    checkAchievements();
}

/* =========================================================
   POWER UP ACTIVATION
========================================================= */

function activatePowerUp(type) {
    switch (type) {
        case "speed":
            activateSpeedBoost();
            break;

        case "double":
            activateDoublePoints();
            break;

        case "shield":
            activateShield();
            break;

        case "magnet":
            activateMagnet();
            break;

        case "slow":
            activateSlowMotion();
            break;

        case "ghost":
            activateGhost();
            break;

        case "life":
            activateExtraLife();
            break;
    }
}

function activateSpeedBoost() {
    speedBoostActive = true;

    achievementStats.speedBoosts++;

    updateDailyMission(
        "speed"
    );

    clearTimeout(speedBoostTimer);

    speedBoostTimer =
        setTimeout(() => {
            speedBoostActive = false;
        }, POWER_UP_DURATION);

    checkAchievements();
}

function activateDoublePoints() {
    doublePointsActive = true;

    clearTimeout(doublePointsTimer);

    doublePointsTimer =
        setTimeout(() => {
            doublePointsActive = false;
        }, POWER_UP_DURATION);
}

function activateShield() {
    shieldActive = true;
}

function activateMagnet() {
    magnetActive = true;

    clearTimeout(magnetTimer);

    magnetTimer =
        setTimeout(() => {
            magnetActive = false;
        }, POWER_UP_DURATION);
}

function activateSlowMotion() {
    slowMotionActive = true;

    clearTimeout(slowMotionTimer);

    slowMotionTimer =
        setTimeout(() => {
            slowMotionActive = false;
        }, POWER_UP_DURATION);
}

function activateGhost() {
    ghostActive = true;

    ghostStartTime =
        performance.now();

    clearTimeout(ghostTimer);

    ghostTimer =
        setTimeout(() => {
            registerGhostTime();

            ghostActive = false;
            ghostStartTime = null;
        }, POWER_UP_DURATION);
}

function registerGhostTime() {
    if (!ghostStartTime) {
        return;
    }

    const elapsed =
        (
            performance.now() -
            ghostStartTime
        ) / 1000;

    achievementStats.ghostTime += elapsed;

    ghostStartTime = null;

    saveAchievements();
    checkAchievements();
}

function activateExtraLife() {
    extraLifeActive = true;
}

function useShield() {
    if (shieldActive) {
        shieldActive = false;

        playSound("shield");

        achievementStats.shieldSaves++;

        updateDailyMission(
            "shield"
        );

        saveAchievements();
        checkAchievements();

        return true;
    }

    if (extraLifeActive) {
        extraLifeActive = false;

        return true;
    }

    return false;
}

function respawnSnake() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = {
        x: 1,
        y: 0
    };

    nextDirection = {
        x: 1,
        y: 0
    };
}

/* =========================================================
   GAME OVER
========================================================= */

function gameOver(message) {
    gameRunning = false;
    gamePaused = false;
    gameOverState = true;
}

    setPowerStatus(
        "slow-status",
        slowMotionActive
    );

    setPowerStatus(
        "ghost-status",
        ghostActive
    );

    setPowerStatus(
        "life-status",
        extraLifeActive
    );
}

function setPowerStatus(
    id,
    active
) {
    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.classList.toggle(
        "active",
        Boolean(active)
    );
}

/* =========================================================
   STATISTICS UI
========================================================= */

function updateStatisticsUI() {
    if (statsGames) {
        statsGames.textContent =
            statistics.gamesPlayed;
    }

    if (statsBestScore) {
        statsBestScore.textContent =
            statistics.bestScore;
    }

    if (statsHighestLevel) {
        statsHighestLevel.textContent =
            statistics.highestLevel;
    }

    if (statsFood) {
        statsFood.textContent =
            statistics.foodCollected;
    }

    if (statsCoins) {
        statsCoins.textContent =
            statistics.coinsEarned;
    }

    if (statsPowerups) {
        statsPowerups.textContent =
            statistics.powerUpsCollected;
    }

    if (statsTime) {
        statsTime.textContent =
            formatPlayTime(
                statistics.playTime
            );
    }

    if (statsAchievements) {
        statsAchievements.textContent =
            Object.keys(
                unlockedAchievements
            ).length;
    }

    if (statsSkins) {
        statsSkins.textContent =
            playerProfile
                .ownedSkins
                .length;
    }

    if (statsPowerupTypes) {
        statsPowerupTypes.textContent =
            achievementStats
                .powerUpsCollected
                .length;
    }
}


/* =========================================================
   PLAYER PROGRESS UI
========================================================= */

function updatePlayerProgressUI() {
    const required =
        getXPRequiredForLevel(
            playerProfile.playerLevel
        );

    const percentage =
        Math.min(
            100,
            (
                playerProfile.xp /
                required
            ) * 100
        );

    if (playerLevelElement) {
        playerLevelElement.textContent =
            playerProfile.playerLevel;
    }

    if (xpText) {
        xpText.textContent =
            `${Math.floor(
                playerProfile.xp
            )} / ${required} XP`;
    }

    if (xpFill) {
        xpFill.style.width =
            `${percentage}%`;
    }
}

function getXPRequiredForLevel(
    playerLevel
) {
    return (
        400 +
        (
            playerLevel - 1
        ) * 100
    );
}

function addPlayerXP(amount) {
    if (
        !amount ||
        amount <= 0
    ) {
        return;
    }

    playerProfile.xp +=
        amount;

    let leveledUp = false;

    while (
        playerProfile.xp >=
        getXPRequiredForLevel(
            playerProfile.playerLevel
        )
    ) {

        playerProfile.xp -=
            getXPRequiredForLevel(
                playerProfile.playerLevel
            );

        playerProfile.playerLevel++;

        leveledUp = true;

        addCoins(
            25,
            false
        );

        showToast(
            "⭐ Novo nível!",
            `Você alcançou o Player Level ${playerProfile.playerLevel}.`
        );
    }

    savePlayerProfile();

    updatePlayerProgressUI();

    if (leveledUp) {
        playSound(
            "levelup"
        );
    }
}


/* =========================================================
   COINS
========================================================= */

function addCoins(
    amount,
    trackStatistics = true
) {
    if (
        !amount ||
        amount <= 0
    ) {
        return;
    }

    playerProfile.coins +=
        amount;

    playerProfile.totalCoins +=
        amount;

    if (trackStatistics) {
        statistics.coinsEarned +=
            amount;
    }

    savePlayerProfile();

    saveStatistics();

    updateUI();
    updateStatisticsUI();
}

function spendCoins(amount) {
    if (
        !amount ||
        amount <= 0
    ) {
        return false;
    }

    if (
        playerProfile.coins <
        amount
    ) {
        return false;
    }

    playerProfile.coins -=
        amount;

    savePlayerProfile();

    updateUI();

    return true;
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    title,
    message
) {
    let toast =
        document.getElementById(
            "game-toast"
        );

    if (!toast) {
        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "game-toast";

        toast.innerHTML = `
            <strong
                id="game-toast-title"
            ></strong>

            <span
                id="game-toast-message"
            ></span>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 250px;
            padding: 16px 18px;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 14px;
            background: rgba(15,23,42,.94);
            color: #fff;
            box-shadow:
                0 20px 50px rgba(0,0,0,.35);
            backdrop-filter: blur(16px);
            opacity: 0;
            transform: translateY(-15px);
            pointer-events: none;
            transition:
                opacity .25s ease,
                transform .25s ease;
        `;

        document.body.appendChild(
            toast
        );
    }

    const titleElement =
        document.getElementById(
            "game-toast-title"
        );

    const messageElement =
        document.getElementById(
            "game-toast-message"
        );

    titleElement.textContent =
        title;

    messageElement.textContent =
        message;

    toast.style.opacity =
        "1";

    toast.style.transform =
        "translateY(0)";

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(
            () => {
                toast.style.opacity =
                    "0";

                toast.style.transform =
                    "translateY(-15px)";
            },
            3000
        );
}


/* =========================================================
   ACHIEVEMENT NOTIFICATION
========================================================= */

function showAchievementNotification(
    achievement
) {
    playSound(
        "achievement"
    );

    if (
        achievementNotificationIcon
    ) {
        achievementNotificationIcon.textContent =
            achievement.icon;
    }

    if (
        achievementNotificationTitle
    ) {
        achievementNotificationTitle.textContent =
            achievement.title;
    }

    if (
        achievementNotificationMessage
    ) {
        achievementNotificationMessage.textContent =
            `Conquista desbloqueada! +${achievement.reward} moedas`;
    }

    if (
        achievementNotification
    ) {
        achievementNotification.classList.add(
            "show"
        );

        clearTimeout(
            showAchievementNotification.timer
        );

        showAchievementNotification.timer =
            setTimeout(
                () => {
                    achievementNotification.classList.remove(
                        "show"
                    );
                },
                4000
            );
    }
}


/* =========================================================
   MISSION NOTIFICATION
========================================================= */

function showMissionRewardNotification(
    mission
) {
    playSound(
        "mission"
    );

    if (
        missionNotificationTitle
    ) {
        missionNotificationTitle.textContent =
            "🎯 Missão concluída!";
    }

    if (
        missionNotificationMessage
    ) {
        missionNotificationMessage.textContent =
            `${mission.title} — +${mission.reward} moedas`;
    }

    if (
        missionNotification
    ) {
        missionNotification.classList.add(
            "show"
        );

        clearTimeout(
            showMissionRewardNotification.timer
        );

        showMissionRewardNotification.timer =
            setTimeout(
                () => {
                    missionNotification.classList.remove(
                        "show"
                    );
                },
                4000
            );
    }
}


/* =========================================================
   RESET GAME STATE
========================================================= */

function resetGameState() {
    stopBackgroundMusic();

    clearTimeout(
        powerUpTimer
    );

    clearTimeout(
        speedBoostTimer
    );

    clearTimeout(
        doublePointsTimer
    );

    clearTimeout(
        slowMotionTimer
    );

    clearTimeout(
        ghostTimer
    );

    clearTimeout(
        magnetTimer
    );

    powerUpTimer = null;
    speedBoostTimer = null;
    doublePointsTimer = null;
    slowMotionTimer = null;
    ghostTimer = null;
    magnetTimer = null;

    snake = [
        {
            x: 10,
            y: 10
        },

        {
            x: 9,
            y: 10
        },

        {
            x: 8,
            y: 10
        }
    ];

    direction = {
        x: 1,
        y: 0
    };

    nextDirection = {
        x: 1,
        y: 0
    };

    score = 0;

    level = 1;

    powerUp = null;

    obstacles = [];

    particles = [];

    foodPulse = 0;

    powerUpPulse = 0;

    speedBoostActive = false;

    doublePointsActive = false;

    shieldActive = false;

    magnetActive = false;

    slowMotionActive = false;

    ghostActive = false;

    extraLifeActive = false;

    ghostStartTime = null;

    achievementStats.currentFoodStreak =
        0;

    gameAccumulator = 0;

    generateFood();

    updateUI();

    updatePowerStatus();

    drawGame();
}


/* =========================================================
   INPUT — KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        unlockAudio();

        const key =
            event.key.toLowerCase();


        /* -----------------------------------------------
           ENTER
        ------------------------------------------------ */

        if (
            key === "enter"
        ) {

            event.preventDefault();

            if (
                !gameRunning ||
                gameOverState
            ) {
                startGame();

                return;
            }
        }


        /* -----------------------------------------------
           SPACE
        ------------------------------------------------ */

        if (
            key === " "
        ) {

            event.preventDefault();

            if (
                !gameRunning ||
                gameOverState
            ) {
                startGame();

                return;
            }

            togglePause();

            return;
        }


        /* -----------------------------------------------
           ARROWS
        ------------------------------------------------ */

        if (
            key === "arrowup" ||
            key === "w"
        ) {

            event.preventDefault();

            setDirection({
                x: 0,
                y: -1
            });

            return;
        }

        if (
            key === "arrowdown" ||
            key === "s"
        ) {

            event.preventDefault();

            setDirection({
                x: 0,
                y: 1
            });

            return;
        }

        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            event.preventDefault();

            setDirection({
                x: -1,
                y: 0
            });

            return;
        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {

            event.preventDefault();

            setDirection({
                x: 1,
                y: 0
            });

            return;
        }
    }
);


/* =========================================================
   BUTTON EVENTS
========================================================= */

if (startButton) {
    startButton.addEventListener(
        "click",
        () => {
            unlockAudio();
            playSound("click");
            startGame();
        }
    );
}

if (pauseButton) {
    pauseButton.addEventListener(
        "click",
        () => {
            unlockAudio();
            playSound("click");
            togglePause();
        }
    );
}

if (restartButton) {
    restartButton.addEventListener(
        "click",
        () => {
            unlockAudio();
            playSound("click");
            startGame();
        }
    );
}


/* =========================================================
   SHOP BUTTON
========================================================= */

if (shopButton) {
    shopButton.addEventListener(
        "click",
        () => {
            unlockAudio();
            playSound("click");

            renderShop();

            if (shopModal) {
                shopModal.classList.add(
                    "show"
                );
            }
        }
    );
}

if (closeShopButton) {
    closeShopButton.addEventListener(
        "click",
        () => {
            playSound("click");

            shopModal.classList.remove(
                "show"
            );
        }
    );
}


/* =========================================================
   STATISTICS BUTTON
========================================================= */

if (statisticsButton) {
    statisticsButton.addEventListener(
        "click",
        () => {
            unlockAudio();
            playSound("click");

            updateStatisticsUI();

            statisticsModal.classList.add(
                "show"
            );
        }
    );
}

if (closeStatisticsButton) {
    closeStatisticsButton.addEventListener(
        "click",
        () => {
            playSound("click");

            statisticsModal.classList.remove(
                "show"
            );
        }
    );
}


/* =========================================================
   ACHIEVEMENTS BUTTON
========================================================= */

if (achievementButton) {
    achievementButton.addEventListener(
        "click",
        () => {
            unlockAudio();
            playSound("click");

            renderAchievements();

            achievementModal.classList.add(
                "show"
            );
        }
    );
}

if (closeAchievementsButton) {
    closeAchievementsButton.addEventListener(
        "click",
        () => {
            playSound("click");

            achievementModal.classList.remove(
                "show"
            );
        }
    );
}


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            shopModal &&
            event.target ===
                shopModal
        ) {
            shopModal.classList.remove(
                "show"
            );
        }

        if (
            statisticsModal &&
            event.target ===
                statisticsModal
        ) {
            statisticsModal.classList.remove(
                "show"
            );
        }

        if (
            achievementModal &&
            event.target ===
                achievementModal
        ) {
            achievementModal.classList.remove(
                "show"
            );
        }
    }
);


/* =========================================================
   TOUCH / SWIPE
========================================================= */

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
    "touchstart",
    event => {

        unlockAudio();

        const touch =
            event.changedTouches[0];

        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;

    },
    {
        passive: true
    }
);

canvas.addEventListener(
    "touchend",
    event => {

        const touch =
            event.changedTouches[0];

        const dx =
            touch.clientX -
            touchStartX;

        const dy =
            touch.clientY -
            touchStartY;

        const minSwipe =
            25;

        if (
            Math.abs(dx) <
                minSwipe &&
            Math.abs(dy) <
                minSwipe
        ) {
            return;
        }

        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            if (
                dx > 0
            ) {
                setDirection({
                    x: 1,
                    y: 0
                });
            } else {
                setDirection({
                    x: -1,
                    y: 0
                });
            }

        } else {

            if (
                dy > 0
            ) {
                setDirection({
                    x: 0,
                    y: 1
                });
            } else {
                setDirection({
                    x: 0,
                    y: -1
                });
            }
        }

    },
    {
        passive: true
    }
);


/* =========================================================
   AUDIO UNLOCK
========================================================= */

document.addEventListener(
    "pointerdown",
    () => {
        unlockAudio();
    },
    {
        once: true,
        passive: true
    }
);

document.addEventListener(
    "keydown",
    () => {
        unlockAudio();
    },
    {
        once: true
    }
);


/* =========================================================
   AUDIO BUTTON
========================================================= */

ensureAudioButton();


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeGame() {

    applyTheme(
        currentTheme
    );

    ensureDailyMissions();

    renderDailyMissions();

    renderAchievements();

    updateUI();

    updatePlayerProgressUI();

    updateStatisticsUI();

    updatePowerStatus();

    resetGameState();

    /*
       Estado inicial.
    */

    gameRunning = false;

    gamePaused = false;

    gameOverState = false;

    overlay.classList.remove(
        "hidden"
    );

    overlayIcon.textContent =
        "🐍";

    overlayTitle.textContent =
        "Snake";

    overlayMessage.textContent =
        "Use as setas ou WASD para jogar.";

    startButton.textContent =
        "▶ Iniciar";

    pauseButton.textContent =
        "⏸ Pausar";

    drawGame();
}

initializeGame();


/* =========================================================
   WINDOW EVENTS
========================================================= */

window.addEventListener(
    "blur",
    () => {

        if (
            gameRunning &&
            !gamePaused
        ) {
            togglePause();
        }
    }
);

window.addEventListener(
    "beforeunload",
    () => {

        savePlayerProfile();

        saveStatistics();

        saveAchievements();

        saveDailyMissions();

        stopBackgroundMusic();

        cancelAnimationFrame(
            gameLoop
        );
    }
);


/* =========================================================
   VISIBILITY CHANGE
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            gameRunning &&
            !gamePaused
        ) {
            togglePause();
        }
    }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {
        drawGame();
    }
);

    setPowerStatus(
        "slow-status",
        slowMotionActive
    );

    setPowerStatus(
        "ghost-status",
        ghostActive
    );

    setPowerStatus(
        "life-status",
        extraLifeActive
    );
}

function setPowerStatus(
    id,
    active
) {
    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.classList.toggle(
        "active",
        active
    );

    const status =
        element.querySelector("small");

    if (status) {
        status.textContent =
            active
                ? "ON"
                : "OFF";
    }
}

/* =========================================================
   STATISTICS UI
========================================================= */

function updateStatisticsUI() {
    statsGames.textContent =
        statistics.gamesPlayed.toLocaleString(
            "pt-BR"
        );

    statsBestScore.textContent =
        statistics.bestScore.toLocaleString(
            "pt-BR"
        );

    statsHighestLevel.textContent =
        statistics.highestLevel.toLocaleString(
            "pt-BR"
        );

    statsFood.textContent =
        statistics.foodCollected.toLocaleString(
            "pt-BR"
        );

    statsCoins.textContent =
        statistics.coinsEarned.toLocaleString(
            "pt-BR"
        );

    statsPowerups.textContent =
        statistics.powerUpsCollected.toLocaleString(
            "pt-BR"
        );

    statsTime.textContent =
        formatPlayTime(
            statistics.playTime
        );

    const unlocked =
        ACHIEVEMENTS.filter(
            achievement =>
                unlockedAchievements[
                    achievement.id
                ]
        ).length;

    statsAchievements.textContent =
        `${unlocked}/${ACHIEVEMENTS.length}`;

    statsSkins.textContent =
        `${playerProfile.ownedSkins.length}/${Object.keys(SKINS).length}`;

    statsPowerupTypes.textContent =
        `${achievementStats.powerUpsCollected.length}/${POWER_UP_TYPES.length}`;
}

/* =========================================================
   TOAST
========================================================= */

function showToast(
    title,
    message
) {
    playSound("mission");

    missionNotificationTitle.textContent =
        title;

    missionNotificationMessage.textContent =
        message;

    missionNotification.classList.remove(
        "hidden"
    );

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(() => {
            missionNotification.classList.add(
                "hidden"
            );
        }, 3500);
}

/* =========================================================
   THEMES
========================================================= */

function hexToRgba(
    hex,
    alpha
) {
    const clean =
        hex.replace("#", "");

    const bigint =
        parseInt(
            clean,
            16
        );

    const r =
        (bigint >> 16) & 255;

    const g =
        (bigint >> 8) & 255;

    const b =
        bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyTheme(themeName) {
    const theme =
        THEMES[themeName] ||
        THEMES.neon;

    currentTheme =
        themeName;

    const root =
        document.documentElement;

    root.style.setProperty(
        "--theme-bg",
        theme.background
    );

    root.style.setProperty(
        "--theme-bg-secondary",
        theme.panel
    );

    root.style.setProperty(
        "--theme-panel",
        theme.panel
    );

    root.style.setProperty(
        "--theme-text",
        theme.text
    );

    root.style.setProperty(
        "--theme-primary",
        theme.snakeHead
    );

    root.style.setProperty(
        "--theme-secondary",
        theme.snakeBody
    );

    root.style.setProperty(
        "--theme-food",
        theme.food
    );

    root.style.setProperty(
        "--theme-glow",
        theme.glow
    );

    root.style.setProperty(
        "--theme-border",
        hexToRgba(
            theme.glow,
            0.2
        )
    );

    root.style.setProperty(
        "--theme-button-hover",
        hexToRgba(
            theme.glow,
            0.18
        )
    );

    localStorage.setItem(
        "snakeTheme",
        themeName
    );

    document
        .querySelectorAll(".theme-btn")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.theme ===
                    themeName
            );
        });

    drawGame();
}

/* =========================================================
   MODALS
========================================================= */

function openShop() {
    renderShop();

    shopModal.classList.remove(
        "hidden"
    );
}

function closeShop() {
    shopModal.classList.add(
        "hidden"
    );
}

function openStatistics() {
    updateStatisticsUI();

    statisticsModal.classList.remove(
        "hidden"
    );
}

function closeStatistics() {
    statisticsModal.classList.add(
        "hidden"
    );
}

function openAchievements() {
    renderAchievements();

    achievementModal.classList.remove(
        "hidden"
    );
}

function closeAchievements() {
    achievementModal.classList.add(
        "hidden"
    );
}

/* =========================================================
   EVENTS
========================================================= */

startButton.addEventListener(
    "click",
    () => {
        if (
            gamePaused &&
            gameRunning
        ) {
            togglePause();
            return;
        }

        startGame();
    }
);

pauseButton.addEventListener(
    "click",
    togglePause
);

restartButton.addEventListener(
    "click",
    () => {
        startGame();
    }
);

shopButton.addEventListener(
    "click",
    openShop
);

closeShopButton.addEventListener(
    "click",
    closeShop
);

statisticsButton.addEventListener(
    "click",
    openStatistics
);

closeStatisticsButton.addEventListener(
    "click",
    closeStatistics
);

achievementButton.addEventListener(
    "click",
    openAchievements
);

closeAchievementsButton.addEventListener(
    "click",
    closeAchievements
);

shopModal.addEventListener(
    "click",
    event => {
        if (
            event.target ===
            shopModal
        ) {
            closeShop();
        }
    }
);

statisticsModal.addEventListener(
    "click",
    event => {
        if (
            event.target ===
            statisticsModal
        ) {
            closeStatistics();
        }
    }
);

achievementModal.addEventListener(
    "click",
    event => {
        if (
            event.target ===
            achievementModal
        ) {
            closeAchievements();
        }
    }
);

/* Themes */

document
    .querySelectorAll(".theme-btn")
    .forEach(button => {
        button.addEventListener(
            "click",
            () => {
                applyTheme(
                    button.dataset.theme
                );
            }
        );
    });

/* Mobile */

document
    .querySelectorAll(".control-button")
    .forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const value =
                    button.dataset.direction;

                const directions = {
                    up: {
                        x: 0,
                        y: -1
                    },

                    down: {
                        x: 0,
                        y: 1
                    },

                    left: {
                        x: -1,
                        y: 0
                    },

                    right: {
                        x: 1,
                        y: 0
                    }
                };

                setDirection(
                    directions[value]
                );
            }
        );
    });

/* Keyboard */

document.addEventListener(
    "keydown",
    event => {
        const key =
            event.key.toLowerCase();

        const keys = {
            arrowup: {
                x: 0,
                y: -1
            },

            w: {
                x: 0,
                y: -1
            },

            arrowdown: {
                x: 0,
                y: 1
            },

            s: {
                x: 0,
                y: 1
            },

            arrowleft: {
                x: -1,
                y: 0
            },

            a: {
                x: -1,
                y: 0
            },

            arrowright: {
                x: 1,
                y: 0
            },

            d: {
                x: 1,
                y: 0
            }
        };

        if (
            keys[key]
        ) {
            event.preventDefault();

            setDirection(
                keys[key]
            );
        }

        if (
            event.code ===
            "Space"
        ) {
            event.preventDefault();
            unlockAudio();

            if (gameOverState || !gameRunning) {
                startGame();
            } else {
                togglePause();
            }
        }

        if (event.key === "Enter" && !gameRunning) {
            event.preventDefault();
            startGame();
        }

        if (
            event.key ===
            "Escape"
        ) {
            closeShop();
            closeStatistics();
            closeAchievements();
        }
    }
);

/* =========================================================
   SWIPE
========================================================= */

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
    "touchstart",
    event => {
        const touch =
            event.changedTouches[0];

        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;
    },
    {
        passive: true
    }
);

canvas.addEventListener(
    "touchend",
    event => {
        const touch =
            event.changedTouches[0];

        const deltaX =
            touch.clientX -
            touchStartX;

        const deltaY =
            touch.clientY -
            touchStartY;

        const minimumDistance =
            25;

        if (
            Math.abs(deltaX) <
                minimumDistance &&
            Math.abs(deltaY) <
                minimumDistance
        ) {
            return;
        }

        if (
            Math.abs(deltaX) >
            Math.abs(deltaY)
        ) {
            setDirection({
                x:
                    deltaX > 0
                        ? 1
                        : -1,

                y: 0
            });
        } else {
            setDirection({
                x: 0,

                y:
                    deltaY > 0
                        ? 1
                        : -1
            });
        }
    },
    {
        passive: true
    }
);

/* =========================================================
   POWER-UP COLLISION
========================================================= */

function checkPowerUpCollision() {
    if (
        !powerUp ||
        snake.length === 0
    ) {
        return;
    }

    const head =
        snake[0];

    if (
        head.x === powerUp.x &&
        head.y === powerUp.y
    ) {
        collectPowerUp();
    }
}

/* =========================================================
   PATCH UPDATE GAME FOR POWER-UP
========================================================= */

const originalUpdateGame =
    updateGame;

updateGame = function () {
    originalUpdateGame();

    if (gameRunning) {
        checkPowerUpCollision();
        updatePowerStatus();
        updateUI();
    }
};

/* =========================================================
   BEFORE UNLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {
        savePlayerProfile();
        saveStatistics();
        saveAchievements();
        saveDailyMissions();
    }
);

/* =========================================================
   INITIALIZATION
========================================================= */

ensureAudioButton();

document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });

highScoreElement.textContent =
    highScore;

ensureDailyMissions();

applyTheme(
    currentTheme
);

updatePlayerProgressUI();

renderDailyMissions();

renderAchievements();

renderShop();

updateStatisticsUI();

updateUI();

updatePowerStatus();

resetGameState();