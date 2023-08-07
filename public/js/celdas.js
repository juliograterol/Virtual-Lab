class Cell{
    constructor({
        position = {
            x: 0, 
            y: 0
        },
        state = {
            a: undefined,
            c: 0
        },
        width = 12.5,
        height = 12.5
    }){
        this.position = position
        this.state = state
        this.width = width
        this.height = height
    }
}

function createGrid(space) {
    let i = 0;
    let maxCells = {columns: 0, rows: 0}

    while (i < grid.width) {
        drawLine(g, { x1: i, y1: 0 }, { x2: i, y2: grid.height })
        i += space
        maxCells.columns++
    }

    i = 0
    while (i < grid.height) {
        drawLine(g, { x1: 0, y1: i }, { x2: grid.width, y2: i })
        i += space
        maxCells.rows++
    }

    return maxCells
}