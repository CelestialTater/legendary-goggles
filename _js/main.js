//Imports
const chalk = require("chalk")
const keypress = require("keypress")

//variable declaration
var map = [];
var battleMap = [];
var run = true;
var lastDirection = "";
var battling = false;
var battleEnding = false;
var enemyStarted = false;
var maxEnemyHealth = 5;
var enemyHealth = maxEnemyHealth;
var currentEnemy = "8";
var enemyY = 0;
var enemyX = 0;
var maxHealth = 10;
var health = maxHealth;
var spaceFiller = "";
var miss = "    ";
var enemyMiss = "";

//array to hold special characters. store the special character, then the desired color at the index after
var specialChars = ["8", chalk.blueBright]

/**
 * Prints an icon to the map
 * @param icon icon to draw
 * @param color color of icon
 * @param bg background color
 * @param y y-position
 * @param x x-position
 */
printIcon = (icon, color, bg, y, x) =>{
    if(specialChars.includes(icon)){
        map[y][x] = bg(icon)
        map[y][x] = specialChars[specialChars.indexOf(icon) + 1](map[y][x])
    }else{
        map[y][x] = bg(icon)
        map[y][x] = color(map[y][x])
    }

}  
/**
 * Draws the map on the console. Should be run after printing icons and during battles.
 */
drawMap = () =>{
    console.clear()
    if (!battling) {
        for(i of map){
            var string = ""
            for(o of i){
                string += o
            }
            string = chalk.bgGreen(string)
            string = chalk.green(string)
            console.log(string)
        }
        console.log("Dev coords: " + coords[0] + "," + coords[1])
        console.log(coords[1] + "," + coords[0])
    } else {
        //Creates battle interface
        battleMap = []
        battleMap.push(["\n"])
        battleMap.push([" "  + "[" + drawHealthBar(healthBar) + "]" + "    " + "[" + drawHealthBar(enemyHealthBar) + "]"])
        battleMap.push(["\n"])
        battleMap.push(["      @             " + currentEnemy])
        battleMap.push(["    " + miss + "          " + enemyMiss])
        battleMap.push(chalk.magentaBright(" --- Press Space to attack! ---"))
        
        for(i of battleMap){
            var string = ""
            for(o of i){
                string += o
            }
            string = chalk.green(string)
            console.log(string)
        }
    }
}
/**
 * Sleep function
 * @param time time in milliseconds
 */
