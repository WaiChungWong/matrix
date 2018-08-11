class Rain {
  constructor() {
    this.rainDrops = [];
    this.interval = 0.05;
    this.time = 0;
  }

  stop() {
    this.interval = 0;
  }

  update(timeDiff) {
    this.time += timeDiff;

    if (this.interval && this.time > this.interval) {
      this.rainDrops.push({
        current: 0,
        startX: Math.random(),
        lifespan: 2 + 4 * Math.random()
      });
    }

    this.time %= this.interval;

    for (let i = this.rainDrops.length - 1; i >= 0; i--) {
      let rainDrop = this.rainDrops[i];
      rainDrop.current += timeDiff;

      if (rainDrop.current >= rainDrop.lifespan) {
        this.rainDrops.splice(i, 1);
      }
    }
  }

  draw(context, width, height, dropWidth) {
    for (let i = 0; i < this.rainDrops.length; i++) {
      let { startX, current, lifespan } = this.rainDrops[i];

      let x = Math.round(startX * width / dropWidth) * dropWidth;
      let dropLength = height / lifespan * 4;
      let dropEnd = current / lifespan * (height + dropLength);
      let y = dropEnd - dropLength;

      let gradient = context.createLinearGradient(0, y, 0, dropEnd);

      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");

      context.fillStyle = gradient;
      context.fillRect(x, y, dropWidth, dropLength);
    }
  }
}

export default Rain;
