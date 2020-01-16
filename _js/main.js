//Imports
const chalk = require("chalk")
const keypress = require("keypress")

//variable declaration
var map = [
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","."]
]
let coords = [0,0]
var run = true;

/**
 * Prints an icon to the map
 * @params icon to draw, color of icon, position of icon
 */
printIcon = (icon, color, bg, x, y) =>{
    console.clear()
    map[x][y] = bg(icon)
    map[x][y] = color(map[x][y])
}  
drawMap = () =>{
    for(i of map){
        var string = ""
        for(o of i){
            string += o
        }
        string = chalk.bgGreen(string)
        string = chalk.green(string)
        console.log(string)
    }
}
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
drawMap()

//Key listeners and coordinate updates based on the movement.
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', function (ch, key) {
    if (key.name == "up") {
        if(coords[0] != 0){
            printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1])
            coords[0]--
            if(coords[0] == 0){
                console.log("hit")
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])  
                drawMap()
            }else if(coords[1] == map[0].length - 1){
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])  
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                drawMap()
            }else{
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                drawMap()
            }
        }
    }else if(key.name == "down"){
        if(coords[0] != map.length - 1){
            printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1])
            coords[0]++
            if(coords[0] == map.length - 1){
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                drawMap()
            }else if(coords[1] == map[0].length - 1){
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])  
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                drawMap()
            }else{
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                drawMap()
            }
            
        }
    }else if(key.name == "left"){
        if(coords[1] != 0){
            printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1])
            coords[1]--
            if(coords[0] == 0){
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])  
                drawMap()
            }else if(coords[0] == map.length - 1){
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])  
                drawMap()
            }else{
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                drawMap()
            }
        }

    }else if(key.name == "right"){
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
                    printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                    printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])  
                    printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                    printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                    printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                    printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                    drawMap()
                }
            }else if(coords[0] == map.length - 1){  
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                drawMap()  
            }else if(coords[0] == 0){
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                drawMap()
            }else{
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1])
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0], coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] - 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] - 1, coords[1] + 1)
                printIcon(".", chalk.green, chalk.bgBlack, coords[0] + 1, coords[1] - 1)
                printIcon("@", chalk.yellow, chalk.bgBlack, coords[0], coords[1])
                drawMap()
            }
        }
    }

    if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
        run = false;
    }
    process.stdin.pause()
    sleep(500).then(() => {
        if(run){
            process.stdin.resume()
        } 
    })
}
);

