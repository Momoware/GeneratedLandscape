import Attractor from './attractor';
import defaultSetting from './settings';
import Vec2 from 'vec2';
import { getRandom } from './utility';

let width = defaultSetting.width;
let height = defaultSetting.height;

export default (numAttractors) => {
    let attractors = [];
    for (let i = 0; i < numAttractors; i ++) {
      let x = getRandom(0, width);
      let y = getRandom(0, height);
      attractors.push(
        new Attractor(
          new Vec2(x, y), 
        ));
    }
    return attractors;
  }