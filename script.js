import { FOLDERY } from './shape.js';
import { DrawingManager } from './drawing.js';
import { calculateAccuracy } from './accuracy.js';

let drawCanvas, bgCanvas, bgCtx, startBtn, resultDiv;
let modal, btnSelectShape, modalClose, modalGrid, btnBackToFolders, modalTitle;
let drawingManager;

let showTemplate = true;
let currentImg = new Image();
let timeLeft = 6;
let timerInterval = null;

let activeFolderIndex = 0;
let activeShapeIndex = 0;

window.addEventListener('DOMContentLoaded', () => {
    drawCanvas = document.getElementById('drawCanvas');
    bgCanvas = document.getElementById('bgCanvas');
    bgCtx = bgCanvas.getContext('2d');
    startBtn = document.getElementById('startOverlayBtn');
    resultDiv = document.getElementById('result');

    modal = document.getElementById('shapeModal');
    btnSelectShape = document.getElementById('btnSelectShape');
    modalClose = document.querySelector('.modal-close');
    modalGrid = document.getElementById('modalGrid');
    btnBackToFolders = document.getElementById('btnBackToFolders');
    modalTitle = document.getElementById('modalTitle');

    drawingManager = new DrawingManager(drawCanvas);

    renderFolders();

    btnBackToFolders.addEventListener('click', renderFolders);

    btnSelectShape.addEventListener('click', () => {
        renderFolders();
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

    changeCharacter();
});

function renderFolders() {
    modalGrid.innerHTML = '';
    btnBackToFolders.style.display = 'none';
    modalTitle.innerHTML = 'Wybierz kategorię';

    FOLDERY.forEach((folder, folderIdx) => {
        const card = document.createElement('div');
        card.className = 'shape-card folder-card';
        card.innerHTML = `
            <span style="font-size: 40px; color: #ffc107;">📁</span>
            <span>${folder.categoryName}</span>
        `;
        card.addEventListener('click', () => {
            renderShapes(folderIdx);
        });
        modalGrid.appendChild(card);
    });
}

function renderShapes(folderIdx) {
    modalGrid.innerHTML = '';
    btnBackToFolders.style.display = 'block';
    modalTitle.innerHTML = FOLDERY[folderIdx].categoryName;

    FOLDERY[folderIdx].shapes.forEach((znak, shapeIdx) => {
        const card = document.createElement('div');
        card.className = 'shape-card';
        card.innerHTML = `
            <img src="${znak.url}" alt="${znak.name}">
            <span>${znak.name}</span>
        `;
        card.addEventListener('click', () => {
            activeFolderIndex = folderIdx;
            activeShapeIndex = shapeIdx;
            changeCharacter();
            modal.style.display = 'none';
        });
        modalGrid.appendChild(card);
    });
}

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
            
            if (!showTemplate) {
                bgCanvas.style.display = 'block';
            }

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
    const aktualnyZnak = FOLDERY[activeFolderIndex].shapes[activeShapeIndex];
    currentImg.crossOrigin = "Anonymous";
    currentImg.src = aktualnyZnak.url;
    currentImg.onload = function() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgCtx.drawImage(currentImg, 40, 40, 320, 320);
        clearCanvas();
    };
}

function checkAccuracy() {
    clearInterval(timerInterval);
    drawingManager.canDraw = false;
    startBtn.style.display = 'block';

    const score = calculateAccuracy(bgCtx, drawingManager.ctx, bgCanvas.width, bgCanvas.height);
    
    if (score === 0 && drawingManager.isDrawing === false) {
        resultDiv.innerHTML = `Wynik: 0% (Nic nie narysowano)`;
    } else {
        resultDiv.innerHTML = `Wynik: ${score.toFixed(0)}%`;
    }
}