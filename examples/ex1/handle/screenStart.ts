import * as pc from "playcanvas";

export class StartScreen {
  private app: any;
  private startScreen: HTMLDivElement;
  private gameStarted: boolean;

  constructor(app: any) {
    this.app = app;
    this.startScreen = this.createStartScreen();
    this.gameStarted = false;
  }

  private createStartScreen(): HTMLDivElement {
    const startScreen = document.createElement("div");
    startScreen.style.position = "absolute";
    startScreen.style.top = "0";
    startScreen.style.left = "0";
    startScreen.style.width = "100%";
    startScreen.style.height = "100%";
    startScreen.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    startScreen.style.display = "flex";
    startScreen.style.justifyContent = "center";
    startScreen.style.alignItems = "center";
    startScreen.style.color = "white";
    startScreen.style.fontSize = "36px";

    const startButton = document.createElement("button");
    startButton.id = "start-button";
    startButton.innerText = "Bắt đầu game";
    startButton.style.fontSize = "24px";
    startButton.style.padding = "10px 20px";

    startScreen.appendChild(startButton);
    document.body.appendChild(startScreen);

    startButton.addEventListener("click", () => {
      this.startGame();
    });

    return startScreen;
  }

  private startGame(): void {
    document.body.removeChild(this.startScreen);
    this.gameStarted = true;
    this.app.start();
  }

  public isGameStarted(): boolean {
    return this.gameStarted;
  }
}
