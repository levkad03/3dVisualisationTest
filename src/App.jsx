import React, { useState, useEffect } from "react";
import "./App.css";
import { createLightRayScene } from "./Sphere";

const App = () => {
  useEffect(() => {
    const cleanup = createLightRayScene();

    // Очистка ресурсов при размонтировании компонента
    return cleanup;
  }, []);

  return <div id="scene" />;
};

export default App;
