// LightRay.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Функция для создания конуса (луча)
const createCone = (scene) => {
  /* Parameters of THREE.ConeGeometry(...): 
      1. radius (is value = bigger_angle / 2)
      2. height (is maxDistance ?? from mudule 4)
      3. section amount
 */

  const coneGeometry = new THREE.ConeGeometry(1, 4, 32);
  const coneHeight = coneGeometry.parameters.height;
  const coneMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    //wireframe: true,
    opacity: 0.7, // Прозрачность (0 - полностью прозрачно, 1 - непрозрачно)
    transparent: true,
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.rotation.z = Math.PI / 2;
  scene.add(cone);
  return coneHeight;
};

// Функция для создания прямоугольника
const createRectangle = (scene, coneHeight) => {
  /* Rectangle is Smax
    Parameters of THREE.BoxGeometry(...): 
      1. width 
      2. height
      3. depth 
  */

  const rectGeometry = new THREE.BoxGeometry(1, 0, 1); // Параметры: ширина, высота, глубина
  const rectMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  });
  const rectangle = new THREE.Mesh(rectGeometry, rectMaterial);
  rectangle.rotation.z = Math.PI / 2;
  rectangle.position.set(coneHeight / 2, 0, 0); // Размещение в центре основания конуса
  scene.add(rectangle);
};

// Функция для создания эллипса
const createEllipse = (scene, coneHeight) => {
  /* Ellipse is Smax
    Parameters of ellipseShape.ellipse(...):
    1. x: Координата x центра эллипса (в данном случае 0).
    2. y: Координата y центра эллипса (в данном случае 0).
    3. xRadius: Радиус по оси x (горизонтальная ось).
    4. yRadius: Радиус по оси y (вертикальная ось).
    5. startAngle: Угол, с которого начинается отрисовка эллипса (в радианах).
    6. endAngle: Угол, на котором заканчивается отрисовка эллипса (в радианах).
    7. clockwise: Направление отрисовки (true - по часовой стрелке, false - против часовой стрелки).
  */

  const ellipseShape = new THREE.Shape();
  ellipseShape.ellipse(0, 0, 1, 0.5, 0, Math.PI * 2, 0);
  const ellipseGeometry = new THREE.ExtrudeGeometry(ellipseShape, {
    depth: 0,
    bevelEnabled: false,
  });
  const ellipseMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    //wireframe: true,
    opacity: 0.7, // Прозрачность (0 - полностью прозрачно, 1 - непрозрачно)
    transparent: true,
  });
  const ellipse = new THREE.Mesh(ellipseGeometry, ellipseMaterial);
  ellipse.rotation.z = Math.PI / 2; // Поворот, если необходимо
  ellipse.rotation.y = Math.PI / 2; // Поворот, если необходимо
  ellipse.position.set(coneHeight / 2, 0, 0); // Размещение в центре основания конуса
  scene.add(ellipse);
};

export const createLightRayScene = () => {
  // Создание сцены
  const scene = new THREE.Scene();

  // Создание камеры
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Создание рендерера
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Отрисовка моделей
  const coneHeight = createCone(scene);
  //createRectangle(scene, coneHeight);
  createEllipse(scene, coneHeight);

  renderer.render(scene, camera);

  // вращение с помощью мыши
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // установите это для плавного вращения
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  // Функция для анимации и рендеринга сцены
  const animate = () => {
    requestAnimationFrame(animate);
    // Обновление контроллера
    controls.update();
    // Рендеринг сцены
    renderer.render(scene, camera);
  };

  animate();

  // Очистка ресурсов при размонтировании компонента
  return () => {
    controls.dispose();
    document.body.removeChild(renderer.domElement);
  };
};
