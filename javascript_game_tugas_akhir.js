/*
  (catatan) ada beberapa masalah yang saya hadapi yaitu tidak dapat memuat suara ketika saya
  tidak melakukan interaksi kontrol sama sekali, mulai dari interaksi gerak dan yang lain lain.
  Hal ini juga memunculkan error pada debug console(DOMException), tapi bisa diatasi dengan melakukan interaksi kontrol seperti
  menekan tombol spasi untuk menembak :)

  Nama : Naufal Muhammad Dzaky
  kelas : PPLG
  tugas : tugas akhir kelas JS GameDev Gamelab
*/


const canvas = document.getElementById("canvasNaufal");
const ctx = canvas.getContext("2d");

const playerName = prompt("Masukkan nama Anda:"); // agar meminta nama anda


// Mendapatkan elemen suara dan gambar
const suaraDor = document.getElementById("suaraTembak");
const suaraBmm = document.getElementById("suaraBum");
const lose = document.getElementById("wk");
const suaraPoin = document.getElementById("poinUp");

// ukuran dan posisi awal segitiga
const triangleWidth = 60;
const triangleHeight = 30;
let triangleX = 10;
let triangleY = canvas.height / 2 - triangleHeight / 2;

// peluru
const peluruRadius = 5;
const peluruSpeed = 10;
const peluruCooldown = 250;
let lastPeluruTime = 0;
let peluru = [];

// musuh
const enemySize = 89;
const enemyWidth = 50;
const enemyHeight = 90;
const enemySpeed = 5;
let enemies = [];

// Skor dan nyawa player
let score = 0;
let lives = 10;

let isMouseDown = false;

// gambar
function gambar() {
  // Create an image element
  const img = document.createElement("img");

  // Set attributes for the image
  img.src = "gambar/gemleb.png"; // Replace with the actual image path
  img.width = 140;
  img.height = 60;

  // Apply CSS styles to position the image
  img.style.position = "absolute";
  img.style.top = "10px"; 
  img.style.left = "20px"; 
  const imageContainer = document.getElementById("foto");
  imageContainer.appendChild(img);
}

// menggambar segitiga
function drawTriangle(x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + triangleWidth, y + triangleHeight / 2);
  ctx.lineTo(x, y + triangleHeight);
  ctx.closePath();

  // Tambahkan efek menyala
  ctx.shadowColor = "blue";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = "blue"; // ubah warna menjadi biru
  ctx.fill();

  // Hapus efek bayangan setelah menggambar segitiga
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Menggambar peluru
function drawPeluru(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, peluruRadius, 0, Math.PI * 2);

  // Tambahkan efek menyala
  ctx.shadowColor = "white";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = "red";
  ctx.fill();

  // Hapus efek menyala
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// menggambar musuh berbentuk pentagon
function drawEnemy(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 2);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(enemyWidth, -enemyHeight / 2);
  ctx.lineTo(enemyWidth / 2, -enemyHeight);
  ctx.lineTo(-enemyWidth / 2, -enemyHeight);
  ctx.lineTo(-enemyWidth, -enemyHeight / 2);
  ctx.closePath();

  // efek menyala
  ctx.shadowColor = "purple";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = "purple";
  ctx.fill();

  // Hapus efek menyala
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Mengembalikan transformasi sebelumnya
  ctx.restore();
}
// menggambar efek explode
function drawExplosion(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  ctx.fillStyle = color;
  ctx.fill();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// menggambar latar belakang
function drawStars() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Menggambar bintang random warna putih
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 5;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 20);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

