class Timer {
    constructor(minutes = 10) {
        this.initialTime = minutes * 60; // Convert to seconds
        this.remainingTime = this.initialTime;
        this.isRunning = false;
        this.interval = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => {
                if (this.remainingTime > 0) {
                    this.remainingTime--;
                    this.onTick?.(this.remainingTime);
                } else {
                    this.stop();
                    this.onTimeout?.();
                }
            }, 1000);
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.interval);
        }
    }

    reset(minutes = null) {
        this.stop();
        if (minutes !== null) {
            this.initialTime = minutes * 60;
        }
        this.remainingTime = this.initialTime;
        this.onTick?.(this.remainingTime);
    }

    formatTime() {
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

export default Timer; 