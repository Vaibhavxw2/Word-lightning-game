class WordLightning {
    constructor() {
        this.words = [
            // Easy (1-4 letters)
            'cat', 'dog', 'run', 'jump', 'love', 'code', 'game', 'fun',
            
            // Medium (5-8 letters)
            'awesome', 'lightning', 'keyboard', 'telegram', 'developer', 'amazing', 'challenge', 'victory',
            
            // Hard (9+ letters)
            'javascript', 'programming', 'supercalifragilisticexpialidocious', 'extraordinary', 'unbelievable', 'magnificent', 'tremendous'
        ];
        
        this.roasts = [
            "My grandmother types faster! 👵",
            "Are you typing with your elbows? 🤔",
            "Even Internet Explorer is faster! 🐌",
            "Did you fall asleep? 😴",
            "Turtles are judging you right now 🐢",
            "Your keyboard is crying 😢",
            "Speed of a snail, accuracy of a storm! 🌪️",
            "I've seen faster glaciers! 🧊"
        ];
        
        this.encouragements = [
            "LIGHTNING FAST! ⚡",
            "SPEED DEMON! 👹",
            "KEYBOARD WARRIOR! ⚔️",
            "UNSTOPPABLE! 🚀",
            "TYPING LEGEND! 👑",
            "ABSOLUTELY INSANE! 🔥",
            "INHUMAN SPEED! 🤖"
        ];
        
        this.score = 0;
        this.streak = 0;
        this.currentWord = '';
        this.startTime = 0;
        this.gameActive = false;
        this.timeLimit = 5000; // 5 seconds initially
        this.timer = null;
        
        this.initializeElements();
        this.loadScores();
        this.initializeTelegram();
    }
    
    initializeElements() {
        this.wordDisplay = document.getElementById('wordDisplay');
        this.wordInput = document.getElementById('wordInput');
        this.scoreElement = document.getElementById('score');
        this.streakElement = document.getElementById('streak');
        this.startBtn = document.getElementById('startBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.timerBar = document.getElementById('timerBar');
        this.timerText = document.getElementById('timerText');
        this.roastZone = document.getElementById('roastZone');
        this.scoresList = document.getElementById('scoresList');
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.shareBtn.addEventListener('click', () => this.shareScore());
        this.wordInput.addEventListener('input', (e) => this.checkInput(e.target.value));
        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkInput(e.target.value);
        });
    }
    
    initializeTelegram() {
        // Initialize Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            // Set theme
            document.body.style.background = tg.themeParams.bg_color || document.body.style.background;
        }
    }
    
    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.streak = 0;
        this.timeLimit = 5000;
        
        this.startBtn.style.display = 'none';
        this.shareBtn.style.display = 'none';
        this.wordInput.disabled = false;
        this.wordInput.focus();
        
        this.updateDisplay();
        this.nextWord();
        this.roastZone.textContent = "Let's see what you got! 💪";
    }
    
    nextWord() {
        if (!this.gameActive) return;
        
        // Progressive difficulty
        let wordPool;
        if (this.streak < 5) {
            wordPool = this.words.slice(0, 8); // Easy words
        } else if (this.streak < 15) {
            wordPool = this.words.slice(4, 16); // Medium words
        } else {
            wordPool = this.words.slice(8); // Hard words
        }
        
        this.currentWord = wordPool[Math.floor(Math.random() * wordPool.length)];
        this.wordDisplay.textContent = this.currentWord;
        this.wordDisplay.className = 'word-display';
        this.wordInput.value = '';
        
        this.startTime = Date.now();
        this.startTimer();
        
        // Reduce time limit as streak increases (minimum 2 seconds)
        this.timeLimit = Math.max(2000, 5000 - (this.streak * 100));
        this.timerText.textContent = `${(this.timeLimit / 1000).toFixed(1)}s`;
    }
    
    startTimer() {
        this.timerBar.className = 'timer-bar running';
        this.timerBar.style.transition = `transform ${this.timeLimit}ms linear`;
        
        // Panic mode at 1 second left
        const panicTimeout = setTimeout(() => {
            this.wordDisplay.classList.add('panic-mode');
            this.vibrate();
        }, this.timeLimit - 1000);
        
        this.timer = setTimeout(() => {
            this.timeUp();
        }, this.timeLimit);
    }
    
    checkInput(input) {
        if (!this.gameActive) return;
        
        if (input.toLowerCase().trim() === this.currentWord.toLowerCase()) {
            this.correctAnswer();
        }
    }
    
    correctAnswer() {
        clearTimeout(this.timer);
        this.wordDisplay.classList.remove('panic-mode');
        
        const timeTaken = Date.now() - this.startTime;
        const timeBonus = Math.max(100 - Math.floor(timeTaken / 50), 10);
        const lengthBonus = this.currentWord.length * 10;
        const streakBonus = this.streak * 5;
        
        const points = timeBonus + lengthBonus + streakBonus;
        this.score += points;
        this.streak++;
        
        // Visual feedback
        this.wordDisplay.className = 'word-display correct';
        this.vibrate(50);
        
        // Encouragement
        if (timeTaken < 2000) {
            this.showEncouragement();
        }
        
        this.updateDisplay();
        
        setTimeout(() => {
            this.nextWord();
        }, 800);
    }
    
    timeUp() {
        this.wrongAnswer("Time's up! ⏰");
    }
    
    wrongAnswer(message = '') {
        this.wordDisplay.classList.remove('panic-mode');
        this.wordDisplay.className = 'word-display wrong';
        this.vibrate([100, 50, 100]);
        
        // Show roast
        this.showRoast(message);
        
        // Reset streak
        this.streak = 0;
        this.updateDisplay();
        
        // Game over after 3 wrong answers or continue
        setTimeout(() => {
            if (this.score < 500) { // Easy game over condition
                this.gameOver();
            } else {
                this.nextWord();
            }
        }, 1500);
    }
    
    gameOver() {
        this.gameActive = false;
        this.wordInput.disabled = true;
        this.timerBar.className = 'timer-bar';
        
        this.wordDisplay.textContent = `Game Over! Final Score: ${this.score}`;
        this.wordDisplay.className = 'word-display';
        
        this.startBtn.textContent = '🔄 PLAY AGAIN';
        this.startBtn.style.display = 'block';
        this.shareBtn.style.display = 'block';
        
        this.saveScore();
        this.displayScores();
        
        // Final roast or encouragement
        if (this.score < 200) {
            this.roastZone.textContent = "Practice makes perfect... hopefully! 😅";
        } else if (this.score > 1000) {
            this.roastZone.textContent = "LEGENDARY PERFORMANCE! 🏆👑";
        }
    }
    
    showRoast(customMessage = '') {
        const message = customMessage || this.roasts[Math.floor(Math.random() * this.roasts.length)];
        this.roastZone.textContent = message;
    }
    
    showEncouragement() {
        const message = this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
        this.roastZone.textContent = message;
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.streakElement.textContent = this.streak;
    }
    
    vibrate(pattern = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
        
        // Telegram haptic feedback
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }
    
    saveScore() {
        const scores = JSON.parse(localStorage.getItem('wordLightningScores') || '[]');
        scores.push({
            score: this.score,
            date: new Date().toLocaleDateString(),
            streak: this.streak
        });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(5); // Keep only top 5
        localStorage.setItem('wordLightningScores', JSON.stringify(scores));
    }
    
    loadScores() {
        this.displayScores();
    }
    
    displayScores() {
        const scores = JSON.parse(localStorage.getItem('wordLightningScores') || '[]');
        
        if (scores.length === 0) {
            this.scoresList.textContent = 'No scores yet!';
            return;
        }
        
        this.scoresList.innerHTML = scores.map((score, index) => 
            `<div class="score-item">
                <span>${index + 1}. ${score.score} pts</span>
                <span>Streak: ${score.streak}</span>
            </div>`
        ).join('');
    }
    
    shareScore() {
        const message = `🔥 I just scored ${this.score} points in Word Lightning! ⚡\nMax streak: ${this.streak} words\n\nCan you beat me? Try it now! 👇`;
        
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showPopup({
                title: 'Share Your Score!',
                message: 'Share your amazing score with friends?',
                buttons: [
                    {id: 'share', type: 'default', text: 'Share Score'},
                    {id: 'cancel', type: 'cancel', text: 'Cancel'}
                ]
            }, (buttonId) => {
                if (buttonId === 'share') {
                    window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`);
                }
            });
        } else {
            // Fallback for web
            if (navigator.share) {
                navigator.share({
                    title: 'Word Lightning Score',
                    text: message,
                    url: window.location.href
                });
            } else {
                // Copy to clipboard
                navigator.clipboard.writeText(message + '\n' + window.location.href);
                alert('Score copied to clipboard!');
            }
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WordLightning();
});
