import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as math from "mathjs";

const changePointPosition = (points, wSegments, segment, pointIndex, delta) => {
  delta.applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    (pointIndex * 2 * Math.PI) / wSegments
  );

  if (pointIndex == 0) {
    points[(segment * (wSegments + 1) + wSegments) * 3] += delta.x;
    points[(segment * (wSegments + 1) + wSegments) * 3 + 1] += delta.y;
    points[(segment * (wSegments + 1) + wSegments) * 3 + 2] += delta.z;
  }

  points[(segment * (wSegments + 1) + pointIndex) * 3] += delta.x;
  points[(segment * (wSegments + 1) + pointIndex) * 3 + 1] += delta.y;
  points[(segment * (wSegments + 1) + pointIndex) * 3 + 2] += delta.z;
};

const polarToCartesian = (radius, angleDegrees) => {
  var angleRadians = (angleDegrees * Math.PI) / 180;
  var x = radius * Math.cos(angleRadians);
  var y = radius * Math.sin(angleRadians);
  return [x, y];
};

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

const paintGradient = (
  geometry,
  gradient = undefined,
  gradientSpan = undefined
) => {
  const positions = geometry.attributes.position;
  // Setting color attribute to the sphere
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(positions.count * 3), 3)
  );

  const colors = geometry.attributes.color;

  if (gradient === undefined || gradient.length <= 0) {
    for (let i = 0; i < positions.count; i++) {
      colors.setXYZ(i, 1, 1, 1);
    }
    console.log("gradient must contains 1 or more colors");
    return;
  }

  if (gradient.length === 1) {
    const c = hexToRgb(gradient[0]);
    for (let i = 0; i < positions.count; i++) {
      colors.setXYZ(i, c[0] / 256, c[1] / 256, c[2] / 256);
    }
    return;
  }

  let YMin;
  let YMax;
  const Y = Array.from({ length: positions.count }, (_, i) =>
    positions.getY(i)
  );
  if (gradientSpan === undefined) {
    YMin = Math.min(...Y);
    YMax = Math.max(...Y);
  } else {
    YMin = gradientSpan[0] !== undefined ? gradientSpan[0] : Math.min(...Y);
    YMax = gradientSpan[1] !== undefined ? gradientSpan[1] : Math.max(...Y);
  }

  const gradientRGB = gradient.map((x) => hexToRgb(x));
  const gn = gradientRGB.length - 1;
  for (let i = 0; i < positions.count; i++) {
    const t = (positions.getY(i) - YMin) / (YMax - YMin);
    const gt = Math.max(Math.min(t * gn, gn - 0.000001), 0);
    const gi = Math.floor(gt);

    const ct = gt - gi;

    const cs = math.multiply(math.matrix(gradientRGB[gi]), 1 - ct);
    const ce = math.multiply(math.matrix(gradientRGB[gi + 1]), ct);
    const c = math.multiply(math.add(cs, ce), 1 / 256).toArray();
    colors.setXYZ(i, c[0], c[1], c[2]);
  }
};

const foundMeanOfLists = (l1, l2) => {
  let result = [];
  for (let i = 0; i < l1.length; i++) {
    result.push((l1[i] + l2[i]) / 2);
  }
  return new Float32Array(result);
};

const interpolateOffsets = (lists, subdivisions) => {
  if (subdivisions <= 0) {
    return lists;
  }

  let result = [];
  for (let sub = 0; sub < subdivisions; sub++) {
    result = [];

    for (let i = 0; i < lists.length - 1; i++) {
      result.push(lists[i]);
      result.push(foundMeanOfLists(lists[i], lists[i + 1]));
    }

    if (lists.length !== 0) {
      result.push(lists[lists.length - 1]);
      result.push(foundMeanOfLists(lists[0], lists[lists.length - 1]));
    }

    lists = result;
  }

  return result;
};

const testPolarFunction = (phi) => {
  // return 20*(Math.cos(phi+Math.PI/2) + 1);
  return 20 * (Math.cos(phi) + 1);
};

function getBezierCoef(points) {
  // Since the formulas work given that we have n+1 points,
  // then n must be this:
  const n = points.length - 1;
  points = points.map((point) => math.matrix(point));

  // Build coefficients matrix
  const C = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    C[i][i] = 4;
    if (i > 0) C[i][i - 1] = 1;
    if (i < n - 1) C[i][i + 1] = 1;
  }
  C[0][0] = 2;
  C[n - 1][n - 1] = 7;
  C[n - 1][n - 2] = 2;

  // Build points vector
  const P = [];
  for (let i = 0; i < n; i++) {
    P.push(
      math.multiply(math.add(math.multiply(points[i], 2), points[i + 1]), 2)
    );
  }
  P[0] = math.add(points[0], math.multiply(points[1], 2));
  P[n - 1] = math.add(math.multiply(points[n - 1], 8), points[n]);

  // Solve system, find a & b
  // solve linalg equations
  const A = math.multiply(math.inv(math.matrix(C)), math.matrix(P)).toArray();
  const B = [];
  for (let i = 0; i < n - 1; i++) {
    // 2 * points[i + 1] - A[i + 1]
    B.push(
      math
        .add(
          math.multiply(points[i + 1], 2),
          math.multiply(math.matrix(A[i + 1]), -1)
        )
        .toArray()
    );
  }
  // (A[n - 1] + points[n]) / 2
  B.push(
    math
      .multiply(math.add(math.matrix(A[n - 1]), math.matrix(points[n])), 0.5)
      .toArray()
  );

  return [A, B];
}

