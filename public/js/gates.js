class LogicGate {
  constructor({
    id,
    position,
    imageSrc = "",
    scale = 1,
    offset = { x: 0, y: 0 },
    height,
    width,
    drag = false,
    grabbing = false,
    state = {
      a: 0,
      b: 0,
      c: 0,
    },
    input = {
      a: { x: 0, y: 0 },
      b: { x: 0, y: 0 },
      c: { x: 0, y: 0 },
    },
    deleted = false,
  }) {
    this.id = id;
    this.position = position;
    this.height = height;
    this.width = width;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.offset = offset;
    this.drag = drag;
    this.grabbing = grabbing;
    this.state = state;
    this.input = input;
    this.deleted = deleted;

    canvas.addEventListener("contextmenu", (e) => {
      if (mouseCollision({ e: e, object: this })) {
        console.log(this);
        console.log(this.input);
        console.log(this.state);
        // console.log(cells[this.input.a.x/12.5][this.input.a.y/12.5])
      }
    });
    window.addEventListener("keydown", (event) => {
      if (!this.deleted && this.grabbing) {
        if (event.key === "d" || event.key === "Delete") {
          this.delete();
        }
      }
    });
    canvas.addEventListener("mousemove", (e) => {
      if (mouseCollision({ e: e, object: this })) {
        this.onDrag(canvas);
      }
    });
  }

  select() {
    c.strokeStyle = "blue";
    c.lineWidth = 2;
    c.strokeRect(
      this.position.x - this.offset.x - c.lineWidth / 2,
      this.position.y - this.offset.y - c.lineWidth / 2,
      this.image.width * this.scale + c.lineWidth,
      this.image.height * this.scale + c.lineWidth
    );
  }

  draw() {
    c.save(); // Guardar el estado actual del contexto
    if (this.grabbing) {
      // Dibujar el margen si grabbing es true
      this.select();
    }

    for (const input in this.input) {
      c.beginPath();
      c.arc(this.input[input].x, this.input[input].y, 2, 0, 2 * Math.PI);
      c.fillStyle = "black";
      c.fill();
    }

    c.drawImage(
      this.image,
      0,
      0,
      this.image.width,
      this.image.height,
      this.position.x - this.offset.x,
      this.position.y - this.offset.y,
      this.image.width * this.scale,
      this.image.height * this.scale
    );
    c.restore();
  }

  onDrag(canva) {
    canva.addEventListener("mousedown", (e) => {
      this.drag = true;
    });

    canva.addEventListener("mouseup", (e) => {
      this.drag = false;
      this.grabbing = false;
      grabbingOther = false;
      canva.style.cursor = `default`;
      // Redondear la posición del objeto al soltarlo a múltiplos de 10
      const roundFactor = 25 / 2;
      this.position.x = Math.round(this.position.x / roundFactor) * roundFactor;
      this.position.y = Math.round(this.position.y / roundFactor) * roundFactor;
      // console.log(this.position)
    });

    canva.addEventListener("mousemove", (e) => {
      if (
        (mouseCollision({ e: e, object: this }) && !grabbingOther) ||
        this.grabbing
      ) {
        if (this.drag) {
          if (!this.grabbing) {
            this.cellDisconect();
            this.grabbing = true;
          }
          var mousePos = getMousePos(canva, e);
          this.position.x = mousePos.x - this.width / 2;
          this.position.y = mousePos.y - this.height / 2;
          canva.style.cursor = `grabbing`;
        }
      }
      for (let i = 0; i < gates.length; i++) {
        if (
          this.position.x == gates[i].position.x &&
          this.position.y == gates[i].position.y &&
          this.id != gates[i].id
        ) {
          gates[i].position.x += gates[i].width;
        }
      }
    });
  }
  delete() {
    // console.log(gates);
    gates.splice(this.id, 1);
    // console.log(gates);
    this.deleted = true;
  }
  cellDisconect() {
    cells[this.input.c.x / 12.5][this.input.c.y / 12.5].state.a = undefined;
    cells[this.input.c.x / 12.5][this.input.c.y / 12.5].state.c = undefined;
  }
  cellConnection() {
    for (const input in this.state) {
      if (input != "c") {
        this.state[input] =
          cells[this.input[input].x / 12.5][this.input[input].y / 12.5].state.c;
      }
    }
    cells[this.input.c.x / 12.5][this.input.c.y / 12.5].state.a = this.state.c;
  }
  update() {
    this.draw();
  }
}

class LED extends LogicGate {
  constructor({
    position,
    imageSrc = "/images/LEDUndefined.png",
    scale = 0.5,
    offset = { x: 0, y: 0 },
    height = 50,
    width = 50,
    drag = false,
    grabbing = false,
    state = {
      a: 0,
    },
    input = {
      a: 0,
    },
  }) {
    super({
      position,
      imageSrc,
      scale,
      offset,
      state,
    });
    this.position = position;
    this.height = height;
    this.width = width;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.offset = offset;
    this.drag = drag;
    this.grabbing = grabbing;
    this.state = state;
    this.input = input;
    this.color = "black";
  }

