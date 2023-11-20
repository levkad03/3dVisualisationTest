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
  let coneGeometry = new THREE.ConeGeometry(coneRadius, maxDistance, 32);
  let coneMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
    opacity: 0.7,
    transparent: true,
  });
  let cone = new THREE.Mesh(coneGeometry, coneMaterial);

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

const createSphere = (scene, radius, maxDistance) => {
  // Параметры THREE.SphereGeometry:
  // 1. Радиус сферы
  // 2. Количество сегментов по горизонтали
  // 3. Количество сегментов по вертикали
  //const biggerRadius = Math.max(xRadius, yRadius);
  //const smallerRadius = Math.min(xRadius, yRadius);
  let sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff, // Синий цвет
    opacity: 1,
    transparent: true,
    wireframe: true,
  });

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, maxDistance / 2, 0);

  scene.add(sphere);
  return sphere;
};

const createIntersection = (scene, cone, sphere, choice) => {
  scene.remove(cone);
  scene.remove(sphere);
  let interRes;

  if (choice == "intersect") {
    interRes = CSG.intersect(cone, sphere);
  } else if (choice == "subtract") {
    interRes = CSG.subtract(cone, sphere);
  }

  const material = new THREE.MeshNormalMaterial({
    wireframe: true,
  });
  interRes.material = material;
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
  const xRadius = 2;
  const yRadius = 0.5;
  const coneRadius = Math.max(xRadius, yRadius);

  // макс дистанция
  const minDistance = 2;
  const maxDistance = 6;

  // Отрисовка моделей
  const sphere = createSphere(scene, maxDistance, maxDistance);
  const cone = createCone(scene, coneRadius, xRadius, yRadius, maxDistance);

  sphere.updateMatrix();
  cone.updateMatrix();

  let interModel1 = createIntersection(scene, cone, sphere, "intersect");
  let minSphere = createSphere(scene, minDistance, maxDistance);

  interModel1.updateMatrix();
  minSphere.updateMatrix();

  scene.add(minSphere);

  let model = createIntersection(scene, interModel1, minSphere, "subtract");

  model.rotation.z = Math.PI / 2;

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
