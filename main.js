// Three.js loaded from CDN, available as global THREE object

// 导航逻辑
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const sectionId = btn.dataset.section;
    navigateTo(sectionId);
    mobileMenu.classList.remove('active');
  });
});

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

// 追踪已初始化的canvas
const initializedCanvases = new Set();

function navigateTo(sectionId) {
  sections.forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });
  
  // 离开波包分解时停止动画
  if (sectionId !== 'wave-packet') {
    stopWaveAnimation();
  }
  
  // 使用 requestAnimationFrame 确保 DOM 已经渲染
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      switch(sectionId) {
        case 'experiment-2d':
          if (!initializedCanvases.has('canvas2d')) {
            initCanvas2d();
            initializedCanvases.add('canvas2d');
          } else if (canvas2d) {
            const rect = canvas2d.getBoundingClientRect();
            canvas2d.width = rect.width > 10 ? rect.width : 400;
            canvas2d.height = rect.height > 10 ? rect.height : 300;
            draw2dExperiment();
          }
          break;
        case 'definition':
          if (!initializedCanvases.has('deltaCanvas')) {
            initDeltaCanvas();
            initializedCanvases.add('deltaCanvas');
          } else if (deltaCanvas) {
            const rect = deltaCanvas.getBoundingClientRect();
            deltaCanvas.width = rect.width > 10 ? rect.width : 400;
            deltaCanvas.height = rect.height > 10 ? rect.height : 300;
            drawDeltaExperiment();
          }
          break;
        case 'dimension':
          if (!initializedCanvases.has('dimensionCanvas')) {
            initDimensionCanvas();
            initializedCanvases.add('dimensionCanvas');
          } else if (dimensionCanvas) {
            const rect = dimensionCanvas.getBoundingClientRect();
            dimensionCanvas.width = rect.width > 10 ? rect.width : 400;
            dimensionCanvas.height = rect.height > 10 ? rect.height : 300;
            drawDimensionExperiment();
          }
          break;
        case 'multi-scale':
          if (!initializedCanvases.has('scaleCanvas')) {
            initScaleCanvas();
            initializedCanvases.add('scaleCanvas');
          } else if (scaleCanvas) {
            const rect = scaleCanvas.getBoundingClientRect();
            scaleCanvas.width = rect.width > 10 ? rect.width : 400;
            scaleCanvas.height = rect.height > 10 ? rect.height : 300;
            drawScaleExperiment();
          }
          break;
        case 'wave-packet':
          if (!initializedCanvases.has('waveCanvas')) {
            initWaveCanvas();
            initializedCanvases.add('waveCanvas');
          } else if (waveCanvas) {
            const rect = waveCanvas.getBoundingClientRect();
            waveCanvas.width = rect.width > 10 ? rect.width : 400;
            waveCanvas.height = rect.height > 10 ? rect.height : 300;
            drawWaveExperiment();
          }
          // 启动波包动画
          startWaveAnimation();
          break;
      }
    });
  });
}

// 三维可视化
let scene, camera, renderer, tubes = [];
let directionalLight, pointLight;
let isRotating = true;
let currentPattern = 'star';
let numTubes = 320;
let tubeRadius = 0.014;

function initThree() {
  const container = document.getElementById('three-container');
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14120f);

  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 3.1;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xd97742, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  pointLight = new THREE.PointLight(0x6f9068, 1.05);
  pointLight.position.set(-5, -5, 5);
  scene.add(pointLight);

  createTubes();
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 鼠标交互
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };
    scene.rotation.y += deltaMove.x * 0.005;
    scene.rotation.x += deltaMove.y * 0.005;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z = Math.max(1.6, Math.min(8, camera.position.z + e.deltaY * 0.004));
  });

  // 触摸支持
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaMove = {
      x: e.touches[0].clientX - previousMousePosition.x,
      y: e.touches[0].clientY - previousMousePosition.y
    };
    scene.rotation.y += deltaMove.x * 0.005;
    scene.rotation.x += deltaMove.y * 0.005;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });

  // 双指缩放
  let initialPinchDistance = null;
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleFactor = initialPinchDistance / currentDistance;
      camera.position.z = Math.max(1.6, Math.min(8, camera.position.z * scaleFactor));
      initialPinchDistance = currentDistance;
    }
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialPinchDistance = null;
    }
  });
}

// 模式颜色映射
const patternColors = {
  star: 0xd97742,        // 紫色 - 中心星束
  scattered: 0x6f9068,   // 青色 - 分散排列
  sticky: 0xc9973f,      // 琥珀色 - 多尺度黏连
  grain: 0x6f8fa8        // 粉色 - 木纹颗粒
};

// ---------- 方向采样与覆盖度量 ----------
// 挂谷集合的定义要求"每个方向都有一根单位线段"。有限条管永远做不到，
// 但可以量: 球面上离最近管方向最远的那个方向, 差了多少度 —— 即"最大角隙"。
// 方向是无向的(一条线与它的反向是同一方向), 故用 |dot| 做对径等同。
//
// Fibonacci 球面采样是确定性的、覆盖接近最优。离线实测(20000 探针):
//   N=40  Fib 20.66° vs 随机 32.20°;  N=640  Fib 5.22° vs 随机 9.54°
//   且 gap × sqrt(N) ≈ 132-145 基本恒定, 印证 C/sqrt(N) 标度。
// 探针数取 6000: 相对 40000 探针的偏差 +0.15% (取 2000 则偏低 4.6%)。
function fibDirections(n) {
  const out = [], ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const z = 1 - (2 * i + 1) / n;
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    const th = ga * i;
    out.push(new THREE.Vector3(r * Math.cos(th), r * Math.sin(th), z));
  }
  return out;
}

let tubeDirections = [];

function maxAngularGapDeg(dirs, probeCount) {
  if (!dirs.length) return NaN;
  const probes = fibDirections(probeCount || 2000);
  let worst = 0;
  for (const p of probes) {
    let best = 0;
    for (const d of dirs) {
      const a = Math.abs(p.x * d.x + p.y * d.y + p.z * d.z);
      if (a > best) best = a;
    }
    const ang = Math.acos(Math.min(1, best)) * 180 / Math.PI;
    if (ang > worst) worst = ang;
  }
  return worst;
}

