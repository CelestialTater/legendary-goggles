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
     * @param max the size of the health bar (aka: max health)
     * @param current the current health to generate
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

            case 0:
                maxEnemyHealth = 5
                enemyHealth = maxEnemyHealth
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
                return map

            case 1:
                console.log("Generating floor 1")
                maxEnemyHealth = 7
                enemyHealth = maxEnemyHealth
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
        return eventLocations;
    }
}
