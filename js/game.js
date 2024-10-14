// Game Config
let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#85c3ff",
    physics: {
        default: "arcade",
        arcade: {
            gravity: 0,
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

let game = new Phaser.Game(config);
let score = 0;
let gamePaused = false; // Initialize the gamePaused variable
let gameState = "start"; // Add a variable to track the game state

// Constant for rock Y position
const ROCK_Y_POSITION = window.innerHeight - 310; // Set your desired Y position for rocks

function preload() {
    // Preload assets here
    this.load.image("player", "assets/boat.png");
    this.load.image("rock", "assets/rock.png");
}

function create() {
    window.addEventListener("resize", resizeGame);

    // Create the ground
    this.ground = this.add
        .rectangle(
            0,
            window.innerHeight - 300,
            window.innerWidth,
            300,
            0x126fc7
        )
        .setOrigin(0, 0)
        .setDepth(1);

    // Add the player character (Initially hidden until game starts)
    this.player = this.physics.add.sprite(
        window.innerWidth / 2,
        window.innerHeight - 325,
        "player"
    );
    this.player.setScale(0.3);
    this.player.setDepth(2);
    this.player.setVisible(false); // Hide player initially

    // Adjust player physics body size (collision box)
    this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.8);
    this.player.body.setOffset(
        this.player.width * 0.2,
        this.player.height * 0.1
    );

    // Create the jump button (Initially hidden)
    this.jumpButton = this.add
        .rectangle(
            window.innerWidth / 2,
            window.innerHeight - 150,
            325,
            150,
            0xf5d932
        )
        .setDepth(2)
        .setInteractive()
        .on("pointerdown", () => {
            jump.call(this);
        })
        .setVisible(false); // Hide button initially

    // Add text to the button
    this.jumpText = this.add
        .text(window.innerWidth / 2, window.innerHeight - 150, "Jump!", {
            fontFamily: "Montserrat",
            fontSize: "32px",
            color: "#000000", // Black color for the text
            align: "center",
        })
        .setDepth(3)
        .setOrigin(0.5, 0.5)
        .setPosition(window.innerWidth / 2, window.innerHeight - 150)
        .setVisible(false); // Hide text initially

    // Add score text (Initially hidden)
    this.scoreText = this.add
        .text(20, 20, `Score: ${score}`, {
            fontFamily: "Montserrat",
            fontSize: "42px",
            color: "#ffffff", // White color for the text
        })
        .setShadow(3, 3, "#000000", 0.5, true)
        .setVisible(false); // Hide score initially

    // Create a group for rocks (Initially not active)
    this.rocksGroup = this.physics.add.group({
        defaultKey: "rock",
        maxSize: 10, // Limit the number of rocks for recycling
    });

    // Collisions between the player and the rocks group
    this.physics.add.collider(
        this.player,
        this.rocksGroup,
        gameOver,
        null,
        this
    );

    // === Start Screen ===
    // Create Start Button
    this.startButton = this.add
        .rectangle(
            window.innerWidth / 2,
            window.innerHeight / 2,
            400,
            150,
            0xf5d932
        )
        .setDepth(3)
        .setInteractive()
        .on("pointerdown", () => {
            startGame.call(this);
        });

    this.startText = this.add
        .text(window.innerWidth / 2, window.innerHeight / 2, "Start Game", {
            fontFamily: "Montserrat",
            fontSize: "42px",
            color: "#000000",
        })
        .setOrigin(0.5)
        .setDepth(4);

    // === Game Over Screen (Initially hidden) ===
    this.gameOverText = this.add
        .text(
            window.innerWidth / 2,
            window.innerHeight / 2 - 100,
            "Game Over",
            {
                fontFamily: "Montserrat",
                fontSize: "52px",
                color: "#ff0000", // Red text for game over
            }
        )
        .setOrigin(0.5)
        .setDepth(5)
        .setVisible(false); // Hide initially

    this.restartButton = this.add
        .rectangle(
            window.innerWidth / 2,
            window.innerHeight / 2 + 50,
            400,
            100,
            0x0000ff
        )
        .setDepth(5)
        .setInteractive()
        .on("pointerdown", () => {
            restartGame.call(this);
        })
        .setVisible(false); // Hide initially

    this.restartText = this.add
        .text(window.innerWidth / 2, window.innerHeight / 2 + 50, "Restart", {
            fontFamily: "Montserrat",
            fontSize: "36px",
            color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(6)
        .setVisible(false); // Hide initially
}

// Function to start the game
function startGame() {
    gameState = "playing"; // Change state to playing
    this.player.setVisible(true);
    this.jumpButton.setVisible(true);
    this.jumpText.setVisible(true);
    this.scoreText.setVisible(true);
    this.startButton.setVisible(false); // Hide the start button
    this.startText.setVisible(false);
    score = 0; // Reset score
    spawnRocks.call(this); // Start spawning rocks
}

// Function to handle game over
function gameOver() {
    this.physics.pause(); // Pause the game
    this.jumpButton.disableInteractive(); // Disable the jump button
    gamePaused = true; // Set game paused state to true
    this.gameOverText.setVisible(true); // Show game over text
    this.restartButton.setVisible(true); // Show restart button
    this.restartText.setVisible(true); // Show restart text
    console.log("Game Over!");
}

// Function to refresh the page on restart
function restartGame() {
    console.log("Restarting game...");
    location.reload(); // Refresh the page
}

// Function to reset all rocks
function resetRocks() {
    this.rocksGroup.children.iterate((rock) => {
        if (rock.active) {
            rock.setActive(false).setVisible(false); // Deactivate and hide rocks
            rock.body.setVelocityX(0); // Reset velocity
        }
    });
}

function spawnRocks() {
    this.time.addEvent({
        delay: Phaser.Math.Between(1000, 2500), // Random delay between 1 and 3 seconds
        callback: () => {
            if (!gamePaused) {
                let rock = this.rocksGroup.get();
                if (rock) {
                    rock.setActive(true).setVisible(true);
                    rock.setScale(0.075);
                    rock.setDepth(0);
                    rock.setPosition(window.innerWidth, ROCK_Y_POSITION);
                    rock.body.setVelocityX(-550); // Move rock to the left
                }
                spawnRocks.call(this); // Continue spawning rocks
            }
        },
        callbackScope: this,
    });
}

function jump() {
    this.tweens.add({
        targets: this.player,
        y: this.player.y - 250,
        duration: 400,
        yoyo: true,
        ease: "Power2",
    });
}

function update() {
    if (gamePaused || gameState === "start") return;

    this.rocksGroup.children.iterate((rock) => {
        if (rock.active && rock.x < -rock.width) {
            this.rocksGroup.killAndHide(rock);
            rock.body.reset(0, 0); // Reset rock position
            score += 10; // Add to score
            this.scoreText.setText(`Score: ${score}`); // Update score
        }
    });
}

// Resize function
function resizeGame() {
    game.scale.resize(window.innerWidth, window.innerHeight);
}

// // Game Config
// let config = {
//     type: Phaser.AUTO,
//     width: window.innerWidth,
//     height: window.innerHeight,
//     backgroundColor: "#85c3ff",
//     physics: {
//         default: "arcade",
//         arcade: {
//             gravity: 0,
//             debug: false,
//         },
//     },
//     scene: {
//         preload: preload,
//         create: create,
//         update: update,
//     },
// };

// let game = new Phaser.Game(config);
// let score = 0;
// let gamePaused = false; // Initialize the gamePaused variable
// let gameState = "start"; // Add a variable to track the game state

// // Constant for rock Y position
// const ROCK_Y_POSITION = window.innerHeight - 310; // Set your desired Y position for rocks

// function preload() {
//     // Preload assets here
//     this.load.image("player", "assets/boat.png");
//     this.load.image("rock", "assets/rock.png");
// }

// function create() {
//     window.addEventListener("resize", resizeGame);

//     // Create the ground
//     this.ground = this.add
//         .rectangle(
//             0,
//             window.innerHeight - 300,
//             window.innerWidth,
//             300,
//             0x126fc7
//         )
//         .setOrigin(0, 0)
//         .setDepth(1);

//     // Add the player character (Initially hidden until game starts)
//     this.player = this.physics.add.sprite(
//         window.innerWidth / 2,
//         window.innerHeight - 325,
//         "player"
//     );
//     this.player.setScale(0.3);
//     this.player.setDepth(2);
//     this.player.setVisible(false); // Hide player initially

//     // Adjust player physics body size (collision box)
//     this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.8);
//     this.player.body.setOffset(
//         this.player.width * 0.2,
//         this.player.height * 0.1
//     );

//     // Create the jump button (Initially hidden)
//     this.jumpButton = this.add
//         .rectangle(
//             window.innerWidth / 2,
//             window.innerHeight - 150,
//             325,
//             150,
//             0xf5d932
//         )
//         .setDepth(2)
//         .setInteractive()
//         .on("pointerdown", () => {
//             jump.call(this);
//         })
//         .setVisible(false); // Hide button initially

//     // Add text to the button
//     this.jumpText = this.add
//         .text(window.innerWidth / 2, window.innerHeight - 150, "Jump!", {
//             fontFamily: "Montserrat",
//             fontSize: "32px",
//             color: "#000000", // Black color for the text
//             align: "center",
//         })
//         .setDepth(3)
//         .setOrigin(0.5, 0.5)
//         .setPosition(window.innerWidth / 2, window.innerHeight - 150)
//         .setVisible(false); // Hide text initially

//     // Add score text (Initially hidden)
//     this.scoreText = this.add
//         .text(20, 20, `Score: ${score}`, {
//             fontFamily: "Montserrat",
//             fontSize: "42px",
//             color: "#ffffff", // White color for the text
//         })
//         .setShadow(3, 3, "#000000", 0.5, true)
//         .setVisible(false); // Hide score initially

//     // Create a group for rocks (Initially not active)
//     this.rocksGroup = this.physics.add.group({
//         defaultKey: "rock",
//         maxSize: 10, // Limit the number of rocks for recycling
//     });

//     // Collisions between the player and the rocks group
//     this.physics.add.collider(
//         this.player,
//         this.rocksGroup,
//         gameOver,
//         null,
//         this
//     );

//     // === Start Screen ===
//     // Create Start Button
//     this.startButton = this.add
//         .rectangle(
//             window.innerWidth / 2,
//             window.innerHeight / 2,
//             400,
//             150,
//             0xf5d932
//         )
//         .setDepth(3)
//         .setInteractive()
//         .on("pointerdown", () => {
//             startGame.call(this);
//         });

//     this.startText = this.add
//         .text(window.innerWidth / 2, window.innerHeight / 2, "Start Game", {
//             fontFamily: "Montserrat",
//             fontSize: "42px",
//             color: "#000000",
//         })
//         .setOrigin(0.5)
//         .setDepth(4);

//     // === Game Over Screen (Initially hidden) ===
//     this.gameOverText = this.add
//         .text(
//             window.innerWidth / 2,
//             window.innerHeight / 2 - 100,
//             "Game Over",
//             {
//                 fontFamily: "Montserrat",
//                 fontSize: "52px",
//                 color: "#ff0000", // Red text for game over
//             }
//         )
//         .setOrigin(0.5)
//         .setDepth(5)
//         .setVisible(false); // Hide initially

//     this.restartButton = this.add
//         .rectangle(
//             window.innerWidth / 2,
//             window.innerHeight / 2 + 50,
//             400,
//             100,
//             0x0000ff
//         )
//         .setDepth(5)
//         .setInteractive()
//         .on("pointerdown", () => {
//             restartGame.call(this);
//         })
//         .setVisible(false); // Hide initially

//     this.restartText = this.add
//         .text(window.innerWidth / 2, window.innerHeight / 2 + 50, "Restart", {
//             fontFamily: "Montserrat",
//             fontSize: "36px",
//             color: "#ffffff",
//         })
//         .setOrigin(0.5)
//         .setDepth(6)
//         .setVisible(false); // Hide initially
// }

// // Function to start the game
// function startGame() {
//     gameState = "playing"; // Change state to playing
//     this.player.setVisible(true);
//     this.jumpButton.setVisible(true);
//     this.jumpText.setVisible(true);
//     this.scoreText.setVisible(true);
//     this.startButton.setVisible(false); // Hide the start button
//     this.startText.setVisible(false);

//     // Ensure game over elements are hidden when starting the game
//     this.gameOverText.setVisible(false);
//     this.restartButton.setVisible(false);
//     this.restartText.setVisible(false);

//     score = 0; // Reset score
//     spawnRocks.call(this); // Start spawning rocks
// }

// // Function to handle game over
// function gameOver() {
//     this.physics.pause(); // Pause the game
//     this.jumpButton.disableInteractive(); // Disable the jump button
//     gamePaused = true; // Set game paused state to true
//     this.gameOverText.setVisible(true); // Show game over text
//     this.restartButton.setVisible(true); // Show restart button
//     this.restartText.setVisible(true); // Show restart text
//     console.log("Game Over!");
// }

// // Function to restart the game
// function restartGame() {
//     console.log("Restarting game..."); // Debug log
//     gamePaused = false;
//     this.physics.resume(); // Resume physics
//     resetRocks.call(this); // Reset rocks
//     this.player.setPosition(window.innerWidth / 2, window.innerHeight - 325); // Reset player position
//     this.player.body.setVelocity(0); // Reset player velocity to zero

//     // Hide game over and restart button elements
//     this.gameOverText.setVisible(false); // Hide game over text
//     console.log("Game Over Text Visible: ", this.gameOverText.visible);
//     this.restartButton.setVisible(false); // Hide restart button
//     console.log("Restart Button Visible: ", this.restartButton.visible);
//     this.restartText.setVisible(false); // Hide restart text
//     console.log("Restart Text Visible: ", this.restartText.visible);

//     score = 0; // Reset the score
//     this.scoreText.setText(`Score: ${score}`);

//     // Start the game
//     startGame.call(this); // Start game logic
// }

// // Function to reset all rocks
// function resetRocks() {
//     this.rocksGroup.children.iterate((rock) => {
//         if (rock.active) {
//             rock.setActive(false).setVisible(false); // Deactivate and hide rocks
//             rock.body.setVelocityX(0); // Reset velocity
//         }
//     });
// }

// function spawnRocks() {
//     this.time.addEvent({
//         delay: Phaser.Math.Between(1000, 2500), // Random delay between 1 and 3 seconds
//         callback: () => {
//             if (!gamePaused) {
//                 let rock = this.rocksGroup.get();
//                 if (rock) {
//                     rock.setActive(true).setVisible(true);
//                     rock.setScale(0.075);
//                     rock.setDepth(0);
//                     rock.setPosition(window.innerWidth, ROCK_Y_POSITION);
//                     rock.body.setVelocityX(-550); // Move rock to the left
//                 }
//                 spawnRocks.call(this); // Continue spawning rocks
//             }
//         },
//         callbackScope: this,
//     });
// }

// function jump() {
//     this.tweens.add({
//         targets: this.player,
//         y: this.player.y - 250,
//         duration: 400,
//         yoyo: true,
//         ease: "Power2",
//     });
// }

// function update() {
//     if (gamePaused || gameState === "start") return;

//     this.rocksGroup.children.iterate((rock) => {
//         if (rock.active && rock.x < -rock.width) {
//             this.rocksGroup.killAndHide(rock);
//             rock.body.reset(0, 0); // Reset rock position
//             score += 10; // Add to score
//             this.scoreText.setText(`Score: ${score}`); // Update score
//         }
//     });
// }

// // Resize function
// function resizeGame() {
//     game.scale.resize(window.innerWidth, window.innerHeight);
// }