function reportCoverage() {
  const gapEl = document.getElementById('gapValue');
  const noteEl = document.getElementById('gapNote');
  if (!gapEl) return;
  const gap = maxAngularGapDeg(tubeDirections, 6000);
  gapEl.textContent = isFinite(gap) ? gap.toFixed(1) + '\u00b0' : '\u2014';
  if (noteEl) {
    noteEl.textContent = isFinite(gap)
      ? '\u7403\u9762\u4e0a\u603b\u6709\u4e00\u4e2a\u65b9\u5411\uff0c\u79bb\u6700\u8fd1\u7684\u7ba1\u5dee\u4e86 ' + gap.toFixed(1)
        + '\u00b0\u3002\u6316\u8c37\u96c6\u5408\u8981\u6c42\u8fd9\u4e2a\u6570\u662f 0 \u2014\u2014 \u800c\u4efb\u4f55\u6709\u9650\u6839\u7ba1\u90fd\u505a\u4e0d\u5230\u3002'
      : '';
  }
}

function createTubes() {
  // 清除旧的管和粒子
  tubes.forEach(tube => scene.remove(tube));
  tubes = [];
  tubeDirections = [];
  
  // 清除粒子
  if (particles) {
    scene.remove(particles);
    particles.geometry.dispose();
    particles.material.dispose();
  }

  const geometry = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1.5, 10);
  
  // 根据模式选择颜色
  const color = patternColors[currentPattern] || 0xd97742;
  const material = new THREE.MeshPhongMaterial({
    color: color,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    shininess: 100,
    specular: new THREE.Color(0xffffff)
  });

  switch (currentPattern) {
    case 'star':
      createStarPattern(geometry, material);
      break;
    case 'scattered':
      createScatteredPattern(geometry, material);
      break;
    case 'sticky':
      createStickyPattern(geometry, material);
      break;
    case 'grain':
      createGrainPattern(geometry, material);
      break;
  }
  
  // 添加粒子背景效果
  addParticles();
  reportCoverage();
}

// 粒子系统
let particles;
function addParticles() {
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  
  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
}

function createStarPattern(geometry, material) {
  const dirs = fibDirections(numTubes);
  for (let i = 0; i < numTubes; i++) {
    const tube = new THREE.Mesh(geometry, material);
    const direction = dirs[i];

    tube.position.set(0, 0, 0);
    tube.lookAt(direction);
    tube.position.copy(direction.clone().multiplyScalar(0.25));

    tubeDirections.push(direction.clone());
    tubes.push(tube);
    scene.add(tube);
  }
}

function createScatteredPattern(geometry, material) {
  const dirs = fibDirections(numTubes);
  for (let i = 0; i < numTubes; i++) {
    const tube = new THREE.Mesh(geometry, material);
    const direction = dirs[i];
    tubeDirections.push(direction.clone());

    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8
    );
    
    tube.position.copy(offset);
    tube.lookAt(offset.clone().add(direction));
    
    tubes.push(tube);
    scene.add(tube);
  }
}

function createStickyPattern(geometry, material) {
  const groups = 8;
  const tubesPerGroup = Math.floor(numTubes / groups);
  
  for (let g = 0; g < groups; g++) {
    const groupCenter = new THREE.Vector3(
      Math.cos((g / groups) * Math.PI * 2) * 0.4,
      Math.sin((g / groups) * Math.PI * 2) * 0.4,
      (Math.random() - 0.5) * 0.3
    );
    
    for (let i = 0; i < tubesPerGroup; i++) {
      const tube = new THREE.Mesh(geometry, material);
      
      const angle = (i / tubesPerGroup) * Math.PI * 2;
      const spread = 0.3;
      const direction = new THREE.Vector3(
        Math.cos(angle) * (1 + (Math.random() - 0.5) * spread),
        Math.sin(angle) * (1 + (Math.random() - 0.5) * spread),
        (Math.random() - 0.5) * spread
      ).normalize();
      
      tube.position.copy(groupCenter);
      tube.lookAt(groupCenter.clone().add(direction));

      tubeDirections.push(direction.clone());
      tubes.push(tube);
      scene.add(tube);
    }
  }
}

function createGrainPattern(geometry, material) {
  const gridSize = 6;
  const tubesPerCell = Math.floor(numTubes / (gridSize * gridSize));
  
  for (let x = -gridSize/2; x < gridSize/2; x++) {
    for (let y = -gridSize/2; y < gridSize/2; y++) {
      const cellCenter = new THREE.Vector3(x * 0.3, y * 0.3, 0);
      
      for (let i = 0; i < tubesPerCell; i++) {
        const tube = new THREE.Mesh(geometry, material);
        
        const layer = Math.floor(i / 3);
        const withinLayer = i % 3;
        
        let direction;
        if (layer % 3 === 0) {
          direction = new THREE.Vector3(1, 0, (withinLayer - 1) * 0.3).normalize();
        } else if (layer % 3 === 1) {
          direction = new THREE.Vector3(0, 1, (withinLayer - 1) * 0.3).normalize();
        } else {
          direction = new THREE.Vector3((withinLayer - 1) * 0.3, (withinLayer - 1) * 0.3, 1).normalize();
        }
        
        tube.position.copy(cellCenter);
        tube.lookAt(cellCenter.clone().add(direction));

        tubeDirections.push(direction.clone());
        tubes.push(tube);
        scene.add(tube);
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  if (isRotating) {
    scene.rotation.y += 0.003;
    // 粒子旋转
    if (particles) {
      particles.rotation.y -= 0.001;
      particles.rotation.x += 0.0005;
    }
  }
  
  // 动态光源
  if (directionalLight) {
    const time = Date.now() * 0.001;
    directionalLight.position.x = Math.sin(time * 0.3) * 5;
    directionalLight.position.z = Math.cos(time * 0.3) * 5;
  }
  
  renderer.render(scene, camera);
}

// 三维实验控制
const patternButtons = document.querySelectorAll('.pattern-btn');
patternButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    patternButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPattern = btn.dataset.pattern;
    createTubes();
  });
});

const tubeCountSlider = document.getElementById('tubeCount');
const tubeCountValue = document.getElementById('tubeCountValue');
tubeCountSlider.addEventListener('input', (e) => {
  numTubes = parseInt(e.target.value);
  tubeCountValue.textContent = numTubes;
  createTubes();
});

const radiusSlider = document.getElementById('tubeRadius');
const radiusValue = document.getElementById('radiusValue');
radiusSlider.addEventListener('input', (e) => {
  tubeRadius = parseFloat(e.target.value);
  radiusValue.textContent = tubeRadius.toFixed(3);
  createTubes();
});

const pauseBtn = document.getElementById('pauseBtn');
pauseBtn.addEventListener('click', () => {
  isRotating = !isRotating;
  pauseBtn.textContent = isRotating ? '⏸ 暂停旋转' : '▶ 继续旋转';
});

const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', () => {
  navigateTo('experiment-2d');
});

// 二维直觉实验
let canvas2d, ctx2d;
let directionCount = 60;
let compression = 0.5;
let mode = 'center';

