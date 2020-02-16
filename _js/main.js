//Imports
const chalk = require("chalk")
const window = require("window-size")
const keypress = require("keypress")
const crypto = require("crypto-js")
const cp = require("copy-paste")
const compression = require("js-string-compression")
const func = require("./funcs")

var compressor = new compression.Hauffman();

//Variable declaration
var gameRunner = null;
var paused = false;
var saving = false;
var loading = false;
var pauseMenu = [];
pauseMenu.push(chalk.magentaBright("Game Paused"));
pauseMenu.push("");
pauseMenu.push("Save [1]");
pauseMenu.push("");
pauseMenu.push("Load [2]");
pauseMenu.push("");
pauseMenu.push("Press escape to return to game");
var savedInformation = [];
var introStep = 0;
var playingIntro = true;
var map = [];
var coords = [];
var keyInterface = [];
var usingKey = false;
var buildings = [];
var buildingEvents = [];
var eventY = 0;
var eventX = 0;
var lastMap = [];
var enteredBuildingFrom = [];
var currentBuildingCoords = [];
var inBuilding = false;
var floor = 0;
var highestFloor = 1;
var battleInterface = [];
var inventoryInterface = [];
var run = false;
var gameEnded = false;
var lastDirection = "";
var accessingInventory = false;
var inventory = {
    meat:[99, "Meat", "1", "Regenerates 1 point of health."],
    goggles:[99, "Goggles", "8", "Reveals entire map. 1 use."],
    rareGoggles:[99, "Rare Goggles", "9", "Reveals hidden objects and passageways. 1 use."],
    key:[99, "Key", null, "Opens a door"]
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
var saveString = "";

//array to hold special characters. store the special character, then the desired color at the index after
var specialChars = ["8", chalk.blueBright, "[", chalk.redBright, "~", chalk.rgb(51, 51, 255), "}", chalk.cyanBright, "X", chalk.grey, "-", chalk.red, "$", chalk.yellowBright]

/**
 * Saves and encrypts data
 * @param key the key that is pressed
 */
save = (key) => {
    saving = true;
    saveString = "";
    saveString += map
    saveString += ":"
    saveString += coords[0]
    saveString += ":"
    saveString += coords[1]
    saveString += ":"
    saveString += buildings
    saveString += ":"
    saveString += floor
    saveString += ":"
    saveString += inventory
    saveString += ":"
    saveString += health
    saveString = compressor.compress(saveString);
    saveString = crypto.AES.encrypt(saveString, "SaveString").toString();
    console.clear();
    console.log(chalk.magentaBright("Press c to copy your save"));
    if (key == "c") {
        cp.copy(saveString);
        return new Promise((resolve) => setTimeout(() => {
            console.clear();
            console.log(chalk.magentaBright("Successfully copied save - press escape to return to the pause menu"));
        }, 500));
    } else if (key == "escape") {
        saving = false;
        drawUI();
    }
}

/**
 * Decrypts and loads data
 * @param key the key that is pressed
 */
load = (key) => {
    loading = true;
    console.clear();
    console.log("Please paste your save: " + saveString);
    if (key == "return") {
        if (saveString != "") {
            saveString = crypto.AES.decrypt(saveString, "SaveString");
            saveString = saveString.toString(crypto.enc.Utf8);
            savedInformation = saveString.split(":");
            //map = savedInformation[0];
            coords[0] = parseInt(savedInformation[1]);
            coords[1] = parseInt(savedInformation[2]);
            //buildings = savedInformation[3];
            floor = parseInt(savedInformation[4]);
            //inventory = savedInformation[5];
            health = parseInt(savedInformation[6]);
            loading = false;
            paused = false;
            run = true;
            drawUI();
            console.log(savedInformation[5]);
        }
    } else if (key == "escape") {
        loading = false;
        drawUI();
    }
}

/**
 * Lets the user save or load their game
 * @param key the key that is pressed
 */
saveMenu = (key) => {
    paused = true;

    if (!saving && !loading) {
        drawUI();
        switch (key) {
            case "1":
                save(null);
                break;

            case "2":
                load(null);
                break;

            case "escape":
                paused = false;
                drawUI();
                break;
        
            default:
                break;
        }
    } else if (saving) {
        save(key);
    } else if (loading) {
        load(key);
    }
}

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
 * Draws the map on the console. Should be run after printing icons and during battles, or after loading a save
 */
drawUI = () =>{
    if (run) {

        //Creates the map
        console.clear()
        if (!paused && !battling && !accessingInventory && !usingKey) {
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

        } else if (!paused && battling && !accessingInventory && !usingKey) {
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
        } else if (!paused && usingKey) {
            updateKeyInterface();
            for(i of keyInterface){
                var string = ""
                for(o of i){
                    string += o
                }
                string = chalk.green(string)
                console.log(string)
            }
        } else if (paused && !saving && !loading) {
            for(i of pauseMenu) {
                var string = ""
                for(o of i) {
                    string += o
                }
                string = chalk.green(string)
                console.log(string)
            } 
        } else if (accessingInventory) {
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
            if (inventory[item.toString()][0] > 0) {
                inventoryString = inventory[item.toString()][0] + "x "
                inventoryString = inventoryString + inventory[item.toString()][1]
                if(inventory[item.toString()][2] != null) {
                    inventoryString = inventoryString + " [" + inventory[item.toString()][2] + "]";
                }
                inventoryInterface.push(inventoryString)
                inventoryInterface.push(inventory[item.toString()][3])
                inventoryInterface.push("")
            }
        }
        if (inventoryInterface.length <= 2) {
            inventoryInterface.push("Your inventory is empty. Go find some stuff!");
        }
    } else {
        inventoryInterface.push("Using " + amountUsing + "/" + inventory[itemUsing][0] + " " + inventory[itemUsing][1].toLowerCase());
        inventoryInterface.push("")
        if (inventory[itemUsing][0] > 1) {
            inventoryInterface.push("Press up and down arrows to change amount using, press enter to confirm, press escape to cancel")
        } else {
            inventoryInterface.push("Press enter to confirm, press escape to cancel")
        }
    }
}

/**
 * Lets the user look at and use items in their inventory
 */
useInventory = (ch) =>{

    if (inventoryLevel == 0) {

        switch (ch) {
            case "1":
                if (inventory["meat"][0] >= 1) {
                    itemUsing = "meat"
                    inventoryLevel = 1
                    drawUI()
                }
                break;

            case "8":
                if (inventory["goggles"][0] >= 1) {
                    itemUsing = "goggles"
                    inventoryLevel = 1
                    drawUI()
                }
                break;

            case "9":
                if (inventory["rareGoggles"][0] >= 1) {
                    itemUsing = "rareGoggles"
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

        switch (ch) {
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
                amountUsing = 1;
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

            amountUsing = 1;
            healthBar = func.generateHealthBar(maxHealth, health);

            break;

        case "goggles":

            reveal()
            inventoryLevel = 0
            drawUI()
            amountUsing = 1

            break;

        case "rareGoggles":

            reveal()
            inventoryLevel = 0
            drawUI()
            amountUsing = 1

            break;
    
        default:
            break;
    }
}

/**
 * Generates and reveals special tiles, or automatically reveals the entire map
 */
reveal = () =>{
    switch (itemUsing) {

        case "goggles":
            
            //Reveals entire map
            for(i = 0; i < map.length; i++) {
                for(o = 0; o < map[0].length; o++) {
                    printIcon(map[i][o], chalk.green, chalk.bgBlack, i, o)
                }
            }
            drawUI();
            break;

        case "rareGoggles":


            //Floor specific items
            for (var gen = 0; gen < 1; gen++) {
                if (floor == 0) {
                    let randY = Math.floor(Math.random() * map.length)
                    let randX = Math.floor(Math.random() * map[0].length)
                    if (map[randY][randX] == "@"){
                        gen--;
                    } else {
                        map[randY][randX] = chalk.bgBlack(chalk.rgb(51, 51, 255)("~"))
                        eventLocations.push(randY + ", " + randX)
                        eventLocations.push("~")
                    }
                }
            }


            //Creates and reveals exit
            for(var gen = 0; gen < 1; gen++){
                let randY = Math.floor(Math.random() * map.length)
                let randX = Math.floor(Math.random() * map[0].length)
                if (map[randY][randX] == "@" || map[randY][randX] == "~"){
                    gen--;
                } else {
                    map[randY][randX] = chalk.bgBlack(chalk.redBright("["))
                    eventLocations.push(randY + ", " + randX)
                    eventLocations.push("[")
                }
            }


            break;

        default:
            break;

    }
    drawUI()
}

/**
 * Handles events
 * 
 * @param coordY the Y coordinate of the event
 * @param coordX the X coordinate of the event
 */
handleEvent = (coordY, coordX) =>{
    eventY = coordY;
    eventX = coordX;
    if (!inBuilding) {

        if (eventLocations[eventLocations.indexOf(coordY + ", " + coordX) + 1] == "8") {
            battling = true;
            enemyY = coordY;
            enemyX = coordX;
            drawUI(); 
            if (!enemyStarted) {
                enemyAttack();
            }

        } else if (eventLocations[eventLocations.indexOf(coordY + ", " + coordX) + 1] == "~") {
            inventory["key"][0]++;
            eventLocations.splice(eventLocations.indexOf(coordY + ", " + coordX), 2);
            revealMap(lastDirection);

        } else if (eventLocations[eventLocations.indexOf(coordY + ", " + coordX) + 1] == "}") {
            enterBuilding(coordY, coordX);

        } else if (eventLocations[eventLocations.indexOf(coordY + ", " + coordX) + 1] == "[") {
            eventLocations.splice(eventLocations.indexOf(coordY + ", " + coordX), 2);
            nextLevel();
        }

    } else {
    
        if (buildingEvents[buildingEvents.indexOf(coordY + ", " + coordX) + 1] == "8") {
            battling = true;
            enemyY = coordY;
            enemyX = coordX;
            drawUI(); 
            if (!enemyStarted) {
                enemyAttack();
            }

        } else if (buildingEvents[buildingEvents.indexOf(coordY + ", " + coordX) + 1] == "}") {
            exitBuilding();

        } else if (buildingEvents[buildingEvents.indexOf(coordY + ", " + coordX) + 1] == "-") {
            usingKey = true;
            drawUI();

        } else if (buildingEvents[buildingEvents.indexOf(coordY + ", " + coordX) + 1] == "$") {
            inventory.goggles[0]++;
            buildingEvents.splice(buildingEvents.indexOf(coordY + ", " + coordX) + 1, 2);
            revealMap(lastDirection);
        }
    }
}

/**
 * Asks user if they want to use a key
 */
updateKeyInterface = () =>{
    keyInterface = [];
    
    if (inventory["key"][0] >= 1) {
        keyInterface.push("Would you like to use one of your keys to open this door?")
        keyInterface.push("")
        if (inventory["key"][0] == 1) {
            keyInterface.push("You have 1 key.")
        } else {
            keyInterface.push("You have " + inventory["key"][0] + " keys.")
        }
        keyInterface.push("")
        keyInterface.push("Press enter to confirm, press escape to cancel.")
    } else {
        keyInterface.push("You need a key to open this door.")
        keyInterface.push("")
        keyInterface.push("Press escape to exit")
    }
}

/**
 * Generates or loads building
 * 
 * @param coordY the main map y-coordinate of the building
 * @param coordX the main map x-coordinate of the building
 */
enterBuilding = (coordY, coordX) =>{
    //Stores necessary information from the main map
    enteredBuildingFrom = coords;
    lastMap = map;

    //Clears the map so that it can be changed to a building
    map = [];

    //Checks to see if building exists yet
    if (buildings.includes(coordY + ", " + coordX)) {
        //Finds the building and its events, and puts them into map and buildingEvents
        map = buildings[buildings.indexOf(coordY + ", " + coordX) + 1];
        buildingEvents = buildings[buildings.indexOf(coordY + ", " + coordX) + 2];
    } else {
        //Creates a building and events at the coordinates specified and adds it to buildings and map, and buildingEvents
        map = func.generateMap(-1);
        buildingEvents = func.getEvents(map);
        buildings.push(coordY + ", " + coordX);
        buildings.push(map);
        buildings.push(buildingEvents);
    }

    currentBuildingCoords = [coordY, coordX];

    //Moves the player to the correct location
    coords = [(map.length / 2) - 0.5, (map[0].length - 3)];
    inBuilding = true;

    revealMap("right");
}

/**
 * Exit the current building
 */
exitBuilding = () =>{
    //Save the current buildingEvents
    buildings[(buildings.indexOf(currentBuildingCoords[0] + ", " + currentBuildingCoords[1]) + 2)] = buildingEvents;

    //Exits building and restores the main map
    coords = enteredBuildingFrom;
    map = lastMap;
    inBuilding = false;
    drawUI();
}

/**
 * Makes a new map and changes level
 */
nextLevel = () =>{
    floor++;

    //Deletes buildings
    buildings = [];
    buildingEvents = [];
    currentBuildingCoords = [];

    console.clear()
    if (floor <= highestFloor) {
        map = func.generateMap(floor);
        eventLocations = func.getEvents(map);
        let randomY = Math.floor(Math.random() * map.length - 1)
        let randomX = Math.floor(Math.random() * map[0].length - 1)
        if(randomY <= 0){
            randomY++
        }
        if(randomX <= 0){
            randomX++
        }
        if(randomX == map.length - 1){
            randomX--
        }
        coords = [randomY, randomX]
        printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
        revealMap("right");
    } else {
        //Ends game
        console.log("Congratulations! You won!");
        introStep = 0;
        playingIntro = true;
        return new Promise((resolve) => setTimeout(() => {playIntro();}, 5000));     
    }
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
                    drawUI()
                    battleEnding = true
                    return new Promise((resolve) => setTimeout(() => {
                        battling = false
                        console.clear()
                        console.log(chalk.magentaBright("You Died."))
                        run = false
                        process.stdin.pause();
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
    healthBar = func.generateHealthBar(maxHealth, health);
    drawUI();
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
                        if (Math.floor(Math.random() * 4) != 3) {
                            inventory["meat"][0]++;
                        }

                        if (eventLocations.length <= 2 && floor == 0 && !inBuilding) {
                            inventory["rareGoggles"][0]++;
                        }

                        if (eventLocations.length <= 2 && floor == 1 && !inBuilding) {
                            inventory["rareGoggles"][0]++;
                        }

                        //Reset the battle, remove defeated enemy from map and eventLocations, and move onto the tile
                        battleEnding = true
                        if (inBuilding) {
                            buildingEvents.splice(buildingEvents.indexOf(enemyY + ", " + enemyX), 2)
                        } else {
                            eventLocations.splice(eventLocations.indexOf(enemyY + ", " + enemyX), 2)
                        }
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
            case "escape":
                saveMenu(null);
                break;

            case "up":
                if (((!eventLocations.includes((coords[0] - 1) + ", " + coords[1])) && inBuilding == false) || (!buildingEvents.includes((coords[0] - 1) + ", " + coords[1]) && inBuilding == true)) {
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
                    handleEvent(coords[0] - 1, coords[1])
                }
                break;
            case "down":
                if (((!eventLocations.includes((coords[0] + 1) + ", " + coords[1])) && inBuilding == false) || (!buildingEvents.includes((coords[0] + 1) + ", " + coords[1]) && inBuilding == true)) {
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
                    handleEvent(coords[0] + 1, coords[1])
                }
                break;
            case "left":
                if ((!eventLocations.includes(coords[0] + ", " + (coords[1] - 1)) && inBuilding == false) || (!buildingEvents.includes(coords[0] + ", " + (coords[1] - 1)) && inBuilding == true)) {
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
                    handleEvent(coords[0], coords[1] - 1)
                }
                break;
            case "right":
                if ((!eventLocations.includes(coords[0] + ", " + (coords[1] + 1)) && inBuilding == false) || (!buildingEvents.includes(coords[0] + ", " + (coords[1] + 1)) && inBuilding == true)) {
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
                    handleEvent(coords[0], coords[1] + 1)
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
    if (window.get().height != 30 && window.get().width != 120) {
        if(playingIntro) {
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

                    if (introStep != 10) {
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
                    } else {
                        console.log(chalk.black(String.raw`  _                                    _                     `))
                        console.log(chalk.black(String.raw` | |                                  | |                    `))
                        console.log(chalk.black(String.raw` | |      ___   __ _   ___  _ __    __| |  __ _  _ __  _   _ `))
                        console.log(chalk.black(String.raw` | |     / _ \ / _' | / _ \| '_ \  / _' | / _' || '__|| | | |`))
                        console.log(chalk.black(String.raw` | |____|  __/| (_| ||  __/| | | || (_| || (_| || |   | |_| |`))
                        console.log(chalk.black(String.raw` |______|\___| \__, | \___||_| |_| \__,_| \__,_||_|    \__, |`))
                        console.log(chalk.black(String.raw`                __/ |                                   __/ |`))
                        console.log(chalk.black(String.raw`               |___/                                   |___/ `))
                        console.log(chalk.black(String.raw`           _____                       _                     `))
                        console.log(chalk.black(String.raw`          / ____|                     | |                    `))
                        console.log(chalk.black(String.raw`         | |  __   ___    __ _   __ _ | |  ___  ___          `))
                        console.log(chalk.black(String.raw`         | | |_ | / _ \  / _' | / _' || | / _ \/ __|         `))
                        console.log(chalk.black(String.raw`         | |__| || (_) || (_| || (_| || ||  __/\__ \         `))
                        console.log(chalk.black(String.raw`          \_____| \___/  \__, | \__, ||_| \___||___/         `))
                        console.log(chalk.black(String.raw`                          __/ |  __/ |                       `))
                        console.log(chalk.black(String.raw`                         |___/  |___/                        `))
                        introStep++;
                    }
                    return new Promise((resolve) => setTimeout(() => {playIntro();}, 200));

                    break;
                case (introStep == 11 && floor == 0):
                    
                    introStep++;
                    return new Promise((resolve) => setTimeout(() => {playIntro();}, 1750));

                    break;

                case (introStep == 12 && floor == 0):

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
                                                    introStep++;
                                                    playIntro();
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })

                    break;

                    case (introStep >= 13 && introStep <= 22 && floor == 0):

                        var fade = (22 - introStep) / 10;
                        
                        console.clear()
                        console.log("\n")
                        console.log("          " + chalk.bgRgb(230 * fade, 230 * fade, 230 * fade)("     "))
                        console.log("          " + chalk.bgRgb(230 * fade, 230 * fade, 230 * fade)("     "))
                        console.log("          " + chalk.bgRgb(230 * fade, 230 * fade, 230 * fade)("  ") + chalk.rgb(173 * fade, 140 * fade, 0)("@") + chalk.bgRgb(230 * fade, 230 * fade, 230 * fade)("  "))
                        introStep++;

                        return new Promise((resolve) => setTimeout(() => {playIntro();}, 150));

                    case (introStep == 23 && floor == 0):

                        return new Promise((resolve) => setTimeout(() => {
                            run = true;
                            playingIntro = false;
                            revealMap("right");
                        }, 150));

                        break;

                    case (introStep == 11 && floor != 0):

                        //Ends program

                        run = false;
                        playingIntro = false;
                        clearInterval(gameRunner);
                        console.clear();
                        process.stdin.pause();

                        break;

                default:
                    console.log("Error: Invalid introStep of " + introStep + " for floor " + floor);
                    break;
            }
        }
    } else {
        console.clear();
        console.log("Please fullscreen this window");
        return new Promise((resolve) => setTimeout(() => {playIntro();}, 50));
    }
}


playIntro()
var map = func.generateMap(floor)
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
coords = [randomY, randomX]
printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])

//Key listeners and coordinate updates based on the movement.
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', function (ch, key) {
    if (key != null && key.name != undefined) {
        ch = key.name
    }

    //stops game.
    if (key && key.ctrl && ch == "c") {
        process.stdin.pause();
        run = false;
        battling = false;
        clearInterval(gameRunner);
    }

    if (run && !playingIntro && !paused) {
        if (!battling && !accessingInventory && !usingKey) {
            revealMap(ch)
            //stops taking input for 1/10th of a second, then re-enables input. This limits input speed and reduces flashing.
            process.stdin.pause()
            func.sleep(100).then(() => {
            if(run){
                process.stdin.resume()
            } 
        })
        } else if (battling && !accessingInventory && !usingKey) {
            battle(ch)
        } else if (!battling && accessingInventory && !usingKey) {
            useInventory(ch)
        } else if (usingKey) {
            switch (ch) {
                case "return":
                    
                    if (inventory.key[0] >= 1) {
                        inventory.key[0]--;
                        usingKey = false;
                        buildingEvents.splice(buildingEvents.indexOf(eventY + ", " + eventX), 2);
                        revealMap(lastDirection);
                        drawUI();
                    }

                    break;

                case "escape":

                    usingKey = false;
                    drawUI();

                    break;
            
                default:
                    break;
            }
        } else {
            drawUI();
        }
    } else if (playingIntro && floor == 0) {
        if (ch == "space") {
            playingIntro = false;
            run = true;
            revealMap("right");
        }
    } else if (paused) {
        saveMenu(ch);
    }
}
);
gameRunner = setInterval(() => {}, 1000 * 60 * 60);
