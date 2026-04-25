// ==================== FK KÜÇÜLT - PDF-COMPRESS.JS ====================

let pdfOriginalFile = null;
let pdfCompressedBlob = null;

/**
 * PDF sıkıştırma arayüzünü başlatır
 */
function initPdfCompress() {
    const container = document.getElementById('pdf-container');
    if (!container) return;

    container.innerHTML = `
        <div class="dropzone" id="pdf-dropzone">
            <i class="fa-solid fa-cloud-upload-alt"></i>
            <p>PDF dosyasını sürükleyin veya tıklayın</p>
            <input type="file" id="pdf-input" accept=".pdf" style="display:none;">
        </div>
        <div id="pdf-info" class="file-info" style="display:none;"></div>
        <button id="pdf-compress-btn" class="btn-primary" style="display:none;">
            <i class="fa-solid fa-compress"></i> Küçült
        </button>
        <div id="pdf-result" class="result-box" style="display:none;"></div>
    `;

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-input');
    const compressBtn = document.getElementById('pdf-compress-btn');

    // Dropzone tıklama
    dropzone.addEventListener('click', () => fileInput.click());

    // Dosya seçildi
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            pdfOriginalFile = file;
            showFileInfo('pdf-info', file.name, file.size);
            compressBtn.style.display = 'block';
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
    dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            pdfOriginalFile = file;
            showFileInfo('pdf-info', file.name, file.size);
            compressBtn.style.display = 'block';
        }
    });

    // Sıkıştırma
    compressBtn.addEventListener('click', async () => {
        if (!pdfOriginalFile) return;
        setButtonLoading(compressBtn, true);

        try {
            const arrayBuffer = await pdfOriginalFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const compressedBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false
            });
            pdfCompressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
            showResult('pdf-result', pdfOriginalFile.size, pdfCompressedBlob.size, downloadPdf);
        } catch (err) {
            showToast('PDF sıkıştırılamadı: ' + err.message);
            console.error(err);
        } finally {
            setButtonLoading(compressBtn, false);
        }
    });
}

/**
 * Sıkıştırılmış PDF'i indirir
 */
function downloadPdf() {
    if (!pdfCompressedBlob) return;
    const url = URL.createObjectURL(pdfCompressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kucultulmus_' + (pdfOriginalFile?.name || 'dosya.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('PDF indirildi!');
}