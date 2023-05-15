import * as go from "gojs";
import { ReactDiagram } from "gojs-react";

import "./App.css"; // contains .diagram-component CSS
import { useState } from "react";

// ...

/**
 * Diagram initialization method, which is passed to the ReactDiagram component.
 * This method is responsible for making the diagram and initializing the model and any templates.
 * The model's data should not be set here, as the ReactDiagram component handles that via the other props.
 */
function initDiagram() {
  const $ = go.GraphObject.make;
  // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
  const diagram = $(go.Diagram, {
    "undoManager.isEnabled": true, // must be set to allow for model change listening
    // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
    "clickCreatingTool.archetypeNodeData": {
      text: "new node",
      color: "lightblue",
    },
    model: new go.GraphLinksModel({
      linkKeyProperty: "key", // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
    }),
  });

  // define a simple Node template
  diagram.nodeTemplate = $(
    go.Node,
    "Auto", // the Shape will go around the TextBlock
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
      go.Point.stringify
    ),
    $(
      go.Shape,
      { name: "SHAPE", fill: "white" },
      // Shape.fill is bound to Node.data.color
      new go.Binding("fill", "color"),
      new go.Binding("geometryString", "shape")
    ),
    $(
      go.TextBlock,
      { editable: true, stroke: "#ff0000", font: "bold 14pt serif" }, // some room around the text
      new go.Binding("margin", "padding"),
      new go.Binding("stroke", "textColor").makeTwoWay(),
      new go.Binding("text").makeTwoWay()
    )
  );

  return diagram;
}

function App() {
  const [chartItem, setChartItem] = useState("");
  const [nodes, setNodes] = useState([]);
  const [nodeShape, setNodeShape] = useState("rectangle");
  const [customShapes, setCustomShapes] = useState({
    rectangle: "F M 0,0 L 20,0 L 20,10 L 0,10 L 0,0 z",
    diamond: "F M 0,0 L 15,15 L 0,30 L -15,15 L 0,0 z",
    circle: "F M 100, 100 m 75, 0 a 75,75 0 1,0 -150,0 a 75,75 0 1,0  150,0 z",
    triangle: "F M 0,0 L 10,20 L -10,20 L 0,0 z",
  });

  const addNode = (e) => {
    e.preventDefault();
    let newKey = 0;
    let randColor = "";
    let textColor = "";
    while (true) {
      const randKey = Math.floor(Math.random() * 1000);
      const keyExists = nodes.find((node) => node.key === randKey);
      if (!keyExists) {
        newKey = randKey;
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        randColor = `rgb(${r},${g},${b})`;
        // Calculate the brightness of the color
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        textColor = brightness > 128 ? "black" : "white";
        break;
      }
    }
    setNodes((prev) => [
      ...prev,
      {
        key: newKey,
        text: chartItem,
        padding: 15,
        color: randColor,
        textColor: textColor,
        loc: `${Math.floor(Math.random() * 1248)} ${Math.floor(
          Math.random() * 400
        )}`,
        shape: customShapes[nodeShape],
      },
    ]);
  };

  const handleModelChange = (changes) => {
    console.log(changes);
    const allModifiedData = changes.modifiedNodeData;
    allModifiedData.forEach((n) => {
      let tempNodes = nodes.filter((node) => node.key !== n.key);
      let newNodes = [...tempNodes, n];
      setNodes(newNodes);
    });
  };

  return (
    <div style={{ width: "100%", display: "flex" }}>
      <form
        onSubmit={addNode}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        <h3>Add flow chart item</h3>
        <input
          value={chartItem}
          onChange={(e) => setChartItem(e.target.value)}
          type="text"
          placeholder="Flow chart item"
        />
        <select
          onChange={(e) => setNodeShape(e.target.value)}
          value={nodeShape}
          style={{
            textTransform: "capitalize",
          }}
        >
          {Object.keys(customShapes).map((shape) => (
            <option
              key={shape}
              value={shape}
              style={{
                textTransform: "capitalize",
              }}
            >
              {shape}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName="diagram-component"
        nodeDataArray={nodes}
        onModelChange={handleModelChange}
      />
    </div>
  );
}

export default App;
