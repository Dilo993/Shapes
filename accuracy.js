export function calculateAccuracy(bgCtx, drawCtx, width, height) {
    const imgDataTemplate = bgCtx.getImageData(0, 0, width, height).data;
    const imgDataUser = drawCtx.getImageData(0, 0, width, height).data;
    
    let templatePixels = 0;
    let userPixels = 0;
    let correctMatches = 0;

    function checkTemplateNearby(x, y, radius) {
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    let idx = (ny * width + nx) * 4;
                    if (imgDataTemplate[idx + 3] > 50) return true;
                }
            }
        }
        return false;
    }

    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            let idx = (y * width + x) * 4;
            
            const tF = imgDataTemplate[idx + 3] > 50;
            const uF = imgDataUser[idx + 3] > 50;
            
            if (tF) templatePixels++;
            if (uF) {
                userPixels++;
                if (checkTemplateNearby(x, y, 8)) {
                    correctMatches++;
                }
            }
        }
    }

    if (userPixels === 0) return 0;

    let precision = correctMatches / userPixels;
    let recall = correctMatches / templatePixels;

    let f1Score = 0;
    if (precision + recall > 0) {
        f1Score = (2 * precision * recall) / (precision + recall);
    }

    return Math.min(f1Score * 100, 100);
}