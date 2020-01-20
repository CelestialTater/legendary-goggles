//Imports
const chalk = require("chalk")
const keypress = require("keypress")

//variable declaration
var map = [];
var run = true;

//array to hold special characters. store the special character, then the desired color at the index after
var specialChars = ["8", chalk.blueBright]

/**
 * Prints an icon to the map
 * @params icon to draw, color of icon, position of icon
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
 * Draws the map on the console. Should be ran after printing icons.
 */
drawMap = () =>{
    console.clear()
    for(i of map){
        var string = ""
        for(o of i){
            string += o
        }
        string = chalk.bgGreen(string)
        string = chalk.green(string)
        console.log(string)
    }
    console.log(coords[1] + "," + coords[0])
}
/**
 * Sleep function
 * @params time in millisecondcs
 */
sleep = (time) =>{
    return new Promise((resolve) => setTimeout(resolve, time));
}
/**
 * Generates a map with events in random positions
 * @params floor (currently no use, will affect generation in future). defaults to 1
 */
generateMap = (floor = 1) =>{
    //TODO: Add floors and differences between floors
    switch(floor){
        case 1:
            for(var arr = 0; arr < 15; arr++){
                var str = []
                for(var chr = 0; chr < 20; chr++){
                    let randInt = Math.floor(Math.random() * 20);
                    if(randInt === 5){
                        str.push("8")
                    }else{
                        str.push(".")
                    }
                }
                map.push(str);
            }
            break;
        default:
            console.log("Error: generateMap invalid input")
    }
}

/**
 * Reveals appropriate map tiles
 * @params direction of movement
 */
revealMap = (direction) =>{
    switch(direction){
        case "up":
            if(coords[0] != 0){
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1])
                coords[0]--
                if(coords[0] == 0){
                    console.log("hit")
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
            break;
        case "down":
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
            break;
        case "left":
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
            break;
        case "right":
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
            break;
        default:
            console.log(chalk.magentaBright("Use the arrow keys to move!"));
            break;
    }
}

generateMap()
let randomY = Math.floor(Math.random() * map.length - 1)
let randomX = Math.floor(Math.random() * map[0].length - 1)
let coords = [randomY, randomX]
printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
drawMap()

//Key listeners and coordinate updates based on the movement.
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', function (ch, key) {
    revealMap(key.name)
    //stops game.
    if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
        run = false;
    }
    //stops taking input for 1/10th of a second, then re-enables input. This limits input speed and reduces flashing.
    process.stdin.pause()
    sleep(100).then(() => {
        if(run){
            process.stdin.resume()
        } 
    })
}
);

