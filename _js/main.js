//Imports
const chalk = require("chalk")
const keypress = require("keypress")
const func = require("./funcs")

//Variable declaration
var introStep = 0;
var map = [];
var battleInterface = [];
var inventoryInterface = [];
var run = false;
var lastDirection = "";
var accessingInventory = false;
var inventory = {
    meat:[3, "Meat", "1", "Regenerates 1 point of health."]
};
var amountUsing = 1;
var itemUsing = "Meat";
var inventoryLevel = 0;
var inventoryString = "";
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
drawUI = () =>{
    if (run) {
        console.clear()
        console.log("Health: " + health)
        if (!battling && !accessingInventory) {
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
        } else if (battling && !accessingInventory) {
            //Creates battle interface
            battleInterface = []
            battleInterface.push(["\n"])
            battleInterface.push([" "  + "[" + func.drawHealthBar(healthBar) + "]" + "    " + "[" + func.drawHealthBar(enemyHealthBar) + "]"])
            battleInterface.push(["\n"])
            battleInterface.push(["      @             " + currentEnemy])
            battleInterface.push(["    " + miss + "          " + enemyMiss])
            battleInterface.push(chalk.magentaBright(" --- Press Space to attack! ---"))

            for(i of battleInterface){
                var string = ""
                for(o of i){
                    string += o
                }
                string = chalk.green(string)
                console.log(string)
            }
        } else {
            //Creates inventory interface
            updateInventoryInterface()
            for (i of inventoryInterface) {
                var string = ""
                for (o of i) {
                    string += o
                }
                string = chalk.green(string)
                console.log(string)
            }
        }
    }
}

/**
 * Creates the inventory screen
 */
updateInventoryInterface = () =>{
    inventoryInterface = []
    if (inventoryLevel == 0) {
        inventoryInterface.push("Inventory")
        inventoryInterface.push("")
        for (let item of Object.keys(inventory)) {
            inventoryString = inventory[item.toString()][0] + "x ";
            inventoryString = inventoryString + inventory[item.toString()][1];
            inventoryString = inventoryString + " [" + inventory[item.toString()][2] + "]";
            inventoryInterface.push(inventoryString)
            inventoryInterface.push(inventory[item.toString()][3])
            inventoryInterface.push("")
        }
    } else {
        inventoryInterface.push("Using " + amountUsing + "/" + inventory[itemUsing][0] + " " + itemUsing)
        inventoryInterface.push("")
        inventoryInterface.push("Press up and down arrows to change amount using, press enter to confirm")
    }
}

/**
 * Lets the user look at and use items in their inventory
 */
useInventory = (key, ch) =>{

    if (key != null && key.name == "escape") {
        ch = "escape";
    }

    if (inventoryLevel == 0) {

        switch (ch) {
            case "1":
                if (inventory["meat"][0] >= 1) {
                    itemUsing = "meat"
                    inventoryLevel = 1
                    drawUI()
                }
                break;

            case "escape":
                accessingInventory = false;
                drawUI()

            default:
                break;
        }

    } else {

        switch (key.name) {
            case "up":
                if ((amountUsing + 1) <= inventory[itemUsing][0]) {
                    amountUsing++;
                    drawUI();
                }
                break;

            case "down":
                if ((amountUsing - 1) >= 1) {
                    amountUsing--;
                    drawUI();
                }
                break;

            case "return":
                inventory[itemUsing][0] -= amountUsing;
                useItem();
                break;

            case "escape":
                inventoryLevel = 0;
                drawUI()
        
            default:
                break;
        }
    }
}

/**
 * Consumes items and activates effects of said items
 */
useItem = () =>{
    switch (itemUsing) {
        case "meat":
            
            if (amountUsing + health <= maxHealth) {
                health += amountUsing;
                inventoryLevel = 0;
                drawUI();
            } else {
                health = maxHealth;
                inventoryLevel = 0;
                drawUI();
                console.log(chalk.magentaBright("What a waste of food..."))
            }

            amountUsing = 0;

            break;
    
        default:
            break;
    }
}

