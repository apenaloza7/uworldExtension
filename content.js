console.log('UWorld Celebration Extension loaded!'); // Debug log

async function init() {
    const observerModule = await import(chrome.runtime.getURL('observer.js'));
    observerModule.initializeObserver();
}

// Start the initialization process when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}