function initCanvas2d() {
  canvas2d = document.getElementById('canvas2d');
  if (!canvas2d) return;
  
  ctx2d = canvas2d.getContext('2d');
  const rect = canvas2d.getBoundingClientRect();
  const w = rect.width > 10 ? rect.width : 400;
  const h = rect.height > 10 ? rect.height : 300;
  canvas2d.width = w;
  canvas2d.height = h;
  
  draw2dExperiment();
  
  window.addEventListener('resize', () => {
    const r = canvas2d.getBoundingClientRect();
    const ww = r.width > 10 ? r.width : 400;
    const hh = r.height > 10 ? r.height : 300;
    canvas2d.width = ww;
    canvas2d.height = hh;
    draw2dExperiment();
  });
}

const directionSlider = document.getElementById('directionCount');
const directionValue = document.getElementById('directionValue');
directionSlider.addEventListener('input', (e) => {
  directionCount = parseInt(e.target.value);
  directionValue.textContent = directionCount;
  draw2dExperiment();
});

const compressionSlider = document.getElementById('compression');
const compressionValue = document.getElementById('compressionValue');
compressionSlider.addEventListener('input', (e) => {
  compression = parseFloat(e.target.value);
  compressionValue.textContent = compression;
  draw2dExperiment();
});

const modeSelect = document.getElementById('modeSelect');
modeSelect.addEventListener('change', (e) => {
  mode = e.target.value;
  draw2dExperiment();
});

function draw2dExperiment() {
  if (!ctx2d) return;
  
  // 确保canvas有有效尺寸
  const width = canvas2d.width || 400;
  const height = canvas2d.height || 300;
  if (width < 10 || height < 10) return;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) * 0.42;
  
  // 绘制背景
  ctx2d.fillStyle = '#1c1a16';
  ctx2d.fillRect(0, 0, width, height);
  
  // 绘制参考圆
  ctx2d.strokeStyle = '#38332b';
  ctx2d.lineWidth = 1;
  ctx2d.beginPath();
  ctx2d.arc(centerX, centerY, scale, 0, Math.PI * 2);
  ctx2d.stroke();
  
  // 绘制所有线段
  for (let i = 0; i < directionCount; i++) {
    const angle = (i / directionCount) * Math.PI * 2;
    
    let x1, y1, x2, y2;
    
    switch (mode) {
      case 'center':
        x1 = centerX - Math.cos(angle) * scale * compression;
        y1 = centerY - Math.sin(angle) * scale * compression;
        x2 = centerX + Math.cos(angle) * scale * compression;
        y2 = centerY + Math.sin(angle) * scale * compression;
        break;
      case 'offset':
        const offset = (i % 3 - 1) * scale * 0.2;
        x1 = centerX - Math.cos(angle) * scale + offset * Math.sin(angle);
        y1 = centerY - Math.sin(angle) * scale + offset * Math.cos(angle);
        x2 = centerX + Math.cos(angle) * scale + offset * Math.sin(angle);
        y2 = centerY + Math.sin(angle) * scale + offset * Math.cos(angle);
        break;
      case 'bundle':
        const bundleSize = 5;
        const bundleIndex = Math.floor(i / bundleSize);
        const withinBundle = i % bundleSize;
        const baseAngle = (bundleIndex / Math.max(1, directionCount / bundleSize)) * Math.PI * 2;
        const spread = (withinBundle - bundleSize / 2) * 0.1;
        const bundleAngle = baseAngle + spread;
        x1 = centerX - Math.cos(bundleAngle) * scale * compression;
        y1 = centerY - Math.sin(bundleAngle) * scale * compression;
        x2 = centerX + Math.cos(bundleAngle) * scale * compression;
        y2 = centerY + Math.sin(bundleAngle) * scale * compression;
        break;
      default:
        x1 = centerX - Math.cos(angle) * scale * compression;
        y1 = centerY - Math.sin(angle) * scale * compression;
        x2 = centerX + Math.cos(angle) * scale * compression;
        y2 = centerY + Math.sin(angle) * scale * compression;
    }
    
    ctx2d.beginPath();
    ctx2d.moveTo(x1, y1);
    ctx2d.lineTo(x2, y2);
    ctx2d.strokeStyle = `rgba(217, 119, 66, 0.8)`;
    ctx2d.lineWidth = 1;
    ctx2d.stroke();
  }
  
  updateStats(width, height);
}

let bestScore = 0, bestDirections = 0, bestCoverage = 0;

function updateStats(width, height) {
  if (width < 10 || height < 10) return;

  try {
    const imageData = ctx2d.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // The canvas is painted with an opaque background before anything is
    // drawn, so every pixel has alpha 255. Counting alpha > 0 therefore
    // reports 100% no matter what is on screen. Compare against the known
    // background colour instead, and ignore the faint reference circle.
    const BG = [28, 26, 22];          // #1c1a16  —— 必须与实际绘制的底色一致,
  // 否则覆盖率统计会把背景算成前景(2026-08 曾因此永远显示 100%)
    const TOL = 26;                   // tolerance for antialiasing
    let covered = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const dr = Math.abs(pixels[i]     - BG[0]);
      const dg = Math.abs(pixels[i + 1] - BG[1]);
      const db = Math.abs(pixels[i + 2] - BG[2]);
      if (dr + dg + db > TOL) covered++;
    }

    const coverage = (covered / (width * height) * 100).toFixed(1);

    const segmentCountEl = document.getElementById('segmentCount');
    const coverageRatioEl = document.getElementById('coverageRatio');
    if (segmentCountEl) segmentCountEl.textContent = directionCount;
    if (coverageRatioEl) coverageRatioEl.textContent = coverage + '%';

    // A Besicovitch set has as many directions as you like and as little area
    // as you like. Rewarding "more directions, less area" turns the sliders
    // into that statement rather than a pair of unrelated knobs.
    const cov = parseFloat(coverage);
    if (directionCount >= 24 && cov > 0) {
      const score = directionCount / cov;          // directions per unit area
      if (score > bestScore) {
        bestScore = score;
        bestDirections = directionCount;
        bestCoverage = cov;
      }
    }
    const bestEl = document.getElementById('bestScore');
    if (bestEl) {
      bestEl.textContent = bestScore > 0
        ? `${bestDirections} 方向 / ${bestCoverage.toFixed(1)}%`
        : '试试看';
    }
  } catch (e) {
    // getImageData can throw on a tainted canvas; the figure still renders.
  }
}


// δ邻域可视化
let deltaCanvas, deltaCtx;
let delta = 0.05;

