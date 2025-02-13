// Default settings
const defaultSettings = {
    confettiCount: 150,
    hoorayVolume: 10,
    jjkVolume: 10,
    enableConfetti: true,
    enableSounds: true
};

// Load saved settings
chrome.storage.sync.get(defaultSettings, (settings) => {
    document.getElementById('confettiCount').value = settings.confettiCount;
    document.getElementById('hoorayVolume').value = settings.hoorayVolume;
    document.getElementById('jjkVolume').value = settings.jjkVolume;
    document.getElementById('enableConfetti').checked = settings.enableConfetti;
    document.getElementById('enableSounds').checked = settings.enableSounds;
});

// Save settings when changed
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', () => {
        const settings = {
            confettiCount: Number(document.getElementById('confettiCount').value),
            hoorayVolume: Number(document.getElementById('hoorayVolume').value),
            jjkVolume: Number(document.getElementById('jjkVolume').value),
            enableConfetti: document.getElementById('enableConfetti').checked,
            enableSounds: document.getElementById('enableSounds').checked
        };
        
        chrome.storage.sync.set(settings);
        
        // Notify content script of changes
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'settingsUpdated',
                settings: settings
            });
        });
    });
});
