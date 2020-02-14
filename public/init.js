function init() {
  if (window.goSamples) goSamples(); // init for these samples -- you don't need to call this
  var $ = go.GraphObject.make; // for conciseness in defining templates

  myDiagram = $(
    go.Diagram,
    "myDiagramDiv", // must name or refer to the DIV HTML element
    {
      LinkDrawn: showLinkLabel, // this DiagramEvent listener is defined below
      LinkRelinked: showLinkLabel,
      "undoManager.isEnabled": true // enable undo & redo
    }
  );

  // when the document is modified, add a "*" to the title and enable the "Save" button
  myDiagram.addDiagramListener("Modified", function(e) {
    var button = document.getElementById("SaveButton");
    if (button) button.disabled = !myDiagram.isModified;
    var idx = document.title.indexOf("*");
    if (myDiagram.isModified) {
      if (idx < 0) document.title += "*";
    } else {
      if (idx >= 0) document.title = document.title.substr(0, idx);
    }
  });

  // helper definitions for node templates

  function nodeStyle() {
    return [
      // The Node.location comes from the "loc" property of the node data,
      // converted by the Point.parse static method.
      // If the Node.location is changed, it updates the "loc" property of the node data,
      // converting back using the Point.stringify static method.
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      {
        // the Node.location is at the center of each node
        locationSpot: go.Spot.Center
      }
    ];
  }

  // Define a function for creating a "port" that is normally transparent.
  // The "name" is used as the GraphObject.portId,
  // the "align" is used to determine where to position the port relative to the body of the node,
  // the "spot" is used to control how links connect with the port and whether the port
  // stretches along the side of the node,
  // and the boolean "output" and "input" arguments control whether the user can draw links from or to the port.
  function makePort(name, align, spot, output, input) {
    var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
    // the port is basically just a transparent rectangle that stretches along the side of the node,
    // and becomes colored when the mouse passes over it
    return $(go.Shape, {
      fill: "transparent", // changed to a color in the mouseEnter event handler
      strokeWidth: 0, // no stroke
      width: horizontal ? NaN : 8, // if not stretching horizontally, just 8 wide
      height: !horizontal ? NaN : 8, // if not stretching vertically, just 8 tall
      alignment: align, // align the port on the main Shape
      stretch: horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical,
      portId: name, // declare this object to be a "port"
      fromSpot: spot, // declare where links may connect at this port
      fromLinkable: output, // declare whether the user may draw links from here
      toSpot: spot, // declare where links may connect at this port
      toLinkable: input, // declare whether the user may draw links to here
      cursor: "pointer", // show a different cursor to indicate potential link point
      mouseEnter: function(e, port) {
        // the PORT argument will be this Shape
        if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
      },
      mouseLeave: function(e, port) {
        port.fill = "transparent";
      }
    });
  }

  function textStyle() {
    return {
      font: "bold 11pt Lato, Helvetica, Arial, sans-serif",
      stroke: "#F8F8F8"
    };
  }

  // define the Node templates for regular nodes

  myDiagram.nodeTemplateMap.add(
    "", // the default category
    $(
      go.Node,
      "Table",
      nodeStyle(),
      // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
      $(
        go.Panel,
        "Auto",
        $(
          go.Shape,
          "Rectangle",
          { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
          new go.Binding("figure", "figure")
        ),
        $(
          go.TextBlock,
          textStyle(),
          {
            margin: 8,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: true
          },
          new go.Binding("text").makeTwoWay()
        )
      ),
      // four named ports, one on each side:
      makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
      makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
      makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
      makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
    )
  );

  myDiagram.nodeTemplateMap.add(
    "Conditional",
    $(
      go.Node,
      "Table",
      nodeStyle(),
      // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
      $(
        go.Panel,
        "Auto",
        $(
          go.Shape,
          "Diamond",
          { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
          new go.Binding("figure", "figure")
        ),
        $(
          go.TextBlock,
          textStyle(),
          {
            margin: 8,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: true
          },
          new go.Binding("text").makeTwoWay()
        )
      ),
      // four named ports, one on each side:
      makePort("T", go.Spot.Top, go.Spot.Top, false, true),
      makePort("L", go.Spot.Left, go.Spot.Left, true, true),
      makePort("R", go.Spot.Right, go.Spot.Right, true, true),
      makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
    )
  );

  myDiagram.nodeTemplateMap.add(
    "Start",
    $(
      go.Node,
      "Table",
      nodeStyle(),
      $(
        go.Panel,
        "Spot",
        $(go.Shape, "Circle", {
          desiredSize: new go.Size(70, 70),
          fill: "#282c34",
          stroke: "#09d3ac",
          strokeWidth: 3.5
        }),
        $(go.TextBlock, "Start", textStyle(), new go.Binding("text"))
      ),
      // three named ports, one on each side except the top, all output only:
      makePort("L", go.Spot.Left, go.Spot.Left, true, false),
      makePort("R", go.Spot.Right, go.Spot.Right, true, false),
      makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
    )
  );

  myDiagram.nodeTemplateMap.add(
    "End",
    $(
      go.Node,
      "Table",
      nodeStyle(),
      $(
        go.Panel,
        "Spot",
        $(go.Shape, "Circle", {
          desiredSize: new go.Size(60, 60),
          fill: "#282c34",
          stroke: "#DC3C00",
          strokeWidth: 3.5
        }),
        $(go.TextBlock, "End", textStyle(), new go.Binding("text"))
      ),
      // three named ports, one on each side except the bottom, all input only:
      makePort("T", go.Spot.Top, go.Spot.Top, false, true),
      makePort("L", go.Spot.Left, go.Spot.Left, false, true),
      makePort("R", go.Spot.Right, go.Spot.Right, false, true)
    )
  );

  // taken from ../extensions/Figures.js:
  go.Shape.defineFigureGenerator("File", function(shape, w, h) {
    var geo = new go.Geometry();
    var fig = new go.PathFigure(0, 0, true); // starting point
    geo.add(fig);
    fig.add(new go.PathSegment(go.PathSegment.Line, 0.75 * w, 0));
    fig.add(new go.PathSegment(go.PathSegment.Line, w, 0.25 * h));
    fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
    fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
    var fig2 = new go.PathFigure(0.75 * w, 0, false);
    geo.add(fig2);
    // The Fold
    fig2.add(new go.PathSegment(go.PathSegment.Line, 0.75 * w, 0.25 * h));
    fig2.add(new go.PathSegment(go.PathSegment.Line, w, 0.25 * h));
    geo.spot1 = new go.Spot(0, 0.25);
    geo.spot2 = go.Spot.BottomRight;
    return geo;
  });

  myDiagram.nodeTemplateMap.add(
    "Comment",
    $(
      go.Node,
      "Auto",
      nodeStyle(),
      $(go.Shape, "File", {
        fill: "#282c34",
        stroke: "#DEE0A3",
        strokeWidth: 3
      }),
      $(
        go.TextBlock,
        textStyle(),
        {
          margin: 8,
          maxSize: new go.Size(200, NaN),
          wrap: go.TextBlock.WrapFit,
          textAlign: "center",
          editable: true
        },
        new go.Binding("text").makeTwoWay()
      )
      // no ports, because no links are allowed to connect with a comment
    )
  );

  // replace the default Link template in the linkTemplateMap
  myDiagram.linkTemplate = $(
    go.Link, // the whole link panel
    {
      routing: go.Link.AvoidsNodes,
      curve: go.Link.JumpOver,
      corner: 5,
      toShortLength: 4,
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true,
      resegmentable: true,
      // mouse-overs subtly highlight links:
      mouseEnter: function(e, link) {
        link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)";
      },
      mouseLeave: function(e, link) {
        link.findObject("HIGHLIGHT").stroke = "transparent";
      },
      selectionAdorned: false
    },
    new go.Binding("points").makeTwoWay(),
    $(
      go.Shape, // the highlight shape, normally transparent
      {
        isPanelMain: true,
        strokeWidth: 8,
        stroke: "transparent",
        name: "HIGHLIGHT"
      }
    ),
    $(
      go.Shape, // the link path shape
      { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
      new go.Binding("stroke", "isSelected", function(sel) {
        return sel ? "dodgerblue" : "gray";
      }).ofObject()
    ),
    $(
      go.Shape, // the arrowhead
      { toArrow: "standard", strokeWidth: 0, fill: "gray" }
    ),
    $(
      go.Panel,
      "Auto", // the link label, normally not visible
      { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
      new go.Binding("visible", "visible").makeTwoWay(),
      $(
        go.Shape,
        "RoundedRectangle", // the label shape
        { fill: "#F8F8F8", strokeWidth: 0 }
      ),
      $(
        go.TextBlock,
        "Yes", // the label
        {
          textAlign: "center",
          font: "10pt helvetica, arial, sans-serif",
          stroke: "#333333",
          editable: true
        },
        new go.Binding("text").makeTwoWay()
      )
    )
  );

  // Make link labels visible if coming out of a "conditional" node.
  // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
  function showLinkLabel(e) {
    var label = e.subject.findObject("LABEL");
    if (label !== null)
      label.visible = e.subject.fromNode.data.category === "Conditional";
  }

  // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
  myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
  myDiagram.toolManager.relinkingTool.temporaryLink.routing =
    go.Link.Orthogonal;

  load(); // load an initial diagram from some JSON text

  // initialize the Palette that is on the left side of the page
  myPalette = $(
    go.Palette,
    "myPaletteDiv", // must name or refer to the DIV HTML element
    {
      // Instead of the default animation, use a custom fade-down
      "animationManager.initialAnimationStyle": go.AnimationManager.None,
      InitialAnimationStarting: animateFadeDown, // Instead, animate with this function

      nodeTemplateMap: myDiagram.nodeTemplateMap, // share the templates used by myDiagram
      model: new go.GraphLinksModel([
        // specify the contents of the Palette
        { category: "Start", text: "Start" },
        { text: "Step" },
        { category: "Conditional", text: "???" },
        { category: "End", text: "End" },
        { category: "Comment", text: "Comment" }
      ])
    }
  );

  // This is a re-implementation of the default animation, except it fades in from downwards, instead of upwards.
  function animateFadeDown(e) {
    var diagram = e.diagram;
    var animation = new go.Animation();
    animation.isViewportUnconstrained = true; // So Diagram positioning rules let the animation start off-screen
    animation.easing = go.Animation.EaseOutExpo;
    animation.duration = 900;
    // Fade "down", in other words, fade in from above
    animation.add(
      diagram,
      "position",
      diagram.position.copy().offset(0, 200),
      diagram.position
    );
    animation.add(diagram, "opacity", 0, 1);
    animation.start();
  }
} // end init

// Show the diagram's model in JSON  format that the user may edit
function save() {
  const data = myDiagram.model.toJson();

  document.getElementById("mySavedModel").value = data;
  myDiagram.isModified = false;
  // console.log(data.linkDataArray)
  let arrayRoutes = JSON.parse(data).linkDataArray;
  let arrayProduct = JSON.parse(data).nodeDataArray;
  const mapIndexes = {};
  const mapFromTo = arrayRoutes.reduce((acc, x) => {
    acc[x.from] = x.to;
    // console.log(acc);
    arrayProduct.forEach(element => {
      if (x.from === element.key) {
        mapIndexes[x.from] = element;
      }
    });
    return acc;
  }, {});
  let next = mapIndexes[mapFromTo[-1]];
  let map = new Map();
  let map2 = new Map();
  for (let [k, v] of Object.entries(mapIndexes)) {
    if (v.text.includes("потери")) {
      v.text.split("\n").forEach(el => {
        if (el != "потери") {
          let arr = el.split(" ");
          map.set(arr[0], arr[1].slice(0, arr[1].length-1));
          // obj[arr[0]] = arr[1].slice(0, arr[1].length);
        }
      });
    } else {
      let arr=v.text.split(' ');
      if(arr.length > 1 ){
        let numb=arr[1].match(/\d/g)
        console.log(numb)
        if(numb===null){
          map2.set(arr[0],'0')
          
        } else {
          map2.set(arr[0],numb.join(''))
        }
      }
    }
  }

    // for (let [k, v] of Object.entries(mapIndexes)) {
//     if(v.text='сгущенка'){
//      const result =  100/map.get('молоко')
//      const result0 =  100/map.get('сахар')
// if(result>result0){
//   map2.set('сгущенка', `${result0}`)
//   map2.set('молоко',)
//   map2.set('сахар',0)


// } else {
//   map2.set('сгущенка', `${result}`)
//   map2.set('молоко',0)
//   map2.set('сахар',)

// }
//     }

//     }
let str=[]
   for (let k of map2){
str.push(k[1])
   }
   alert(str.join('\n'))
  //   for (let [k, v] of Object.entries(mapIndexes)) {
  //     if(v.text='карамелька'){
  //      const result =  map2.get('огонь')/(map2.get('огонь')*map.get('огонь')/100)
  //      const result0 =  map2.get('сгущенка')/(map2.get('сгущенка')*map.get('сгущенка')/100)
  // if(result>result0){
  //   map2.set('карамелька', `${result0}`)
  
  // } else {
  //   map2.set('карамелька', `${result}`)
  // }
  //     }
  
  //     }
    
    console.log(map2)
  
}
function load() {
  myDiagram.model = go.Model.fromJson(
    document.getElementById("mySavedModel").value
  );
}

// print the diagram by opening a new window holding SVG images of the diagram contents for each page
function printDiagram() {
  var svgWindow = window.open();
  if (!svgWindow) return; // failure to open a new Window
  var printSize = new go.Size(700, 960);
  var bnds = myDiagram.documentBounds;
  var x = bnds.x;
  var y = bnds.y;
  while (y < bnds.bottom) {
    while (x < bnds.right) {
      var svg = myDiagram.makeSVG({
        scale: 1.0,
        position: new go.Point(x, y),
        size: printSize
      });
      svgWindow.document.body.appendChild(svg);
      x += printSize.width;
    }
    x = bnds.x;
    y += printSize.height;
  }
  setTimeout(function() {
    svgWindow.print();
  }, 1);
}
