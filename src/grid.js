import { distance, minmax } from "./utility";
import settings from "./settings";

export default class {
    constructor(x, y, attractors, cells) {
        this.x = x;
        this.y = y;
        this.attractors = attractors;
        this.cells = cells;
    }

    update() {
        for (let attractor of this.attractors) {
            /*
            let influencedCells = this.getCellsInAttractionZone(attractor);
            console.log(influencedCells);
            for(let cell of influencedCells) {
                cell.influencedBy += 1;
            }
            */
            this.countAttraction(attractor);
        }

        let influenced = this.cells.map((c) => { return c.influencedBy });
        console.log(influenced);
        let range = minmax(influenced);
        settings.influencedMin = range.min;
        settings.influencedMax = range.max;
    }

    countAttraction(attractor) {
        for (let singleCell of this.cells) {
            if (distance(attractor.position.x, attractor.position.y,
                singleCell.x, singleCell.y) < settings.gridAttractionDistance) {
                singleCell.influencedBy += 1;
            }
        }
    }

    draw(s) {
        for (let cell of this.cells) {
            cell.draw(s);
        }
        settings.finished = 1;
    }

    data() {
        let lst = [];
        for (let i = 0; i < this.cells.length; i++) {
            lst[i] = this.cells[i].data();
        }
        return lst;
    }
}
