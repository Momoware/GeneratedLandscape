import Setting from './settings';

export class Node {
    constructor(parent, position, isTip) {
      this.parent = parent;       // reference to parent node, necessary for vein thickening later
      this.position = position;   // {vec2} of this node's position
      this.isTip = isTip;         // {boolean} 
      this.influencedBy = [];     // references to all Attractors influencing this node each frame
      this.thickness = 0;         // thickness - this is increased during vein thickening process
    }
  
    draw(s) {
      if (this.parent != null) {
        s.stroke(0, 0, 0);
        s.strokeWeight(1);
        s.line(this.position.x, this.position.y,this.parent.position.x, this.parent.position.y);
      }
    }
  
    // Create a new node in the provided direction and a pre-defined distance (SegmentLength)
    getNextNode(averageAttractorDirection) {
        this.isTip = false;
        this.nextPosition = this.position.add(averageAttractorDirection.multiply(Setting.SegmentLength), true);
        return new Node(
            this,
            this.nextPosition,
            true,
        );
    }
  }