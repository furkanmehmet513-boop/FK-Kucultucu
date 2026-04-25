// ==================== FK KÜÇÜLT - MULTIPLE-IMAGES.JS ====================

let multipleFiles = [];
let multipleCompressedBlobs = [];

/**
 * Çoklu fotoğraf sıkıştırma arayüzünü başlatır
 */
function initMultipleImages() {
    const container = document.getElementById('multiple-container');
    if (!container) return;

    container.innerHTML = `
        <div class="dropzone" id="multiple-dropzone">
            <i class="fa-solid fa-cloud-upload-alt"></i>
            <p>Fotoğrafları sürükleyin veya tıklayın</p>
            <input type="file" id="multiple-input" accept="image/*" multiple style="display:none;">
        </div>
        <div id="multiple-file-list" style="margin-bottom:15px;"></div>
        <div class="quality-section" id="multiple-quality-section" style="display:none;">
            <label>Kalite: <span id="multiple-quality-value">%70</span></label>
            <input type="range" id="multiple-quality-slider" min="10" max="100" value="70">
        </div>
        <button id="multiple-compress-btn" class="btn-primary" style="display:none;">
            <i class="fa-solid fa-compress"></i> Tümünü Küçült ve ZIP İndir
        </button>
        <div id="multiple-result" class="result-box" style="display:none;"></div>
    `;

    const dropzone = document.getElementById('multiple-dropzone');
    const fileInput = document.getElementById('multiple-input');
    const compressBtn = document.getElementById('multiple-compress-btn');
    const qualitySlider = document.getElementById('multiple-quality-slider');
    const qualityValue = document.getElementById('multiple-quality-value');

    qualitySlider.addEventListener('input', () => {
        qualityValue.innerText = '%' + qualitySlider.value;
    });

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            addMultipleFiles(Array.from(e.target.files));
            fileInput.value = '';
        }
    });

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
        if (e.dataTransfer.files.length > 0) {
            addMultipleFiles(Array.from(e.dataTransfer.files));
        }
    });

    compressBtn.addEventListener('click', async () => {
        if (multipleFiles.length === 0) return;
        setButtonLoading(compressBtn, true);

        try {
            const quality = qualitySlider.value / 100;
            multipleCompressedBlobs = [];
            for (const file of multipleFiles) {
                const compressed = await compressImage(file, quality);
                multipleCompressedBlobs.push({
                    blob: compressed,
                    name: 'kucultulmus_' + file.name.replace(/\.[^.]+$/, '') + '.jpg'
                });
            }
            showResult('multiple-result', getTotalOriginalSize(), getTotalCompressedSize(), downloadMultipleZip);
        } catch (err) {
            showToast('Sıkıştırma hatası: ' + err.message);
            console.error(err);
        } finally {
            setButtonLoading(compressBtn, false);
        }
    });
}

/**
 * Çoklu dosya ekler
 */
function addMultipleFiles(files) {
    multipleFiles = [...multipleFiles, ...files];
    renderMultipleFileList();
    if (multipleFiles.length > 0) {
        document.getElementById('multiple-quality-section').style.display = 'block';
        document.getElementById('multiple-compress-btn').style.display = 'block';
    }
}

/**
 * Dosya listesini render eder
 */
function renderMultipleFileList() {
    const list = document.getElementById('multiple-file-list');
    list.innerHTML = multipleFiles.map((file, i) => `
        <div class="file-info">
            <span>${file.name}</span>
            <div style="display:flex;align-items:center;gap:10px;">
                <span>${formatBytes(file.size)}</span>
                <button onclick="removeMultipleFile(${i})" class="icon-btn" style="color:var(--danger);">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Dosyayı listeden çıkarır
 */
function removeMultipleFile(index) {
    multipleFiles.splice(index, 1);
    renderMultipleFileList();
    if (multipleFiles.length === 0) {
        document.getElementById('multiple-quality-section').style.display = 'none';
        document.getElementById('multiple-compress-btn').style.display = 'none';
    }
}

/**
 * Toplam orijinal boyutu hesaplar
 */
function getTotalOriginalSize() {
    return multipleFiles.reduce((acc, f) => acc + f.size, 0);
}

/**
 * Toplam sıkıştırılmış boyutu hesaplar
 */
function getTotalCompressedSize() {
    return multipleCompressedBlobs.reduce((acc, b) => acc + b.blob.size, 0);
}

/**
 * Sıkıştırılmış dosyaları ZIP olarak indirir
 */
async function downloadMultipleZip() {
    if (multipleCompressedBlobs.length === 0) return;

    const zip = new JSZip();
    for (const item of multipleCompressedBlobs) {
        zip.file(item.name, item.blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kucultulmus_fotograflar.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('ZIP dosyası indirildi!');
}