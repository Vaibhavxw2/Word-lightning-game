class WordLightning {
    constructor() {
        this.words = [
            'cat', 'dog', 'run', 'jump', 'love', 'code', 'game', 'fun',
            'awesome', 'lightning', 'keyboard', 'telegram', 'developer', 'amazing', 'challenge', 'victory',
            'javascript', 'programming', 'supercalifragilisticexpialidocious', 'extraordinary', 'unbelievable'
        ];
        
        this.roasts = [
            "My grandmother types faster! 👵",
            "Are you typing with your elbows? 🤔", 
            "Even Internet Explorer is faster! 🐌",
            "Turtles are judging you right now 🐢"
        ];
        
        this.encouragements = [
            "LIGHTNING FAST! ⚡",
            "SPEED DEMON! 👹", 
            "KEYBOARD WARRIOR! ⚔️",
            "UNSTOPPABLE! 🚀"
        ];
        
        this.resetGame();
        this.initializeElements();
        this.loadSounds();
        this.initializeTelegram();
    }
    
    resetGame() {
        this.score = 0;
        this.streak = 0;
        this.currentWord = '';
        this.startTime = 0;
        this.gameActive = false;
        this.timeLimit = 3000;
        this.timer = null;
        this.wordsTyped = 0;
        this.level = 1;
    }
    
    initializeElements() {
        this.wordDisplay = document.getElementById('wordDisplay');
        this.wordInput = document.getElementById('wordInput');
        this.scoreElement = document.getElementById('score');
        this.streakElement = document.getElementById('streak');
        this.startBtn = document.getElementById('startBtn');
        this.timerBar = document.getElementById('timerBar');
        this.timerText = document.getElementById('timerText');
        this.roastZone = document.getElementById('roastZone');
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.wordInput.addEventListener('input', (e) => this.checkInput(e.target.value));
        
        document.addEventListener('gesturestart', e => e.preventDefault());
        document.addEventListener('gesturechange', e => e.preventDefault());
        document.addEventListener('gestureend', e => e.preventDefault());
        document.addEventListener('selectstart', e => e.preventDefault());
        this.wordInput.addEventListener('paste', e => e.preventDefault());
    }
    
    loadSounds() {
        this.correctSound = new Audio();
        this.correctSound.src = 'data:audio/wav;base64,UklGRhwCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfgBAAC4uLi4uLi4';
        this.wrongSound = new Audio();
        this.wrongSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAA';
    }
    
    initializeTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            tg.disableVerticalSwipes();
        }
    }
    
    startGame() {
        this.resetGame();
        this.gameActive = true;
        
        this.vibrate([100, 50, 100]);
        this.startBtn.classList.add('pressed');
        
        setTimeout(() => {
            this.startBtn.style.display = 'none';
            this.wordInput.disabled = false;
            this.wordInput.focus();
            this.nextWord();
        }, 200);
        
        this.roastZone.textContent = "Let's see what you got! 💪";
    }
    
    nextWord() {
        if (!this.gameActive) return;
        
        this.calculateDifficulty();
        
        this.currentWord = this.getWordForLevel();
        this.wordDisplay.textContent = this.currentWord;
        this.wordDisplay.className = 'word-display';
        this.wordInput.value = '';
        
        this.startTime = Date.now();
        this.startTimer();
    }
    
    calculateDifficulty() {
        if (this.wordsTyped < 3) {
            this.timeLimit = 3000;
            this.level = 1;
        } else if (this.wordsTyped < 7) {
            this.timeLimit = 3000;
            this.level = 2;
        } else if (this.wordsTyped < 12) {
            this.timeLimit = 4000;
            this.level = 3;
        } else {
            this.timeLimit = Math.max(2000, 4000 - Math.floor((this.wordsTyped - 12) / 3) * 200);
            this.level = Math.floor(this.wordsTyped / 5) + 1;
        }
    }
    
    getWordForLevel() {
        let wordPool;
        if (this.level === 1) {
            wordPool = this.words.slice(0, 8);
        } else if (this.level === 2) {
            wordPool = this.words.slice(4, 16);
        } else {
            wordPool = this.words.slice(8);
        }
        
        return wordPool[Math.floor(Math.random() * wordPool.length)];
    }
    
    startTimer() {
        this.timerBar.className = 'timer-bar running';
        this.timerBar.style.transition = `transform ${this.timeLimit}ms linear`;
        this.timerText.textContent = `${(this.timeLimit / 1000).toFixed(1)}s`;
        
        this.updateTimer();
        
        this.timer = setTimeout(() => {
            this.timeUp();
        }, this.timeLimit);
    }
    
    updateTimer() {
        if (!this.gameActive) return;
        
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.timeLimit - elapsed);
        
        this.timerText.textContent = `${(remaining / 1000).toFixed(1)}s`;
        
        if (remaining > 0) {
            requestAnimationFrame(() => this.updateTimer());
        }
    }
    
    checkInput(input) {
        if (!this.gameActive) return;
        
        if (input.toLowerCase().trim() === this.currentWord.toLowerCase()) {
            this.correctAnswer();
        }
    }
    
    correctAnswer() {
        clearTimeout(this.timer);
        this.playSound('correct');
        this.vibrate(50);
        
        const timeTaken = Date.now() - this.startTime;
        const timeBonus = Math.max(100 - Math.floor(timeTaken / 50), 10);
        const lengthBonus = this.currentWord.length * 10;
        const streakBonus = this.streak * 5;
        
        const points = timeBonus + lengthBonus + streakBonus;
        this.score += points;
        this.streak++;
        this.wordsTyped++;
        
        this.wordDisplay.className = 'word-display correct';
        
        if (timeTaken < 2000) {
            this.showEncouragement();
        }
        
        this.updateDisplay();
        
        setTimeout(() => {
            this.nextWord();
        }, 800);
    }
    
    timeUp() {
        this.gameOver("⏰ Time's up!");
    }
    
    gameOver(reason) {
        this.gameActive = false;
        this.playSound('wrong');
        this.vibrate([100, 50, 100]);
        
        this.wordInput.disabled = true;
        this.timerBar.className = 'timer-bar';
        
        this.wordDisplay.textContent = `Game Over! Score: ${this.score}`;
        this.wordDisplay.className = 'word-display wrong';
        
        this.startBtn.textContent = '🔄 PLAY AGAIN';
        this.startBtn.style.display = 'block';
        this.startBtn.classList.remove('pressed');
        
        this.showRoast(reason);
        this.saveScore();
    }
    
    playSound(type) {
        try {
            if (type === 'correct') {
                this.correctSound.currentTime = 0;
                this.correctSound.play();
            } else {
                this.wrongSound.currentTime = 0;
                this.wrongSound.play();
            }
        } catch (e) {}
    }
    
    vibrate(pattern = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
        
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
    }
    
    showRoast(message = '') {
        const roast = message || this.roasts[Math.floor(Math.random() * this.roasts.length)];
        this.roastZone.textContent = roast;
    }
    
    showEncouragement() {
        const message = this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
        this.roastZone.textContent = message;
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.streakElement.textContent = this.streak;
    }
    
    saveScore() {
        const scores = JSON.parse(localStorage.getItem('wordLightningScores') || '[]');
        scores.push({
            score: this.score,
            streak: this.streak,
            date: new Date().toLocaleDateString()
        });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(5);
        localStorage.setItem('wordLightningScores', JSON.stringify(scores));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    new WordLightning();
});
