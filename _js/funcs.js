const chalk = require("chalk")
module.exports = {
    /**
    * Sleep function
    * @param time time in milliseconds
    */
    sleep:function(time){        
        return new Promise((resolve) => setTimeout(resolve, time));
    },

    /**
     * Converts a health bar to a string
     * @param bar bar to convert
     */
    drawHealthBar: function(bar){
        let str = ""
        for(i of bar){
            str += i
        }
        return str
    },

    /**
     * Generates a health bar
     * @param max the maximum health that would need to be rendered
     * @param current the current health to show
     */
    generateHealthBar: function(max, current = -1){
        if (current == -1) {
            current = max;
        }
        var bar = []
        for(i = 0; i < current; i++){
            bar.push(chalk.bgWhite(" "))
        }
        for(i = 0; i < (max - current); i++){
            bar.push(chalk.bgBlack(" "))
        }
        return bar
    },

    /**
     * Generates a map with events in random positions
     * @param floor which map to generate. defaults to 0
     */
    generateMap: function(floor = 0){
        var map = []
        //TODO: Add floors and differences between floors
        switch(floor){

            //Main floors
            case 0:
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
                    }
                }

                for(var scc = 0; scc < 1; scc++){
                    let randY = Math.floor(Math.random() * 15)
                    let randX = Math.floor(Math.random() * 20)
                    if (map[randY][randX] == "}"){
                        scc--;
                    }else{
                        map[randY][randX] = "}"
                    }
                }

                return map

            case 1:
                for(var arr = 0; arr < 30; arr++){
                    var str = []
                    for(var chr = 0; chr < 40; chr++){
                        str.push(".")
                    }
                    map.push(str);
                }
                for(var scc = 0; scc < 25; scc++){
                    let randY = Math.floor(Math.random() * 30)
                    let randX = Math.floor(Math.random() * 40)
                    if (map[randY][randX] == "8"){
                        scc--;
                    }else{
                        map[randY][randX] = "8"
                    }
                }
                return map
            
            //Buildings
            case -1:
                for(var arr = 0; arr < 5; arr++){
                    var str = []
                    for(var chr = 0; chr < 9; chr++){
                        str.push(".")
                    }
                    map.push(str);
                }

                for(var scc = 0; scc < 8; scc++){
                    map[1][scc + 1] = "X"
                }

                for(var scc = 0; scc < 8; scc++){
                    map[3][scc + 1] = "X"
                }

                map[1][0] = "-"
                map[3][0] = "-"

                map[2][0] = "8"
                map[0][7] = "8"
                map[4][7] = "8"

                map[0][8] = "$"
                map[4][8] = "$"

                map[2][8] = "}"

                return map

            default:
                console.log("Error: generateMap invalid input")
        }
    },

    /**
     * Gets the event locations in a map
     * @param map the map to use.
     */
    getEvents: function(map){
        var eventLocations = [];
        for(c in map){
            for (l in map[c]){
                if(map[c][l] == "8"){
                    eventLocations.push(c + ", " + l)
                    eventLocations.push("8")
                }
            }
        }

        for(c in map){
            for (l in map[c]){
                if(map[c][l] == "}"){
                    eventLocations.push(c + ", " + l)
                    eventLocations.push("}")
                }
            }
        }

        for(c in map){
            for (l in map[c]){
                if(map[c][l] == "X"){
                    eventLocations.push(c + ", " + l)
                    eventLocations.push("X")
                }
            }
        }

        for(c in map){
            for (l in map[c]){
                if(map[c][l] == "-"){
                    eventLocations.push(c + ", " + l)
                    eventLocations.push("-")
                }
            }
        }

        for(c in map){
            for (l in map[c]){
                if(map[c][l] == "$"){
                    eventLocations.push(c + ", " + l)
                    eventLocations.push("$")
                }
            }
        }

        return eventLocations;
    }
}
