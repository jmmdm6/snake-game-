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
const restartButton = document.getElementById("restart-button");
const pauseButton = document.getElementById("pause-button");

const themeButtons = document.querySelectorAll(".theme-btn");
const themeStatus = document.querySelector(".theme-status");

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

const shopButton =
    document.getElementById("shop-button");

const shopModal =
    document.getElementById("shop-modal");

const closeShopButton =
    document.getElementById("close-shop");

const shopBalance =
    document.getElementById("shop-balance");

const skinList =
    document.getElementById("skin-list");

const effectList =
    document.getElementById("effect-list");

const coinsValue =
    document.getElementById("coins-value");

const missionsButton =
    document.getElementById("missions-button");

const missionsModal =
    document.getElementById("missions-modal");

const closeMissionsButton =
    document.getElementById("close-missions");

const missionsList =
    document.getElementById("missions-list");

const missionsResetTimer =
    document.getElementById("missions-reset-timer");

const statsButton =
    document.getElementById("stats-button");

const statsModal =
    document.getElementById("stats-modal");

const closeStatsButton =
    document.getElementById("close-stats");

const statsGrid =
    document.getElementById("stats-grid");


/* =========================================================
   CONFIG
========================================================= */

const GRID_SIZE = 20;

const TILE_SIZE =
    canvas.width / GRID_SIZE;

const INITIAL_SPEED = 120;

const MIN_SPEED = 55;

const MAX_OBSTACLES = 12;

const POWER_UP_DURATION = 5000;

const POWER_UP_LIFETIME = 8000;

const POWER_UP_CHANCE = 0.20;

const SPEED_BOOST_MULTIPLIER = 0.65;

const SLOW_MOTION_MULTIPLIER = 1.6;


/* =========================================================
   THEMES
========================================================= */

const THEMES = {

    neon: {
        name: "Neon",
        background: "#020617",
        grid: "rgba(255,255,255,0.04)",
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
        grid: "rgba(255,255,255,0.035)",
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
        grid: "rgba(15,23,42,0.08)",
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
        grid: "rgba(134,239,172,0.08)",
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
        grid: "rgba(248,113,113,0.08)",
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
        grid: "rgba(125,211,252,0.10)",
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
   PLAYER PROFILE
========================================================= */

const DEFAULT_PLAYER_PROFILE = {

    coins: 0,

    totalCoins: 0,

    ownedSkins: [
        "classic"
    ],

    equippedSkin: "classic",

    ownedEffects: [],

    equippedEffect: "none"

};


let playerProfile = {};

try {

    const savedProfile =
        JSON.parse(
            localStorage.getItem(
                "snakePlayerProfile"
            )
        );

    playerProfile = {
        ...DEFAULT_PLAYER_PROFILE,
        ...(savedProfile || {})
    };

    if (!Array.isArray(playerProfile.ownedSkins)) {
        playerProfile.ownedSkins = ["classic"];
    }

    if (!Array.isArray(playerProfile.ownedEffects)) {
        playerProfile.ownedEffects = [];
    }

} catch {

    playerProfile = {
        ...DEFAULT_PLAYER_PROFILE,

        ownedSkins: [
            "classic"
        ],

        ownedEffects: []
    };

}


function savePlayerProfile() {

    localStorage.setItem(
        "snakePlayerProfile",
        JSON.stringify(playerProfile)
    );

}


function addCoins(amount) {

    amount = Math.max(
        0,
        Math.floor(amount)
    );

    playerProfile.coins += amount;

    playerProfile.totalCoins += amount;

    savePlayerProfile();

    updateUI();

}


function spendCoins(amount) {

    if (playerProfile.coins < amount) {
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

const SKINS = [

    {
        id: "classic",
        name: "Classic",
        price: 0,
        icon: "🐍",
        description: "Cores do tema atual."
    },

    {
        id: "fire",
        name: "Fire",
        price: 150,
        icon: "🔥",
        description: "Uma cobra em chamas."
    },

    {
        id: "ocean",
        name: "Ocean",
        price: 200,
        icon: "🌊",
        description: "Visual inspirado no oceano."
    },

    {
        id: "shadow",
        name: "Shadow",
        price: 250,
        icon: "🌑",
        description: "Escura e misteriosa."
    },

    {
        id: "toxic",
        name: "Toxic",
        price: 300,
        icon: "☢️",
        description: "Visual radioativo."
    },

    {
        id: "ice",
        name: "Ice",
        price: 400,
        icon: "❄️",
        description: "Cobra congelante."
    },

    {
        id: "rainbow",
        name: "Rainbow",
        price: 500,
        icon: "🌈",
        description: "Cores mudando constantemente."
    },

    {
        id: "gold",
        name: "Gold",
        price: 750,
        icon: "👑",
        description: "Para quem quer mostrar estilo."
    }

];


const EFFECTS = [

    {
        id: "none",
        name: "Nenhum",
        price: 0,
        icon: "⭕",
        description: "Sem efeito."
    },

    {
        id: "sparkle",
        name: "Sparkle",
        price: 250,
        icon: "✨",
        description: "Partículas brilhantes."
    },

    {
        id: "trail",
        name: "Trail",
        price: 300,
        icon: "💫",
        description: "Rastro luminoso."
    },

    {
        id: "aura",
        name: "Aura",
        price: 350,
        icon: "🔮",
        description: "Aura ao redor da cobra."
    },

    {
        id: "rainbowTrail",
        name: "Rainbow Trail",
        price: 450,
        icon: "🌈",
        description: "Rastro colorido."
    }

];


function isSkinOwned(id) {

    return playerProfile.ownedSkins.includes(id);

}


function isEffectOwned(id) {

    return id === "none" ||
        playerProfile.ownedEffects.includes(id);

}


function buySkin(id) {

    const skin =
        SKINS.find(item => item.id === id);

    if (!skin) return;

    if (isSkinOwned(id)) {

        playerProfile.equippedSkin = id;

        savePlayerProfile();

        renderShop();

        return;
    }

    if (!spendCoins(skin.price)) {

        showNotification(
            "🪙",
            "Moedas insuficientes",
            `Você precisa de ${skin.price} moedas.`
        );

        return;
    }

    playerProfile.ownedSkins.push(id);

    playerProfile.equippedSkin = id;

    savePlayerProfile();

    renderShop();

    showNotification(
        skin.icon,
        "Skin desbloqueada!",
        skin.name
    );

}


function buyEffect(id) {

    const effect =
        EFFECTS.find(item => item.id === id);

    if (!effect) return;

    if (isEffectOwned(id)) {

        playerProfile.equippedEffect = id;

        savePlayerProfile();

        renderShop();

        return;
    }

    if (!spendCoins(effect.price)) {

        showNotification(
            "🪙",
            "Moedas insuficientes",
            `Você precisa de ${effect.price} moedas.`
        );

        return;
    }

    playerProfile.ownedEffects.push(id);

    playerProfile.equippedEffect = id;

    savePlayerProfile();

    renderShop();

    showNotification(
        effect.icon,
        "Efeito desbloqueado!",
        effect.name
    );

}


function renderShop() {

    if (!skinList || !effectList) return;

    shopBalance.textContent =
        playerProfile.coins;


    skinList.innerHTML =
        SKINS.map(skin => {

            const owned =
                isSkinOwned(skin.id);

            const equipped =
                playerProfile.equippedSkin === skin.id;

            let buttonText;

            if (equipped) {

                buttonText = "✓ Equipado";

            } else if (owned) {

                buttonText = "Equipar";

            } else if (skin.price === 0) {

                buttonText = "Usar";

            } else {

                buttonText =
                    `Comprar · ${skin.price} 🪙`;

            }

            return `

                <div class="shop-item">

                    <div class="shop-item-preview">
                        ${skin.icon}
                    </div>

                    <h3>
                        ${skin.name}
                    </h3>

                    <p>
                        ${skin.description}
                    </p>

                    <div class="shop-price">
                        ${
                            skin.price === 0
                                ? "GRÁTIS"
                                : `${skin.price} 🪙`
                        }
                    </div>

                    <button
                        type="button"
                        class="${equipped ? "equipped" : ""}"
                        data-skin="${skin.id}"
                    >
                        ${buttonText}
                    </button>

                </div>

            `;

        }).join("");


    effectList.innerHTML =
        EFFECTS.map(effect => {

            const owned =
                isEffectOwned(effect.id);

            const equipped =
                playerProfile.equippedEffect === effect.id;

            let buttonText;

            if (equipped) {

                buttonText = "✓ Equipado";

            } else if (owned) {

                buttonText = "Equipar";

            } else {

                buttonText =
                    `Comprar · ${effect.price} 🪙`;

            }

            return `

                <div class="shop-item">

                    <div class="shop-item-preview">
                        ${effect.icon}
                    </div>

                    <h3>
                        ${effect.name}
                    </h3>

                    <p>
                        ${effect.description}
                    </p>

                    <div class="shop-price">
                        ${
                            effect.price === 0
                                ? "GRÁTIS"
                                : `${effect.price} 🪙`
                        }
                    </div>

                    <button
                        type="button"
                        class="${equipped ? "equipped" : ""}"
                        data-effect="${effect.id}"
                    >
                        ${buttonText}
                    </button>

                </div>

            `;

        }).join("");


    skinList
        .querySelectorAll("[data-skin]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    buySkin(
                        button.dataset.skin
                    );
                }
            );

        });


    effectList
        .querySelectorAll("[data-effect]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    buyEffect(
                        button.dataset.effect
                    );
                }
            );

        });

}


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