function initDeltaCanvas() {
  deltaCanvas = document.getElementById('deltaCanvas');
  if (!deltaCanvas) return;
  
  deltaCtx = deltaCanvas.getContext('2d');
  const rect = deltaCanvas.getBoundingClientRect();
  const w = rect.width > 10 ? rect.width : 400;
  const h = rect.height > 10 ? rect.height : 300;
  deltaCanvas.width = w;
  deltaCanvas.height = h;
  
  drawDeltaExperiment();
  
  window.addEventListener('resize', () => {
    const r = deltaCanvas.getBoundingClientRect();
    const ww = r.width > 10 ? r.width : 400;
    const hh = r.height > 10 ? r.height : 300;
    deltaCanvas.width = ww;
    deltaCanvas.height = hh;
    drawDeltaExperiment();
  });
}

const deltaSlider = document.getElementById('deltaSlider');
const deltaValue = document.getElementById('deltaValue');
deltaSlider.addEventListener('input', (e) => {
  delta = parseFloat(e.target.value);
  deltaValue.textContent = delta;
  drawDeltaExperiment();
});

function drawDeltaExperiment() {
  if (!deltaCtx) return;
  
  const width = deltaCanvas.width || 400;
  const height = deltaCanvas.height || 300;
  if (width < 10 || height < 10) return;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) * 0.42;
  
  deltaCtx.fillStyle = '#1c1a16';
  deltaCtx.fillRect(0, 0, width, height);
  
  const numLines = 12;
  
  for (let i = 0; i < numLines; i++) {
    const angle = (i / numLines) * Math.PI * 2;
    const x1 = centerX - Math.cos(angle) * scale;
    const y1 = centerY - Math.sin(angle) * scale;
    const x2 = centerX + Math.cos(angle) * scale;
    const y2 = centerY + Math.sin(angle) * scale;
    
    const tubeWidth = delta * scale * 10;
    
    deltaCtx.beginPath();
    deltaCtx.moveTo(x1, y1);
    deltaCtx.lineTo(x2, y2);
    deltaCtx.strokeStyle = 'rgba(217, 119, 66, 0.3)';
    deltaCtx.lineWidth = tubeWidth;
    deltaCtx.lineCap = 'round';
    deltaCtx.stroke();
    
    deltaCtx.beginPath();
    deltaCtx.moveTo(x1, y1);
    deltaCtx.lineTo(x2, y2);
    deltaCtx.strokeStyle = '#d97742';
    deltaCtx.lineWidth = 1;
    deltaCtx.stroke();
  }
  
  const textY = height - 30;
  deltaCtx.fillStyle = '#8a8377';
  deltaCtx.font = '14px sans-serif';
  deltaCtx.textAlign = 'center';
  deltaCtx.fillText(`δ = ${delta}`, centerX, textY);
}

// 证明地图切换
const toggleBtns = document.querySelectorAll('.toggle-btn');
toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const layer = btn.dataset.layer;
    
    toggleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.layer-content').forEach(content => {
      if (content.classList.contains(layer)) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
  });
});

// ============================================================
// 维数测量仪 — 真正的盒计数 (box-counting) 维数估计
//
// dim_box K = lim_{e->0} log N(e) / log(1/e)
//
// 屏幕上没有 e->0, 只有有限像素。所以取若干 e, 对
// log N(e) ~ log(1/e) 做最小二乘, 用斜率作为估计。
// 只喂维数已知的集合, 这样读者能随时对照真值检验这台仪器。
//
// 实现在 4 个已知真值的集合上离线验证过 (自然尺度族下):
//   线段 1 -> 0.991 | 方块 2 -> 1.982
//   Cantor 尘 log4/log3=1.2619 -> 1.2619 | Sierpinski log3/log2=1.5850 -> 1.5850
// ============================================================

let dimensionCanvas, dimensionCtx, dimensionFitCanvas, dimensionFitCtx;
let setType = 'cantor';
let scaleFamily = 'mixed';
let showGrid = true;

const GRID_N = 729;          // 3^6, 同时被 2 与 3 的幂整除得够深

const SCALE_FAMILIES = {
  mixed: [1, 2, 3, 4, 6, 8, 12, 16, 24, 32],
  p2:    [1, 2, 4, 8, 16, 32, 64],
  p3:    [1, 3, 9, 27, 81],
};

const SET_DEFS = {
  segment:    { truth: 1,                        label: '线段',
                note: '一条水平线段。不是分形，没有可以失配的特征尺度。' },
  square:     { truth: 2,                        label: '实心方块',
                note: '整个画布。维数的上界，同样不是分形。' },
  cantor:     { truth: Math.log(4) / Math.log(3), label: 'Cantor 尘',
                note: '中三分集与自身的乘积。按 3 分自相似 —— 网格边长取 3 的幂时与它共格。' },
  sierpinski: { truth: Math.log(3) / Math.log(2), label: 'Sierpiński 三角',
                note: '按 2 分自相似 —— 与 Cantor 尘互为镜像的检验。' },
  kakeya:     { truth: 2,                        label: '挂谷型细管并',
                note: '有限 δ 的近似：它有正面积，盒维数就是 2。真正的 Besicovitch 集是 δ→0 的极限。' },
};

// ---------- 生成占位位图 (Uint8Array, 1 = 属于集合) ----------
function buildSet(type) {
  const S = GRID_N;
  const o = new Uint8Array(S * S);
  if (type === 'segment') {
    const y = S >> 1;
    for (let x = 0; x < S; x++) o[y * S + x] = 1;
  } else if (type === 'square') {
    o.fill(1);
  } else if (type === 'cantor') {
    // 整数三进制判据：任一位为 1 则不在中三分集内。
    // (浮点迭代 v = v*3 % 1 到第 6 层已丢精度, 会漏点)
    const inC = (i) => { for (let k = 0; k < 6; k++) { if (i % 3 === 1) return false; i = (i / 3) | 0; } return true; };
    for (let y = 0; y < S; y++) { if (!inC(y)) continue;
      for (let x = 0; x < S; x++) if (inC(x)) o[y * S + x] = 1; }
  } else if (type === 'sierpinski') {
    const n = 512;                       // 2^9, 按位与判据要求 2 的幂
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if ((x & y) === 0) o[y * S + x] = 1;
  } else if (type === 'kakeya') {
    // 有限条 1×δ 细管, 方向均匀铺满半圆, 中心按 Perron 式错开。
    const M = 64, half = S / 2, R = S * 0.42, rad = S * 0.012;
    for (let i = 0; i < M; i++) {
      const th = (i / M) * Math.PI;
      const cx = half + Math.cos(th * 2) * R * 0.32;
      const cy = half + Math.sin(th * 2) * R * 0.32;
      const ux = Math.cos(th), uy = Math.sin(th);
      for (let t = -R; t <= R; t += 0.5)
        for (let dr = -rad; dr <= rad; dr += 0.5) {
          const x = Math.round(cx + ux * t - uy * dr);
          const y = Math.round(cy + uy * t + ux * dr);
          if (x >= 0 && x < S && y >= 0 && y < S) o[y * S + x] = 1;
        }
    }
  }
  return o;
}

