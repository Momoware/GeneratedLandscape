import './style.css';
import defaultSetting from './settings';
import Network from './network';
import randomAttractors from './attractorPattern';
import { Node } from './node';
import Vec2 from 'vec2';
import p5 from 'p5';
import Grid from './grid';
import Cell from './cell';
import { getRandom } from './utility';
import * as dat from 'dat.gui';
import { threeScript } from './threeScript';

let width = defaultSetting.width;
let height = defaultSetting.height;
let cellUnit = defaultSetting.cellUnit;
//const gui = new dat.GUI();
let network, grid;
let gridExecuted = false;

const sketch = (s) => {


    function setupGrid(s) {
        let xnum = width / cellUnit;
        let ynum = height / cellUnit;
        let cells = [];
    
        for (let i = 0; i < xnum; i++) {
            for (let j = 0; j < ynum; j++) {
                cells.push(new Cell(i * cellUnit, j * cellUnit))
            }
        }

        grid = new Grid(width / cellUnit, height / cellUnit, network.nodes, cells);
    
        grid.update();

        grid.draw(s);

        defaultSetting.data = grid.data();

        //console.log(defaultSetting.data);
        gridExecuted = true;
    }

    // Create the network with initial conditions
    let setupNetwork = () => {
        // Initialize simulation object
        //console.log("setup");
        network = new Network();
        //console.log(network);
        // Set up the attractors using pre-made patterns

        
        network.attractors = randomAttractors(defaultSetting.attractorNum);
        // Add a set of random root nodes throughout scene
        for (let i = 0; i < defaultSetting.numNodes; i++) {
            network.addNode(
                new Node(
                    null,
                    new Vec2(
                        getRandom(0, width),
                        getRandom(0, height)
                    ),
                    true,
                )
            )
        }
        //console.log(network.nodes);
    }


    s.setup = () => {
        s.createCanvas(width, height);
        s.background(250);
        setupNetwork();
    }

    s.draw = () => {
        if (network.attractors.length == 0 && gridExecuted) {
            
            console.log('test');
            let el = document.getElementById('p5sketch');
            el.remove();
            threeScript();
            
            s.noLoop();
            return
        }

        if (network.attractors.length == 0) {
            setupGrid(s);
        }

        network.update();
        network.draw(s);
    }
}

const sketchInstance = new p5(sketch, document.getElementById('p5sketch'));