let gameLoop = null;

let particles = [];

let foodPulse = 0;

let powerUpPulse = 0;

let currentTheme =
    localStorage.getItem(
        "snakeTheme"
    ) || "neon";

let ghostStartTime = null;


/* =========================================================
   ACHIEVEMENTS
========================================================= */

const defaultAchievementStats = {

    gamesPlayed: 0,

    bestScore: 0,

    currentFoodStreak: 0,

    bestFoodStreak: 0,

    speedBoosts: 0,

    ghostTime: 0,

    shieldSaves: 0,

    highestLevel: 1,

    powerUpsCollected: [],

    totalFoodEaten: 0,

    totalPowerUpsCollected: 0,

    totalPlayTimeMs: 0

};


let savedAchievementStats = {};

try {

    savedAchievementStats =
        JSON.parse(
            localStorage.getItem(
                "snakeAchievementStats"
            )
        ) || {};

} catch {

    savedAchievementStats = {};

}


let achievementStats = {

    ...defaultAchievementStats,

    ...savedAchievementStats,

    powerUpsCollected:
        Array.isArray(
            savedAchievementStats.powerUpsCollected
        )
            ? savedAchievementStats.powerUpsCollected
            : []

};


let unlockedAchievements = {};

try {

    unlockedAchievements =
        JSON.parse(
            localStorage.getItem(
                "snakeAchievements"
            )
        ) || {};

} catch {

    unlockedAchievements = {};

}


const ACHIEVEMENTS = [

    {
        id: "firstGame",
        icon: "🎮",
        name: "Primeiro jogo",
        description: "Complete sua primeira partida.",
        target: 1
    },

    {
        id: "hundredPoints",
        icon: "💯",
        name: "Centenário",
        description: "Faça 100 pontos.",
        target: 100
    },

    {
        id: "foodStreak",
        icon: "🔥",
        name: "Sequência",
        description: "Coma 10 comidas seguidas.",
        target: 10
    },

    {
        id: "speedBoost",
        icon: "⚡",
        name: "Velocidade máxima",
        description: "Colete 5 Speed Boosts.",
        target: 5
    },

    {
        id: "ghost",
        icon: "👻",
        name: "Fantasma",
        description: "Use Ghost por 30 segundos.",
        target: 30
    },

    {
        id: "shield",
        icon: "🛡️",
        name: "Sobrevivente",
        description: "Use um Shield para sobreviver.",
        target: 1
    },

    {
        id: "level10",
        icon: "🚀",
        name: "Nível 10",
        description: "Chegue ao nível 10.",
        target: 10
    },

    {
        id: "collector",
        icon: "📦",
        name: "Colecionador",
        description: "Colete todos os 7 power-ups.",
        target: 7
    }

];


/* =========================================================
   DAILY MISSIONS
========================================================= */

const DAILY_MISSIONS = [

    {
        id: "eat10",
        icon: "🍎",
        name: "Começando bem",
        description: "Coma 10 comidas.",
        type: "food",
        target: 10,
        reward: 10
    },

    {
        id: "eat20",
        icon: "🍏",
        name: "Fome de cobra",
        description: "Coma 20 comidas.",
        type: "food",
        target: 20,
        reward: 20
    },

    {
        id: "score50",
        icon: "🎯",
        name: "Primeira pontuação",
        description: "Faça 50 pontos.",
        type: "score",
        target: 50,
        reward: 15
    },

    {
        id: "score100",
        icon: "🏹",
        name: "Pontuação alta",
        description: "Faça 100 pontos.",
        type: "score",
        target: 100,
        reward: 30
    },

    {
        id: "score250",
        icon: "💎",
        name: "Pontuação lendária",
        description: "Faça 250 pontos.",
        type: "score",
        target: 250,
        reward: 60
    },

    {
        id: "powerups2",
        icon: "⚡",
        name: "Caçador de Power-ups",
        description: "Colete 2 power-ups.",
        type: "powerups",
        target: 2,
        reward: 15
    },

    {
        id: "powerups5",
        icon: "✨",
        name: "Especialista",
        description: "Colete 5 power-ups.",
        type: "powerups",
        target: 5,
        reward: 35
    },

    {
        id: "level5",
        icon: "🚀",
        name: "Subindo",
        description: "Chegue ao nível 5.",
        type: "level",
        target: 5,
        reward: 25
    },

    {
        id: "level10",
        icon: "👑",
        name: "Mestre da cobra",
        description: "Chegue ao nível 10.",
        type: "level",
        target: 10,
        reward: 75
    },

    {
        id: "play",
        icon: "🎮",
        name: "Só jogar",
        description: "Complete uma partida.",
        type: "games",
        target: 1,
        reward: 10
    },

    {
        id: "speed",
        icon: "⚡",
        name: "Velocidade",
        description: "Colete um Speed Boost.",
        type: "speed",
        target: 1,
        reward: 20
    },

    {
        id: "shield",
        icon: "🛡️",
        name: "Protegido",
        description: "Colete um Shield.",
        type: "shield",
        target: 1,
        reward: 20
    },

    {
        id: "streak10",
        icon: "🔥",
        name: "Combo",
        description: "Consiga uma sequência de 10 comidas.",
        type: "streak",
        target: 10,
        reward: 30
    }

];


