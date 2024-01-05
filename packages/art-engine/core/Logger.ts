class Logger {
  private isEnabled = false;

  public enable() {
    this.isEnabled = true;
  }

  public printHero(version: string) {
    if (!this.isEnabled) {
      return;
    }
  }
}

const loggerInstance = new Logger();

export default loggerInstance;
