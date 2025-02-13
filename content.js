console.log('UWorld Celebration Extension loaded!'); // Debug log

async function init() {
    const observerModule = await import(chrome.runtime.getURL('observer.js'));
    observerModule.initializeObserver();
}

// Listen for settings changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsUpdated') {
        updateSettings(message.settings);
    }
});

async function updateSettings(settings) {
    const audioModule = await import(chrome.runtime.getURL('audio.js'));
    
    // Update audio volumes
    audioModule.hoorayAudio.volume = settings.hoorayVolume / 100;
    audioModule.jjkAudio.volume = settings.jjkVolume / 100;
    
    // Update confetti settings
    const { default: confetti } = await import(chrome.runtime.getURL('confetti.js'));
    confetti.maxCount = settings.confettiCount;
}

// Start the initialization process when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}