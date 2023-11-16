import React, { useState, useEffect } from "react";
import "./App.css";
import { createLightRayScene } from "./LightRay";

const App = () => {
  useEffect(() => {
    const cleanup = createLightRayScene();

    // Очистка ресурсов при размонтировании компонента
    return cleanup;
  }, []);

  // Создаем состояние для хранения значения введенного текста
  const [angleWidth, setAngleWidthValue] = useState(0);
  const [angleHeight, setAngleHeightValue] = useState(0);

  // Функция для обработки изменений в текстовом поле
  const handleAngleWidthChange = (event) => {
    setAngleWidthValue(event.target.value);
  };

  const handleAngleHeightChange = (event) => {
    setAngleHeightValue(event.target.value);
  };

  return (
    <div className="container">
      <h1>Вертикальный угол: </h1>
      <input
        type="number"
        placeholder="Введите значение вертикального угла"
        value={angleWidth}
        onChange={handleAngleWidthChange}
      />
      <p>Введенное значение: {angleWidth}</p>

      <h1>Горизонатальный угол: </h1>
      <input
        type="number"
        placeholder="Введите значение горизонтального угла"
        value={angleHeight}
        onChange={handleAngleHeightChange}
      />
      <p>Введенное значение: {angleHeight}</p>

      <p>Введенное значение: {parseInt(angleWidth) + parseInt(angleHeight)}</p>
      <div id="scene" />
    </div>
  );
};

export default App;
