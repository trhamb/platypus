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
let rocks = [];
let scoredRocks = [];
let score = 0;
let gamePaused = false; // Initialize the gamePaused variable

// Constant for rock Y position
const ROCK_Y_POSITION = window.innerHeight - 310; // Set your desired Y position for rocks

function preload() {
    // Preload assets here
    this.load.image("player", "assets/boat.png");
    this.load.image("rock", "assets/rock.png");
}

function create() {
    // Set up objects etc
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

    // Add the player character
    this.player = this.physics.add.sprite(
        window.innerWidth / 2,
        window.innerHeight - 325,
        "player"
    );
    this.player.setScale(0.3);
    this.player.setDepth(2);

    // Create and add the jump button
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
        });

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
        .setPosition(window.innerWidth / 2, window.innerHeight - 150);

    // Add score text
    this.scoreText = this.add
        .text(20, 20, `Score: ${score}`, {
            fontFamily: "Montserrat",
            fontSize: "42px",
            color: "#ffffff", // White color for the text
        })
        .setShadow(3, 3, "#000000", 0.5, true);

    // Start spawning rocks with random intervals
    spawnRocks.call(this);

    // Collisions
    this.physics.add.collider(this.player, rocks, gameOver, null, this);
}

let lastRockX = 0; // Track the last rock's X position
const MIN_DISTANCE_BETWEEN_ROCKS = 400; // Set minimum distance between rocks

function spawnRocks() {
    // Add a timed event to spawn another rock after a random interval
    this.time.addEvent({
        delay: Phaser.Math.Between(500, 1500), // Random delay between 1 and 3 seconds
        callback: () => {
            if (!gamePaused) {
                // Ensure the last rock is far enough from the previous rock
                if (
                    lastRockX <
                    window.innerWidth - MIN_DISTANCE_BETWEEN_ROCKS
                ) {
                    addRock.call(this);
                } else {
                    // If not enough distance, add a slight delay before the next check
                    this.time.delayedCall(500, spawnRocks, [], this);
                }
                spawnRocks.call(this); // Call spawnRocks again to repeat the process
            }
        },
        callbackScope: this,
    });
}

function addRock() {
    // Create a rock and set its position off-screen
    let rock = this.physics.add.sprite(
        window.innerWidth,
        ROCK_Y_POSITION,
        "rock"
    );
    rock.setScale(0.075); // Adjust scale as needed
    rock.setDepth(0);
    rocks.push(rock); // Store the rock in the array
    lastRockX = rock.x; // Update the last rock's X position
}

function jump() {
    // Example of a basic jump: Move the player up by 150 pixels
    this.tweens.add({
        targets: this.player, // The player object
        y: this.player.y - 250, // Jump height (px)
        duration: 400, // Time it takes to jump
        yoyo: true, // Player falls back after reaching the peak
        ease: "Power2", // Smoother jump effect
    });
}

function resizeGame() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Resize the game
    game.scale.resize(width, height);

    // Update the ground size and position
    this.ground.setSize(width, 300);
    this.ground.setPosition(0, height - 300);

    // Update player position
    this.player.setPosition(width / 2, height - 325);

    // Center the jump button inside the ground
    this.jumpButton.setPosition(width / 2, height - 150); // Keep button centered inside the ground
}

function gameOver() {
    // Stop the game
    this.physics.pause(); // Pause the physics world
    this.jumpButton.disableInteractive(); // Disable the jump button interaction
    gamePaused = true; // Set game paused state to true
    console.log("Game Over!");
}

function update() {
    if (gamePaused) return; // Skip the update if the game is paused

    // Move rocks to the left
    rocks.forEach((rock, index) => {
        rock.x -= 10; // Move rock left

        // Check if rock is off-screen
        if (rock.x < -50) {
            // If off-screen, reset its position
            rock.x = window.innerWidth + 50; // Reset to right side of the screen
            rock.y = ROCK_Y_POSITION; // Reset y position
            scoredRocks.splice(index, 1); // Remove from scored rocks
        } else if (
            rock.x < window.innerWidth / 2 &&
            !scoredRocks.includes(rock)
        ) {
            // Check if the rock has passed the player and hasn't been scored yet
            score++; // Increment score
            this.scoreText.setText(`Score: ${score}`); // Update the score display
            scoredRocks.push(rock); // Mark this rock as scored
        }
    });
}
