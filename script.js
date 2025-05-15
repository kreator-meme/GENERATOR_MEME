const memeCanvas = document.getElementById("memeCanvas");
const templates = [
  "https://i.imgflip.com/1bij.jpg",
  "https://i.imgflip.com/26am.jpg",
  "https://i.imgflip.com/2wifvo.jpg",
  "https://i.imgflip.com/1otk96.jpg",
  "https://i.imgflip.com/3si4.jpg",
  "https://i.imgflip.com/4t0m5.jpg",
  "https://i.imgflip.com/2fm6x.jpg",
  "https://i.imgflip.com/30b1gx.jpg",
  "https://i.imgflip.com/1ur9b0.jpg"
];

function addText(position) {
  const value = document.getElementById(position === 'top' ? "topText" : "bottomText").value;
  if (!value) return;

  let oldText = document.getElementById(position + "TextElement");
  if (oldText) oldText.remove();

  const textEl = document.createElement("div");
  textEl.className = "meme-text";
  textEl.id = position + "TextElement";
  textEl.innerText = value;
  textEl.style.fontSize = document.getElementById("textSize").value + "px";
  textEl.style.top = position === 'top' ? '10px' : '80%';
  textEl.style.left = '50%';
  textEl.style.transform = 'translateX(-50%)';

  addDragAndDelete(textEl);
  memeCanvas.appendChild(textEl);
}

function updateTextSize() {
  const size = document.getElementById("textSize").value + "px";
  ["topTextElement", "bottomTextElement"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.fontSize = size;
  });
}

function addDragAndDelete(el) {
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "×";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    el.remove();
  });
  el.appendChild(deleteBtn);

  el.addEventListener("mousedown", startDrag);
  el.addEventListener("touchstart", startTouchDrag, { passive: false });
  el.addEventListener("click", (e) => {
    document.querySelectorAll(".meme-text").forEach(e => e.classList.remove("selected"));
    el.classList.add("selected");
    e.stopPropagation();
  });
}

let activeText = null;
let offsetX = 0;
let offsetY = 0;

function startDrag(e) {
  if (e.target.classList.contains("delete-btn")) return;
  activeText = e.currentTarget;
  const rect = activeText.getBoundingClientRect();
  const canvasRect = memeCanvas.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDrag);
}

function drag(e) {
  if (!activeText) return;
  const canvasRect = memeCanvas.getBoundingClientRect();
  let x = e.clientX - canvasRect.left - offsetX;
  let y = e.clientY - canvasRect.top - offsetY;

  const maxX = canvasRect.width - activeText.offsetWidth;
  const maxY = canvasRect.height - activeText.offsetHeight;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  activeText.style.left = x + "px";
  activeText.style.top = y + "px";
  activeText.style.transform = "none";
}

function stopDrag() {
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDrag);
  activeText = null;
}

function startTouchDrag(e) {
  if (e.target.classList.contains("delete-btn")) return;
  e.preventDefault();
  activeText = e.currentTarget;
  const touch = e.touches[0];
  const rect = activeText.getBoundingClientRect();
  const canvasRect = memeCanvas.getBoundingClientRect();
  offsetX = touch.clientX - rect.left;
  offsetY = touch.clientY - rect.top;
  document.addEventListener("touchmove", touchDrag, { passive: false });
  document.addEventListener("touchend", stopTouchDrag);
}

function touchDrag(e) {
  if (!activeText) return;
  const touch = e.touches[0];
  const canvasRect = memeCanvas.getBoundingClientRect();
  let x = touch.clientX - canvasRect.left - offsetX;
  let y = touch.clientY - canvasRect.top - offsetY;

  const maxX = canvasRect.width - activeText.offsetWidth;
  const maxY = canvasRect.height - activeText.offsetHeight;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  activeText.style.left = x + "px";
  activeText.style.top = y + "px";
  activeText.style.transform = "none";
}

function stopTouchDrag() {
  document.removeEventListener("touchmove", touchDrag);
  document.removeEventListener("touchend", stopTouchDrag);
  activeText = null;
}

function refreshTemplates() {
  const shuffled = templates.sort(() => 0.5 - Math.random()).slice(0, 9);
  const grid = document.getElementById("templateGrid");
  grid.innerHTML = "";
  shuffled.forEach(src => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onclick = () => loadImage(src);
    grid.appendChild(img);
  });
}

function loadImage(src) {
  memeCanvas.innerHTML = "";
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  img.onload = () => {
    img.style.maxWidth = "100%";
    img.style.display = "block";
    memeCanvas.appendChild(img);
  };
}

document.getElementById("upload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => loadImage(e.target.result);
    reader.readAsDataURL(file);
  }
});

function downloadMeme() {
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach(btn => btn.style.display = "none");

  document.querySelectorAll(".meme-text").forEach(el => el.classList.remove("selected"));
  html2canvas(memeCanvas, { useCORS: true }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL();
    link.click();
    deleteButtons.forEach(btn => btn.style.display = "block");
  });
}

refreshTemplates();