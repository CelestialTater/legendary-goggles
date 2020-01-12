//Imports
const chalk = require("chalk")
const keypress = require("keypress")

//variable declaration
var map = [[".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".","."],
[".",".",".",".",".",".",".",".",".","."]
]
let coords = [0,0]

/**
 * Prints an icon to the map
 * @params icon to draw, color of icon, position of icon
 */
printIcon = (icon, color, x, y) =>{
    console.clear()
    map[x][y] = color(icon)
    for(i of map){
        var string = "";
        for(o of i){
            string+= o
        } 
        console.log(string)
    }
}

printIcon("@", chalk.yellow, coords[0], coords[1])


//Key listeners and coordinate updates based on the movement.
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', function (ch, key) {
    if (key.name == "up") {
        if(coords[0] != 0){
            printIcon(".", chalk.white, coords[0], coords[1])
            coords[0]--
            printIcon("@", chalk.yellow, coords[0], coords[1])
        }
    }else if(key.name == "down"){
        if(coords[0] != map.length - 1){
            printIcon(".", chalk.white, coords[0], coords[1])
            coords[0]++
            printIcon("@", chalk.yellow, coords[0], coords[1])
        }
    }else if(key.name == "left"){
        if(coords[1] != 0){
            printIcon(".", chalk.white, coords[0], coords[1])
            coords[1]--
            printIcon("@", chalk.yellow, coords[0], coords[1])
        }

    }else if(key.name == "right"){
        if(coords[1] != map[0].length - 1){
            printIcon(".", chalk.white, coords[0], coords[1])
            coords[1]++
            printIcon("@", chalk.yellow, coords[0], coords[1])
        }
    }

    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause();
    }
  });


