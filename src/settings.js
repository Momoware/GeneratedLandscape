export default {

    /**
     * 3D Settings
     */
    baseWdith: 20,
    baseSpacing: 0.1,
    minHeight: 10,
    maxHeight: 200,


    /**
     * 2D Settings
     */
    influencedMax: 0,
    influencedMin: 0,
    attractorNum: 200,
    dataLow: 0,
    dataHigh: 255,
    width: 400,
    height: 400,
    cellUnit: 10,
    numNodes: 15,
    finished: 0,
    data: [],
    gridAttractionDistance: 25,

    /**
      Simulation configurations
    */
  
    VenationType: 'Closed',         // venation can be "Open" or "Closed"
    SegmentLength: 5,             // length of each branch segment. Smaller numbers mean smoother lines, but more computation cost
    AttractionDistance: 200,       // radius of influence (d_i) around each attractor that attracts nodes
    KillDistance: 5,              // distance (d_k) between attractors and nodes when branches are ended
    IsPaused: false,              // initial pause/unpause state
    EnableCanalization: true,     // turns on/off auxin flux canalization (line segment thickening)
    EnableOpacityBlending: true,  // turns on/off opacity
  
    /**
      Rendering configurations
    */
  
    // Visibility toggles
    ShowAttractors: false,       // toggled with 'a'
    ShowNodes: true,             // toggled with 'n'
    ShowTips: false,             // toggled with 't'
    ShowAttractionZones: false,  // toggled with 'z'
    ShowKillZones: false,        // toggled with 'k'
    ShowInfluenceLines: false,   // toggled with 'i'
    ShowBounds: false,           // toggled with 'b'
    ShowObstacles: false,        // toggled with 'o'
  
    // Modes
    RenderMode: 'Lines',  // draw branch segments as "Lines" or "Dots"
  
    // Colors
    Colors: {
      BackgroundColor: 'rgba(0,0,0,.9)',
      AttractorColor: 'rgba(255,255,255,.5)',
      BranchColor: 'rgba(255,255,255,1)',
      TipColor: 'rgba(0,255,255,1)',
      AttractionZoneColor: 'rgba(255,255,255,.002)',
      KillZoneColor: 'rgba(255,0,0,.4)',
      InfluenceLinesColor: 'rgba(255,255,255,.2)',
      BoundsFillColor: 'rgba(255,255,255,0)',
      BoundsBorderColor: 'rgba(255,255,255,.05)',
      ObstacleFillColor: 'rgba(255,255,255,.2)'
    },
  
    // Line thicknesses
    BranchThickness: 1.5,
    TipThickness: 2,
    BoundsBorderThickness: 1
  }