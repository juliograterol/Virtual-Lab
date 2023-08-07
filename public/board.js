const c = canvas.getContext("2d");

const body = document.querySelector("body");

canvas.width = 1051;
canvas.height = 501;

let grabbingOther = false;

const gates = [
  // new AND({
  //     scale: 0.5,
  //     position:{
  //         x: 25,
  //         y: 50
  //     },
  //     width: 50,
  //     height: 50,
  // }),
  // new NOT({
  //     scale: 0.5,
  //     position:{
  //         x: 25,
  //         y: 100
  //     },
  //     width: 50,
  //     height: 50
  // }),
  // new OR({
  //     scale: 0.5,
  //     position:{
  //         x: 25,
  //         y: 150
  //     },
  //     width: 25,
  //     height: 50
  // }),
  // new Wire({
  //     position:{
  //         x: 25,
  //         y: 200
  //     },
  //     width: 50,
  // }),
  // new SwitchGate({
  //     scale: 0.5,
  //     position:{
  //         x: 25,
  //         y: 225
  //     },
  //     height: 50,
  //     width: 50
  // }),
  // new LED({
  //     scale: 0.5,
  //     position:{
  //         x: 25,
  //         y: 275
  //     },
  //     height: 50,
  //     width: 50
  // })
];

const btnAND = document.getElementById("btn-and");
btnAND.addEventListener("click", () => {
  gates.push(
    new AND({
      scale: 0.5,
      position: {
        x: 25,
        y: 50,
      },
    })
  );
});

const btnOR = document.getElementById("btn-or");
btnOR.addEventListener("click", () => {
  gates.push(
    new OR({
      position: {
        x: 25,
        y: 100,
      },
    })
  );
});

const btnXOR = document.getElementById("btn-xor");
btnXOR.addEventListener("click", () => {
  gates.push(
    new XOR({
      position: {
        x: 25,
        y: 150,
      },
    })
  );
});

const btnNOT = document.getElementById("btn-not");
btnNOT.addEventListener("click", () => {
  gates.push(
    new NOT({
      position: {
        x: 25,
        y: 200,
      },
    })
  );
});

const btnSwitch = document.getElementById("btn-switch");
btnSwitch.addEventListener("click", () => {
  gates.push(
    new SwitchGate({
      position: {
        x: 25,
        y: 250,
      },
    })
  );
});

const btnLED = document.getElementById("btn-led");
btnLED.addEventListener("click", () => {
  gates.push(
    new LED({
      position: {
        x: 25,
        y: 300,
      },
    })
  );
});

const btnWire = document.getElementById("btn-wire");
btnWire.addEventListener("click", () => {
  gates.push(
    new Wire({
      position: {
        x: 25,
        y: 350,
      },
      width: 50,
    })
  );
});

const grid = document.getElementById("myGrid");
const g = grid.getContext("2d");
grid.width = canvas.width;
grid.height = canvas.height;

g.lineWidth = 2;
g.strokeStyle = "lightgrey";

let cells = [];

let maxCells = createGrid(12.5);

for (let i = 0; i < maxCells.columns; i++) {
  cells.push([]);
  for (let j = 0; j < maxCells.rows; j++) {
    cells[i].push(
      new Cell({
        position: {
          x: i * 12.5,
          y: j * 12.5,
        },
      })
    );
  }
}

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

let admin = true;
let gatesPositions = [];
//var img = new Image(200, 200);
// document.body.appendChild(img);
var res = [];

function start() {
  window.requestAnimationFrame(start);
  if (admin) {
    var SendedGates = [];
    gates.forEach((gate) => {
      let g = {
        img: gate.image.src,
        x: gate.position.x,
        y: gate.position.y,
        width: gate.width,
        height: gate.height,
      };
      SendedGates.push(g);
    });
    //var dataURL = canvas.toDataURL();
    socket.emit("share-canvas", SendedGates);
  }
  c.clearRect(0, 0, canvas.width, canvas.height);

  if (admin) {
    //logica del circuito//
    for (let i = 0; i < gates.length; i++) {
      gates[i].update();
      gates[i].id = i;
      if (gates[i].grabbing) {
        grabbingOther = true;
      } else {
        gates[i].cellConnection();
        connection({ component: gates[i] });
      }
    }
    ///////////////////////
  } else {
    // c.drawImage(img, 0, 0, canvas.width, canvas.height);
    res.forEach((gate) => {
      var img = new Image();
      img.src = gate.img;
      c.drawImage(img, gate.x, gate.y, gate.width, gate.height);
    });
  }

  socket.on("update-canvas", (msg) => {
    admin = false;
    // img.src = msg;
    res = msg;
  });
}
start();