/**
 * Sets the enemy to attack after a certain amount of time
 */
enemyAttack = () =>{
    healthBar = func.generateHealthBar(maxHealth, health);
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
                    drawUI()
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
        drawUI()
        
    }, 1000));
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
                if (Math.floor(Math.random() * 7) != 6) {
                    enemyHealth--
                    enemyHealthBar[enemyHealth] = chalk.bgBlack(" ")
                    miss = "    "
                    if (enemyHealth <= 0) {
                        drawUI()

                        //Give items to player
                        if (Math.floor(Math.random() * 5) != 4) {
                            inventory["meat"][0]++;
                        }

                        //Reset the battle, remove defeated enemy from map and eventLocations, and move onto the tile
                        battleEnding = true
                        eventLocations.splice(eventLocations.indexOf(enemyY + ", " + enemyX), 1)
                        map[enemyY][enemyX] = chalk.bgBlack(".")
                        return new Promise((resolve) => setTimeout(() => {
                            battling = false;
                            revealMap(lastDirection);
                            enemyHealth = maxEnemyHealth;
                            enemyHealthBar = func.generateHealthBar(5)
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

    drawUI()
}

/**
 * Reveals appropriate map tiles
 * @param direction direction of movement
 */
revealMap = (direction) => {
    if (!battling && !accessingInventory) {
        lastDirection = direction;
        switch(direction){
            case "up":
                if (!eventLocations.includes(coords[0] - 1 + ", " + coords[1])) {
                    if(coords[0] != 0){
                        printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1])
                        coords[0]--
                        if(coords[0] == 0){
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])  
                            drawUI()
                        }else if(coords[1] == map[0].length - 1){
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])  
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawUI()
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
                            drawUI()
                        }
                    }
                } else {
                    battling = true;
                    enemyY = coords[0] - 1
                    enemyX = coords[1]
                    drawUI(); 
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
                            drawUI()
                        }else if(coords[1] == map[0].length - 1){
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])  
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1]) 
                            drawUI()
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
                            drawUI()
                        }
                        
                    }
                } else {
                    battling = true;
                    enemyY = coords[0] + 1
                    enemyX = coords[1]
                    drawUI();
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
                            drawUI()
                        }else if(coords[0] == map.length - 1){
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawUI()
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
                            drawUI()
                        }
                    }
                } else {
                    battling = true;
                    enemyY = coords[0]
                    enemyX = (coords[1] - 1)
                    drawUI();
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
                                drawUI()
                            }else if(coords[0] == map.length - 1){
                                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                                drawUI()
                            }else{
                                printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                                printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])  
                                printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                                printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                                printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1]) 
                                drawUI()
                            }
                        }else if(coords[0] == map.length - 1){ 
                            printIcon(map[coords[0] - 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                            printIcon(map[coords[0] - 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            
                            drawUI()  
                        }else if(coords[0] == 0){
                            printIcon(map[coords[0] + 1][coords[1]], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                            printIcon(map[coords[0]][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                            printIcon(map[coords[0]][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                            printIcon(map[coords[0] + 1][coords[1] + 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                            printIcon(map[coords[0] + 1][coords[1] - 1], chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                            printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                            drawUI()
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
                            drawUI()
                        }
                    }
                } else {
                    battling = true;
                    enemyY = coords[0]
                    enemyX = (coords[1] + 1)
                    drawUI();
                    if (!enemyStarted) {
                        enemyAttack();
                    }
                }
                break;

            case "i":
                
                accessingInventory = true;
                inventoryLevel = 0;
                itemsUsing = 0;
                drawUI();

                break;

            default:
                console.log(chalk.magentaBright("Use the arrow keys to move!"));
                break;
        }
    }
}

/**
 * Animation for the beginning of the game
 */
playIntro = () =>{
    switch (true) {
        case (introStep == 0):

            console.clear()
            console.log(chalk.rgb(193, 156, 0)(String.raw`  _                                    _                     `))
            console.log(chalk.rgb(193, 156, 0)(String.raw` | |                                  | |                    `))
            console.log(chalk.rgb(193, 156, 0)(String.raw` | |      ___   __ _   ___  _ __    __| |  __ _  _ __  _   _ `))
            console.log(chalk.rgb(193, 156, 0)(String.raw` | |     / _ \ / _' | / _ \| '_ \  / _' | / _' || '__|| | | |`))
            console.log(chalk.rgb(193, 156, 0)(String.raw` | |____|  __/| (_| ||  __/| | | || (_| || (_| || |   | |_| |`))
            console.log(chalk.rgb(193, 156, 0)(String.raw` |______|\___| \__, | \___||_| |_| \__,_| \__,_||_|    \__, |`))
            console.log(chalk.rgb(193, 156, 0)(String.raw`                __/ |                                   __/ |`))
            console.log(chalk.rgb(193, 156, 0)(String.raw`               |___/                                   |___/ `))
            console.log(chalk.rgb(193, 156, 0)(String.raw`           _____                       _                     `))
            console.log(chalk.rgb(193, 156, 0)(String.raw`          / ____|                     | |                    `))
            console.log(chalk.rgb(193, 156, 0)(String.raw`         | |  __   ___    __ _   __ _ | |  ___  ___          `))
            console.log(chalk.rgb(193, 156, 0)(String.raw`         | | |_ | / _ \  / _' | / _' || | / _ \/ __|         `))
            console.log(chalk.rgb(193, 156, 0)(String.raw`         | |__| || (_) || (_| || (_| || ||  __/\__ \         `))
            console.log(chalk.rgb(193, 156, 0)(String.raw`          \_____| \___/  \__, | \__, ||_| \___||___/         `))
            console.log(chalk.rgb(193, 156, 0)(String.raw`                          __/ |  __/ |                       `))
            console.log(chalk.rgb(193, 156, 0)(String.raw`                         |___/  |___/                        `))
            introStep++;
            return new Promise((resolve) => setTimeout(() => {playIntro();}, 3000));

            break;

        case (introStep < 11 && introStep > 0):
            console.clear()
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`  _                                    _                     `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw` | |                                  | |                    `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw` | |      ___   __ _   ___  _ __    __| |  __ _  _ __  _   _ `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw` | |     / _ \ / _' | / _ \| '_ \  / _' | / _' || '__|| | | |`))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw` | |____|  __/| (_| ||  __/| | | || (_| || (_| || |   | |_| |`))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw` |______|\___| \__, | \___||_| |_| \__,_| \__,_||_|    \__, |`))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`                __/ |                                   __/ |`))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`               |___/                                   |___/ `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`           _____                       _                     `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`          / ____|                     | |                    `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`         | |  __   ___    __ _   __ _ | |  ___  ___          `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`         | | |_ | / _ \  / _' | / _' || | / _ \/ __|         `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`         | |__| || (_) || (_| || (_| || ||  __/\__ \         `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`          \_____| \___/  \__, | \__, ||_| \___||___/         `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`                          __/ |  __/ |                       `))
            console.log(chalk.rgb(193 - ((introStep - 1) * 21), 156 - ((introStep - 1) * 17), 0)(String.raw`                         |___/  |___/                        `))
            introStep++;
            return new Promise((resolve) => setTimeout(() => {playIntro();}, 200));

            break;
        case (introStep == 11):
            
            introStep++;
            return new Promise((resolve) => setTimeout(() => {playIntro();}, 1750));

            break;

        case (introStep >= 12):

            console.clear()
            console.log("\n")
            console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
            console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
            console.log("     " + chalk.rgb(193, 156, 0)("@") + "    " + chalk.bgRgb(255, 255, 255)("  ") + " " + chalk.bgRgb(255, 255, 255)("  "))
            func.sleep(300).then(() =>{
                console.clear()
                console.log("\n")
                console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                console.log("     " + chalk.rgb(193, 156, 0)("@") + "    " + chalk.bgRgb(255, 255, 255)("  ") + " " + chalk.bgRgb(255, 255, 255)("  "))
                func.sleep(300).then(() =>{
                    console.clear()
                    console.log("\n")
                    console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                    console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                    console.log("      " + chalk.rgb(193, 156, 0)("@") + "   " + chalk.bgRgb(255, 255, 255)("  ") + " " + chalk.bgRgb(255, 255, 255)("  "))
                    func.sleep(300).then(() =>{
                        console.clear()
                        console.log("\n")
                        console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                        console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                        console.log("       " + chalk.rgb(193, 156, 0)("@") + "  " + chalk.bgRgb(255, 255, 255)("  ") + " " + chalk.bgRgb(255, 255, 255)("  "))
                        func.sleep(300).then(() =>{
                            console.clear()
                            console.log("\n")
                            console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                            console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                            console.log("        " + chalk.rgb(193, 156, 0)("@") + " " + chalk.bgRgb(255, 255, 255)("  ") + " " + chalk.bgRgb(255, 255, 255)("  "))
                            func.sleep(300).then(() =>{
                                console.clear()
                                console.log("\n")
                                console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                                console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                                console.log("          " + chalk.bgRgb(255, 255, 255)(chalk.rgb(193, 156, 0)("@ ")) + " " + chalk.bgRgb(255, 255, 255)("  "))
                                func.sleep(300).then(() =>{
                                    console.clear()
                                    console.log("\n")
                                    console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                                    console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                                    console.log("          " + chalk.bgRgb(255, 255, 255)(chalk.rgb(193, 156, 0)(" @")) + " " + chalk.bgRgb(255, 255, 255)("  "))
                                    func.sleep(300).then(() =>{
                                        console.clear()
                                        console.log("\n")
                                        console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                                        console.log("          " + chalk.bgRgb(255, 255, 255)("     "))
                                        console.log("          " + chalk.bgRgb(255, 255, 255)("  ") + chalk.rgb(193, 156, 0)("@") + chalk.bgRgb(255, 255, 255)("  "))
                                        func.sleep(150).then(() =>{
                                            console.clear()
                                            console.log("\n")
                                            console.log("          " + chalk.bgRgb(230, 230, 230)("     "))
                                            console.log("          " + chalk.bgRgb(230, 230, 230)("     "))
                                            console.log("          " + chalk.bgRgb(230, 230, 230)("  ") + chalk.rgb(173, 140, 0)("@") + chalk.bgRgb(230, 230, 230)("  "))
                                            func.sleep(150).then(() =>{
                                                console.clear()
                                                console.log("\n")
                                                console.log("          " + chalk.bgRgb(205, 205, 205)("     "))
                                                console.log("          " + chalk.bgRgb(205, 205, 205)("     "))
                                                console.log("          " + chalk.bgRgb(205, 205, 205)("  ") + chalk.rgb(153, 125, 0)("@") + chalk.bgRgb(205, 205, 205)("  "))
                                                func.sleep(150).then(() =>{
                                                    console.clear()
                                                    console.log("\n")
                                                    console.log("          " + chalk.bgRgb(180, 180, 180)("     "))
                                                    console.log("          " + chalk.bgRgb(180, 180, 180)("     "))
                                                    console.log("          " + chalk.bgRgb(180, 180, 180)("  ") + chalk.rgb(133, 110, 0)("@") + chalk.bgRgb(180, 180, 180)("  "))
                                                    func.sleep(150).then(() =>{
                                                        console.clear()
                                                        console.log("\n")
                                                        console.log("          " + chalk.bgRgb(155, 155, 155)("     "))
                                                        console.log("          " + chalk.bgRgb(155, 155, 155)("     "))
                                                        console.log("          " + chalk.bgRgb(155, 155, 155)("  ") + chalk.rgb(113, 95, 0)("@") + chalk.bgRgb(155, 155, 155)("  "))
                                                        func.sleep(150).then(() =>{
                                                            console.clear()
                                                            console.log("\n")
                                                            console.log("          " + chalk.bgRgb(130, 130, 130)("     "))
                                                            console.log("          " + chalk.bgRgb(130, 130, 130)("     "))
                                                            console.log("          " + chalk.bgRgb(130, 130, 130)("  ") + chalk.rgb(93, 80, 0)("@") + chalk.bgRgb(130, 130, 130)("  "))
                                                            func.sleep(150).then(() =>{
                                                                console.clear()
                                                                console.log("\n")
                                                                console.log("          " + chalk.bgRgb(105, 105, 105)("     "))
                                                                console.log("          " + chalk.bgRgb(105, 105, 105)("     "))
                                                                console.log("          " + chalk.bgRgb(105, 105, 105)("  ") + chalk.rgb(73, 65, 0)("@") + chalk.bgRgb(105, 105, 105)("  "))
                                                                func.sleep(150).then(() =>{
                                                                    console.clear()
                                                                    console.log("\n")
                                                                    console.log("          " + chalk.bgRgb(80, 80, 80)("     "))
                                                                    console.log("          " + chalk.bgRgb(80, 80, 80)("     "))
                                                                    console.log("          " + chalk.bgRgb(80, 80, 80)("  ") + chalk.rgb(53, 50, 0)("@") + chalk.bgRgb(80, 80, 80)("  "))
                                                                    func.sleep(150).then(() =>{
                                                                        console.clear()
                                                                        console.log("\n")
                                                                        console.log("          " + chalk.bgRgb(55, 55, 55)("     "))
                                                                        console.log("          " + chalk.bgRgb(55, 55, 55)("     "))
                                                                        console.log("          " + chalk.bgRgb(55, 55, 55)("  ") + chalk.rgb(33, 33, 0)("@") + chalk.bgRgb(55, 55, 55)("  "))
                                                                        func.sleep(150).then(() =>{
                                                                            console.clear()
                                                                            console.log("\n")
                                                                            console.log("          " + chalk.bgRgb(30, 30, 30)("     "))
                                                                            console.log("          " + chalk.bgRgb(30, 30, 30)("     "))
                                                                            console.log("          " + chalk.bgRgb(30, 30, 30)("  ") + chalk.rgb(13, 15, 0)("@") + chalk.bgRgb(30, 30, 30)("  "))
                                                                            func.sleep(150).then(() =>{
                                                                                console.clear()
                                                                                console.log("\n")
                                                                                console.log("          " + chalk.bgBlack("     "))
                                                                                console.log("          " + chalk.bgBlack("     "))
                                                                                console.log("          " + chalk.bgBlack("  ") + chalk.black("@") + chalk.bgBlack("  "))
                                                                                func.sleep(150).then(() =>{
                                                                                    run = true;
                                                                                    revealMap("right");
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })

            break;

        default:
            console.log("Error: Invalid introStep of " + introStep);
            break;
    }
    
}


playIntro()
var map = func.generateMap()
var eventLocations = func.getEvents(map)
var healthBar = func.generateHealthBar(maxHealth)
var enemyHealthBar = func.generateHealthBar(maxEnemyHealth)
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

//Key listeners and coordinate updates based on the movement.
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', function (ch, key) {
    if (run) {
        if (!battling && !accessingInventory) {
            revealMap(key.name)
            //stops taking input for 1/10th of a second, then re-enables input. This limits input speed and reduces flashing.
            process.stdin.pause()
            func.sleep(100).then(() => {
            if(run){
                process.stdin.resume()
            } 
        })
        } else if (battling && !accessingInventory) {
            battle(key.name)
        } else if (!battling && accessingInventory) {
            useInventory(key, ch)
        } else {
            drawUI();
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
