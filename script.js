import { FOLDERY } from './shape.js';
import { DrawingManager } from './drawing.js';
import { calculateAccuracy } from './accuracy.js';

let drawCanvas, bgCanvas, bgCtx, resultDiv;
let modal, btnSelectShape, modalClose, modalCategoriesContainer, btnApplyShapes;
let drawingManager;

let showTemplate = true;
let timeLeft = 6;
let timerInterval = null;

let gameStarted = false;

let wybraneZnaki = [{ fIdx: 0, sIdx: 0 }];

window.addEventListener('DOMContentLoaded', () => {
    drawCanvas = document.getElementById('drawCanvas');
    bgCanvas = document.getElementById('bgCanvas');
    bgCtx = bgCanvas.getContext('2d');
    resultDiv = document.getElementById('result');

    modal = document.getElementById('shapeModal');
    btnSelectShape = document.getElementById('btnSelectShape');
    modalClose = document.querySelector('.modal-close');
    modalCategoriesContainer = document.getElementById('modalCategoriesContainer');
    btnApplyShapes = document.getElementById('btnApplyShapes');

    drawingManager = new DrawingManager(drawCanvas);
    drawingManager.canDraw = true;

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
            
            const isChecked = wybraneZnaki.some(z => z.fIdx === folderIdx && z.sIdx === shapeIdx);

            label.innerHTML = `
                <input type="checkbox" value="${folderIdx}-${shapeIdx}" ${isChecked ? 'checked' : ''} style="margin-right: 10px; transform: scale(1.1);">
                ${znak.name}
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
    
    drawCanvas.addEventListener('mousedown', handleFirstStroke);
    drawCanvas.addEventListener('touchstart', handleFirstStroke);

    changeCharacter();
});

function handleFirstStroke() {
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 6;
    drawingManager.canDraw = true;
    resultDiv.innerHTML = `Pozostały czas: ${timeLeft}s`;

    if (!showTemplate) {
        bgCanvas.style.display = 'none';
    }

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            resultDiv.innerHTML = `Pozostały czas: ${timeLeft}s`;
        } else {
            clearInterval(timerInterval);
            drawingManager.canDraw = false;
            drawingManager.stop();
            
            bgCanvas.style.display = 'block';

            resultDiv.innerHTML = "Koniec czasu! Sprawdzam...";
            setTimeout(checkAccuracy, 500);
        }
    }, 1000);
}

function clearCanvas() {
    clearInterval(timerInterval);
    drawingManager.clear();
    
    gameStarted = false; 
    drawingManager.canDraw = true;
    
    bgCanvas.style.display = showTemplate ? 'block' : 'none'; 
    
    resultDiv.innerHTML = showTemplate 
        ? 'Zacznij rysować po płótnie, aby uruchomić czas (6s)!' 
        : 'Przyjrzyj się kształtowi (w trybie z pamięci zniknie on po pierwszym dotknięciu)!';
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

    const unikalneFoldery = new Set(wybraneZnaki.map(pozycja => pozycja.fIdx));
    const czyMiksFolderow = unikalneFoldery.size > 1;

    const iloscWFolderze = {};
    wybraneZnaki.forEach(p => {
        iloscWFolderze[p.fIdx] = (iloscWFolderze[p.fIdx] || 0) + 1;
    });

    const KĄTY = [
        { x: 10,  y: 10 }, 
        { x: 134, y: 10 },
        { x: 10,  y: 134 },
        { x: 134, y: 134 }
    ];

    const licznikKątówDlaFolderu = {};

    wybraneZnaki.forEach((pozycja) => {
        const znak = FOLDERY[pozycja.fIdx].shapes[pozycja.sIdx];
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = znak.url;

        img.onload = function() {
            bgCtx.save();
            
            let szerokosc = 320;
            let wysokosc = 320;
            let marginesX = 40;
            let marginesY = 40;

            const czyWieleZtegoSamegoFolderu = iloscWFolderze[pozycja.fIdx] > 1;

            if (czyWieleZtegoSamegoFolderu) {
                szerokosc = 320 * 0.8;
                wysokosc = 320 * 0.8;
                
                if (licznikKątówDlaFolderu[pozycja.fIdx] === undefined) {
                    licznikKątówDlaFolderu[pozycja.fIdx] = 0;
                }
                const katIndex = licznikKątówDlaFolderu[pozycja.fIdx] % 4;
                
                marginesX = KĄTY[katIndex].x;
                marginesY = KĄTY[katIndex].y;
                
                licznikKątówDlaFolderu[pozycja.fIdx]++;
            }

            if (czyMiksFolderow && pozycja.fIdx === 0) {
                const staraSzerokosc = szerokosc;
                const staraWysokosc = wysokosc;

                szerokosc = szerokosc * 1.5;
                wysokosc = wysokosc * 1.5;

                if (!czyWieleZtegoSamegoFolderu) {
                    marginesX = (bgCanvas.width - szerokosc) / 2;
                    marginesY = (bgCanvas.height - wysokosc) / 2;
                } else {
                    marginesX -= (szerokosc - staraSzerokosc) / 2;
                    marginesY -= (wysokosc - staraWysokosc) / 2;
                }
            }

            const kat = znak.rotation || 0;
            if (kat !== 0) {
                const srodekX = marginesX + szerokosc / 2;
                const srodekY = marginesY + wysokosc / 2;
                
                bgCtx.translate(srodekX, srodekY);
                bgCtx.rotate((kat * Math.PI) / 180);
                bgCtx.translate(-srodekX, -srodekY);
            }

            bgCtx.drawImage(img, marginesX, marginesY, szerokosc, wysokosc);
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

    const score = calculateAccuracy(bgCtx, drawingManager.ctx, bgCanvas.width, bgCanvas.height);
    
    if (score === 0 && drawingManager.isDrawing === false) {
        resultDiv.innerHTML = `Wynik: 0% (Nic nie narysowano)`;
    } else {
        resultDiv.innerHTML = `Wynik: ${score.toFixed(0)}%`;
    }
}