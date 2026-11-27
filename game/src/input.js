// Keyboard + mouse input for Giblet's Great Escape.
// One job: turn raw key and pointer events into named game actions, with
// edge detection (pressed this frame) so a held key never double-fires.

export class Input {
  constructor(canvas) {
    this.keysDown = new Set();
    this.pressedQueue = [];
    this.pointerPressed = false;
    this.pointerX = 0;
    this.pointerY = 0;
    this.duckHeld = false;
    this.onFirstGesture = null;
    this.gestureSeen = false;

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.noteGesture();
      this.keysDown.add(event.code);
      this.pressedQueue.push(event.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keysDown.delete(event.code);
    });
    window.addEventListener('blur', () => {
      this.keysDown.clear();
      this.duckHeld = false;
    });

    canvas.addEventListener('pointerdown', (event) => {
      this.noteGesture();
      this.pointerPressed = true;
      this.pointerX = event.clientX;
      this.pointerY = event.clientY;
    });
    canvas.addEventListener('pointerup', () => {
      this.pointerPressed = false;
    });
  }

  noteGesture() {
    if (!this.gestureSeen) {
      this.gestureSeen = true;
      if (typeof this.onFirstGesture === 'function') this.onFirstGesture();
    }
  }

  // True once, on the frame the action key went down.
  pressed(...codes) {
    for (let i = 0; i < this.pressedQueue.length; i++) {
      if (codes.includes(this.pressedQueue[i])) return true;
    }
    return false;
  }

  held(...codes) {
    return codes.some((code) => this.keysDown.has(code));
  }

  consumePointerPress() {
    const was = this.pointerPressed;
    this.pointerPressed = false;
    return was;
  }

  endFrame() {
    this.pressedQueue.length = 0;
  }

  jumpPressed() {
    return this.pressed('Space', 'ArrowUp', 'KeyW') || this.consumePointerPress();
  }

  dashPressed() {
    return this.pressed('ShiftLeft', 'ShiftRight', 'KeyX', 'KeyK');
  }

  duckHeldNow() {
    return this.held('ArrowDown', 'KeyS');
  }

  pausePressed() {
    return this.pressed('KeyP', 'Escape');
  }

  restartPressed() {
    return this.pressed('KeyR');
  }

  startPressed() {
    return this.pressed('Enter', 'Space') || this.consumePointerPress();
  }

  mutePressed() {
    return this.pressed('KeyM');
  }
}
