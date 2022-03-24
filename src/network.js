import defaultSetting from './settings';
import Vec2 from 'vec2';
import KDBush from 'kdbush';
import { getRandom } from './utility';

export default class {
  constructor() {
    this.settings = defaultSetting;
    this.attractors = [];  // attractors influence node growth
    this.nodes = [];       // nodes are connected to form branches
    this.nodesIndex;       // kd-bush spatial index for all nodes
    this.buildSpatialIndices();
  }

  update() {
    // Skip iteration if paused
    if (this.settings.IsPaused) {
      return;
    }

    for (let [attractorID, attractor] of this.attractors.entries()) {
      switch (this.settings.VenationType) {
        // For open venation, only associate this attractor with its closest node
        case 'Open':
          let closestNode = this.getClosestNode(attractor, this.getNodesInAttractionZone(attractor));

          if (closestNode != null) {
            closestNode.influencedBy.push(attractorID);
            attractor.influencingNodes = [closestNode];
          }

          break;

        // For closed venation, associate this attractor with all nodes in its relative neighborhood
        case 'Closed':
          let neighborhoodNodes = this.getRelativeNeighborNodes(attractor);
          let nodesInKillZone = this.getNodesInKillZone(attractor);

          // Exclude nodes that are in the attractor's kill zone (these should stop growing)
          let nodesToGrow = neighborhoodNodes.filter((neighborNode) => {
            return !nodesInKillZone.includes(neighborNode);
          });

          attractor.influencingNodes = neighborhoodNodes;

          if (nodesToGrow.length > 0) {
            attractor.fresh = false;

            for (let node of nodesToGrow) {
              node.influencedBy.push(attractorID);
            }
          }
          break;
      }
    }

    // Grow the network by adding new nodes onto any nodes being influenced by attractors
    for (let node of this.nodes) {
      if (node.influencedBy.length > 0) {
        let averageDirection = this.getAverageDirection(node, node.influencedBy.map(id => this.attractors[id]));
        let nextNode = node.getNextNode(averageDirection);
        this.nodes.push(nextNode);
      }
      node.influencedBy = [];
    }

    // Remove any attractors that have been reached by their associated nodes
    for (let [attractorID, attractor] of this.attractors.entries()) {
      switch (this.settings.VenationType) {
        // For open venation, remove the attractor as soon as any node reaches it
        case 'Open':
          if (attractor.reached) {
            this.attractors.splice(attractorID, 1);
          }

          break;

        // For closed venation, remove the attractor only when all associated nodes have reached it
        case 'Closed':
          if (attractor.influencingNodes.length > 0 && !attractor.fresh) {
            let allNodesReached = true;

            for (let node of attractor.influencingNodes) {
              if (node.position.distance(attractor.position) > this.settings.KillDistance) {
                allNodesReached = false;
              }
            }

            if (allNodesReached) {
              this.attractors.splice(attractorID, 1);
            }
          }

          break;
      }
    }

    // Rebuild spatial indices
    this.buildSpatialIndices();
  }

  draw(s) {
    for (let node of this.nodes) {
      node.draw(s);
    }
  }

  drawBackground(s) {
    s.background(250);
  }

  drawNodes(s) {
    if (this.settings.ShowNodes) {
      for (let node of this.nodes) {
        node.draw(s);
      }
    }
  }

  drawattractors() {
    for (let attractor of this.attractors) {
      attractor.draw();
    }
  }

  getNodesInAttractionZone(attractor) {
    // KDBush within
    return this.nodesIndex.within(
      attractor.position.x,
      attractor.position.y,
      this.settings.AttractionDistance
    ).map(
      id => this.nodes[id]
    );
  }

  getNodesInKillZone(attractor) {
    return this.nodesIndex.within(
      attractor.position.x,
      attractor.position.y,
      this.settings.KillDistance
    ).map(
      id => this.nodes[id]
    );
  }

  getClosestNode(attractor, nearbyNodes) {
    let closestNode = null;
    let record = this.settings.AttractionDistance;

    for (let node of nearbyNodes) {
      let distance = node.position.distance(attractor.position);

      if (distance < this.settings.KillDistance) {
        attractor.reached = true;
        closestNode = null;
      } else if (distance < record) {
        closestNode = node;
        record = distance;
      }
    }
    return closestNode;
  }

  getRelativeNeighborNodes(attractor) {
    let fail;
    let nearbyNodes = this.getNodesInAttractionZone(attractor);
    let relativeNeighbors = [];
    let attractorToP0, attractorToP1, p0ToP1;

    // p0 is a relative neighbor of auxinPos iff
    // for any point p1 that is closer to auxinPos than is p0,
    // p0 is closer to auxinPos than to p1
    for (let p0 of nearbyNodes) {
      fail = false;
      attractorToP0 = p0.position.subtract(attractor.position, true);

      for (let p1 of nearbyNodes) {
        if (p0 === p1) {
          continue;
        }

        attractorToP1 = p1.position.subtract(attractor.position, true);

        if (attractorToP1.length() > attractorToP0.length()) {
          continue;
        }

        p0ToP1 = p1.position.subtract(p0.position, true);

        if (attractorToP0.length() > p0ToP1.length()) {
          fail = true;
          break;
        }
      }

      if (!fail) {
        relativeNeighbors.push(p0);
      }
    }

    return relativeNeighbors;
  }

  getAverageDirection(node, nearbyattractors) {
    // Add up normalized vectors pointing to each attractor
    let averageDirection = new Vec2(0, 0);
    for (let attractor of nearbyattractors) {
      averageDirection.add(
        attractor.position.subtract(node.position, true).normalize()
      );
    }
    // Add small amount of random "jitter" to avoid getting stuck between two attractors and endlessly generating nodes in the same place

    // (Credit to Davide Prati (edap) for the idea, seen in ofxSpaceColonization)
    averageDirection.add(new Vec2(getRandom(-.1, .1), getRandom(-.1, .1))).normalize();
    averageDirection.divide(node.influencedBy.length).normalize();


    return averageDirection;
  }

  addNode(node) {
    this.nodes.push(node);
    this.buildSpatialIndices();
  }

  reset() {
    this.nodes = [];
    this.attractors = [];
    this.buildSpatialIndices();
  }

  // builds spatial indices
  buildSpatialIndices() {
    this.nodesIndex = new KDBush(this.nodes, p => p.position.x, p => p.position.y);
  }
}