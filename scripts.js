function onload() {
    globalThis.canvas = document.querySelector("#canvas");
    globalThis.ctx = canvas.getContext("2d");
    generate_grid();
    globalThis.active = 0;

    console.log()

    canvas.addEventListener("click", function(e) { 
        var rect = e.target.getBoundingClientRect();
        var canvasX = Math.round(e.clientX - rect.left);
        var canvasY = Math.round(e.clientY - rect.top);

        //Get the approximate possition of the cell
        var x = canvasX / 16;
        var y = canvasY / 16;

        //Gets the final rounded possition of the cell for x
        if(canvasX % 16 <= 8 && canvasX % 16 > 4) {
            x = Math.floor(x);
        } else if (canvasX % 16 > 8 && canvasX % 16 < 12) {
            x = Math.floor(x);
        }

        //Gets the final rounded possition of the cell for y
        if(canvasY % 16 <= 8 && canvasY % 16 > 0) {
            y = Math.floor(y);
        } else if (canvasY % 16 > 8 && canvasY % 16 < 16) {
            y = Math.floor(y);
        }

        //Changes the state of the cell
        if(cells_arr[x][y].read_state() == false) {
            cells_arr[x][y].change_state(true);
            ctx.fillStyle = "#ffffff";
        } else {
            cells_arr[x][y].change_state(false);
            ctx.fillStyle = "#000000";
        }
        
        //Redraws the cells
        for (var i = 0; i < 64; i++) {
            for (var j = 0; j < 64; j++) {
                if (cells_arr[j][i].read_state() == false) {
                    ctx.fillStyle = "#ffffff";
                } else {
                    ctx.fillStyle = "#000000";
                }
                ctx.fillRect((j * 16) + 1, (i * 16) + 1, 14, 14);
            }
        }
        
    });
}

function start() {
    if (active == 0) {
        globalThis.update = setInterval(update_cells, 250);
        active = 1;
    }
}

function fill_with_random() {
    for (var i = 0; i < 64; i++) {
        for (var j = 0; j < 64; j++) {
            if (Math.floor(Math.random() * 10) + 1 > 5) {
                cells_arr[j][i].change_state(true);
            } else {
                cells_arr[j][i].change_state(false);
            }
        }
    }
    update_cells();
}

function stop() {
    if (typeof update != 'undefined') {
        clearInterval(update);
        active = 0;
    }
}

function clean() {
    for (var i = 0; i < 64; i++) {
        for (var j = 0; j < 64; j++) {
            cells_arr[j][i].change_state(false);
        }
    }
    update_cells();
    stop();
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = false;
        this.next_state = false;
    }

    change_state(state) {
        this.state = state;
    }

    //Returns the state of a cell
    read_state() {
        return this.state;
    }

    //Checks how much of the surrounding cells are alive and changes the cell state accordingly
    check_surroundings() {
        var alive_neighbours = 0;

        /*
            Visual representation
            [0,0]->[0,1]->[0,2]->
            [1,0]->[skip]->[1,2]->
            [2,0]->[2,1]->[2,2]
            changes the state of a cell
        */
        for (var i = 1; i > -2; i--) {
            for (var j = 1; j > -2; j--) {
                //Doesn't check itself
                if (i == 0 && j == 0) {
                    continue;
                }

                //Checks if the place is valid
                if (this.x - i < 0 || this.y - j < 0) {
                    continue;
                }
                try {
                    if (typeof cells_arr[this.x - j][this.y - i] == 'undefined') {
                        continue;
                    }
                } catch(err) {
                    continue;
                }

                //Checks the neighbour
                if (cells_arr[this.x - j][this.y - i].read_state()) {
                    alive_neighbours++;
                } else {
                    continue;
                }
            }
        }

        /*
            2 -> nothing
            3 -> alive
            else -> die
        */
        if (alive_neighbours == 2) {
            this.next_state = this.state;
            return;
        } else if (alive_neighbours == 3) {
            this.next_state = true;
            return;
        } else {
            this.next_state = false;
            return;
        }
    }

    apply_state() {
        this.state = this.next_state;
    }
}

function update_cells() {
    //Checks and updates surroundings of all cells
    for (var i = 0; i < 64; i++) {
        for (var j = 0; j < 64; j++) {
            cells_arr[j][i].check_surroundings();
        }
    }

    //Changes all cells to their final state
    for (var i = 0; i < 64; i++) {
        for (var j = 0; j < 64; j++) {
            cells_arr[j][i].apply_state();
        }
    }

    //Redraws the cells
    for (var i = 0; i < 64; i++) {
        for (var j = 0; j < 64; j++) {
            if (cells_arr[j][i].read_state() == false) {
                ctx.fillStyle = "#ffffff";
            } else {
                ctx.fillStyle = "#000000";
            }
            ctx.fillRect((j * 16) + 1, (i * 16) + 1, 14, 14);
        }
    }
}

function generate_grid() {
    //Makes the outline
    ctx.fillStyle = "#3d3d3d";
    for (var i = 0; i < 64; i++) {
        for (var j = 0; j < 64; j++) {
            ctx.fillRect(j * 16, i * 16, 16, 16);
        }
    }

    //Makes an empty array for the cells
    globalThis.cells_arr = new Array(64);
    for (var i = 0; i < 64; i++) {
        cells_arr[i] = new Array(64);
    }

    //Draws the empty cells
    ctx.fillStyle = "#ffffff";
    for (var i = 0; i < 64; i++) {
        for (var j = 0; j < 64; j++) {
            ctx.fillRect((j * 16) + 1, (i * 16) + 1, 14, 14);
            cells_arr[j][i] = new Cell(j, i);
        }
    }
}

