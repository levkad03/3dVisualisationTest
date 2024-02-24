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

  // Создание BufferGeometry для сферы
  const sphereGeometry = new THREE.SphereGeometry(2, 16, 16);

  // Создание материала
  const material = new THREE.MeshNormalMaterial({
    //color: 'red',
    wireframe: !true,
  });

  // Создание Mesh
  const mesh = new THREE.Mesh(sphereGeometry, material);

  // Получение координат вершин сферы
  const positions = sphereGeometry.getAttribute('position').array;

  // Вывод координат всех точек сферы
  console.log("Coordinates of all points on the sphere:");
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    console.log(`Point ${i / 3}: x=${x}, y=${y}, z=${z}`);
  }

  const offsetVector = new THREE.Vector3(1, 2, 0);

  // Изменение расстояния точек от центра с использованием вектора
  for (let index = 0; index < 16; index++) {
    const vertex = new THREE.Vector3().fromArray(positions, index * 3);
    vertex.add(offsetVector);
    vertex.toArray(positions, index * 3);
  }

  // Укажите Three.js, что буфер атрибутов был изменен
  sphereGeometry.getAttribute('position').needsUpdate = true;

  // changing position of points [Sphere]
  // for (let index = 0; index < 16; index++) {
  //   positions[index*3] += 2;
  //   positions[index*3 + 1] += 2;
  //   positions[index*3 + 2] += 2;
  // }

  // for (let index = 16; index < 34; index++) {
  //   positions[index*3 + 1] = 3;
  // }

  // for (let index = 34; index < 51; index++) {
  //   positions[index*3 + 1] = 4;
  // }

  // for (let index = 51; index < 68; index++) {
  //   positions[index*3 + 1] = 5;
  // }

  
  // Добавление меша на сцену
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