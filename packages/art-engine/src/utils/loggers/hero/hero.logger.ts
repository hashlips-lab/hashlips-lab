class HeroLogger {
  private isEnabled = false;

  public enable() {
    this.isEnabled = true;
  }

  public printHero(version: string) {
    if (!this.isEnabled) {
      return;
    }
    console.log(`
██╗  ██╗ █████╗ ███████╗██╗  ██╗██╗     ██╗██████╗ ███████╗    ██╗      █████╗ ██████╗
██║  ██║██╔══██╗██╔════╝██║  ██║██║     ██║██╔══██╗██╔════╝    ██║     ██╔══██╗██╔══██╗
███████║███████║███████╗███████║██║     ██║██████╔╝███████╗    ██║     ███████║██████╔╝
██╔══██║██╔══██║╚════██║██╔══██║██║     ██║██╔═══╝ ╚════██║    ██║     ██╔══██║██╔══██╗
██║  ██║██║  ██║███████║██║  ██║███████╗██║██║     ███████║    ███████╗██║  ██║██████╔╝
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝     ╚══════╝    ╚══════╝╚═╝  ╚═╝╚═════╝

Art Engine ${version} 👄
      `);
  }
}

const loggerInstance = new HeroLogger();

export default loggerInstance;
