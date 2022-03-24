import { map_range, minmax } from "./utility";
import settings from "./settings";
let cellUnit = settings.cellUnit;

export default class {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.influencedBy = 0;
    }

    draw(s) {
        s.noStroke();
        //let mapped = 255 - map_range(this.influencedBy, settings.influencedMin, settings.influencedMax, 0, 255); 
        let mapped = map_range(this.influencedBy, settings.influencedMin, settings.influencedMax, 0, 255); 
        s.fill(mapped);
        //console.log(mapped);
        s.rect(this.x, this.y, cellUnit);
    }

    data() {
        //let mapped = 255 - map_range(this.influencedBy, settings.influencedMin, settings.influencedMax, 0, 255); 
        let mapped = map_range(this.influencedBy, settings.influencedMin, settings.influencedMax, 0, 255); 
        return mapped;
    }
}