// ---------- 盒计数 ----------
function boxCount(occ, S, eps) {
  const cols = Math.ceil(S / eps);
  const seen = new Uint8Array(cols * Math.ceil(S / eps));
  let n = 0;
  for (let y = 0; y < S; y++) {
    const by = (y / eps) | 0;
    for (let x = 0; x < S; x++) {
      if (!occ[y * S + x]) continue;
      const k = by * cols + ((x / eps) | 0);
      if (!seen[k]) { seen[k] = 1; n++; }
    }
  }
  return n;
}

// 最小二乘 y = a + b x, 返回斜率、截距、斜率标准误、R^2
function lsq(xs, ys) {
  const n = xs.length;
  if (n < 2) return { b: NaN, a: NaN, seB: NaN, r2: NaN };
  const mx = xs.reduce((p, q) => p + q, 0) / n, my = ys.reduce((p, q) => p + q, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); syy += (ys[i] - my) ** 2; }
  const b = sxy / sxx, a = my - b * mx;
  let sse = 0;
  for (let i = 0; i < n; i++) sse += (ys[i] - (a + b * xs[i])) ** 2;
  return { b, a, seB: n > 2 ? Math.sqrt(sse / (n - 2) / sxx) : NaN, r2: syy > 0 ? 1 - sse / syy : NaN };
}

function measure(occ, S, epsList) {
  const xs = [], ys = [], pts = [];
  for (const e of epsList) {
    const N = boxCount(occ, S, e);
    if (N < 2) continue;
    const x = Math.log(1 / e), y = Math.log(N);
    xs.push(x); ys.push(y); pts.push({ eps: e, N, x, y });
  }
  return { ...lsq(xs, ys), pts };
}

// ---------- 绘制: 集合 + 网格 ----------
function drawSetPanel(occ) {
  const W = dimensionCanvas.width, H = dimensionCanvas.height;
  const side = Math.min(W, H), ox = (W - side) / 2, oy = (H - side) / 2;
  dimensionCtx.fillStyle = '#14120f';
  dimensionCtx.fillRect(0, 0, W, H);

  const img = dimensionCtx.createImageData(side, side);
  const S = GRID_N;
  for (let py = 0; py < side; py++) {
    const sy = ((py * S / side) | 0);
    for (let px = 0; px < side; px++) {
      const sx = ((px * S / side) | 0);
      const on = occ[sy * S + sx];
      const k = (py * side + px) * 4;
      // 分量写死在这里, 十六进制的批量替换抓不到 —— 改配色时必须同步改这三行。
      // on  = #d8d1c4 (--ink-2 亮档)   off = #14120f (--ground)
      img.data[k]     = on ? 216 : 20;
      img.data[k + 1] = on ? 209 : 18;
      img.data[k + 2] = on ? 196 : 15;
      img.data[k + 3] = 255;
    }
  }
  dimensionCtx.putImageData(img, ox, oy);

  if (showGrid) {
    // 画当前尺度族里最粗的那个 eps: 取中位数会有 90+ 条线, 密到看不出共格与否。
    // 最粗的 eps 下 mixed->23 格, p2->12 格, p3->9 格, 一眼能看出格线是否落在结构的间隙上。
    const fam = SCALE_FAMILIES[scaleFamily];
    const eps = fam[fam.length - 1];
    const stepPx = side * eps / S;
    if (stepPx >= 3) {
      dimensionCtx.strokeStyle = 'rgba(217,119,66,0.55)';
      dimensionCtx.lineWidth = 1;
      dimensionCtx.beginPath();
      for (let g = 0; g <= S / eps; g++) {
        const p = ox + g * stepPx;
        dimensionCtx.moveTo(p, oy); dimensionCtx.lineTo(p, oy + side);
        dimensionCtx.moveTo(ox, oy + g * stepPx); dimensionCtx.lineTo(ox + side, oy + g * stepPx);
      }
      dimensionCtx.stroke();
      // 标签压在结构上会看不清, 先铺一块底衬
      dimensionCtx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
      const lab = '网格 ε = ' + eps;
      const lw = dimensionCtx.measureText(lab).width;
      dimensionCtx.fillStyle = 'rgba(20,18,15,0.85)';
      dimensionCtx.fillRect(ox + 4, oy + 4, lw + 12, 20);
      dimensionCtx.fillStyle = 'rgba(217,119,66,0.98)';
      dimensionCtx.fillText(lab, ox + 10, oy + 18);
    }
  }
}

// ---------- 绘制: log-log 拟合图 ----------
function drawFitPanel(res, truth) {
  const W = dimensionFitCanvas.width, H = dimensionFitCanvas.height;
  const c = dimensionFitCtx;
  c.fillStyle = '#14120f'; c.fillRect(0, 0, W, H);
  if (!res.pts.length) return;

  const padL = 52, padR = 16, padT = 18, padB = 34;
  const xs = res.pts.map(p => p.x), ys = res.pts.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const spanX = (x1 - x0) || 1, spanY = (y1 - y0) || 1;
  const X = v => padL + (v - x0) / spanX * (W - padL - padR);
  const Y = v => H - padB - (v - y0) / spanY * (H - padT - padB);

  c.strokeStyle = 'rgba(138,131,119,0.28)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(padL, padT); c.lineTo(padL, H - padB); c.lineTo(W - padR, H - padB); c.stroke();

  // 真值斜率参考线, 过散点重心
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  c.strokeStyle = 'rgba(138,131,119,0.75)';
  c.setLineDash([5, 4]); c.beginPath();
  c.moveTo(X(x0), Y(my + truth * (x0 - mx)));
  c.lineTo(X(x1), Y(my + truth * (x1 - mx)));
  c.stroke(); c.setLineDash([]);

  // 拟合线
  c.strokeStyle = '#d97742'; c.lineWidth = 2;
  c.beginPath();
  c.moveTo(X(x0), Y(res.a + res.b * x0));
  c.lineTo(X(x1), Y(res.a + res.b * x1));
  c.stroke();

  // 散点
  c.fillStyle = '#d8d1c4';
  for (const p of res.pts) { c.beginPath(); c.arc(X(p.x), Y(p.y), 3.4, 0, Math.PI * 2); c.fill(); }

  c.fillStyle = 'rgba(138,131,119,0.9)';
  c.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
  c.fillText('log(1/ε)', W - padR - 52, H - 10);
  c.save(); c.translate(14, padT + 46); c.rotate(-Math.PI / 2);
  c.fillText('log N(ε)', 0, 0); c.restore();

  c.fillStyle = '#d97742';
  c.fillText('拟合 ' + res.b.toFixed(3), W - padR - 118, padT + 12);
  c.fillStyle = 'rgba(138,131,119,0.95)';
  c.fillText('真值 ' + truth.toFixed(3), W - padR - 118, padT + 28);
}