let dailyMissions = null;


function getTodayKey() {

    const now = new Date();

    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

}


function seededRandom(seed) {

    let value = seed;

    return function () {

        value =
            (value * 9301 + 49297)
            % 233280;

        return value / 233280;

    };

}


function createDailyMissions() {

    const dateKey =
        getTodayKey();

    let seed = 0;

    for (let i = 0; i < dateKey.length; i++) {

        seed =
            ((seed * 31) +
            dateKey.charCodeAt(i))
            >>> 0;

    }

    const random =
        seededRandom(seed);

    const pool =
        [...DAILY_MISSIONS];

    const selected = [];

    while (
        selected.length < 3 &&
        pool.length > 0
    ) {

        const index =
            Math.floor(
                random() * pool.length
            );

        selected.push(
            pool.splice(index, 1)[0]
        );

    }

    return {

        date: dateKey,

        missions:
            selected.map(mission => ({
                id: mission.id,
                progress: 0,
                claimed: false
            }))

    };

}


function loadDailyMissions() {

    const today =
        getTodayKey();

    let saved = null;

    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    "snakeDailyMissions"
                )
            );

    } catch {

        saved = null;

    }

    if (
        !saved ||
        saved.date !== today ||
        !Array.isArray(saved.missions)
    ) {

        dailyMissions =
            createDailyMissions();

        saveDailyMissions();

    } else {

        dailyMissions =
            saved;

    }

}


function saveDailyMissions() {

    localStorage.setItem(
        "snakeDailyMissions",
        JSON.stringify(
            dailyMissions
        )
    );

}


function getMissionDefinition(id) {

    return DAILY_MISSIONS.find(
        mission => mission.id === id
    );

}


function getMissionProgress(mission) {

    switch (mission.type) {

        case "food":
            return score;

        case "score":
            return score;

        case "powerups":
            return getTodayStat("powerups");

        case "level":
            return level;

        case "games":
            return getTodayStat("games");

        case "speed":
            return getTodayStat("speed");

        case "shield":
            return getTodayStat("shield");

        case "streak":
            return Math.max(
                achievementStats.currentFoodStreak,
                achievementStats.bestFoodStreak
            );

        default:
            return 0;

    }

}


function getTodayStat(type) {

    if (!dailyMissions) {
        return 0;
    }

    let value = 0;

    try {

        const stats =
            JSON.parse(
                localStorage.getItem(
                    "snakeDailyStats"
                )
            ) || {};

        if (stats.date === getTodayKey()) {

            value =
                Number(
                    stats[type]
                ) || 0;

        }

    } catch {

        value = 0;

    }

    return value;

}


function updateTodayStat(type, amount = 1) {

    let stats = {};

    try {

        stats =
            JSON.parse(
                localStorage.getItem(
                    "snakeDailyStats"
                )
            ) || {};

    } catch {

        stats = {};

    }

    if (
        stats.date !== getTodayKey()
    ) {

        stats = {
            date: getTodayKey()
        };

    }

    stats[type] =
        (Number(stats[type]) || 0)
        + amount;

    localStorage.setItem(
        "snakeDailyStats",
        JSON.stringify(stats)
    );

}


function updateMissionProgress() {

    if (!dailyMissions) return;

    dailyMissions.missions
        .forEach(mission => {

            if (mission.claimed) {
                return;
            }

            const definition =
                getMissionDefinition(
                    mission.id
                );

            if (!definition) return;

            mission.progress =
                Math.min(
                    definition.target,
                    getMissionProgress(
                        definition
                    )
                );

        });

    saveDailyMissions();

    renderMissions();

}


function claimMission(id) {

    const mission =
        dailyMissions.missions.find(
            item => item.id === id
        );

    if (!mission) return;

    if (mission.claimed) {
        return;
    }

    const definition =
        getMissionDefinition(id);

    if (!definition) return;

    const progress =
        getMissionProgress(
            definition
        );

    if (
        progress <
        definition.target
    ) {

        return;
    }

    mission.progress =
        definition.target;

    mission.claimed = true;

    addCoins(
        definition.reward
    );

    saveDailyMissions();

    renderMissions();

    showNotification(
        "🎯",
        "Missão concluída!",
        `+${definition.reward} moedas`
    );

}


function renderMissions() {

    if (!missionsList) return;

    if (!dailyMissions) {
        loadDailyMissions();
    }

    missionsList.innerHTML =
        dailyMissions.missions
            .map(mission => {

                const definition =
                    getMissionDefinition(
                        mission.id
                    );

                if (!definition) {
                    return "";
                }

                const current =
                    Math.min(
                        definition.target,
                        getMissionProgress(
                            definition
                        )
                    );

                const percentage =
                    Math.min(
                        100,
                        (current /
                        definition.target) *
                        100
                    );

                const completed =
                    current >=
                    definition.target;

                return `

                    <div
                        class="mission-card
                        ${completed ? "completed" : ""}"
                    >

                        <div class="mission-top">

                            <div class="mission-icon">
                                ${definition.icon}
                            </div>

                            <div class="mission-info">

                                <h3>
                                    ${definition.name}
                                </h3>

                                <p>
                                    ${definition.description}
                                </p>

                            </div>

                            <div class="mission-reward">
                                +${definition.reward} 🪙
                            </div>

                        </div>


                        <div class="mission-progress">

                            <div class="mission-progress-track">

                                <div
                                    class="mission-progress-bar"
                                    style="width:${percentage}%"
                                ></div>

                            </div>

                            <div class="mission-progress-text">
                                ${current}/${definition.target}
                            </div>

                        </div>


                        ${
                            completed
                                ? `
                                    <button
                                        type="button"
                                        class="mission-claim ${
                                            mission.claimed
                                                ? "claimed"
                                                : ""
                                        }"
                                        data-claim-mission="${mission.id}"
                                        ${
                                            mission.claimed
                                                ? "disabled"
                                                : ""
                                        }
                                    >
                                        ${
                                            mission.claimed
                                                ? "✓ Recompensa recebida"
                                                : "🎁 Resgatar recompensa"
                                        }
                                    </button>
                                `
                                : ""
                        }

                    </div>

                `;

            })
            .join("");


    missionsList
        .querySelectorAll(
            "[data-claim-mission]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    claimMission(
                        button.dataset
                            .claimMission
                    );

                }
            );

        });

}


/* =========================================================
   MISSION TIMER
========================================================= */

function updateMissionTimer() {

    if (!missionsResetTimer) return;

    const now =
        new Date();

    const tomorrow =
        new Date(now);

    tomorrow.setHours(
        24,
        0,
        0,
        0
    );

    let difference =
        tomorrow - now;

    if (difference <= 0) {

        loadDailyMissions();

        renderMissions();

        difference =
            tomorrow - now;

    }

    const totalSeconds =
        Math.max(
            0,
            Math.floor(
                difference / 1000
            )
        );

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600)
            / 60
        );

    const seconds =
        totalSeconds % 60;

    missionsResetTimer.textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;

}