// Returns the general Bezier cubic formula given 4 control points
function getCubic(a, b, c, d) {
  return (t) =>
    math.add(
      math.multiply(a, Math.pow(1 - t, 3)),
      math.add(
        math.multiply(b, 3 * Math.pow(1 - t, 2) * t),
        math.add(
          math.multiply(c, 3 * (1 - t) * Math.pow(t, 2)),
          math.multiply(d, Math.pow(t, 3))
        )
      )
    );
}

// Return one cubic curve for each consecutive points
function getBezierCubic(points) {
  const [A, B] = getBezierCoef(points);
  return Array.from({ length: points.length - 1 }, (_, i) =>
    getCubic(points[i], A[i], B[i], points[i + 1])
  );
}

// Evaluate each cubic curve on the range [0, 1] sliced in n points
function evaluateBezier(points, n) {
  const curves = getBezierCubic(points);
  const cn = curves.length;
  const result = [];
  for (let i = 0; i < n - 1; i++) {
    const t = i/(n-1); //Перевод индекса в размерность [0,1]
    const ct = Math.max(Math.min(t * cn, cn - 0.000001), 0); //Ограничение коэффициента от 0 до cn
    const ci = Math.floor(ct);

    result.push(curves[ci](ct-ci));
  }
  result.push(points[points.length-1]);
  return result;
}

const createShapeFromData = (data, subdivisions = 1, discreteCoefficient=10) => {

  const widthSegments = data.length * Math.pow(2, subdivisions);
  const heightSegments = data[0].length - 1;
  const heightSmooth = Math.floor(180/discreteCoefficient)+1;
  console.log(heightSmooth);
  const geometry = new THREE.SphereGeometry(
    0,
    widthSegments,
    heightSmooth
  );
  const sidesOffset = interpolateOffsets(data, subdivisions);
  console.log(sidesOffset);

  const positionsOffset = geometry.getAttribute("position").array;

  // apply data offset
  for (let pointIndex = 0; pointIndex < widthSegments; pointIndex++) {
    let polarPoints = Array.from(
      { length: sidesOffset[pointIndex].length },
      (_, i) => {
        return [sidesOffset[pointIndex][i], (180 / heightSegments) * i + 90];
      }
    );
    const decPoints = polarPoints.map((value, index) => {
      return polarToCartesian(value[0], value[1]);
    });
    const interpolatedPoints = evaluateBezier(
      decPoints,
      heightSmooth
    );

    for (let index = 0; index < interpolatedPoints.length; index++) {
      const delta = new THREE.Vector3(
        interpolatedPoints[index][0],
        interpolatedPoints[index][1],
        0
      );

      changePointPosition(
        positionsOffset,
        widthSegments,
        index,
        pointIndex,
        delta
      );
    }
  }

  return geometry;
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
  camera.position.z = 75;

  // Создание рендерера
  const renderer = new THREE.WebGLRenderer({ alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const axis = new THREE.AxesHelper(50);

  const n = 10;
  const baseSphereRadius = 20;
  // const tableLeftSide = [];
  // const tableRightSide = [];
  // for (let i = 0; i < n; i++) {
  //   tableLeftSide.push(testPolarFunction((i * Math.PI) / n + Math.PI));
  //   tableRightSide.push(testPolarFunction((-i * Math.PI) / n + Math.PI));
  // }
  const tableRightSide = new Float32Array([10, 9.9, 8, 7, 4, 2, -2, -6, -10, -13, -8, -6, -6.5, -8, -10, -7, -3.5, -1.5, -1]);
  const tableLeftSide = new Float32Array([10, 9.9, 7.8, 6, 3, 0, -4, -7.5, -10, -10, -7, -5, -5, -7, -9, -8, -4, -2, -1]);
  for (let i = 0; i < tableRightSide.length; i++) {
    tableRightSide[i] += baseSphereRadius;
    tableLeftSide[i] += baseSphereRadius;
  }
  const data = [tableRightSide, tableLeftSide];

  // Создание BufferGeometry для сферы
  const discreteCoefficient = 4;
  const subdivisions = 4;
  // const gradient = ["#ffd700", "#0057b7"];
  const gradient = ["#ff0000", "#00ff00", "#0000ff"];
  // const gradient = ["#ff0000"];
  const geometry = createShapeFromData(
    data,
    subdivisions,
    discreteCoefficient
  );
  // paintGradient(geometry, gradient, [0, undefined]);
  // paintGradient(geometry, gradient, [0, 6]);
  // paintGradient(geometry, gradient, [0, 0]);
  paintGradient(geometry, gradient);

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

  let mesh = new THREE.Mesh(geometry, material);
  let wireframe = new THREE.Mesh(geometry, wireframeMaterial);
  mesh.add(wireframe);

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
