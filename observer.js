/** @type {module} */

export async function initializeObserver() {
    // Import dependencies
    const { playHoorayAudio, playJjkAudio, resetJjkAudio } = await import(chrome.runtime.getURL('audio.js'));
    const { default: confetti } = await import(chrome.runtime.getURL('confetti.js'));
    
    const state = {
        scoresLogged: false,
        lastUrl: location.href
    };

    // Reset state on navigation
    new MutationObserver(() => {
        if (location.href !== state.lastUrl) {
            state.lastUrl = location.href;
            state.scoresLogged = false;
            resetJjkAudio();
        }
    }).observe(document, {subtree: true, childList: true});

    // Find target node for observations
    const targetNode = document.querySelector('.common-content') || 
                      document.querySelector('.stats-area') || 
                      document.body;

    if (!targetNode) {
        setTimeout(initializeObserver, 1000);
        return;
    }

    // Handle mutations
    const handleScores = () => {
        if (state.scoresLogged) return;
        
        const userScore = parseInt(document.querySelector('.user-score span')?.textContent);
        const avgMatch = document.querySelector('.average-score')?.textContent.match(/(\d+)%/);
        const avgScore = avgMatch ? parseInt(avgMatch[1]) : null;

        if (userScore && avgScore && userScore > avgScore) {
            state.scoresLogged = true;
            playJjkAudio();
        }
    };

    const observer = new MutationObserver(() => {
        // Check for correct answer
        if (document.querySelector('.correct-answer')) {
            playHoorayAudio();
            confetti.start();
            setTimeout(() => confetti.stop(), 3000);
        }

        // Check scores
        handleScores();
    });

    observer.observe(targetNode, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}