sleep = (time) =>{
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Sets the enemy to attack after a certain amount of time
 */
enemyAttack = () =>{
    enemyStarted = true;
    return new Promise((resolve) => setTimeout(() => {

        if(battling && (enemyHealth >= 1)) {

            //Enemy has a 1 in 4 chance of missing
            if(Math.floor(Math.random() * 5) != 4) {
                health--
                healthBar[health] = chalk.bgBlack(" ")
                enemyMiss = ""
                if (health < 10) {
                    spaceFiller = " "
                }
                if (health <= 0) {
                    drawMap()
                    battleEnding = true
                    return new Promise((resolve) => setTimeout(() => {
                        battling = false
                        console.clear()
                        console.log(chalk.magentaBright("You Died. Control-C to exit."))
                        run = false
                    }, 2000));
                }
            } else {
                enemyMiss = "Miss"
            }

            //Call the enemy to attack again if the battle isnt over yet
            if(battling && !battleEnding) {
                enemyAttack()
            }
        }
        drawMap()
        
    }, 1000));
}


/**
 * Converts a health bar to a string
 * @param bar bar to convert
 */
drawHealthBar = (bar) =>{
    let str = ""
    for(i of bar){
        str += i
    }
    return str
}

/**
 * Generates a health bar
 * @param len the size of the health bar (aka: max health)
 */
generateHealthBar = (len) =>{
    var bar = []
    for(i = 0; i < len; i++){
        bar.push(chalk.bgWhite(" "))
    }
    return bar
}

/**
 * Allows the character to battle an NPC
 * @param key key that triggered battle function
 */
battle = (key) =>{
    if (!battleEnding) {
        switch (key) {
            case "space":

                //Player has a 1 in 6 chance of missing
                if(Math.floor(Math.random() * 7) != 6) {
                    enemyHealth--
                    enemyHealthBar[enemyHealth] = chalk.bgBlack(" ")
                    miss = "    "
                    if (enemyHealth <= 0) {
                        drawMap()

                        //Reset the battle, remove defeated enemy from map and eventLocations, and move onto the tile
                        battleEnding = true
                        eventLocations.splice(eventLocations.indexOf(enemyY + ", " + enemyX), 1)
                        map[enemyY][enemyX] = chalk.bgBlack(".")
                        return new Promise((resolve) => setTimeout(() => {
                            battling = false;
                            revealMap(lastDirection);
                            enemyHealth = maxEnemyHealth;
                            enemyHealthBar = generateHealthBar(5)
                            enemyStarted = false;
                            battleEnding = false;
                        }, 2000));
                    }
                } else {
                    miss = "Miss"
                }
                break;
        
            default:
                break;
        }
    }

    drawMap()
}

var eventLocations = []
/**
 * Generates a map with events in random positions
 * @param floor (currently no use, will affect generation in future). defaults to 1
 */
generateMap = (floor = 1) =>{
    //TODO: Add floors and differences between floors
    switch(floor){
        case 1:
            for(var arr = 0; arr < 15; arr++){
                var str = []
                for(var chr = 0; chr < 20; chr++){
                    str.push(".")
                }
                map.push(str);
            }
            for(var scc = 0; scc < 10; scc++){
                let randY = Math.floor(Math.random() * 15)
                let randX = Math.floor(Math.random() * 20)
                if (map[randY][randX] == "8"){
                    scc--;
                }else{
                    map[randY][randX] = "8"
                    eventLocations.push(randY + ", " + randX) 
                }
               
            }
            break;
        default:
            console.log("Error: generateMap invalid input")
    }
}

/**
 * Reveals appropriate map tiles
 * @param direction direction of movement
 */
revealMap = (direction) =>{
    if (!battling) {
        lastDirection = direction;
        switch(direction){
            case "up":
                if (!eventLocations.includes(coords[0] - 1 + ", " + coords[1])) {
                    if(coords[0] != 0){
                        printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1])
                        coords[0]--
                        if(coords[0] == 0){
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])  
                            drawMap()
                        }else if(coords[1] == map[0].length - 1){
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])  
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawMap()
                        }else{
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawMap()
                        }
                    }
                } else {
                    battling = true;
                    enemyY = coords[0] - 1
                    enemyX = coords[1]
                    drawMap(); 
                    if (!enemyStarted) {
                        enemyAttack();
                    }
                }
                break;
            case "down":
                if (!eventLocations.includes(coords[0] + 1 + ", " + coords[1])) {
                    if(coords[0] != map.length - 1){
                        printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1])
                        coords[0]++
                        if(coords[0] == map.length - 1){
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawMap()
                        }else if(coords[1] == map[0].length - 1){
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])  
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1]) 
                            drawMap()
                        }else{
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawMap()
                        }
                        
                    }
                } else {
                    battling = true;
                    enemyY = coords[0] + 1
                    enemyX = coords[1]
                    drawMap();
                    if (!enemyStarted) {
                        enemyAttack();
                    }
                }
                break;
            case "left":
                if (!eventLocations.includes(coords[0] + ", " + (coords[1] - 1))) {
                    if(coords[1] != 0){
                        printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1])
                        coords[1]--
                        if(coords[0] == 0){
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])   
                            drawMap()
                        }else if(coords[0] == map.length - 1){
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawMap()
                        }else{
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawMap()
                        }
                    }
                } else {
                    battling = true;
                    enemyY = coords[0]
                    enemyX = (coords[1] - 1)
                    drawMap();
                    if (!enemyStarted) {
                        enemyAttack();
                    }
                }
                break;
            case "right":
                if (!eventLocations.includes(coords[0] + ", " + (coords[1] + 1))) {
                    if(coords[1] != map[0].length - 1){
                        printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1])
                        coords[1]++
                        if(coords[1] == map[0].length - 1){
                            if(coords[0] == 0){
                                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                                drawMap()
                            }else if(coords[0] == map.length - 1){
                                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                                drawMap()
                            }else{
                                printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                                printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])  
                                printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                                printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                                printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1]) 
                                drawMap()
                            }
                        }else if(coords[0] == map.length - 1){ 
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            
                            drawMap()  
                        }else if(coords[0] == 0){
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawMap()
                        }else{
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawMap()
                        }
                    }
                } else {
                    battling = true;
                    enemyY = coords[0]
                    enemyX = (coords[1] + 1)
                    drawMap();
                    if (!enemyStarted) {
                        enemyAttack();
                    }
                }
                break;
            default:
                console.log(chalk.magentaBright("Use the arrow keys to move!"));
                break;
        }
    }
}

generateMap()
var healthBar = generateHealthBar(maxHealth)
var enemyHealthBar = generateHealthBar(maxEnemyHealth)
let randomY = Math.floor(Math.random() * map.length - 1)
let randomX = Math.floor(Math.random() * map[0].length - 1)
if(randomY <= 0){
    randomY++
}
if(randomX <= 0){
    randomX++
}
if(randomX == 19){
    randomX--
}
let coords = [randomY, randomX]
printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
revealMap("right")
drawMap()

//Key listeners and coordinate updates based on the movement.
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', function (ch, key) {
    if (run) {
        if (!battling) {
            revealMap(key.name)
            //stops taking input for 1/10th of a second, then re-enables input. This limits input speed and reduces flashing.
            process.stdin.pause()
            sleep(100).then(() => {
            if(run){
                process.stdin.resume()
            } 
        })
        } else {
            battle(key.name)
        }
    }
    //stops game.
    if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
        run = false;
        battling = false;
    }
}
);
