////////////////////////////////////////////////////////////////////////
// Hooray Audio
////////////////////////////////////////////////////////////////////////

export const hoorayAudio = new Audio(chrome.runtime.getURL('hooray.mp3'));
hoorayAudio.volume = 0.1;

// Add load event listener for hooray audio
hoorayAudio.addEventListener('loadeddata', () => {
    console.log('Hooray audio loaded successfully');
    console.log('Audio duration:', hoorayAudio.duration);
    console.log('Audio volume:', hoorayAudio.volume);
});

// Add detailed error logging
hoorayAudio.addEventListener('error', (e) => {
    console.error('Hooray audio error:', {
        error: e.error,
        message: e.message,
        type: e.type
    });
});

export function playHoorayAudio() {
    return new Promise((resolve, reject) => {
        hoorayAudio.load();
        hoorayAudio.currentTime = 0;
        return hoorayAudio.play()
            .then(() => {
                console.log('Hooray audio playing successfully');
                resolve();
            })
            .catch(e => {
                console.error('Hooray audio error:', e);
                reject(e);
            });
    });
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
    return new Promise((resolve, reject) => {
        if (jjkAudioPlayed) {
            console.log('JJK Audio already played for this session');
            return reject(new Error('Audio already played'));
        }

        // Initialize and play
        jjkAudio.load();
        jjkAudio.currentTime = 0;
        
        // Set flag before playing
        jjkAudioPlayed = true;
        
        // Try to play
        return jjkAudio.play()
            .then(() => {
                console.log('JJK Audio playing successfully');
                resolve();
            })
            .catch(e => {
                console.error('JJK Audio play error:', e);
                jjkAudioPlayed = false; // Reset on error
                reject(e);
            });
    });
}

// Optional: Add reset function for new sessions
export function resetJjkAudio() {
    jjkAudioPlayed = false;
}