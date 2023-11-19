import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSG } from "three-csg-ts";

const createPyramidWithPoints = (scene, rectWidth, rectHeight) => {
  const smallerSide = Math.min(rectWidth, rectHeight);
  const biggerSide = Math.max(rectWidth, rectHeight);

  // Определение вершин пирамиды
  const apex = new THREE.Vector3(0, 0, 0);
  const base1 = new THREE.Vector3(-0.5 * rectWidth, -4, -0.5 * rectHeight);
  const base2 = new THREE.Vector3(0.5 * rectWidth, -4, -0.5 * rectHeight);
  const base3 = new THREE.Vector3(0.5 * rectWidth, -4, 0.5 * rectHeight);
  const base4 = new THREE.Vector3(-0.5 * rectWidth, -4, 0.5 * rectHeight);

  // Создание геометрии точек (BufferGeometry)
  const pyramidGeometry = new THREE.BufferGeometry();

  // Координаты вершин пирамиды
  const vertices = new Float32Array([
    apex.x,
    apex.y,
    apex.z,
    base1.x,
    base1.y,
    base1.z,
    base2.x,
    base2.y,
    base2.z,
    base3.x,
    base3.y,
    base3.z,
    base4.x,
    base4.y,
    base4.z,
  ]);

  // Добавление атрибута вершинам
  pyramidGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertices, 3)
  );

  // Определение индексов для соединения вершин
  const indices = new Uint16Array([
    0,
    1,
    2,
    0,
    2,
    3,
    0,
    3,
    4,
    0,
    4,
    1, // Основание
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    0, // Боковые грани
  ]);

  // Добавление атрибута индексов
  pyramidGeometry.setIndex(new THREE.BufferAttribute(indices, 1));

  // Создание материала для меша с прозрачностью и красным цветом
  const meshMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000, // Красный цвет
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide, // Двустороннее отображение граней
  });

  // Создание меша (пирамиды) из геометрии и материала
  const pyramidMesh = new THREE.Mesh(pyramidGeometry, meshMaterial);
  pyramidMesh.rotation.z = Math.PI / 2;
  // Добавление меша на сцену
  scene.add(pyramidMesh);

  return apex.y;
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
  sphere.position.set(0, maxDistance / 8, 0);

  scene.add(sphere);
  return sphere;
};

const createIntersection = (scene, pyramid, sphere, rectangle) => {
    scene.remove(sphere);
    const interRes = CSG.intersect(pyramid, sphere);

    
    const material = new THREE.MeshBasicMaterial({
        color: 0x964bf4,
        opacity: 1,
        wireframe: true,
      });
      interRes.material = material;
      interRes.position.x = 2;
      scene.add(interRes);
      return interRes;
}

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

  // Размеры прямоугольника эллипса
  const rectWidth = 1;
  const rectHeight = 2;

  // Отрисовка моделей
  const coneHeight = createPyramidWithPoints(scene, rectWidth, rectHeight);
  //createRectangle(scene, coneHeight, rectWidth, rectHeight);

  const maxDistance = 2;
  const sphere = createMaxSphere(scene, maxDistance);

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
