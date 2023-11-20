// LightRay.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSG } from "three-csg-ts";

// Функция для создания конуса (луча)
const createCone = (scene, coneRadius, xRadius, yRadius, maxDistance) => {
  /* Parameters of THREE.ConeGeometry(...): 
      1. radius (is value = bigger_angle / 2)
      2. height (is maxDistance ?? from mudule 4)
      3. section amount
 */
  let coneGeometry = new THREE.ConeGeometry(coneRadius, maxDistance, 16);
  let coneMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
    opacity: 0.7,
    transparent: true,
  });
  let cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.position.x = -5;

  //cone.rotation.z = Math.PI / 2;

  const smallerRadius = Math.min(xRadius, yRadius);
  if (smallerRadius == yRadius) {
    cone.scale.z = smallerRadius / coneRadius;
  } else if (smallerRadius == xRadius) {
    cone.scale.x = smallerRadius / coneRadius;
  }

  scene.add(cone);
  return cone;
};

const createMaxSphere = (scene, maxDistance) => {
  // Параметры THREE.SphereGeometry:
  // 1. Радиус сферы
  // 2. Количество сегментов по горизонтали
  // 3. Количество сегментов по вертикали
  //const biggerRadius = Math.max(xRadius, yRadius);
  //const smallerRadius = Math.min(xRadius, yRadius);
  let sphereGeometry = new THREE.SphereGeometry(maxDistance, 16, 16);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff, // Синий цвет
    opacity: 1,
    transparent: true,
    wireframe: true,
  });

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(-5, maxDistance / 2, 0);

  scene.add(sphere);
  return sphere;
};

const createMinSphere = (scene, maxDistance, minDistance) => {
  // Параметры THREE.SphereGeometry:
  // 1. Радиус сферы
  // 2. Количество сегментов по горизонтали
  // 3. Количество сегментов по вертикали
  //const biggerRadius = Math.max(xRadius, yRadius);
  //const smallerRadius = Math.min(xRadius, yRadius);
  let sphereGeometry = new THREE.SphereGeometry(minDistance, 16, 16);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff, // Синий цвет
    opacity: 1,
    transparent: true,
    wireframe: true,
  });

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(2, maxDistance / 2, 0); // (maxDistance / 2, 0, 0)

  scene.add(sphere);
  return sphere;
};

const createEllipse = (scene, xRadius, yRadius, maxDistance) => {
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
  ellipseShape.ellipse(0, 0, xRadius, yRadius, 0, Math.PI * 2, 0);
  const ellipseGeometry = new THREE.ExtrudeGeometry(ellipseShape, {
    depth: 0,
    bevelEnabled: false,
  });
  const ellipseMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
    opacity: 1, // Прозрачность (0 - полностью прозрачно, 1 - непрозрачно)
    transparent: true,
  });
  const ellipse = new THREE.Mesh(ellipseGeometry, ellipseMaterial);

  //ellipse.rotation.z = Math.PI / 2; // Поворот, если необходимо
  //ellipse.rotation.x = Math.PI / 2; // Поворот, если необходимо

  ellipse.position.set(0, -maxDistance / 2, 0); // Размещение в центре основания конуса
  scene.add(ellipse);
  return ellipse;
};

const createMaxIntersection = (scene, cone, sphere, ellipse) => {
  //scene.remove(cone);
  //scene.remove(sphere);
  scene.remove(ellipse);
  const interRes = CSG.intersect(cone, sphere);

  const material = new THREE.MeshBasicMaterial({
    color: 0x964bf4,
    opacity: 1,
    wireframe: true,
  });
  interRes.material = material;
  interRes.position.x = 2;
  scene.add(interRes);
  return interRes;
};

const createMinIntersection = (scene, cone, sphere) => {
  //scene.remove(cone);
  //scene.remove(sphere);
  const interRes = CSG.subtract(cone, sphere);

  const material = new THREE.MeshNormalMaterial({
    color: 0x964bf4,
    opacity: 1,
    wireframe: true,
  });
  interRes.material = material;
  interRes.position.x = 9;
  scene.add(interRes);
  return interRes;
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
  const renderer = new THREE.WebGLRenderer({ alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Радиусы эллипса
  const xRadius = 3;
  const yRadius = 1;
  const coneRadius = Math.max(xRadius, yRadius);

  // макс дистанция
  const minDistance = 2;
  const maxDistance = 6;

  // Отрисовка моделей
  const sphere = createMaxSphere(scene, maxDistance);
  const cone = createCone(scene, coneRadius, xRadius, yRadius, maxDistance);
  const ellipse = createEllipse(scene, xRadius, yRadius, maxDistance);

  cone.updateMatrix();
  sphere.updateMatrix();

  let interModel1 = createMaxIntersection(scene, cone, sphere, ellipse);
  let minSphere = createMinSphere(scene, maxDistance, minDistance);

  interModel1.updateMatrix();
  minSphere.updateMatrix();
  createMinIntersection(scene, interModel1, minSphere);

  renderer.render(scene, camera);

  // вращение с помощью мыши
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // плавное вращение
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  // Функция для анимации и рендеринга сцены
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  // Очистка ресурсов при размонтировании компонента
  return () => {
    controls.dispose();
    document.body.removeChild(renderer.domElement);
  };
};
