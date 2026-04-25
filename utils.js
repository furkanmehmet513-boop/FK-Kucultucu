// ==================== FK KÜÇÜLT - UTILS.JS ====================

/**
 * Toast bildirimi gösterir
 * @param {string} msg - Gösterilecek mesaj
 */
function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Bayt değerini okunabilir formata çevirir
 * @param {number} bytes - Bayt cinsinden boyut
 * @param {number} decimals - Ondalık basamak sayısı
 * @returns {string} Formatlanmış boyut (örn: "1.5 MB")
 */
function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bayt';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bayt', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Dosya adından uzantıyı döndürür
 * @param {string} filename - Dosya adı
 * @returns {string} Uzantı (örn: "pdf", "jpg")
 */
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

/**
 * Benzersiz bir ID oluşturur
 * @returns {string} Benzersiz ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}