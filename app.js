// ==================== FK KÜÇÜLT - APP.JS ====================

document.addEventListener('DOMContentLoaded', () => {
    // Sidebar butonları
    document.getElementById('btn-menu').addEventListener('click', openSidebar);
    document.getElementById('close-sidebar').addEventListener('click', closeSidebar);
    document.getElementById('overlay').addEventListener('click', closeSidebar);

    // Sidebar menü öğeleri
    document.querySelectorAll('.menu-item[data-view]').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
        });
    });

    // Ana sayfa kartları
    document.querySelectorAll('.home-card[data-target]').forEach(card => {
        card.addEventListener('click', () => {
            const view = card.dataset.target;
            switchView(view);
        });
    });

    //View değişince ilgili modülü başlat
    const originalSwitchView = switchView;
    switchView = function(viewName) {
        originalSwitchView(viewName);
        
        switch(viewName) {
            case 'pdf':
                setTimeout(initPdfCompress, 100);
                break;
            case 'single-image':
                setTimeout(initSingleImage, 100);
                break;
            case 'multiple-images':
                setTimeout(initMultipleImages, 100);
                break;
        }
    };
});