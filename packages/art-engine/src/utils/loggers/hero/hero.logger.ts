import * as fs from "fs";
import * as path from "path";

class HeroLogger {
  private isEnabled = false;
  private version;

  constructor() {
    this.version = JSON.parse(
      fs
        .readFileSync(
          path.join(__dirname, "..", "..", "..", "..", "package.json")
        )
        .toString()
    ).version;
  }

  public enable() {
    this.isEnabled = true;
  }

  public printHero() {
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

Art Engine ${this.version} 👄
      `);
  }
}

const loggerInstance = new HeroLogger();

export default loggerInstance;