setInterval(
    updateMissionTimer,
    1000
);


/* =========================================================
   PLAY TIME TRACKING
========================================================= */

let playTimeSessionStart = null;


function startPlayTimeTracking() {

    playTimeSessionStart =
        Date.now();

}


function flushPlayTime() {

    if (!playTimeSessionStart) {
        return;
    }

    const elapsed =
        Date.now() -
        playTimeSessionStart;

    achievementStats.totalPlayTimeMs +=
        Math.max(
            0,
            elapsed
        );

    playTimeSessionStart =
        Date.now();

    saveAchievementStats();

}


function formatPlayTime(ms) {

    const totalMinutes =
        Math.floor(
            ms / 60000
        );

    const hours =
        Math.floor(
            totalMinutes / 60
        );

    const minutes =
        totalMinutes % 60;

    if (hours > 0) {

        return `${hours}h ${minutes}m`;

    }

    return `${minutes}m`;

}


function formatNumber(value) {

    return Number(value)
        .toLocaleString("pt-BR");

}


/* =========================================================
   PARTICLES
========================================================= */

function createParticles(
    x,
    y,
    color,
    amount = 8
) {

    for (let i = 0; i < amount; i++) {

        particles.push({

            x:
                x * TILE_SIZE +
                TILE_SIZE / 2,

            y:
                y * TILE_SIZE +
                TILE_SIZE / 2,

            vx:
                (Math.random() - 0.5)
                * 4,

            vy:
                (Math.random() - 0.5)
                * 4,

            life: 1,

            color,

            size:
                Math.random() * 3 + 1

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

                particle.life -=
                    0.035;

                return particle.life > 0;

            }
        );

}


function drawParticles() {

    particles.forEach(
        particle => {

            ctx.save();

            ctx.globalAlpha =
                particle.life;

            ctx.fillStyle =
                particle.color;

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
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

function hexToRgba(
    hex,
    alpha
) {

    const value =
        hex.replace("#", "");

    const bigint =
        parseInt(
            value,
            16
        );

    const r =
        (bigint >> 16) & 255;

    const g =
        (bigint >> 8) & 255;

    const b =
        bigint & 255;

    return `rgba(${r},${g},${b},${alpha})`;

}


function applyTheme(themeId) {

    const theme =
        THEMES[themeId];

    if (!theme) return;

    currentTheme =
        themeId;

    document.documentElement.style
        .setProperty(
            "--theme-bg",
            theme.background
        );

    document.documentElement.style
        .setProperty(
            "--theme-bg-secondary",
            theme.panel
        );

    document.documentElement.style
        .setProperty(
            "--theme-panel",
            theme.panel
        );

    document.documentElement.style
        .setProperty(
            "--theme-text",
            theme.text
        );

    document.documentElement.style
        .setProperty(
            "--theme-primary",
            theme.snakeHead
        );

    document.documentElement.style
        .setProperty(
            "--theme-secondary",
            theme.snakeBody
        );

    document.documentElement.style
        .setProperty(
            "--theme-food",
            theme.food
        );

    document.documentElement.style
        .setProperty(
            "--theme-glow",
            theme.glow
        );

    document.documentElement.style
        .setProperty(
            "--theme-border",
            hexToRgba(
                theme.glow,
                0.22
            )
        );

    document.documentElement.style
        .setProperty(
            "--theme-button-hover",
            hexToRgba(
                theme.glow,
                0.18
            )
        );

    document.documentElement.style
        .setProperty(
            "--theme-overlay",
            hexToRgba(
                theme.background,
                0.82
            )
        );

    themeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.theme ===
                themeId
            );

        }
    );

    if (themeStatus) {

        themeStatus.textContent =
            `Current: ${theme.name}`;

    }

    localStorage.setItem(
        "snakeTheme",
        themeId
    );

}


/* =========================================================
   GAME INITIALIZATION
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

    speedBoostActive = false;

    doublePointsActive = false;

    shieldActive = false;

    magnetActive = false;

    slowMotionActive = false;

    ghostActive = false;

    extraLifeActive = false;

    clearPowerTimers();

    generateFood();

    generateObstacles();

    updateUI();

    updatePowerStatus();

    updateMissionProgress();

}


function startGame() {

    resetGame();

    gameRunning = true;

    gamePaused = false;

    overlay.classList.add("hidden");

    startButton.classList.add("hidden");

    restartButton.classList.add("hidden");

    achievementStats.gamesPlayed++;

    updateTodayStat(
        "games",
        1
    );

    saveAchievementStats();

    checkAchievements();

    startPlayTimeTracking();

    restartGameLoop();

}


function restartGameLoop() {

    if (gameLoop) {

        clearInterval(
            gameLoop
        );

    }

    gameLoop =
        setInterval(
            updateGame,
            getGameSpeed()
        );

}


function getGameSpeed() {

    let speed =
        INITIAL_SPEED -
        ((level - 1) * 5);

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


function clearPowerTimers() {

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
   UPDATE GAME
========================================================= */

function updateGame() {

    if (
        !gameRunning ||
        gamePaused
    ) {
        return;
    }

    direction = {
        ...nextDirection
    };

    const head = {
        x:
            snake[0].x +
            direction.x,

        y:
            snake[0].y +
            direction.y
    };


    /* WALL */

    if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
    ) {

        gameOver();

        return;
    }


    /* OBSTACLE */

    if (
        obstacles.some(
            obstacle =>
                obstacle.x === head.x &&
                obstacle.y === head.y
        )
    ) {

        gameOver();

        return;
    }


    /* SELF COLLISION */

    if (
        !ghostActive &&
        snake.some(
            segment =>
                segment.x === head.x &&
                segment.y === head.y
        )
    ) {

        if (shieldActive) {

            useShield();

        } else if (extraLifeActive) {

            useExtraLife();

        } else {

            gameOver();

            return;

        }

    }


    snake.unshift(head);


    /* MAGNET */

    if (magnetActive) {

        const dx =
            food.x - head.x;

        const dy =
            food.y - head.y;

        if (
            Math.abs(dx) <= 3 &&
            Math.abs(dy) <= 3
        ) {

            food.x =
                head.x;

            food.y =
                head.y;

        }

    }


    /* FOOD */

    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        const points =
            doublePointsActive
                ? 2
                : 1;

        score += points;

        achievementStats
            .currentFoodStreak++;

        achievementStats
            .bestFoodStreak =
            Math.max(
                achievementStats.bestFoodStreak,
                achievementStats.currentFoodStreak
            );

        achievementStats.bestScore =
            Math.max(
                achievementStats.bestScore,
                score
            );

        achievementStats.totalFoodEaten++;

        if (
            score >
            highScore
        ) {

            highScore =
                score;

            localStorage.setItem(
                "snakeHighScore",
                highScore
            );

        }

        addCoins(1);

        updateTodayStat(
            "food",
            1
        );

        createParticles(
            head.x,
            head.y,
            THEMES[currentTheme].food,
            12
        );

        generateFood();

        maybeGeneratePowerUp();

        updateLevel();

        saveAchievementStats();

        checkAchievements();

        updateMissionProgress();

    } else {

        snake.pop();

    }


    /* POWER UP */

    if (
        powerUp &&
        head.x === powerUp.x &&
        head.y === powerUp.y
    ) {

        collectPowerUp();

    }


    updateParticles();

    foodPulse += 0.12;

    powerUpPulse += 0.16;

    updateUI();

    updatePowerStatus();

    drawGame();

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
        newLevel >
        level
    ) {

        level =
            newLevel;

        addCoins(3);

        createParticles(
            snake[0].x,
            snake[0].y,
            THEMES[currentTheme].snakeHead,
            20
        );

        showNotification(
            "🚀",
            `Nível ${level}`,
            "+3 moedas"
        );

    }

    achievementStats.highestLevel =
        Math.max(
            achievementStats.highestLevel,
            level
        );

    updateMissionProgress();

    restartGameLoop();

}


