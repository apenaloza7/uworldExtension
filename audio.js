////////////////////////////////////////////////////////////////////////
// Hooray Audio
////////////////////////////////////////////////////////////////////////

let audioInitialized = false;

export const hoorayAudio = new Audio(chrome.runtime.getURL('hooray.mp3'));
hoorayAudio.volume = 0.1;

// Add load event listener for hooray audio
hoorayAudio.addEventListener('loadeddata', () => {
    console.log('Hooray audio loaded successfully');
    console.log('Audio duration:', hoorayAudio.duration);
    console.log('Audio volume:', hoorayAudio.volume);
});

// Initialize audio after user interaction
document.addEventListener('click', () => {
    if (!audioInitialized) {
        hoorayAudio.load();
        jjkAudio.load();
        audioInitialized = true;
        console.log('Audio initialized after user interaction');
    }
}, { once: true });

// Add detailed error logging
hoorayAudio.addEventListener('error', (e) => {
    console.error('Hooray audio error:', {
        error: e.error,
        message: e.message,
        type: e.type
    });
});

export function playHoorayAudio() {
    if (!audioInitialized) {
        console.log('Audio not initialized - waiting for user interaction');
        return;
    }
    hoorayAudio.currentTime = 0;
    return hoorayAudio.play()
        .then(() => console.log('Audio playing successfully'))
        .catch(e => console.error('Audio play error details:', e.name, e.message));
}


////////////////////////////////////////////////////////////////////////
// JJK Audio
////////////////////////////////////////////////////////////////////////

let jjkAudioPlayed = false;
export const jjkAudio = new Audio(chrome.runtime.getURL('outroAvg.mp3'));
jjkAudio.volume = 0.1;

// Add load event listener for jjk audio
jjkAudio.addEventListener('loadeddata', () => {
    console.log('JJK audio loaded successfully');
    console.log('JJK Audio duration:', jjkAudio.duration);
    console.log('JJK Audio volume:', jjkAudio.volume);
});

// Add detailed error logging for jjk audio
jjkAudio.addEventListener('error', (e) => {
    console.error('JJK audio error:', {
        error: e.error,
        message: e.message,
        type: e.type
    });
});

export function playJjkAudio() {
    if (!audioInitialized) {
        console.log('JJK Audio not initialized - waiting for user interaction');
        return;
    }
    
    if (jjkAudioPlayed) {
        console.log('JJK Audio already played for this session');
        return;
    }

    jjkAudio.currentTime = 0;
    jjkAudioPlayed = true;
    return jjkAudio.play()
        .then(() => console.log('JJK Audio playing successfully'))
        .catch(e => console.error('JJK Audio play error details:', e.name, e.message));
}

// Optional: Add reset function for new sessions
export function resetJjkAudio() {
    jjkAudioPlayed = false;
}

// Load initial settings
chrome.storage.sync.get({
    hoorayVolume: 10,
    jjkVolume: 10,
    enableSounds: true
}, (settings) => {
    hoorayAudio.volume = settings.hoorayVolume / 100;
    jjkAudio.volume = settings.jjkVolume / 100;
});