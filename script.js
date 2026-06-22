import { ZNAKI } from './shape.js';
import { DrawingManager } from './drawing.js';
import { calculateAccuracy } from './accuracy.js';

const drawCanvas = document.getElementById('drawCanvas');
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const startBtn = document.getElementById('startOverlayBtn');
const resultDiv = document.getElementById('result');

const modal = document.getElementById('shapeModal');
const btnSelectShape = document.getElementById('btnSelectShape');
const modalClose = document.querySelector('.modal-close');
const modalGrid = document.getElementById('modalGrid');

const drawingManager = new DrawingManager(drawCanvas);

let showTemplate = true;
let currentImg = new Image();
let timeLeft = 6;
let timerInterval = null;
let activeShapeIndex = 0;

ZNAKI.forEach((znak, index) => {
    const card = document.createElement('div');
    card.className = 'shape-card';
    card.innerHTML = `
        <img src="${znak.url}" alt="${znak.name}">
        <span>${znak.name}</span>
    `;
    card.addEventListener('click', () => {
        activeShapeIndex = index;
        changeCharacter();
        modal.style.display = 'none';
    });
    modalGrid.appendChild(card);
});

btnSelectShape.addEventListener('click', () => {
    modal.style.display = 'block';
});

modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

document.getElementById('btnWithTemplate').addEventListener('click', () => setMode(true));
document.getElementById('btnWithoutTemplate').addEventListener('click', () => setMode(false));
document.getElementById('btnClear').addEventListener('click', clearCanvas);
document.getElementById('btnCheck').addEventListener('click', checkAccuracy);
startBtn.addEventListener('click', startTimer);

function startTimer() {
    startBtn.style.display = 'none';
    drawingManager.clear();
    
    clearInterval(timerInterval);
    timeLeft = 6;
    drawingManager.canDraw = true;
    resultDiv.innerHTML = `Pozostały czas: ${timeLeft}s`;

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            resultDiv.innerHTML = `Pozostały czas: ${timeLeft}s`;
        } else {
            clearInterval(timerInterval);
            drawingManager.canDraw = false;
            drawingManager.stop();
            resultDiv.innerHTML = "Koniec czasu! Sprawdzam...";
            setTimeout(checkAccuracy, 500);
        }
    }, 1000);
}

function resetGameUI() {
    clearInterval(timerInterval);
    drawingManager.canDraw = false;
    drawingManager.stop();
    startBtn.style.display = 'block';
}

function clearCanvas() {
    drawingManager.clear();
    resultDiv.innerHTML = 'Kliknij START, aby spróbować ponownie!';
    resetGameUI();
}

function setMode(mode) {
    showTemplate = mode;
    document.getElementById('btnWithTemplate').classList.toggle('active', mode);
    document.getElementById('btnWithoutTemplate').classList.toggle('active', !mode);
    bgCanvas.style.display = mode ? 'block' : 'none';
    clearCanvas();
}

function changeCharacter() {
    currentImg.crossOrigin = "Anonymous";
    currentImg.src = ZNAKI[activeShapeIndex].url;
    currentImg.onload = function() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgCtx.drawImage(currentImg, 40, 40, 320, 320);
        clearCanvas();
    };
}

changeCharacter();