/* =========================================================
   FOOD
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

    } while (
        isBlocked(
            food.x,
            food.y
        ) &&
        attempts < 1000
    );

}


function isBlocked(x, y) {

    return (

        snake.some(
            segment =>
                segment.x === x &&
                segment.y === y
        )

        ||

        obstacles.some(
            obstacle =>
                obstacle.x === x &&
                obstacle.y === y
        )

        ||

        (
            powerUp &&
            powerUp.x === x &&
            powerUp.y === y
        )

    );

}


/* =========================================================
   OBSTACLES
========================================================= */

function getObstacleCount() {

    if (level < 3) {
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

    for (
        let i = 0;
        i < count;
        i++
    ) {

        let position;

        let attempts = 0;

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

        } while (
            (
                snake.some(
                    segment =>
                        segment.x === position.x &&
                        segment.y === position.y
                )
                ||
                (
                    position.x === food.x &&
                    position.y === food.y
                )
                ||
                obstacles.some(
                    obstacle =>
                        obstacle.x === position.x &&
                        obstacle.y === position.y
                )
            )
            &&
            attempts < 500
        );

        if (attempts < 500) {

            obstacles.push(
                position
            );

        }

    }

}


/* =========================================================
   POWER UPS
========================================================= */

const POWER_UPS = [

    {
        type: "speed",
        icon: "⚡"
    },

    {
        type: "double",
        icon: "2X"
    },

    {
        type: "shield",
        icon: "🛡️"
    },

    {
        type: "magnet",
        icon: "🧲"
    },

    {
        type: "slow",
        icon: "❄️"
    },

    {
        type: "ghost",
        icon: "👻"
    },

    {
        type: "life",
        icon: "❤️"
    }

];


function maybeGeneratePowerUp() {

    if (powerUp) {
        return;
    }

    if (
        Math.random() >
        POWER_UP_CHANCE
    ) {
        return;
    }

    const available =
        POWER_UPS.filter(
            item =>
                !achievementStats
                    .powerUpsCollected
                    .includes(item.type)
        );

    const pool =
        available.length
            ? available
            : POWER_UPS;

    const selected =
        pool[
            Math.floor(
                Math.random() *
                pool.length
            )
        ];

    let position;

    let attempts = 0;

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

    } while (
        isBlocked(
            position.x,
            position.y
        )
        &&
        attempts < 500
    );

    if (attempts >= 500) {
        return;
    }

    powerUp = {

        type: selected.type,

        icon: selected.icon,

        x: position.x,

        y: position.y

    };

    clearTimeout(
        powerUpTimer
    );

    powerUpTimer =
        setTimeout(
            () => {

                powerUp = null;

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

    if (
        !achievementStats
            .powerUpsCollected
            .includes(type)
    ) {

        achievementStats
            .powerUpsCollected
            .push(type);

    }

    achievementStats.totalPowerUpsCollected++;

    updateTodayStat(
        "powerups",
        1
    );

    if (type === "speed") {

        updateTodayStat(
            "speed",
            1
        );

    }

    if (type === "shield") {

        updateTodayStat(
            "shield",
            1
        );

    }

    createParticles(
        powerUp.x,
        powerUp.y,
        THEMES[currentTheme].snakeHead,
        20
    );

    activatePowerUp(
        type
    );

    powerUp = null;

    clearTimeout(
        powerUpTimer
    );

    saveAchievementStats();

    checkAchievements();

    updateMissionProgress();

}


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


/* =========================================================
   POWER UP ACTIVATION
========================================================= */

function activateSpeedBoost() {

    speedBoostActive = true;

    achievementStats.speedBoosts++;

    clearTimeout(
        speedBoostTimer
    );

    speedBoostTimer =
        setTimeout(
            () => {

                speedBoostActive =
                    false;

                restartGameLoop();

                updatePowerStatus();

            },
            POWER_UP_DURATION
        );

    restartGameLoop();

}


function activateDoublePoints() {

    doublePointsActive = true;

    clearTimeout(
        doublePointsTimer
    );

    doublePointsTimer =
        setTimeout(
            () => {

                doublePointsActive =
                    false;

                updatePowerStatus();

            },
            POWER_UP_DURATION
        );

}


function activateShield() {

    shieldActive = true;

}


function useShield() {

    shieldActive = false;

    achievementStats.shieldSaves++;

    createParticles(
        snake[0].x,
        snake[0].y,
        "#67e8f9",
        25
    );

    showNotification(
        "🛡️",
        "Shield ativado!",
        "Você sobreviveu à colisão."
    );

    saveAchievementStats();

    checkAchievements();

}


function activateMagnet() {

    magnetActive = true;

    clearTimeout(
        magnetTimer
    );

    magnetTimer =
        setTimeout(
            () => {

                magnetActive =
                    false;

                updatePowerStatus();

            },
            POWER_UP_DURATION
        );

}


function activateSlowMotion() {

    slowMotionActive = true;

    clearTimeout(
        slowMotionTimer
    );

    slowMotionTimer =
        setTimeout(
            () => {

                slowMotionActive =
                    false;

                restartGameLoop();

                updatePowerStatus();

            },
            POWER_UP_DURATION
        );

    restartGameLoop();

}


function activateGhost() {

    ghostActive = true;

    ghostStartTime =
        Date.now();

    clearTimeout(
        ghostTimer
    );

    ghostTimer =
        setTimeout(
            () => {

                registerGhostTime();

                ghostActive =
                    false;

                updatePowerStatus();

            },
            POWER_UP_DURATION
        );

}


function registerGhostTime() {

    if (!ghostStartTime) {
        return;
    }

    const elapsed =
        (Date.now() -
        ghostStartTime) /
        1000;

    achievementStats.ghostTime +=
        elapsed;

    ghostStartTime =
        null;

    saveAchievementStats();

    checkAchievements();

}


function activateExtraLife() {

    extraLifeActive = true;

}


function useExtraLife() {

    extraLifeActive = false;

    createParticles(
        snake[0].x,
        snake[0].y,
        "#fb7185",
        25
    );

    showNotification(
        "❤️",
        "Vida extra!",
        "Você sobreviveu."
    );

}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    gameRunning = false;

    gamePaused = false;

    clearInterval(
        gameLoop
    );

    gameLoop = null;

    if (ghostActive) {
        registerGhostTime();
    }

    achievementStats.currentFoodStreak =
        0;

    flushPlayTime();

    playTimeSessionStart = null;

    saveAchievementStats();

    checkAchievements();

    updateMissionProgress();

    overlay.classList.remove(
        "hidden"
    );

    startButton.classList.add(
        "hidden"
    );

    restartButton.classList.remove(
        "hidden"
    );

    overlayIcon.textContent =
        "💀";

    overlayTitle.textContent =
        "Game Over";

    overlayMessage.textContent =
        `Score: ${score} · Level: ${level}`;

    drawGame();

}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (!gameRunning) {
        return;
    }

    gamePaused =
        !gamePaused;

    if (gamePaused) {

        flushPlayTime();

        playTimeSessionStart = null;

        overlay.classList.remove(
            "hidden"
        );

        startButton.classList.add(
            "hidden"
        );

        restartButton.classList.add(
            "hidden"
        );

        overlayIcon.textContent =
            "⏸️";

        overlayTitle.textContent =
            "Pausado";

        overlayMessage.textContent =
            "Clique em continuar para voltar.";

        startButton.textContent =
            "▶ Continuar";

        startButton.classList.remove(
            "hidden"
        );

    } else {

        startPlayTimeTracking();

        overlay.classList.add(
            "hidden"
        );

        startButton.classList.add(
            "hidden"
        );

        restartButton.classList.add(
            "hidden"
        );

    }

}


