const canvas = document.getElementById("myBoard");

function drawLine(ctx, { x1, y1 }, { x2, y2 }) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2)
    ctx.stroke()
}
const getMousePos = (canvas, e) => {
    clientRect = canvas.getBoundingClientRect();
    return {
        x: Math.round(e.clientX - clientRect.left),
        y: Math.round(e.clientY - clientRect.top),
    };
};

function mouseCollision({ e, object }) {
    var mousePos = getMousePos(canvas, e);
    // console.log(e.clientX, e.clientY, object.position.x, object.position.y)
    return (
        mousePos.x >= object.position.x &&
        mousePos.x <= object.position.x + object.width &&
        mousePos.y >= object.position.y &&
        mousePos.y <= object.position.y + object.height)
}

function collision({ object1, object2 }) {
    return (
        object1.position.x + object1.width >= object2.position.x &&
        object1.position.x <= object2.position.x + object2.width &&
        object1.position.y + object1.height >= object2.position.y &&
        object1.position.y <= object2.position.y + object2.height)
}

function connection({ component }){
    for(const input in component.state){
        let cellState = cells[component.input[input].x/12.5][component.input[input].y/12.5].state
        // if(input!='c'){
        //     component.state[input] = cellState.c
        // }
        // cellState.a = component.state.c
        cellState.c = cellState.a
    }
}