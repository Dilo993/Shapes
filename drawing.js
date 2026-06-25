export class DrawingManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
        this.isDrawing = false;
        this.canDraw = false;

        this.applyBrushStyles();

        this.initEvents();
    }

    applyBrushStyles() {
        this.ctx.lineWidth = 12;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#ffffff';
    }

    initEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.start(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stop());
        this.canvas.addEventListener('mouseout', () => this.stop());

        this.canvas.addEventListener('touchstart', (e) => { this.start(e.touches[0]); e.preventDefault(); });
        this.canvas.addEventListener('touchmove', (e) => { this.draw(e.touches[0]); e.preventDefault(); });
        this.canvas.addEventListener('touchend', () => { this.stop(); });
    }

    start(e) {
        if (!this.canDraw) return;
        
        this.applyBrushStyles();
        
        this.isDrawing = true;
        this.ctx.beginPath();
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    draw(e) {
        if (!this.isDrawing || !this.canDraw) return;
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        this.ctx.stroke();
    }

    stop() {
        this.isDrawing = false;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.applyBrushStyles();
    }
}