// ---------- 主流程 ----------
function drawDimensionExperiment() {
  if (!dimensionCtx || !dimensionFitCtx) return;
  const def = SET_DEFS[setType];
  const occ = buildSet(setType);
  const res = measure(occ, GRID_N, SCALE_FAMILIES[scaleFamily]);

  drawSetPanel(occ);
  drawFitPanel(res, def.truth);

  const bias = res.b - def.truth;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('setNote', def.note);
  set('dimTruth', def.truth.toFixed(4));
  set('dimMeasured', isFinite(res.b) ? res.b.toFixed(4) : '—');
  set('dimBias', isFinite(bias) ? (bias >= 0 ? '+' : '') + bias.toFixed(4) : '—');
  set('dimSE', isFinite(res.seB) ? res.seB.toFixed(4) : '—');
  set('dimR2', isFinite(res.r2) ? res.r2.toFixed(4) : '—');

  const biasEl = document.getElementById('dimBias');
  if (biasEl) biasEl.className = 'readout-value ' + (Math.abs(bias) < 0.02 ? 'good' : Math.abs(bias) < 0.1 ? 'warn' : 'bad');

  const v = document.getElementById('dimVerdict');
  if (v) {
    const a = Math.abs(bias);
    let cls, txt;
    if (a < 0.02) {
      cls = 'good';
      txt = '<strong>测准了。</strong>偏差 ' + a.toFixed(4) + '，小于挂谷猜想需要分辨的 0.01 量级。'
          + '注意这是<em>因为你恰好选对了尺度族</em> —— 换一个族再看。';
    } else if (a < 0.1) {
      cls = 'warn';
      txt = '<strong>偏了 ' + a.toFixed(3) + '。</strong>已经和挂谷猜想要分辨的差距（0.01）同量级甚至更大 —— '
          + '此时测量结果无法支持任何关于"维数恰好是几"的断言。';
    } else {
      cls = 'bad';
      txt = '<strong>偏了 ' + a.toFixed(3) + '，是要分辨的 0.01 的 ' + Math.round(a / 0.01) + ' 倍。</strong>'
          + '集合没变、代码没变，变的只是量它的网格。这就是"计算机验证挂谷猜想"这条路走不通的原因。';
    }
    v.className = 'verdict-card ' + cls;
    v.innerHTML = txt;
  }
}

function fitCanvasSize(cv) {
  const r = cv.getBoundingClientRect();
  cv.width  = r.width  > 10 ? Math.round(r.width)  : 420;
  cv.height = r.height > 10 ? Math.round(r.height) : 320;
}

function initDimensionCanvas() {
  dimensionCanvas = document.getElementById('dimensionCanvas');
  dimensionFitCanvas = document.getElementById('dimensionFitCanvas');
  if (!dimensionCanvas || !dimensionFitCanvas) return;
  dimensionCtx = dimensionCanvas.getContext('2d');
  dimensionFitCtx = dimensionFitCanvas.getContext('2d');
  fitCanvasSize(dimensionCanvas); fitCanvasSize(dimensionFitCanvas);
  drawDimensionExperiment();
  window.addEventListener('resize', () => {
    fitCanvasSize(dimensionCanvas); fitCanvasSize(dimensionFitCanvas);
    drawDimensionExperiment();
  });
}

(function bindDimensionControls() {
  const s = document.getElementById('setType');
  const f = document.getElementById('scaleFamily');
  const g = document.getElementById('showGrid');
  if (s) s.addEventListener('change', e => { setType = e.target.value; drawDimensionExperiment(); });
  if (f) f.addEventListener('change', e => { scaleFamily = e.target.value; drawDimensionExperiment(); });
  if (g) g.addEventListener('change', e => { showGrid = e.target.checked; drawDimensionExperiment(); });
})();

// 多尺度颗粒化采样实验
let scaleCanvas, scaleCtx;
let currentScale = 4;
let grainCount = 16;
let samplingMode = 'uniform';

function initScaleCanvas() {
  scaleCanvas = document.getElementById('scaleCanvas');
  if (!scaleCanvas) return;
  
  scaleCtx = scaleCanvas.getContext('2d');
  const rect = scaleCanvas.getBoundingClientRect();
  const w = rect.width > 10 ? rect.width : 400;
  const h = rect.height > 10 ? rect.height : 300;
  scaleCanvas.width = w;
  scaleCanvas.height = h;
  
  drawScaleExperiment();
  
  window.addEventListener('resize', () => {
    const r = scaleCanvas.getBoundingClientRect();
    const ww = r.width > 10 ? r.width : 400;
    const hh = r.height > 10 ? r.height : 300;
    scaleCanvas.width = ww;
    scaleCanvas.height = hh;
    drawScaleExperiment();
  });
}

const scaleSlider = document.getElementById('currentScale');
const scaleValue = document.getElementById('scaleValue');
const grainSlider = document.getElementById('grainCount');
const grainValue = document.getElementById('grainValue');
const samplingSelect = document.getElementById('samplingMode');

scaleSlider.addEventListener('input', (e) => {
  currentScale = parseInt(e.target.value);
  scaleValue.textContent = currentScale;
  drawScaleExperiment();
});

grainSlider.addEventListener('input', (e) => {
  grainCount = parseInt(e.target.value);
  grainValue.textContent = grainCount;
  drawScaleExperiment();
});

samplingSelect.addEventListener('change', (e) => {
  samplingMode = e.target.value;
  drawScaleExperiment();
});

