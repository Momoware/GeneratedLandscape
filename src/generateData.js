import Network from './network';
import Grid from './grid';
import Cell from './cell';
import Node from './node';
import randomAttractors from './attractorPattern';
import settings from './settings';
import Vec2 from 'vec2';
let width = settings.width;
let height = settings.height;
let state = 0;
let network, grid;

function setupGrid() {
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
}

// Create the network with initial conditions
let setupNetwork = (s) => {
    // Initialize simulation object
    //console.log("setup");
    network = new Network(settings);
    //console.log(network);
    // Set up the attractors using pre-made patterns

    network.attractors = randomAttractors(10);
    // Add a set of random root nodes throughout scene
    for (let i = 0; i < 3; i++) {
        network.addNode(
            new Node(
                null,
                new Vec2(
                    Math.random(0, width),
                    Math.random(0, height)
                ),
                true,
            )
        )
    }
}

export default () => {
    console.log(1);
    setupNetwork();
    return(network.attractors.length);
    /*
    while (state == 0) {
        console.log(network.attractors.length);
        //network.update();
        if (network.attractors.length == 0) {
            state = 1;
        }
    }
    console.log(3);
    setupGrid();
    grid.data();
    */
}