// untuk update kanvas
function updateCanvas() {
  clearCanvas();
  drawStars();

  peluru.forEach((pel, pelIndex) => {
    pel.x += peluruSpeed;
    drawPeluru(pel.x, pel.y);

    enemies.forEach((enemy, enemyIndex) => {
      // jarak kena musuh dan peluru
      const dx = pel.x - enemy.x;
      const dy = pel.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // jika peluru mengenai musuh
      if (distance < peluruRadius + enemySize / 2) {
        peluru.splice(pelIndex, 1); // Menghapus peluru
        createExplosion(enemy.x, enemy.y); // Membuat efek ledakan
        enemies.splice(enemyIndex, 1); // Menghapus musuh
        score += 1; // Menambah skor
        suaraPoin.play()
        updateScore(); // Memperbarui skor
      }
    });

    // Menghapus peluru jika melewati batas
    if (pel.x > canvas.width) {
      peluru.splice(pelIndex, 1);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.x -= enemySpeed;
    drawEnemy(enemy.x, enemy.y);

    // Menghapus musuh jika melewati batas
    if (enemy.x + enemySize / 2 < 0) {
      enemies.splice(index, 1);
      reduceLives(); // Mengurangi nyawa jika musuh lolos
    }
  });

  drawTriangle(triangleX, triangleY);
}

// efek explode pada posisi tertentu
function createExplosion(x, y) {
  let explosionSize = 1;
  let colorIndex = 0;
  const colors = ["red", "orange", "yellow", "white", "yellow", "orange", "red"];

  // menggambar efek ledakan
  const boomEffect = setInterval(() => {
    drawExplosion(x, y, explosionSize, colors[colorIndex]);
    explosionSize += 2;
    colorIndex = (colorIndex + 1) % colors.length;
    if (explosionSize > 40) {
      clearInterval(boomEffect);
    }
  }, 30);

  suaraBmm.play(); // sfx
  console.log("duwarrr, musuh hancur");
}


// Fungsi untuk menembakkan peluru
function shootPeluru() {
  // untuk membuat jeda per tembakan
  const currentTime = new Date().getTime();
  if (currentTime - lastPeluruTime > peluruCooldown) {
    const peluruX = triangleX + triangleWidth;
    const peluruY = triangleY + triangleHeight / 2;
    peluru.push({ x: peluruX, y: peluruY });
    lastPeluruTime = currentTime; // Memperbarui waktu peluru terakhir ditembakkan
    console.log("piuw");
    suaraDor.play(); // Memutar suara tembakan
  }
}

// spawn musuh
function spawnEnemy() {
  const enemyY = Math.random() * (canvas.height - enemyHeight);
  enemies.push({ x: canvas.width, y: enemyY });
}

// Fungsi untuk updaete skor
function updateScore() {
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = `Skor: ${score}`;
  scoreElement.style.color = "blue"; // Mengubah warna teks skor menjadi biru
}


// Fungsi untuk update nyawa
function updateLives() {
  const livesElement = document.getElementById("lives");
  livesElement.textContent = `Nyawa: ${lives}`;
  livesElement.style.color = "red"; // Mengubah warna teks nyawa menjadi merah
}

// nyawa berkurang
function reduceLives() {
  lives -= 1; // Mengurangi nyawa
  lose.play(); // sfx
  console.log("aduh, musuh lolos");
  updateLives(); // tampilan nyawa
  

  // jika nyawa kurang dari -1 maka akan muncul alert
  if (lives === -1 ) {
    alert("Game Over");
    alert(`Hi. ${playerName} Skor terakhir kamu adalah ${score}`);
    document.location.reload(); // refresh halaman
  }
}


canvas.addEventListener("mousemove", (event) => {
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;

  triangleY = mouseY - triangleHeight / 2;
  triangleX = mouseX - triangleWidth / 2;

  if (triangleY < 0) {
    triangleY = 0;
  } else if (triangleY > canvas.height - triangleHeight) {
    triangleY = canvas.height - triangleHeight;
  }

  if (triangleX < 0) {
    triangleX = 0;
  } else if (triangleX > canvas.width - triangleWidth) {
    triangleX = canvas.width - triangleWidth;
  }

});

// Event listener untuk mendeteksi saat tombol spasi ditekan
document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    shootPeluru();
  }
});

updateScore();
updateLives();
gambar();
console.log(`Halo, selamat mencoba ${playerName}`);
setInterval(updateCanvas, 10); // menjalankan fungsi setiap 10 milidetik
setInterval(spawnEnemy, 1000); // fungsi akan dijalankan setiap 1000 milidetik
