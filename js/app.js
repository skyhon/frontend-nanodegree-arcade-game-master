/* app.js
 * This file provides a number of entities to the game including the player characters
 * and enemies to recreate the classic arcade game Frogger.
*/

'use strict';

// Constants
var ROWS = 5,           // number of rows on the grid
    COLS = 5,           // number of columns on the grid
    MAX_ENEMIES = 5,        // maximum number of enemies allowed
    ENEMIES_POS_OFFSET = {     // enemies position offset
        "x": -100,
        "y": -40
    },
    PLAYER_POS_OFFSET = {       // player position offset
        "x": -100,
        "y": -40
    },
    PLAYER_INIT = {             // the initial placement of the player
        "row": 5,
        "col": 3,
    },
    CELL = {                    // size of a cell in a grid 
        "height": 171,
        "width": 101
    },
    CANVAS = {
        "height": 606,          // size of the grid
        "width": 505
    };

var isKeyPressAllowed = true;

function validPos (nextMove, boundaries) {
    /*  This function detects if the next move is within the boundaries of the grid.
     *  It returns true if the coordinates of the next move are within the boundaries,
     *  false otherwise.
     */
    var isValidPos = false;
    if (nextMove >= boundaries[0] && nextMove <= boundaries[1])  // next move's coordinates are within the boundaries
        isValidPos = true;
    return isValidPos;
}

function validEnemyPosX (nextMove) {
    /* This function detects if the coordinates of an enemy are within the boundaries of the grid;
     *  it returns true if it is inside the boundaries, false otherwise.
     * Input:
     *      nextMove - the enemy's next position (coordinates) on the grid
     */
    return validPos (nextMove, [-10, 506]);
}

function validPosX (nextMove) {
    /* This function detects if the x-coordinate of the next move is within the horizontal
     * limits of a grid.  True if the coordinates is within the limit, false otherwise.
     *  Input:
     *      nextMove - coordinates of the next move
     */
    return validPos (nextMove, [-10, 405]);
}

function validPosY (nextMove) {
    /* This function detects if the y-coordinate of the next move is within the vertical
     * limits of a grid
     *
     * Input:
     *     nextMove - coordinates of the next move
     */
    return validPos (nextMove, [-110, 406]);
}

function getRandomRow (offset) {
    /* This function gets a random row number specifically for
     *  the placement of an enemy object.
     * Input:
     *      offset [optional] - an integer value deviating from the
     *          actual row number
     */
    var _offset = 0;
    if (offset !== undefined && typeof(offset) === "number")
        _offset = offset;
    return Math.floor (Math.random () * (ROWS + _offset)) + 1;
}

function getRandomCol (offset) {
    /* This function gets a random column number specifically for
     * the random placement of an enemy object.
     * offset [optional] - an integer value deviating from the
     * actual column number
     */
    var _offset = 0;
    if (offset !== undefined && typeof(offset) === "number")
        _offset = offset;
    return Math.floor (Math.random () * (COLS + _offset)) + 1;
}

function isWithinRange (coords, region) {
    /* This function tests to see if a point is located within
     *  the region.  It returns true if the point is within the
     *  region, false otherwise.
     *      Input:
     *          coords - coordinates of the point
     *          region - area that is being compared to point
     */

    var withinRange = false;

    if ((coords.x >= region[0].x) && (coords.y >= region[0].y))
        if ((coords.x <= region[1].x) && (coords.y <= region[1].y)) {
            withinRange = true;
        }

    return withinRange;
}

// Object for any move-able character
var Character = function (x, y, step, sprite) {
    this.x = x;
    this.y = y;
    this.step = step;
    this.sprite = sprite
};

