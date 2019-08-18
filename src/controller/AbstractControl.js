import _ from "lodash";

class AbstractControl {

  constructor(parent) {
    this.eventHandlers = {};

    // Root parent is the synth object.
    if (!(parent instanceof AbstractControl)) {
      this.synth = parent;
    } else {
      this.parent = parent;
      this.synth = parent.synth;

      // If parent exists, add to parent's list of children.
      this.parent.addChild(this.constructor.controlName, this);
    }
  }

  addChild(name, control) {
    Object.defineProperty(this, name, {value: control});
  }

  initHandlers(names) {
    for (const name of names) {
      this.eventHandlers[name] = [];
    }
  }

  fireEvent(name, event) {
    const dotIndex = name.indexOf('.');

    // If it's a child event.
    if (dotIndex > 0) {
      // Forward event to child handler.
      const head = name.substring(0, dotIndex);
      const tail = name.substring(dotIndex + 1);

      const child = this[head];
      if (child === undefined) {
        throw new Error(`Child controller "${head}" does not exist.`);
      }

      child.fireEvent(tail, event);
    } else {
      // Find handler list.
      let handlers = this.eventHandlers[name];
      if (handlers === undefined) {
        throw new Error(`[${this.constructor.controlName}] Event "${name}" does not exist.`);
      }
      if (handlers.length === 0) {
        console.warn(`[${this.constructor.controlName}] Event "${name}" does not have any handlers.`);
      }

      // Trigger all handlers.
      for (const handler of handlers) {
        handler(_.cloneDeep(event));
      }
    }
  }

  subscribeEvent(name, handler) {
    const dotIndex = name.indexOf('.');

    // If it's a child event.
    if (dotIndex > 0) {
      // Forward event to child handler.
      const head = name.substring(0, dotIndex);
      const tail = name.substring(dotIndex + 1);

      const child = this[head];
      if (child === undefined) {
        throw new Error(`[${this.constructor.controlName}] Child controller "${head}" does not exist.`);
      }

      child.subscribeEvent(tail, handler);
    } else {
      // Find handler list.
      let handlers = this.eventHandlers[name];
      if (handlers === undefined) {
        throw new Error(`[${this.constructor.controlName}] Event "${name}" does not exist.`);
      }

      handlers.push(handler);
    }
  }

}

export default AbstractControl