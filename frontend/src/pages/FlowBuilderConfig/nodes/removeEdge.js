import React from "react";
import { getBezierPath, getEdgeCenter, MarkerType } from "@xyflow/react";

import "./css/buttonedge.css";
import { Delete } from "@mui/icons-material";

export default function RemoveEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  arrowHeadType = MarkerType.ArrowClosed, // valor padrão para a seta
  data
}) {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  // markerEnd agora é um objeto com type
  const markerEnd = {
    type: arrowHeadType
  };

  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY
  });

  const foreignObjectSize = 40;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div>
          <button
            className="edgebutton"
            onClick={() => data?.onDelete?.(id)}
          >
            <Delete sx={{ width: "16px", height: "16px", color: "#0000FF" }} />
          </button>
        </div>
      </foreignObject>
    </>
  );
}
