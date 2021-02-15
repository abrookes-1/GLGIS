import React, { useState, useEffect, useRef } from 'react';
import { initCanvas } from "../viewer";

function GlCanvas() {
  const canvasRef = useRef(null);
  // let [angle] = useState({
  //   x: 0,
  //   y: 0,
  // });
  // let [mouse] = useState({ // TODO: probably bad to useState twice
  //   lastX: 0,
  //   lastY: 0,
  //   dragging: false,
  // });

  useEffect(() => {
    // alert("effect");
    let canvas = canvasRef.current // TODO: ensure component type is canvas
    initCanvas(canvas);
  })

  return (
    <canvas ref={canvasRef} id={"game-surface"} width={800} height={600}>
      Browser does not support HTML5.
    </canvas>
  );
}

export { GlCanvas }