import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const changePointPosition = (points, wSegments, segment, pointIndex, newPosition) => {
  if (pointIndex == 0){
    points[(segment*(wSegments+1)+wSegments)*3] += newPosition[0];
    points[(segment*(wSegments+1)+wSegments)*3 + 1] += newPosition[1];
    points[(segment*(wSegments+1)+wSegments)*3 + 2] += newPosition[2];
  }

  points[(segment*(wSegments+1)+pointIndex)*3] += newPosition[0];
  points[(segment*(wSegments+1)+pointIndex)*3 + 1] += newPosition[1];
  points[(segment*(wSegments+1)+pointIndex)*3 + 2] += newPosition[2];

}

const polarToCartesian = (radius, angleDegrees) => {
  var angleRadians = angleDegrees * Math.PI / 180;
  var x = radius * Math.cos(angleRadians);
  var y = radius * Math.sin(angleRadians);
  return [x, y];
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
  camera.position.z = 75;

  // Создание рендерера
  const renderer = new THREE.WebGLRenderer({ alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const axis = new THREE.AxesHelper(50);

  const tableRightSide = new Float32Array([10, 9.9, 8, 7, 4, 2, -2, -6, -10, -13, -8, -6, -6.5, -8, -10, -7, -3.5, -1.5, -1]);
  const tableLeftSide = new Float32Array([10, 9.9, 7.8, 6, 3, 0, -4, -7.5, -10, -10, -7, -5, -5, -7, -9, -8, -4, -2, -1]);
  const tableMean = new Float32Array([10, 9.9, 7.9, 6.5, 3.5, 1, -3, -6.75, -10, -11.5, -7.5, -5.5, -5.75, -7.5, -9.5, -7.5, -3.75, -1.75, -1]);

  // Создание BufferGeometry для сферы
  const radius = 20;
  const widthSegments = 4;
  const heightSegments = 18;
  const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

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
    color.setRGB(1, 0.8 - (positions.getY(i) / radius + 1) / 2, 0);
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

  const offsetVector = new THREE.Vector3(2, 0, 0);

  // Изменение расстояния точек от центра с использованием вектора
  // for (let index = Math.ceil(segments/2)*5;index < (Math.ceil(segments/2) + 1)*5; index++) {
  //   const vertex = new THREE.Vector3().fromArray(positionsOffset, index * 3);
  //   vertex.add(offsetVector);
  //   vertex.toArray(positionsOffset, index * 3);
  // }
  
  for (let index = 0; index < tableRightSide.length; index++) {
    const startPosition = polarToCartesian(radius, 10*index + 90);
    const endPosition = polarToCartesian(radius + tableRightSide[index], 10*index + 90);
    const deltaX = endPosition[0] - startPosition[0];
    const deltaY = endPosition[1] - startPosition[1];
    console.log(`Point x=${deltaX}, y=${deltaY}, index=${index}`)
    changePointPosition(positionsOffset, widthSegments, index, 2, [-deltaX, deltaY, 0]);
  }

  for (let index = 0; index < tableLeftSide.length; index++) {
    const startPosition = polarToCartesian(radius, 10*index + 90);
    const endPosition = polarToCartesian(radius + tableLeftSide[index], 10*index + 90);
    const deltaX = endPosition[0] - startPosition[0];
    const deltaY = endPosition[1] - startPosition[1];
    console.log(`Point x=${deltaX}, y=${deltaY}, index=${index}`)
    changePointPosition(positionsOffset, widthSegments, index, 0, [deltaX, deltaY, 0]);
  }

  for (let index = 0; index < tableMean.length; index++) {
    const startPosition = polarToCartesian(radius, 10*index + 90);
    const endPosition = polarToCartesian(radius + tableMean[index], 10*index + 90);
    const deltaX = endPosition[0] - startPosition[0];
    const deltaY = endPosition[1] - startPosition[1];
    console.log(`Point x=${deltaX}, y=${deltaY}, index=${index}`)
    changePointPosition(positionsOffset, widthSegments, index, 1, [0, deltaY, -deltaX]);
  }

  for (let index = 0; index < tableMean.length; index++) {
    const startPosition = polarToCartesian(radius, 10*index + 90);
    const endPosition = polarToCartesian(radius + tableMean[index], 10*index + 90);
    const deltaX = endPosition[0] - startPosition[0];
    const deltaY = endPosition[1] - startPosition[1];
    console.log(`Point x=${deltaX}, y=${deltaY}, index=${index}`)
    changePointPosition(positionsOffset, widthSegments, index, 3, [0, deltaY, deltaX]);
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
