import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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

  const axis = new THREE.AxesHelper(3);

  // Создание BufferGeometry для сферы
  const sphereGeometry = new THREE.SphereGeometry(2, 16, 16);
  
  // getting number of points
  const count = sphereGeometry.attributes.position.count;
  // Setting color attribute to the sphere
  sphereGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(count * 3), 3)
  );

  const color = new THREE.Color();

  const positions = sphereGeometry.attributes.position;
  const sphereColors = sphereGeometry.attributes.color;
  
  // setting color
  for (let i = 0; i < count; i++) {
    color.setRGB(1, 0.8 - (positions.getY(i) / 2 + 1) / 2, 0);
    sphereColors.setXYZ(i, color.r, color.g, color.b);
  }

  // adding 2 materials(matcap and wireframe)
  const material = new THREE.MeshMatcapMaterial({
    color: 0xffffff,
    flatShading: true,
    vertexColors: true,
    shininess: 0,
  });

  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    transparent: true,
  });

  let mesh = new THREE.Mesh(sphereGeometry, material);
  let wireframe = new THREE.Mesh(sphereGeometry, wireframeMaterial);
  mesh.add(wireframe);

  // Получение координат вершин сферы
  const positionsOffset = sphereGeometry.getAttribute("position").array;

  // Вывод координат всех точек сферы
  console.log("Coordinates of all points on the sphere:");
  for (let i = 0; i < positionsOffset.length; i += 3) {
    const x = positionsOffset[i];
    const y = positionsOffset[i + 1];
    const z = positionsOffset[i + 2];
    console.log(`Point ${i / 3}: x=${x}, y=${y}, z=${z}`);
  }

  const offsetVector = new THREE.Vector3(0, 2, 0);

  // Изменение расстояния точек от центра с использованием вектора
  for (let index = 0; index < 16; index++) {
    const vertex = new THREE.Vector3().fromArray(positionsOffset, index * 3);
    vertex.add(offsetVector);
    vertex.toArray(positionsOffset, index * 3);
  }

  // Укажите Three.js, что буфер атрибутов был изменен
  sphereGeometry.getAttribute("position").needsUpdate = true;

  // changing position of points [Sphere]
  for (let index = 0; index < 16; index++) {
    positionsOffset[index*3] += 2;
    positionsOffset[index*3 + 1] += 2;
    positionsOffset[index*3 + 2] += 2;
  }

  for (let index = 16; index < 34; index++) {
    positionsOffset[index*3 + 1] = 3;
  }

  for (let index = 34; index < 51; index++) {
    positionsOffset[index*3 + 1] = 4;
  }

  for (let index = 51; index < 68; index++) {
    positionsOffset[index*3 + 1] = 5;
  }

  // Добавление меша на сцену
  scene.add(axis);
  scene.add(mesh);

  // Рендеринг сцены
  renderer.render(scene, camera);

  // Вращение с помощью мыши
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
