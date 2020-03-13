import { Noder } from "./index.js";

export class Float extends Noder {

  constructor(target) {

    target.styles = target.styles ? target.styles + "position: absolute;" : "position: absolute;";

    super(target);

  }

  set handler(target) {

    if (this._handler)
      this._handler.remove();

    target.moveTo(this);
    this._handler = target;
    this._handler.addTrigger("click", "mousedown", click => this.handleMovement(click));
  }

  get handler() { return this._handler }

  handleMovement(click) {

    click.preventDefault();

    click = {
      left: click.clientX - this.getOffset("left"),
      top: click.clientY - this.getOffset("top"),
    };

    this._handler.addTrigger("move", "mousemove",
      move => this.setStyles(`transform: translate(${move.clientX - click.left}px, ${move.clientY - click.top}px)`));

    this._handler.addTrigger("out", "mouseleave", () => this._stopMoving())
    this._handler.addTrigger("up", "mouseup", () => this._stopMoving())
  }

  _stopMoving() {

    this._handler.getTrigger("out").remove();
    this._handler.getTrigger("up").remove();

    let trigger = this._handler.getTrigger("move")

    if (trigger)
      trigger.remove();
  }
}
