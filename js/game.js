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
            debug: true,
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
            fontSize: "52px",
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
            fontSize: "50px",
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
                fontSize: "72px",
                color: "#ffffff",
            }
        )
        .setShadow(3, 3, "#000000", 0.5, true)
        .setOrigin(0.5)
        .setDepth(5)
        .setVisible(false); // Hide initially

    this.restartButton = this.add
        .rectangle(
            window.innerWidth / 2,
            window.innerHeight / 2 + 50,
            400,
            100,
            0xf5d932
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
            fontSize: "50px",
            color: "#000000",
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

    // Update the game over text to show the score
    this.jumpButton.setVisible(false);
    this.jumpText.setVisible(false);
    this.gameOverText.setText(`You scored: ${score}`).setVisible(true); // Show score
    this.restartButton.setVisible(true); // Show restart button
    this.restartText.setVisible(true); // Show restart text
}

// Function to refresh the page on restart
function restartGame() {
    console.log("Restarting game...");

    // Reset game state
    gamePaused = false; // Allow the game to be played again
    score = 0; // Reset score
    this.scoreText.setText(`Score: ${score}`); // Update score display

    // Hide game over text and restart button
    this.gameOverText.setVisible(false);
    this.restartButton.setVisible(false);
    this.restartText.setVisible(false);

    // Make player and buttons visible again
    this.player.setVisible(true);
    this.jumpButton.setVisible(true);
    this.jumpButton.setInteractive(); // Make the button interactive again
    this.jumpText.setVisible(true);
    this.scoreText.setVisible(true);

    // Reset player physics body
    this.player.body.setVelocity(0); // Reset player's velocity

    // Reset and hide all rocks
    resetRocks.call(this);

    // Ensure physics is resumed
    this.physics.resume(); // Resume physics

    // Restart spawning rocks
    spawnRocks.call(this);
}

// Function to reset all rocks
function resetRocks() {
    this.rocksGroup.children.iterate((rock) => {
        if (rock.active) {
            rock.setActive(false).setVisible(false); // Deactivate and hide rocks
            rock.body.setVelocityX(0); // Reset velocity
            rock.body.reset(0, 0); // Reset position
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
                    rock.isScored = false; // Reset scoring flag for new rock
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
        if (rock.active) {
            // Check if rock has passed the player and not scored yet
            if (rock.x < this.player.x && !rock.isScored) {
                score += 1; // Increment score by 1
                this.scoreText.setText(`Score: ${score}`); // Update score
                rock.isScored = true; // Mark rock as scored
            }

            // If the rock is out of bounds, hide and reset it
            if (rock.x < -rock.width) {
                this.rocksGroup.killAndHide(rock);
                rock.body.reset(0, 0); // Reset rock position
                rock.isScored = false; // Reset the scoring flag for the next time it appears
            }
        }
    });
}

// Resize function
function resizeGame() {
    game.scale.resize(window.innerWidth, window.innerHeight);
}