  turnSwitch() {
    this.input = {
      a: {
        x: this.position.x,
        y: this.position.y + this.height,
      },
      c: {
        x: this.position.x,
        y: this.position.y + this.height,
      },
    };
    if (this.state.a === 1) {
      this.image.src = "/images/LEDOn.png";
    } else if (this.state.a === 0) {
      this.image.src = "/images/LEDOff.png";
    } else {
      this.state.c = undefined;
      this.image.src = "/images/LEDUndefined.png";
    }
  }

  update() {
    // console.log("SWITCH: "+this.state.c)
    this.draw();
    this.turnSwitch();
  }
}

class AND extends LogicGate {
  constructor({
    position,
    imageSrc = "/images/AND.png",
    scale = 0.5,
    offset = { x: 0, y: 0 },
    height = 50,
    width = 50,
    drag = false,
    grabbing = false,
    state = {
      a: undefined,
      b: undefined,
      c: undefined,
    },
    input = {
      a: 0,
      b: 0,
      c: 0,
    },
  }) {
    super({
      position,
      imageSrc,
      scale,
      offset,
      state,
    });
    this.position = position;
    this.height = height;
    this.width = width;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.offset = offset;
    this.drag = drag;
    this.grabbing = grabbing;
    this.state = state;
    this.input = input;
  }
  setState() {
    this.input = {
      a: {
        x: this.position.x,
        y: this.position.y + this.height * 0.25,
      },
      b: {
        x: this.position.x,
        y: this.position.y + this.height * 0.75,
      },
      c: {
        x: this.position.x + this.width,
        y: this.position.y + this.height / 2,
      },
    };
    if (this.state.a == 1 && this.state.b == 1) {
      this.state.c = 1;
    } else if (this.state.a == undefined || this.state.b == undefined) {
      this.state.c = undefined;
    } else {
      this.state.c = 0;
    }
  }
  update() {
    this.draw();

    this.setState();
  }
}

class OR extends LogicGate {
  constructor({
    position,
    imageSrc = "/images/OR.png",
    scale = 0.5,
    offset = { x: 0, y: 0 },
    height = 50,
    width = 50,
    drag = false,
    grabbing = false,
    state = {
      a: undefined,
      b: undefined,
      c: undefined,
    },
    input = {
      a: 0,
      b: 0,
      c: 0,
    },
  }) {
    super({
      position,
      imageSrc,
      scale,
      offset,
      state,
    });
    this.position = position;
    this.height = height;
    this.width = width;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.offset = offset;
    this.drag = drag;
    this.grabbing = grabbing;
    this.state = state;
    this.input = input;
  }
  setState() {
    this.input = {
      a: {
        x: this.position.x,
        y: this.position.y + this.height * 0.25,
      },
      b: {
        x: this.position.x,
        y: this.position.y + this.height * 0.75,
      },
      c: {
        x: this.position.x + this.width,
        y: this.position.y + this.height / 2,
      },
    };
    if (this.state.a == 1 || this.state.b == 1) {
      this.state.c = 1;
    } else if (this.state.a == undefined && this.state.b == undefined) {
      this.state.c = undefined;
    } else {
      this.state.c = 0;
    }
  }
  update() {
    this.draw();
    this.setState();
  }
}

class XOR extends LogicGate {
  constructor({
    position,
    imageSrc = "/images/XOR.png",
    scale = 0.5,
    offset = { x: 0, y: 0 },
    height = 50,
    width = 50,
    drag = false,
    grabbing = false,
    state = {
      a: undefined,
      b: undefined,
      c: undefined,
    },
    input = {
      a: 0,
      b: 0,
      c: 0,
    },
  }) {
    super({
      position,
      imageSrc,
      scale,
      offset,
      state,
    });
    this.position = position;
    this.height = height;
    this.width = width;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.offset = offset;
    this.drag = drag;
    this.grabbing = grabbing;
    this.state = state;
    this.input = input;
  }
  setState() {
    this.input = {
      a: {
        x: this.position.x,
        y: this.position.y + this.height * 0.25,
      },
      b: {
        x: this.position.x,
        y: this.position.y + this.height * 0.75,
      },
      c: {
        x: this.position.x + this.width,
        y: this.position.y + this.height / 2,
      },
    };
    if (this.state.a == 1 && this.state.b == 0) {
      this.state.c = 1;
    } else if (this.state.a == 0 && this.state.b == 1) {
      this.state.c = 1;
    } else if (this.state.a == 1 && this.state.b == 1) {
      this.state.c = 0;
    } else if (this.state.a == undefined && this.state.b == undefined) {
      this.state.c = undefined;
    } else {
      this.state.c = 0;
    }
  }
  update() {
    this.draw();
    this.setState();
  }
}

