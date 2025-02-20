/** @type {module} */

export async function initializeObserver() {
    // Import dependencies
    const { playHoorayAudio, playJjkAudio, resetJjkAudio } = await import(chrome.runtime.getURL('audio.js'));
    const { default: confetti } = await import(chrome.runtime.getURL('confetti.js'));
    
    const state = {
        scoresLogged: false,
        lastUrl: location.href,
        currentQuestionCelebrated: false,
        answeredQuestions: new Set(JSON.parse(localStorage.getItem('answeredQuestions') || '[]')),
        rewardClaimed: false,
        currentTestId: null  // Add this to track the current test
    };

    let audioInitialized = false;

    function resetState() {
        console.log('Resetting state');
        state.scoresLogged = false;
        state.currentQuestionCelebrated = false;
        state.rewardClaimed = false;
        resetJjkAudio();
    }

    function saveAnsweredQuestions() {
        localStorage.setItem('answeredQuestions', JSON.stringify([...state.answeredQuestions]));
    }

    // Add functions to manage celebrated questions in localStorage
    function hasCelebratedQuestion(questionId) {
        const celebrated = JSON.parse(localStorage.getItem('celebratedQuestions') || '[]');
        return celebrated.includes(questionId);
    }

    function markQuestionCelebrated(questionId) {
        const celebrated = JSON.parse(localStorage.getItem('celebratedQuestions') || '[]');
        celebrated.push(questionId);
        localStorage.setItem('celebratedQuestions', JSON.stringify(celebrated));
    }

    // Add this new function to extract test ID from URL
    function getTestIdFromUrl(url) {
        const match = url.match(/\/test\/(results|analysis)\/(\d+)/);
        return match ? match[2] : null;
    }

    // Add these new functions near the top with other helper functions
    function hasClaimedReward(testId) {
        const claimedRewards = JSON.parse(localStorage.getItem('claimedRewards') || '[]');
        return claimedRewards.includes(testId);
    }

    function markRewardClaimed(testId) {
        const claimedRewards = JSON.parse(localStorage.getItem('claimedRewards') || '[]');
        if (!claimedRewards.includes(testId)) {
            claimedRewards.push(testId);
            localStorage.setItem('claimedRewards', JSON.stringify(claimedRewards));
        }
    }

    // Add this new function
    function getCustomTestId() {
        const testIdSpan = document.querySelector('.test-id-span');
        if (testIdSpan) {
            const match = testIdSpan.textContent.match(/Custom Test Id:\s*(\d+)/);
            return match ? match[1] : null;
        }
        return null;
    }

    // Add this function to manage celebrated tests
    function hasShownPopupForTest(testId) {
        const celebratedTests = JSON.parse(localStorage.getItem('celebratedTests') || '[]');
        return celebratedTests.includes(testId);
    }

    function markPopupShownForTest(testId) {
        const celebratedTests = JSON.parse(localStorage.getItem('celebratedTests') || '[]');
        if (!celebratedTests.includes(testId)) {
            celebratedTests.push(testId);
            localStorage.setItem('celebratedTests', JSON.stringify(celebratedTests));
        }
    }

    // Reset state on navigation
    new MutationObserver(() => {
        if (location.href !== state.lastUrl) {
            const newTestId = getTestIdFromUrl(location.href);
            const oldTestId = getTestIdFromUrl(state.lastUrl);
            
            state.lastUrl = location.href;
            
            // Only reset state if we're moving to a different test
            if (newTestId !== oldTestId) {
                state.currentTestId = newTestId;
                resetState();
            }
        }
    }).observe(document, {subtree: true, childList: true});

    // Add click listeners for navigation buttons
    function setupNavigationListeners() {
        const nextButton = document.querySelector('a[aria-label="Navigate to Next Question"]');

        if (nextButton) {
            nextButton.addEventListener('click', resetState);
        }

        // If buttons aren't found, try again later
        if (!nextButton) {
            setTimeout(setupNavigationListeners, 1000);
        }
    }
    setupNavigationListeners();

    // Add tab switch detection
    function setupTabSwitchListener() {
        const tabLabels = document.querySelectorAll('.mat-tab-label');
        tabLabels.forEach(tab => {
            tab.addEventListener('click', () => {
                console.log('Tab switched - resetting state');
                resetState();
            });
        });
    }

    // Initialize tab listener when available
    function initializeTabListener() {
        if (document.querySelector('.mat-tab-label')) {
            setupTabSwitchListener();
        } else {
            setTimeout(initializeTabListener, 1000);
        }
    }
    initializeTabListener();

    // Find target node for observations
    const targetNode = document.querySelector('.common-content') || 
                      document.querySelector('.stats-area') || 
                      document.body;

    if (!targetNode) {
        setTimeout(initializeObserver, 1000);
        return;
    }

    // Create reward popup element
    const createRewardPopup = () => {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
            z-index: 10000;
            text-align: center;
        `;
        popup.innerHTML = `
            <h3 style="color: #2196f3; margin-bottom: 15px;">Congratulations! 🎉</h3>
            <p style="margin-bottom: 20px;">You scored higher than the average!</p>
            <button id="rewardButton" style="
                background: #2196f3;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            ">Click for your reward!</button>
        `;
        return popup;
    };

    // Modify the isResultsPage function
    function isResultsPage() {
        const testId = getCustomTestId();
        return location.href.includes('/test/results') && 
               !state.scoresLogged &&
               !state.rewardClaimed &&
               testId &&
               !hasShownPopupForTest(testId);
    }

    // Replace checkScoresOnce with new popup logic
    function checkScoresOnce() {
        // Only proceed if we're on results page and haven't shown popup for this test
        if (!isResultsPage()) return;
        
        const userScoreElement = document.querySelector('.user-score span');
        const avgScoreElement = document.querySelector('.average-score');
        
        if (!userScoreElement || !avgScoreElement) {
            setTimeout(checkScoresOnce, 1000);
            return;
        }

        const userScore = parseInt(userScoreElement.textContent);
        const avgMatch = avgScoreElement.textContent.match(/Avg:\s*(\d+)%/);
        const avgScore = avgMatch ? parseInt(avgMatch[1]) : null;

        if (userScore && avgScore && userScore > avgScore) {
            state.scoresLogged = true;
            const popup = createRewardPopup();
            document.body.appendChild(popup);
            
            document.getElementById('rewardButton').addEventListener('click', async () => {
                try {
                    state.rewardClaimed = true;
                    const testId = getCustomTestId();
                    markPopupShownForTest(testId);  // Mark this test as celebrated
                    console.log('Attempting to play JJK audio...');
                    await playJjkAudio();
                    console.log('JJK audio played successfully');
                    confetti.start();
                    setTimeout(() => confetti.stop(), 9000);
                    popup.remove();
                } catch (error) {
                    console.error('Error in reward button handler:', error);
                }
            }, { once: true });
        }
    }

    // Simplify handleScores to just call checkScoresOnce once
    const handleScores = () => {
        if (!state.scoresLogged) {
            checkScoresOnce();
        }
    };

    const observer = new MutationObserver((mutations) => {
        console.log('Mutation detected:', {
            mutations: mutations.map(m => ({
                type: m.type,
                target: m.target.className || m.target.nodeName
            }))
        });
        
        const correctIcon = document.querySelector('.fa-check');
        const incorrectIcon = document.querySelector('.fa-times');
        const questionId = document.querySelector('.question-id')?.textContent?.match(/Question Id: (\d+)/)?.[1];
        
        console.log('DOM Check:', {
            correctIconPresent: !!correctIcon,
            incorrectIconPresent: !!incorrectIcon,
            questionId,
            alreadyCelebrated: questionId ? hasCelebratedQuestion(questionId) : false,
            currentQuestionCelebrated: state.currentQuestionCelebrated
        });

        // Only celebrate if:
        // 1. There's a check mark without an X mark
        // 2. We haven't celebrated this specific question before
        // 3. We haven't celebrated the current question instance
        if (correctIcon && !incorrectIcon && questionId && 
            !hasCelebratedQuestion(questionId) && 
            !state.currentQuestionCelebrated) {
            
            console.log('New correct answer detected! Celebrating...');
            state.currentQuestionCelebrated = true;
            markQuestionCelebrated(questionId);
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