export default class {
    constructor(position) {
      this.position = position;     // vec2 of this attractor's position
      this.influencingNodes = [];   // references to nodes this attractor is influencing each frame
      this.fresh = true;            // flag used to prevent attractors from being removed during first frame of Closed venation mode
    }
  
    draw() {
      // Draw the attraction zone
      fill(255,204,100);
      ellipse(this.position.x, this.position.y, 20, 20);
    }
  }