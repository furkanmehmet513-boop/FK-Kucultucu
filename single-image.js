// ==================== FK KÜÇÜLT - SINGLE-IMAGE.JS ====================

let singleOriginalFile = null;
let singleCompressedBlob = null;

/**
 * Tekli fotoğraf sıkıştırma arayüzünü başlatır
 */
function initSingleImage() {
    const container = document.getElementById('single-container');
    if (!container) return;

    container.innerHTML = `
        <div class="dropzone" id="single-dropzone">
            <i class="fa-solid fa-cloud-upload-alt"></i>
            <p>Fotoğrafı sürükleyin veya tıklayın</p>
            <input type="file" id="single-input" accept="image/*" style="display:none;">
        </div>
        <div id="single-info" class="file-info" style="display:none;"></div>
        <div id="single-preview" style="display:none; text-align:center; margin-bottom:15px;">
            <img id="single-preview-img" style="max-width:100%; max-height:300px; border-radius:12px;">
        </div>
        <div class="quality-section" id="single-quality-section" style="display:none;">
            <label>Kalite: <span id="single-quality-value">%70</span></label>
            <input type="range" id="single-quality-slider" min="10" max="100" value="70">
        </div>
        <button id="single-compress-btn" class="btn-primary" style="display:none;">
            <i class="fa-solid fa-compress"></i> Küçült
        </button>
        <div id="single-result" class="result-box" style="display:none;"></div>
    `;

    const dropzone = document.getElementById('single-dropzone');
    const fileInput = document.getElementById('single-input');
    const compressBtn = document.getElementById('single-compress-btn');
    const qualitySlider = document.getElementById('single-quality-slider');
    const qualityValue = document.getElementById('single-quality-value');

    // Kalite slider'ı
    qualitySlider.addEventListener('input', () => {
        qualityValue.innerText = '%' + qualitySlider.value;
    });

    // Dropzone tıklama
    dropzone.addEventListener('click', () => fileInput.click());

    // Dosya seçildi
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleSingleFile(file);
            fileInput.value = '';
        }
    });

    // Sürükle-bırak
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleSingleFile(file);
        }
    });

    // Sıkıştırma
    compressBtn.addEventListener('click', async () => {
        if (!singleOriginalFile) return;
        setButtonLoading(compressBtn, true);

        try {
            const quality = qualitySlider.value / 100;
            singleCompressedBlob = await compressImage(singleOriginalFile, quality);
            showResult('single-result', singleOriginalFile.size, singleCompressedBlob.size, downloadSingleImage);
        } catch (err) {
            showToast('Fotoğraf sıkıştırılamadı: ' + err.message);
            console.error(err);
        } finally {
            setButtonLoading(compressBtn, false);
        }
    });
}

/**
 * Tekli fotoğraf dosyasını işler
 */
function handleSingleFile(file) {
    singleOriginalFile = file;
    showFileInfo('single-info', file.name, file.size);

    // Önizleme
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('single-preview-img').src = e.target.result;
        document.getElementById('single-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);

    document.getElementById('single-quality-section').style.display = 'block';
    document.getElementById('single-compress-btn').style.display = 'block';
}

/**
 * Canvas API ile fotoğrafı sıkıştırır
 * @param {File} file - Orijinal dosya
 * @param {number} quality - Kalite (0-1 arası)
 * @returns {Promise<Blob>} Sıkıştırılmış Blob
 */
function compressImage(file, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Sıkıştırma başarısız oldu'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Fotoğraf yüklenemedi'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsDataURL(file);
    });
}

/**
 * Sıkıştırılmış tekli fotoğrafı indirir
 */
function downloadSingleImage() {
    if (!singleCompressedBlob) return;
    const url = URL.createObjectURL(singleCompressedBlob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = singleOriginalFile?.name || 'fotograf.jpg';
    const nameWithoutExt = originalName.replace(/\.[^.]+$/, '');
    a.download = 'kucultulmus_' + nameWithoutExt + '.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Fotoğraf indirildi!');
}