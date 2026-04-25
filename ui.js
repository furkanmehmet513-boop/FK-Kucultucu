// ==================== FK KÜÇÜLT - UI.JS ====================

/**
 * Belirtilen view'a geçiş yapar
 * @param {string} viewName - Geçilecek view adı (home, pdf, single-image, multiple-images)
 */
function switchView(viewName) {
    // Tüm view'ları gizle
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // İstenen view'ı göster
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Sidebar aktif öğesini güncelle
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });
    
    // Başlığı güncelle
    const titles = {
        'home': 'FK Küçült',
        'pdf': 'PDF Küçült',
        'single-image': 'Tekli Fotoğraf Küçült',
        'multiple-images': 'Çoklu Fotoğraf Küçült'
    };
    document.getElementById('view-title').innerText = titles[viewName] || 'FK Küçült';
    
    // Sidebar'ı kapat
    closeSidebar();
}

/**
 * Sidebar'ı açar
 */
function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('show');
}

/**
 * Sidebar'ı kapatır
 */
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
}

/**
 * Dropzone alanı oluşturur
 * @param {string} containerId - Container element ID'si
 * @param {string} accept - Kabul edilecek dosya türleri
 * @param {boolean} multiple - Çoklu dosya seçimine izin ver
 * @param {function} onFilesSelected - Dosya seçildiğinde çağrılacak fonksiyon
 * @returns {object} Dropzone ve input elementleri
 */
function createDropzone(containerId, accept, multiple, onFilesSelected) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    container.innerHTML = `
        <div class="dropzone" id="${containerId}-dropzone">
            <i class="fa-solid fa-cloud-upload-alt"></i>
            <p>Dosyaları sürükleyin veya tıklayın</p>
            <input type="file" id="${containerId}-input" accept="${accept}" ${multiple ? 'multiple' : ''} style="display:none;">
        </div>
    `;
    
    const dropzone = document.getElementById(`${containerId}-dropzone`);
    const fileInput = document.getElementById(`${containerId}-input`);
    
    // Tıklama olayı
    dropzone.addEventListener('click', () => fileInput.click());
    
    // Dosya seçildiğinde
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length > 0) {
            const files = Array.from(fileInput.files);
            onFilesSelected(files);
            fileInput.value = '';
        }
    });
    
    // Sürükle-bırak olayları
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
            const files = Array.from(e.dataTransfer.files);
            onFilesSelected(files);
        }
    });
    
    return { dropzone, fileInput };
}

/**
 * Dosya bilgi kutusunu günceller
 * @param {string} infoId - Info element ID'si
 * @param {string} name - Dosya adı
 * @param {number} size - Dosya boyutu (bytes)
 */
function showFileInfo(infoId, name, size) {
    const info = document.getElementById(infoId);
    if (!info) return;
    info.style.display = 'flex';
    info.innerHTML = `
        <span>${name}</span>
        <span>${formatBytes(size)}</span>
    `;
}

/**
 * Sonuç kutusunu gösterir
 * @param {string} resultId - Result element ID'si
 * @param {number} originalSize - Orijinal boyut
 * @param {number} compressedSize - Sıkıştırılmış boyut
 * @param {function} onDownload - İndirme butonuna tıklandığında çağrılacak fonksiyon
 */
function showResult(resultId, originalSize, compressedSize, onDownload) {
    const result = document.getElementById(resultId);
    if (!result) return;
    
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    result.style.display = 'flex';
    result.innerHTML = `
        <div>
            <div style="font-size: 16px; font-weight: 500;">${formatBytes(compressedSize)}</div>
            <div style="font-size: 12px; color: var(--accent);">%${reduction} küçüldü</div>
        </div>
        <button id="${resultId}-download" class="btn-success" style="width: auto; padding: 10px 20px;">
            <i class="fa-solid fa-download"></i> İndir
        </button>
    `;
    
    document.getElementById(`${resultId}-download`).addEventListener('click', onDownload);
}

/**
 * Butonun yüklenme durumunu ayarlar
 * @param {HTMLElement} btn - Buton elementi
 * @param {boolean} loading - Yükleniyor mu?
 */
function setButtonLoading(btn, loading) {
    if (loading) {
        btn.disabled = true;
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> İşleniyor...';
    } else {
        btn.disabled = false;
        if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
        }
    }
}