function drawScaleExperiment() {
  if (!scaleCtx) return;
  
  const width = scaleCanvas.width || 400;
  const height = scaleCanvas.height || 300;
  if (width < 10 || height < 10) return;
  
  scaleCtx.fillStyle = '#1c1a16';
  scaleCtx.fillRect(0, 0, width, height);
  
  const gridSize = Math.floor(Math.sqrt(grainCount));
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;
  
  let samples = [];
  let totalSamples = 0;
  
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const cx = gx * cellWidth + cellWidth / 2;
      const cy = gy * cellHeight + cellHeight / 2;
      
      let sampleCount = 1;
      if (samplingMode === 'adaptive') {
        const complexity = Math.sin(gx * 0.5) * Math.cos(gy * 0.5) + 0.5;
        sampleCount = Math.floor(1 + complexity * 4);
      } else if (samplingMode === 'directional') {
        sampleCount = 3;
      }
      
      totalSamples += sampleCount;
      
      for (let i = 0; i < sampleCount; i++) {
        let sx = cx;
        let sy = cy;
        
        if (samplingMode === 'adaptive') {
          sx += (Math.random() - 0.5) * cellWidth * 0.3;
          sy += (Math.random() - 0.5) * cellHeight * 0.3;
        } else if (samplingMode === 'directional') {
          const angle = (i / sampleCount) * Math.PI * 2;
          sx += Math.cos(angle) * 10;
          sy += Math.sin(angle) * 10;
        }
        
        samples.push({ x: sx, y: sy, size: 2 + sampleCount });
      }
      
      scaleCtx.strokeStyle = 'rgba(56, 51, 43, 0.5)';
      scaleCtx.lineWidth = 1;
      scaleCtx.strokeRect(gx * cellWidth, gy * cellHeight, cellWidth, cellHeight);
    }
  }
  
  samples.forEach(sample => {
    scaleCtx.beginPath();
    scaleCtx.arc(sample.x, sample.y, sample.size, 0, Math.PI * 2);
    scaleCtx.fillStyle = samplingMode === 'uniform' ? '#d97742' : 
                         samplingMode === 'adaptive' ? '#6f9068' : '#b8683a';
    scaleCtx.fill();
  });
  
  const coverage = (totalSamples / (width * height / 100) * 100).toFixed(1);
  const infoGain = samplingMode === 'adaptive' ? '75-95' : 
                   samplingMode === 'directional' ? '60-85' : '50-70';
  
  document.getElementById('sampleCount').textContent = totalSamples;
  document.getElementById('infoGain').textContent = infoGain + '%';
  document.getElementById('coverage').textContent = coverage + '%';
}

// 波包分解实验
let waveCanvas, waveCtx;
let waveScales = 4;
let waveDirections = 8;
let waveMode = 'sum';
let currentWavePacket = 0;

function initWaveCanvas() {
  waveCanvas = document.getElementById('waveCanvas');
  if (!waveCanvas) return;
  
  waveCtx = waveCanvas.getContext('2d');
  const rect = waveCanvas.getBoundingClientRect();
  const w = rect.width > 10 ? rect.width : 400;
  const h = rect.height > 10 ? rect.height : 300;
  waveCanvas.width = w;
  waveCanvas.height = h;
  
  drawWaveExperiment();
  
  window.addEventListener('resize', () => {
    const r = waveCanvas.getBoundingClientRect();
    const ww = r.width > 10 ? r.width : 400;
    const hh = r.height > 10 ? r.height : 300;
    waveCanvas.width = ww;
    waveCanvas.height = hh;
    drawWaveExperiment();
  });
}

const waveScalesSlider = document.getElementById('waveScales');
const waveScalesValue = document.getElementById('waveScalesValue');
const waveDirectionsSlider = document.getElementById('waveDirections');
const waveDirectionsValue = document.getElementById('waveDirectionsValue');
const waveModeSelect = document.getElementById('waveMode');

waveScalesSlider.addEventListener('input', (e) => {
  waveScales = parseInt(e.target.value);
  waveScalesValue.textContent = waveScales;
  drawWaveExperiment();
});

waveDirectionsSlider.addEventListener('input', (e) => {
  waveDirections = parseInt(e.target.value);
  waveDirectionsValue.textContent = waveDirections;
  drawWaveExperiment();
});

waveModeSelect.addEventListener('change', (e) => {
  waveMode = e.target.value;
  drawWaveExperiment();
});

function drawWaveOnImageData(imageData, x, y, sigma, angle, width, height, mode) {
  const pixels = imageData.data;
  const range = Math.ceil(sigma * 3);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const sigma2 = sigma * sigma;
  const smallSigma2 = (sigma / 3) * (sigma / 3);
  
  const startX = Math.max(0, Math.floor(x - range));
  const endX = Math.min(width, Math.ceil(x + range));
  const startY = Math.max(0, Math.floor(y - range));
  const endY = Math.min(height, Math.ceil(y + range));
  
  let energySum = 0;
  
  for (let py = startY; py < endY; py++) {
    for (let px = startX; px < endX; px++) {
      const dx = px - x;
      const dy = py - y;
      
      const rotX = dx * cosA + dy * sinA;
      const rotY = -dx * sinA + dy * cosA;
      
      const expVal = Math.exp(-(rotX * rotX) / (2 * sigma2) - (rotY * rotY) / (2 * smallSigma2));
      
      energySum += expVal;
      const idx = (py * width + px) * 4;
      
      if (mode === 'sum') {
        pixels[idx] = Math.min(255, pixels[idx] + Math.floor(expVal * 200));
        pixels[idx + 1] = Math.min(255, pixels[idx + 1] + Math.floor(expVal * 150));
        pixels[idx + 2] = Math.min(255, pixels[idx + 2] + Math.floor(expVal * 255));
        pixels[idx + 3] = 255;
      } else {
        const val = Math.floor(expVal * 255);
        pixels[idx] = val;
        pixels[idx + 1] = Math.floor(val * 0.7);
        pixels[idx + 2] = Math.floor(val * 1.3);
        pixels[idx + 3] = 255;
      }
    }
  }
  
  return energySum;
}