function resumeFromOverlay() {

    if (
        gameRunning &&
        gamePaused
    ) {

        togglePause();

    } else {

        startGame();

    }

}


/* =========================================================
   DRAW
========================================================= */

function drawGame() {

    const theme =
        THEMES[currentTheme];

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* BACKGROUND */

    ctx.fillStyle =
        theme.background;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* GRID */

    ctx.strokeStyle =
        theme.grid;

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x <= GRID_SIZE;
        x++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x * TILE_SIZE,
            0
        );

        ctx.lineTo(
            x * TILE_SIZE,
            canvas.height
        );

        ctx.stroke();

    }

    for (
        let y = 0;
        y <= GRID_SIZE;
        y++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y * TILE_SIZE
        );

        ctx.lineTo(
            canvas.width,
            y * TILE_SIZE
        );

        ctx.stroke();

    }


    /* OBSTACLES */

    drawObstacles(
        theme
    );


    /* FOOD */

    drawFood(
        theme
    );


    /* POWER UP */

    if (powerUp) {

        drawPowerUp(
            theme
        );

    }


    /* SNAKE */

    drawSnake(
        theme
    );


    /* PARTICLES */

    drawParticles();

}


function drawObstacles(theme) {

    obstacles.forEach(
        obstacle => {

            const x =
                obstacle.x *
                TILE_SIZE;

            const y =
                obstacle.y *
                TILE_SIZE;

            ctx.fillStyle =
                theme.obstacle;

            ctx.strokeStyle =
                theme.obstacleBorder;

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.roundRect(
                x + 3,
                y + 3,
                TILE_SIZE - 6,
                TILE_SIZE - 6,
                6
            );

            ctx.fill();

            ctx.stroke();

        }
    );

}


function drawFood(theme) {

    const pulse =
        Math.sin(
            foodPulse
        ) * 2;

    const centerX =
        food.x *
        TILE_SIZE +
        TILE_SIZE / 2;

    const centerY =
        food.y *
        TILE_SIZE +
        TILE_SIZE / 2;

    ctx.save();

    ctx.shadowBlur =
        15 + pulse;

    ctx.shadowColor =
        theme.food;

    ctx.fillStyle =
        theme.food;

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        6 + pulse * 0.3,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

}


function drawPowerUp(theme) {

    if (!powerUp) {
        return;
    }

    const pulse =
        Math.sin(
            powerUpPulse
        ) * 2;

    const x =
        powerUp.x *
        TILE_SIZE +
        TILE_SIZE / 2;

    const y =
        powerUp.y *
        TILE_SIZE +
        TILE_SIZE / 2;

    ctx.save();

    ctx.shadowBlur =
        20;

    ctx.shadowColor =
        theme.glow;

    ctx.fillStyle =
        theme.panel;

    ctx.strokeStyle =
        theme.glow;

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        10 + pulse,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        theme.text;

    ctx.font =
        "bold 11px system-ui";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        powerUp.icon,
        x,
        y
    );

    ctx.restore();

}


/* =========================================================
   SKIN COLORS
========================================================= */

function getSnakeColors(theme) {

    switch (
        playerProfile.equippedSkin
    ) {

        case "fire":

            return {
                head: "#facc15",
                body: "#ef4444"
            };

        case "ocean":

            return {
                head: "#67e8f9",
                body: "#0284c7"
            };

        case "shadow":

            return {
                head: "#e4e4e7",
                body: "#27272a"
            };

        case "toxic":

            return {
                head: "#d9f99d",
                body: "#65a30d"
            };

        case "ice":

            return {
                head: "#e0f2fe",
                body: "#38bdf8"
            };

        case "gold":

            return {
                head: "#fef08a",
                body: "#eab308"
            };

        case "rainbow":

            return {
                head: `hsl(${(
                    performance.now() / 5
                ) % 360}, 90%, 65%)`,

                body: `hsl(${(
                    performance.now() / 5 + 50
                ) % 360}, 85%, 50%)`
            };

        case "classic":

        default:

            return {
                head: theme.snakeHead,
                body: theme.snakeBody
            };

    }

}


/* =========================================================
   DRAW SNAKE
========================================================= */