class NOT extends LogicGate {
  constructor({
    position,
    imageSrc = "/images/NOT.png",
    scale = 0.5,
    offset = { x: 0, y: 0 },
    height = 50,
    width = 50,
    drag = false,
    grabbing = false,
    state = {
      a: undefined,
      c: undefined,
    },
    input = {
      a: 0,
      c: 0,
    },
  }) {
    super({
      position,
      imageSrc,
      scale,
      offset,
      state,
    });
    this.position = position;
    this.height = height;
    this.width = width;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.offset = offset;
    this.drag = drag;
    this.grabbing = grabbing;
    this.state = state;
    this.input = input;
  }
  setState() {
    this.input = {
      a: {
        x: this.position.x,
        y: this.position.y + this.height / 2,
      },
      c: {
        x: this.position.x + this.width,
        y: this.position.y + this.height / 2,
      },
    };
    if (this.state.a == 1) {
      this.state.c = 0;
    } else if (this.state.a == 0) {
      this.state.c = 1;
    } else if (this.state.a == undefined) {
      this.state.c = undefined;
    }
  }
  update() {
    this.draw();
    this.setState();
  }
}

class Wire extends LogicGate {
  constructor({
    position = {
      x: 0,
      y: 0,
    },
    imageSrc = "/images/Wire.png",
    scale = 0.5,
    offset = { x: 0, y: 0 },
    state = {
      a: 0,
      c: 0,
    },
    input = {
      a: 0,
      c: 0,
    },
    width = 50,
    height = 50,
    direcction = "right",
  }) {
    super({
      position,
      imageSrc,
      scale,
      offset,
      state,
    });
    this.position = position;
    this.state = state;
    this.width = width;
    this.height = height;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.offset = offset;
    this.input = input;
    this.direcction = direcction;
    this.lastDirecction;
    canvas.addEventListener("mousemove", (e) => {
      if (!mouseCollision({ e: e, object: this })) {
        canvas.addEventListener("mousedown", () => {
          this.direcction = this.lastDirecction;
        });
      } else {
        this.setupDirection();
      }
    });
  }
  stateWire() {
    this.state.c = this.state.a;
    if (this.direcction === "right") {
      this.image.src = "/images/Wire.png";
      this.input = {
        a: {
          x: this.position.x,
          y: this.position.y + this.height / 2,
        },
        c: {
          x: this.position.x + this.width,
          y: this.position.y + this.height / 2,
        },
      };
    } else if (this.direcction === "up") {
      this.image.src = "/images/WireUp.png";
      this.input = {
        a: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        c: {
          x: this.position.x + this.width / 2,
          y: this.position.y,
        },
      };
    } else if (this.direcction === "down") {
      this.image.src = "/images/WireDown.png";
      this.input = {
        a: {
          x: this.position.x + this.width / 2,
          y: this.position.y,
        },
        c: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
      };
    }
  }
  setupDirection() {
    this.lastDirecction = this.direcction;
    window.addEventListener("keydown", (e) => {
      if(this.grabbing){
        switch (e.key) {
          case "ArrowUp": {
            this.direcction = "up";
            break;
          }
          case "ArrowRight": {
            this.direcction = "right";
            break;
          }
          case "ArrowDown": {
            this.direcction = "down";
            break;
          }
        }
      }
    });
  }
  update() {
    this.stateWire();
    this.draw();
  }
}

class SwitchGate extends LogicGate {
  constructor({
    position,
    imageSrc = "/images/SwitchOFF.png",
    scale = 0.5,
    offset = { x: 0, y: 0 },
    height = 50,
    width = 50,
    drag = false,
    grabbing = false,
    state = {
      c: 0,
    },
    input = {
      c: { x: 0, y: 0 },
    },
  }) {
    super({
      position,
      imageSrc,
      scale,
      offset,
      state,
    });
    this.position = position;
    this.height = height;
    this.width = width;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.offset = offset;
    this.drag = drag;
    this.grabbing = grabbing;
    this.state = state;
    this.input = input;

    // Agregar el evento dblclick al canvas en el constructor
    canvas.addEventListener("dblclick", () => {
      this.drag = false;
      if (mouseCollision({ e: event, object: this }) && !this.gragging) {
        if (this.state.c === 0) {
          this.state.c = 1;
          this.image.src = "/images/SwitchON.png"; // change imageSrc to SwitchON.png when switch is turned on
        } else {
          this.state.c = 0;
          this.image.src = "/images/SwitchOFF.png"; // change imageSrc to SwitchOFF.png when switch is turned off
        }
      }
    });
  }

  turnSwitch() {
    this.input = {
      c: {
        x: this.position.x + this.width,
        y: this.position.y + this.height / 2,
      },
    };
  }

  update() {
    this.draw();
    this.turnSwitch();
  }
}