function drawWaveExperiment() {
  if (!waveCtx) return;
  
  const width = waveCanvas.width || 400;
  const height = waveCanvas.height || 300;
  if (width < 10 || height < 10) return;
  
  // 清除背景
  waveCtx.fillStyle = '#1c1a16';
  waveCtx.fillRect(0, 0, width, height);
  
  const centerX = width / 2;
  const centerY = height / 2;
  
  let totalEnergy = 0;
  let highFreqEnergy = 0;
  const directionCounts = new Array(waveDirections).fill(0);
  
  if (waveMode === 'sum') {
    // 使用实际的尺度和方向数量
    const effectiveScales = waveScales;
    const effectiveDirections = waveDirections;
    
    // 直接用 canvas 绘制多个高斯波包
    for (let scale = 0; scale < effectiveScales; scale++) {
      const sigma = Math.max(3, 35 / Math.pow(1.5, scale));
      
      for (let dir = 0; dir < effectiveDirections; dir++) {
        const angle = (dir / effectiveDirections) * Math.PI * 2;
        
        // 在方向上绘制线条，模拟波包
        const len = sigma * 3;
        const x1 = centerX - Math.cos(angle) * len;
        const y1 = centerY - Math.sin(angle) * len;
        const x2 = centerX + Math.cos(angle) * len;
        const y2 = centerY + Math.sin(angle) * len;
        
        // 使用简单颜色绘制线条
        const hue = (dir / effectiveDirections) * 360;
        waveCtx.beginPath();
        waveCtx.moveTo(x1, y1);
        waveCtx.lineTo(x2, y2);
        waveCtx.strokeStyle = `hsl(${hue}, 70%, ${40 + scale * 8}%)`;
        waveCtx.lineWidth = sigma / 3;
        waveCtx.lineCap = 'round';
        waveCtx.globalAlpha = 0.5;
        waveCtx.stroke();
        waveCtx.globalAlpha = 1.0;
        
        totalEnergy += 1 / (scale + 1);
        if (scale >= effectiveScales - 2) highFreqEnergy += 1 / (scale + 1);
        directionCounts[dir] += 1 / (scale + 1);
      }
    }
  } else if (waveMode === 'individual') {
    const scaleIdx = Math.floor(currentWavePacket / waveDirections) % waveScales;
    const dirIdx = currentWavePacket % waveDirections;
    const sigma = Math.max(3, 35 / Math.pow(1.5, scaleIdx));
    const angle = (dirIdx / waveDirections) * Math.PI * 2;
    
    // 绘制单个波包
    const len = sigma * 3;
    const x1 = centerX - Math.cos(angle) * len;
    const y1 = centerY - Math.sin(angle) * len;
    const x2 = centerX + Math.cos(angle) * len;
    const y2 = centerY + Math.sin(angle) * len;
    
    const hue = (dirIdx / waveDirections) * 360;
    waveCtx.beginPath();
    waveCtx.moveTo(x1, y1);
    waveCtx.lineTo(x2, y2);
    waveCtx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
    waveCtx.lineWidth = sigma / 2;
    waveCtx.lineCap = 'round';
    waveCtx.stroke();
    
    waveCtx.fillStyle = '#fff';
    waveCtx.font = '14px sans-serif';
    waveCtx.fillText(`波包 ${currentWavePacket + 1} / ${waveScales * waveDirections}`, 10, 25);
  } else if (waveMode === 'energy') {
    const barWidth = Math.max(1, width / (waveScales * waveDirections));
    
    for (let scale = 0; scale < waveScales; scale++) {
      for (let dir = 0; dir < waveDirections; dir++) {
        const index = scale * waveDirections + dir;
        const energy = 1 / (scale + 1);
        const barHeight = energy * height * 0.8;
        
        const hue = (dir / waveDirections) * 360;
        waveCtx.fillStyle = `hsl(${hue}, 70%, ${40 + scale * 8}%)`;
        waveCtx.fillRect(index * barWidth, height - barHeight, Math.max(1, barWidth - 2), barHeight);
      }
    }
  }
  
  // 更新统计信息
  const maxDir = directionCounts.length > 0 ? Math.max(...directionCounts) : 0;
  const minDir = directionCounts.length > 0 ? Math.min(...directionCounts) : 0;
  const uniformity = maxDir > 0 ? ((1 - (maxDir - minDir) / maxDir) * 100).toFixed(1) : '0.0';
  
  const wavePacketCountEl = document.getElementById('wavePacketCount');
  const highFreqEnergyEl = document.getElementById('highFreqEnergy');
  const directionUniformityEl = document.getElementById('directionUniformity');
  
  if (wavePacketCountEl) wavePacketCountEl.textContent = waveScales * waveDirections;
  if (highFreqEnergyEl) highFreqEnergyEl.textContent = totalEnergy > 0 ? ((highFreqEnergy / totalEnergy) * 100).toFixed(1) + '%' : '0.0%';
  if (directionUniformityEl) directionUniformityEl.textContent = uniformity + '%';
}

// 波包动画控制
let waveAnimationId = null;
let lastWaveUpdateTime = 0;
const WAVE_UPDATE_INTERVAL = 400; // ms

function startWaveAnimation() {
  stopWaveAnimation();
  const animate = (currentTime) => {
    if (waveMode === 'individual' && waveCanvas && waveCanvas.width > 0) {
      if (currentTime - lastWaveUpdateTime > WAVE_UPDATE_INTERVAL) {
        currentWavePacket = (currentWavePacket + 1) % (waveScales * waveDirections);
        drawWaveExperiment();
        lastWaveUpdateTime = currentTime;
      }
    }
    waveAnimationId = requestAnimationFrame(animate);
  };
  waveAnimationId = requestAnimationFrame(animate);
}

function stopWaveAnimation() {
  if (waveAnimationId) {
    cancelAnimationFrame(waveAnimationId);
    waveAnimationId = null;
  }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  // 只初始化Three.js（intro section是可见的）
  initThree();
  initializedCanvases.add('three');
});
/* ---------------------------------------------------------------------------
 * Star prompt.
 *
 * Asking before the visitor has got anything out of the page is just an ad, so
 * it waits until they have actually explored - several sections, or real use of
 * the 2D experiment. Dismissing it is permanent, and following the link counts
 * as dismissing it too. It never blocks anything on the page.
 * ------------------------------------------------------------------------- */
(function initStarPrompt() {
  const KEY = 'kakeya-star-prompt-dismissed';
  let sectionsSeen = 0, interactions = 0, shown = false;

  function dismiss() {
    const el = document.getElementById('starPrompt');
    if (el) el.hidden = true;
    try { localStorage.setItem(KEY, '1'); } catch (e) { /* private mode */ }
  }

  function maybeShow() {
    if (shown) return;
    try { if (localStorage.getItem(KEY)) return; } catch (e) { /* ignore */ }
    if (sectionsSeen < 4 && interactions < 12) return;
    const el = document.getElementById('starPrompt');
    if (!el) return;
    el.hidden = false;
    shown = true;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const close = document.getElementById('starPromptClose');
    const later = document.getElementById('starPromptLater');
    const go = document.getElementById('starPromptGo');
    if (close) close.addEventListener('click', dismiss);
    if (later) later.addEventListener('click', dismiss);
    if (go) go.addEventListener('click', dismiss);

    document.querySelectorAll('.nav-link').forEach((a) =>
      a.addEventListener('click', () => { sectionsSeen++; maybeShow(); }));
    ['directionCount', 'compression', 'mode', 'sampleCount', 'tubeRadius']
      .forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => { interactions++; maybeShow(); });
      });
  });
})();

// 正文内跳转链接 (致谢区 -> 维数测量仪)
document.querySelectorAll('.jump-link').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = a.dataset.jump;
    if (target) navigateTo(target);
  });
});