Character.prototype.render = function () {
    /* This method render the object on the canvas, a required method for game
     * Input: None
     */
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Enemies our player must avoid
var Enemy = function() {
    /* Variables applied to each of our instances go here,
     *  we've provided one for you to get started
     *  The image/sprite for our enemies, this uses
     *  a helper we've provided to easily load images
     */
    var step = {
        "x": CELL.width,
        "y": parseInt (CELL.height / 2.0)
    };
    this.speed = 0.6 + (Math.random () * 0.8);
    Character.call(this, 0, 0, step, "images/enemy-bug.png");
};

Enemy.prototype = Object.create (Character.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    var nextMove = this.x + (this.speed * dt * this.step.x);
    var playerCoords = { "x": -1000, "y": -1000 };   // assigning playerCoords to dummy coordinates
    var colliding = false;

    if (nextMove < 0 || validEnemyPosX(nextMove)) {      // 101 x 171 is the dimension of enemy-bug.png

        this.x = nextMove;
        var enemyCoords = { "x": this.x, "y": this.y };
        if (player !== undefined && typeof(player) === "object") {
            playerCoords = { "x": player.x, "y": player.y };
            colliding = this.isColliding(playerCoords);
        }
        if (colliding) {
            isKeyPressAllowed = false;
            player.reset();
        }
    }
    else
        this.reset();
};

Enemy.prototype.reset = function () {
    /*
     * This method resets an enemy position
     */
    this.x = getRandomCol() * -this.step.x + ENEMIES_POS_OFFSET.x; // this.step.x;
    this.y = getRandomRow(-2) * this.step.y + ENEMIES_POS_OFFSET.y; // * this.step.y;
    this.speed = 0.6 + (Math.random () * 0.8);
};

Enemy.prototype.isColliding = function (withYourCoord) {
    /* This function detects if an enemy is colliding with an object
     *  It will return true if a collision is detected, else it
     *  will return false.
     *  Input:
     *      obj - the top-left coordinates of an object
     *
     */

    var collide = false;
    var me = new Array (4),
        you = new Array (4);

    // defining the coordinates of the grid containing object-1
    me[0] = {
        "x": this.x,
        "y": this.y + 1
    };
    me[1] = {
        "x": this.x + parseInt(CELL.width),
        "y": this.y + 1
    };
    me[2] = {
        "x": this.x,
        "y": this.y + parseInt (CELL.height / 2.0 - 1)
    };
    me[3] = {
        "x": this.x + CELL.width,
        "y": this.y + parseInt (CELL.height / 2.0 - 1)
    };

    you[0] = {
        "x": withYourCoord.x,
        "y": withYourCoord.y
    };
    you[1] = {
        "x": withYourCoord.x + parseInt (CELL.width),
        "y": withYourCoord.y
    };
    you[2] = {
        "x": withYourCoord.x,
        "y": withYourCoord.y + parseInt (CELL.height / 2.0)
    };
    you[3] = {
        "x": withYourCoord.x + CELL.width,
        "y": withYourCoord.y + parseInt (CELL.height / 2.0)
    };

    for (var i = 0, len = me.length; i < len; i++) {
        if (isWithinRange (me[i], [ you[0], you[3] ])) {
            collide = true;
            break;
        }
    }

    return collide;

};


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function () {
    var step = { "x": CELL.width, "y": parseInt (CELL.height / 2.0) };
    Character.call(this,
                    step.x * PLAYER_INIT.col + PLAYER_POS_OFFSET.x,
                    step.y * PLAYER_INIT.row + PLAYER_POS_OFFSET.y,
                    step,
                    "images/char-boy.png");
}

Player.prototype = Object.create (Character.prototype);
Player.prototype.constructor = Player;


Player.prototype.update = function () {
    if (this.y < -10) {
        ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
        this.reset();
    }
}

// This method resets the player's position
Player.prototype.reset = function () {
    this.x = this.step.x * PLAYER_INIT.col + PLAYER_POS_OFFSET.x;
    this.y = this.step.y * PLAYER_INIT.row + PLAYER_POS_OFFSET.y;
    isKeyPressAllowed = true;
}

// This method handles the user's key input for controlling
//  the player's action
// Input:
//  keyCode - ascii code of the input key
Player.prototype.handleInput = function (keyCode) {

    if (isKeyPressAllowed) {
        switch (keyCode) {
            case 'left':
                var nextMove = this.x - this.step.x;
                if (validPosX(nextMove))
                    this.x = nextMove;
                this.render();
                break;
            case 'up':
                var nextMove = this.y - this.step.y;
                if (validPosY(nextMove))
                    this.y = nextMove;
                this.render();
                break;
            case 'right':
                var nextMove = this.x + this.step.x;
                if (validPosX(nextMove))
                    this.x = nextMove;
                this.render();
                break;
            case 'down':
                var nextMove = this.y + this.step.y;
                if (validPosY(nextMove))
                    this.y = nextMove;
                this.render();
                break;
        }
    }

};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = new Array (MAX_ENEMIES);
// Place the player object in a variable called player
var player = new Player ();

for (var i = 0; i < allEnemies.length; i++) {
    allEnemies[i] = new Enemy ();
    allEnemies[i]["x"] = getRandomCol() * -allEnemies[i].step.x + ENEMIES_POS_OFFSET.x; // this.step.x;
    allEnemies[i]["y"] = getRandomRow(-2) * allEnemies[i].step.y + ENEMIES_POS_OFFSET.y; // * this.step.y;
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
