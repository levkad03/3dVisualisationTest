import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSG } from "three-csg-ts";

const createRectangle = (scene, maxDistance, rectWidth, rectHeight) => {
  /* Rectangle is Smax
      Parameters of THREE.BoxGeometry(...): 
        1. width 
        2. depth
        3. height
    */

  const rectGeometry = new THREE.BoxGeometry(rectWidth, 0, rectHeight); // Параметры: ширина, глубина, высота
  const rectMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  });
  const rectangle = new THREE.Mesh(rectGeometry, rectMaterial);
  //rectangle.rotation.z = Math.PI / 2;
  rectangle.position.set(0, 0, 0); // Размещение в центре основания конуса
  scene.add(rectangle);
};

const createSphere = (scene, radius, maxDistance) => {
  // Параметры THREE.SphereGeometry:
  // 1. Радиус сферы
  // 2. Количество сегментов по горизонтали
  // 3. Количество сегментов по вертикали
  //const biggerRadius = Math.max(xRadius, yRadius);
  //const smallerRadius = Math.min(xRadius, yRadius);
  let sphereGeometry = new THREE.SphereGeometry(radius, 16, 16);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff, // Синий цвет
    opacity: 1,
    transparent: true,
    wireframe: true,
  });

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, maxDistance, 0);

  scene.add(sphere);
  return sphere;
};

const createPyramid = (scene, rectWidth, rectHeight, maxDistance) => {
  // Create the vertices of the triangle
  const height = maxDistance;
  const vertices = new Float32Array([
    0,
    height,
    0, // Vertex A
    -rectWidth / 2,
    0,
    -rectHeight / 2, // Vertex B
    -rectWidth / 2,
    0,
    rectHeight / 2, // Vertex C
    rectWidth / 2,
    0,
    rectHeight / 2, // Vertex D
    rectWidth / 2,
    0,
    -rectHeight / 2, // Vertex D
  ]);

  // Create indexes to define the faces of the pyramid
  const indices = new Uint32Array([
    0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 3, 2, 1, 4, 3, 1,
  ]);

  // Create a buffer geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.scale(1, 1, 1);
  geometry.computeVertexNormals();

  // Create the material
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: false,
  });

  // Create a mesh
  const pyramid = new THREE.Mesh(geometry, material);

  // Add a triangle to the scene
  scene.add(pyramid);
  return pyramid;
};

const createIntersection = (scene, pyramid, sphere, actionString) => {
  scene.remove(pyramid);
  scene.remove(sphere);
  // Convert objects to CSG
  const sphereCSG = CSG.fromMesh(sphere);
  const pyramidCSG = CSG.fromMesh(pyramid);
  let action;

  // Perform the subtraction operation
  if (actionString == "intersect") {
    action = sphereCSG.intersect(pyramidCSG);
  } else if (actionString == "subtract") {
    action = pyramidCSG.subtract(sphereCSG);
  }

  // Convert the result back to Three.js Mesh
  const resultMesh = CSG.toMesh(action, sphere.matrix);
  resultMesh.material = new THREE.MeshNormalMaterial({ wireframe: true });

  scene.add(resultMesh);
  return resultMesh;
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

  // Ширина и высота плями
  const rectWidth = 2;
  const rectHeight = 4;

  // макс и мин дистанции
  const minDistance = 2;
  const maxDistance = 8;

  // Отрисовка моделей
  //createRectangle(scene, maxDistance, rectWidth, rectHeight);
  const maxSphere = createSphere(scene, maxDistance, maxDistance);
  const pyramid = createPyramid(scene, rectWidth, rectHeight, maxDistance);

  maxSphere.updateMatrix();
  pyramid.updateMatrix();

  const interModel1 = createIntersection(
    scene,
    pyramid,
    maxSphere,
    "intersect"
  );
  //interModel1.position.x = 5;
  const minSphere = createSphere(scene, minDistance, maxDistance);
  //minSphere.position.x = 5;

  minSphere.updateMatrix();
  interModel1.updateMatrix();

  const model = createIntersection(scene, interModel1, minSphere, "subtract");
  model.position.y = 0;
  model.rotation.z = Math.PI / 2;

  model.position.x = -5;

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
