import { FOLDERY } from './shape.js';
import { DrawingManager } from './drawing.js';
import { calculateAccuracy } from './accuracy.js';

let drawCanvas, bgCanvas, bgCtx, startBtn, resultDiv;
let modal, btnSelectShape, modalClose, modalCategoriesContainer, btnApplyShapes;
let drawingManager;

let showTemplate = true;
let timeLeft = 6;
let timerInterval = null;

let wybraneZnaki = [{ fIdx: 0, sIdx: 0 }];

window.addEventListener('DOMContentLoaded', () => {
    drawCanvas = document.getElementById('drawCanvas');
    bgCanvas = document.getElementById('bgCanvas');
    bgCtx = bgCanvas.getContext('2d');
    startBtn = document.getElementById('startOverlayBtn');
    resultDiv = document.getElementById('result');

    modal = document.getElementById('shapeModal');
    btnSelectShape = document.getElementById('btnSelectShape');
    modalClose = document.querySelector('.modal-close');
    modalCategoriesContainer = document.getElementById('modalCategoriesContainer');
    btnApplyShapes = document.getElementById('btnApplyShapes');

    drawingManager = new DrawingManager(drawCanvas);

    FOLDERY.forEach((folder, folderIdx) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        
        categoryCard.innerHTML = `
            <h3>📁 ${folder.categoryName}</h3>
            <div class="category-options"></div>
        `;
        
        const optionsContainer = categoryCard.querySelector('.category-options');

        folder.shapes.forEach((znak, shapeIdx) => {
            const label = document.createElement('label');
            label.style.cursor = 'pointer';
            label.style.fontSize = '16px';
            label.style.display = 'block';

            const infoObrót = znak.rotation ? ` (${znak.rotation}°)` : '';
            
            const isChecked = wybraneZnaki.some(z => z.fIdx === folderIdx && z.sIdx === shapeIdx);

            label.innerHTML = `
                <input type="checkbox" value="${folderIdx}-${shapeIdx}" ${isChecked ? 'checked' : ''} style="margin-right: 10px; transform: scale(1.1);">
                ${znak.name}${infoObrót}
            `;
            optionsContainer.appendChild(label);
        });

        modalCategoriesContainer.appendChild(categoryCard);
    });
    btnApplyShapes.addEventListener('click', () => {
        const checkboxes = modalCategoriesContainer.querySelectorAll('input[type="checkbox"]');
        wybraneZnaki = [];

        checkboxes.forEach(cb => {
            if (cb.checked) {
                const [fIdx, sIdx] = cb.value.split('-').map(Number);
                wybraneZnaki.push({ fIdx, sIdx });
            }
        });

        if (wybraneZnaki.length === 0) {
            alert("Musisz zaznaczyć przynajmniej jeden kształt!");
            return;
        }

        changeCharacter();
        modal.style.display = 'none';
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

    changeCharacter();
});

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
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    let loadedCount = 0;

    wybraneZnaki.forEach(pozycja => {
        const znak = FOLDERY[pozycja.fIdx].shapes[pozycja.sIdx];
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = znak.url;

        img.onload = function() {
            bgCtx.save();
            
            const kat = znak.rotation || 0;
            if (kat !== 0) {
                bgCtx.translate(bgCanvas.width / 2, bgCanvas.height / 2);
                bgCtx.rotate((kat * Math.PI) / 180);
                bgCtx.translate(-bgCanvas.width / 2, -bgCanvas.height / 2);
            }

            bgCtx.drawImage(img, 40, 40, 320, 320);
            bgCtx.restore();

            loadedCount++;
            if (loadedCount === wybraneZnaki.length) {
                clearCanvas();
            }
        };
    });
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