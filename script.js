// LOADING ANIMATION
let progress = 0;
const text = document.getElementById('loading-text');
const fill = document.querySelector('.fill');
const mainContent = document.getElementById('main-content');
const loader = document.getElementById('loading-screen');

const loadingInterval = setInterval(() => {
  progress++;
  text.textContent = `${progress}%`;
  fill.style.width = progress + '%';
  if (progress >= 100) {
    clearInterval(loadingInterval);
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      mainContent.classList.remove('hidden');
      init3DMap();
    }, 500);
  }
}, 50);

// THREE.JS 3D MAP
function init3DMap() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1.6, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const container = document.getElementById('map3D');
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(5, 0.5, 3);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff99 });
  const school = new THREE.Mesh(geometry, material);
  scene.add(school);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  camera.position.z = 6;

  function animate() {
    requestAnimationFrame(animate);
    school.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
}