function drawSnake(theme) {

    const colors =
        getSnakeColors(
            theme
        );


    /* AURA */

    if (
        playerProfile.equippedEffect ===
        "aura"
    ) {

        ctx.save();

        ctx.shadowBlur = 25;

        ctx.shadowColor =
            colors.head;

    }


    snake.forEach(
        (segment, index) => {

            const x =
                segment.x *
                TILE_SIZE;

            const y =
                segment.y *
                TILE_SIZE;

            const padding =
                index === 0
                    ? 2
                    : 3;

            ctx.fillStyle =
                index === 0
                    ? colors.head
                    : colors.body;

            if (ghostActive) {

                ctx.globalAlpha =
                    0.55;

            }


            ctx.beginPath();

            ctx.roundRect(
                x + padding,
                y + padding,
                TILE_SIZE -
                    padding * 2,
                TILE_SIZE -
                    padding * 2,
                5
            );

            ctx.fill();

            ctx.globalAlpha = 1;


            /* TRAIL */

            if (
                playerProfile.equippedEffect ===
                "trail"
                ||
                playerProfile.equippedEffect ===
                "rainbowTrail"
            ) {

                if (
                    index % 2 === 0
                ) {

                    const trailColor =
                        playerProfile.equippedEffect ===
                        "rainbowTrail"

                            ? `hsla(${
                                (
                                    performance.now()
                                    / 4
                                    +
                                    index * 20
                                ) % 360
                            },90%,60%,0.25)`

                            : hexToRgba(
                                colors.body,
                                0.25
                            );

                    ctx.fillStyle =
                        trailColor;

                    ctx.beginPath();

                    ctx.arc(
                        x +
                        TILE_SIZE / 2,
                        y +
                        TILE_SIZE / 2,
                        4,
                        0,
                        Math.PI * 2
                    );

                    ctx.fill();

                }

            }


            /* SPARKLES */

            if (
                playerProfile.equippedEffect ===
                "sparkle"
                &&
                Math.random() < 0.08
            ) {

                ctx.fillStyle =
                    "#ffffff";

                ctx.beginPath();

                ctx.arc(
                    x +
                    Math.random() *
                    TILE_SIZE,

                    y +
                    Math.random() *
                    TILE_SIZE,

                    1.5,

                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }


            /* HEAD */

            if (index === 0) {

                drawSnakeEyes(
                    x,
                    y,
                    direction
                );

            }

        }
    );


    ctx.restore();

}


function drawSnakeEyes(
    x,
    y,
    dir
) {

    const eyeSize = 2;

    let eye1;
    let eye2;

    if (dir.x === 1) {

        eye1 = {
            x: x + 14,
            y: y + 6
        };

        eye2 = {
            x: x + 14,
            y: y + 14
        };

    } else if (dir.x === -1) {

        eye1 = {
            x: x + 6,
            y: y + 6
        };

        eye2 = {
            x: x + 6,
            y: y + 14
        };

    } else if (dir.y === -1) {

        eye1 = {
            x: x + 6,
            y: y + 6
        };

        eye2 = {
            x: x + 14,
            y: y + 6
        };

    } else {

        eye1 = {
            x: x + 6,
            y: y + 14
        };

        eye2 = {
            x: x + 14,
            y: y + 14
        };

    }

    ctx.fillStyle =
        "#111827";

    ctx.beginPath();

    ctx.arc(
        eye1.x,
        eye1.y,
        eyeSize,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        eye2.x,
        eye2.y,
        eyeSize,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =========================================================
   UI
========================================================= */

function updateUI() {

    scoreElement.textContent =
        score;

    highScoreElement.textContent =
        highScore;

    levelElement.textContent =
        level;

    coinsValue.textContent =
        playerProfile.coins;

    if (shopBalance) {

        shopBalance.textContent =
            playerProfile.coins;

    }

}


function updatePowerStatus() {

    setPowerStatus(
        "speed-status",
        speedBoostActive,
        "⚡ Speed",
        speedBoostActive
            ? "⚡ Speed ON"
            : "⚡ Speed"
    );

    setPowerStatus(
        "double-status",
        doublePointsActive,
        "2X Points",
        doublePointsActive
            ? "2X Points ON"
            : "2X Points"
    );

    setPowerStatus(
        "shield-status",
        shieldActive,
        "🛡️ Shield",
        shieldActive
            ? "🛡️ Shield ON"
            : "🛡️ Shield"
    );

    setPowerStatus(
        "magnet-status",
        magnetActive,
        "🧲 Magnet",
        magnetActive
            ? "🧲 Magnet ON"
            : "🧲 Magnet"
    );

    setPowerStatus(
        "slow-status",
        slowMotionActive,
        "❄️ Slow",
        slowMotionActive
            ? "❄️ Slow ON"
            : "❄️ Slow"
    );

    setPowerStatus(
        "ghost-status",
        ghostActive,
        "👻 Ghost",
        ghostActive
            ? "👻 Ghost ON"
            : "👻 Ghost"
    );

    setPowerStatus(
        "life-status",
        extraLifeActive,
        "❤️ Life",
        extraLifeActive
            ? "❤️ Life ON"
            : "❤️ Life"
    );

}


function setPowerStatus(
    id,
    active,
    defaultText,
    activeText
) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent =
        active
            ? activeText
            : defaultText;

    element.classList.toggle(
        "active",
        active
    );

}


/* =========================================================
   ACHIEVEMENTS STORAGE
========================================================= */

function saveAchievementStats() {

    localStorage.setItem(
        "snakeAchievementStats",
        JSON.stringify(
            achievementStats
        )
    );

    localStorage.setItem(
        "snakeAchievements",
        JSON.stringify(
            unlockedAchievements
        )
    );

}


/* =========================================================
   ACHIEVEMENT PROGRESS
========================================================= */

function getAchievementProgress(
    achievement
) {

    switch (
        achievement.id
    ) {

        case "firstGame":
            return achievementStats.gamesPlayed;

        case "hundredPoints":
            return achievementStats.bestScore;

        case "foodStreak":
            return achievementStats.bestFoodStreak;

        case "speedBoost":
            return achievementStats.speedBoosts;

        case "ghost":
            return achievementStats.ghostTime;

        case "shield":
            return achievementStats.shieldSaves;

        case "level10":
            return achievementStats.highestLevel;

        case "collector":
            return achievementStats
                .powerUpsCollected
                .length;

        default:
            return 0;

    }

}


function isAchievementComplete(
    achievement
) {

    return (
        getAchievementProgress(
            achievement
        ) >=
        achievement.target
    );

}


function unlockAchievement(
    achievement
) {

    if (
        unlockedAchievements[
            achievement.id
        ]
    ) {

        return;

    }

    unlockedAchievements[
        achievement.id
    ] = true;

    addCoins(25);

    showNotification(
        achievement.icon,
        achievement.name,
        `${achievement.description} · +25 moedas`
    );

    saveAchievementStats();

    renderAchievements();

}


/* =========================================================
   CHECK ACHIEVEMENTS
========================================================= */

function checkAchievements() {

    ACHIEVEMENTS.forEach(
        achievement => {

            if (
                isAchievementComplete(
                    achievement
                )
            ) {

                unlockAchievement(
                    achievement
                );

            }

        }
    );

    renderAchievements();

}


/* =========================================================
   RENDER ACHIEVEMENTS
========================================================= */

function renderAchievements() {

    if (!achievementList) {
        return;
    }

    let unlockedCount = 0;

    achievementList.innerHTML =
        ACHIEVEMENTS.map(
            achievement => {

                const progress =
                    getAchievementProgress(
                        achievement
                    );

                const complete =
                    isAchievementComplete(
                        achievement
                    );

                const unlocked =
                    Boolean(
                        unlockedAchievements[
                            achievement.id
                        ]
                    );

                if (unlocked) {
                    unlockedCount++;
                }

                const percentage =
                    Math.min(
                        100,
                        (
                            progress /
                            achievement.target
                        ) * 100
                    );

                return `

                    <div
                        class="achievement-item ${
                            unlocked
                                ? "unlocked"
                                : ""
                        }"
                    >

                        <div class="achievement-item-top">

                            <div class="achievement-icon">
                                ${achievement.icon}
                            </div>

                            <div class="achievement-info">

                                <strong>
                                    ${achievement.name}
                                </strong>

                                <p>
                                    ${achievement.description}
                                </p>

                            </div>

                            <div class="achievement-status">

                                ${
                                    unlocked
                                        ? "✓"
                                        : `${Math.min(
                                            progress,
                                            achievement.target
                                        )}/${achievement.target}`
                                }

                            </div>

                        </div>

                        <div class="achievement-progress">

                            <div
                                class="achievement-progress-bar"
                                style="width:${percentage}%"
                            ></div>

                        </div>

                    </div>

                `;

            }
        ).join("");


    achievementCount.textContent =
        `${unlockedCount} / ${ACHIEVEMENTS.length}`;

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStats() {

    if (!statsGrid) {
        return;
    }

    flushPlayTime();

    const items = [

        {
            icon: "🎮",
            label: "PARTIDAS JOGADAS",
            value:
                formatNumber(
                    achievementStats.gamesPlayed
                )
        },

        {
            icon: "🏆",
            label: "MELHOR SCORE",
            value:
                formatNumber(
                    Math.max(
                        achievementStats.bestScore,
                        highScore
                    )
                )
        },

        {
            icon: "🚀",
            label: "MAIOR NÍVEL",
            value:
                formatNumber(
                    achievementStats.highestLevel
                )
        },

        {
            icon: "🍎",
            label: "COMIDAS",
            value:
                formatNumber(
                    achievementStats.totalFoodEaten
                )
        },

        {
            icon: "🪙",
            label: "MOEDAS GANHAS",
            value:
                formatNumber(
                    playerProfile.totalCoins
                )
        },

        {
            icon: "⚡",
            label: "POWER-UPS COLETADOS",
            value:
                formatNumber(
                    achievementStats.totalPowerUpsCollected
                )
        },

        {
            icon: "⏱️",
            label: "TEMPO JOGADO",
            value:
                formatPlayTime(
                    achievementStats.totalPlayTimeMs
                )
        }

    ];

    statsGrid.innerHTML =
        items.map(item => `

            <div class="stats-stat-card">

                <div class="stats-stat-icon">
                    ${item.icon}
                </div>

                <span class="stats-stat-label">
                    ${item.label}
                </span>

                <strong class="stats-stat-value">
                    ${item.value}
                </strong>

            </div>

        `).join("");

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

let notificationTimer = null;

function showNotification(
    icon,
    name,
    description
) {

    const notification =
        document.getElementById(
            "achievement-notification"
        );

    const iconElement =
        document.getElementById(
            "achievement-notification-icon"
        );

    const nameElement =
        document.getElementById(
            "achievement-notification-name"
        );

    const descriptionElement =
        document.getElementById(
            "achievement-notification-description"
        );

    if (!notification) {
        return;
    }

    iconElement.textContent =
        icon;

    nameElement.textContent =
        name;

    descriptionElement.textContent =
        description;

    notification.classList.add(
        "show"
    );

    clearTimeout(
        notificationTimer
    );

    notificationTimer =
        setTimeout(
            () => {

                notification.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================================
   DIRECTION
========================================================= */

function changeDirection(
    newDirection
) {

    if (
        newDirection.x ===
            -direction.x
        &&
        newDirection.y ===
            -direction.y
    ) {

        return;

    }

    nextDirection =
        newDirection;

}


function handleDirection(
    directionName
) {

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

    if (
        directions[directionName]
    ) {

        changeDirection(
            directions[directionName]
        );

    }

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        const controls = {

            arrowup: "up",
            w: "up",

            arrowdown: "down",
            s: "down",

            arrowleft: "left",
            a: "left",

            arrowright: "right",
            d: "right"

        };

        if (
            controls[key]
        ) {

            event.preventDefault();

            handleDirection(
                controls[key]
            );

        }

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            togglePause();

        }

    }
);


/* =========================================================
   MOBILE CONTROLS
========================================================= */

document.querySelectorAll(
    "[data-direction]"
).forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                handleDirection(
                    button.dataset.direction
                );

            }
        );

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

        const dx =
            touch.clientX -
            touchStartX;

        const dy =
            touch.clientY -
            touchStartY;

        if (
            Math.abs(dx) <
                25 &&
            Math.abs(dy) <
                25
        ) {

            return;

        }

        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            handleDirection(
                dx > 0
                    ? "right"
                    : "left"
            );

        } else {

            handleDirection(
                dy > 0
                    ? "down"
                    : "up"
            );

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   BUTTON EVENTS
========================================================= */

startButton.addEventListener(
    "click",
    () => {

        if (
            gameRunning &&
            gamePaused
        ) {

            resumeFromOverlay();

        } else {

            startGame();

        }

    }
);


restartButton.addEventListener(
    "click",
    () => {

        startGame();

    }
);


pauseButton.addEventListener(
    "click",
    () => {

        togglePause();

    }
);


/* =========================================================
   THEMES EVENTS
========================================================= */

themeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                applyTheme(
                    button.dataset.theme
                );

                drawGame();

            }
        );

    }
);


/* =========================================================
   ACHIEVEMENT MODAL
========================================================= */

achievementButton.addEventListener(
    "click",
    () => {

        renderAchievements();

        achievementModal.classList.add(
            "show"
        );

    }
);


closeAchievementsButton.addEventListener(
    "click",
    () => {

        achievementModal.classList.remove(
            "show"
        );

    }
);


/* =========================================================
   SHOP MODAL
========================================================= */

shopButton.addEventListener(
    "click",
    () => {

        renderShop();

        shopModal.classList.add(
            "show"
        );

    }
);


closeShopButton.addEventListener(
    "click",
    () => {

        shopModal.classList.remove(
            "show"
        );

    }
);


/* =========================================================
   MISSIONS MODAL
========================================================= */

missionsButton.addEventListener(
    "click",
    () => {

        loadDailyMissions();

        updateMissionProgress();

        renderMissions();

        updateMissionTimer();

        missionsModal.classList.add(
            "show"
        );

    }
);


closeMissionsButton.addEventListener(
    "click",
    () => {

        missionsModal.classList.remove(
            "show"
        );

    }
);


/* =========================================================
   STATS MODAL
========================================================= */

statsButton.addEventListener(
    "click",
    () => {

        renderStats();

        statsModal.classList.add(
            "show"
        );

    }
);


closeStatsButton.addEventListener(
    "click",
    () => {

        statsModal.classList.remove(
            "show"
        );

    }
);


/* =========================================================
   CLOSE MODALS OUTSIDE
========================================================= */

achievementModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            achievementModal
        ) {

            achievementModal.classList.remove(
                "show"
            );

        }

    }
);


shopModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            shopModal
        ) {

            shopModal.classList.remove(
                "show"
            );

        }

    }
);


missionsModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            missionsModal
        ) {

            missionsModal.classList.remove(
                "show"
            );

        }

    }
);


statsModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            statsModal
        ) {

            statsModal.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   PREVENT PAGE ZOOM / SCROLL ON GAME
========================================================= */

document.addEventListener(
    "gesturestart",
    event => {
        event.preventDefault();
    }
);


/* =========================================================
   SAVE PLAY TIME ON EXIT
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        flushPlayTime();

    }
);

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "hidden"
        ) {

            flushPlayTime();

        } else if (
            gameRunning &&
            !gamePaused
        ) {

            startPlayTimeTracking();

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

loadDailyMissions();

highScoreElement.textContent =
    highScore;

applyTheme(
    currentTheme
);

renderShop();

renderAchievements();

renderMissions();

updateMissionTimer();

updateUI();

updatePowerStatus();

resetGame();

drawGame();
