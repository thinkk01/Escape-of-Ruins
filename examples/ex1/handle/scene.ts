import * as pc from "playcanvas";
import { Coin } from "./coin";

export class Scene {
  private app: pc.Application;
  private coin: Coin;
  private player: pc.Entity;
  private coinsCollected: number;
  private coinLabel: pc.ElementComponent;

  constructor(app: pc.Application, coin: Coin, player: pc.Entity) {
    this.app = app;
    this.coin = coin;
    this.player = player;
    this.coinsCollected = 0;

    this.createUIScreen();
  }

  private createUIScreen(): void {
    const screenEntity = new pc.Entity("UI Screen");

    screenEntity.addComponent("screen", {
      screenSpace: true,
      referenceResolution: { x: 1280, y: 720 },
      scaleMode: pc.SCALEMODE_BLEND,
    });

    this.app.root.addChild(screenEntity);

    const coinTextEntity = new pc.Entity("coinLabel");

    coinTextEntity.addComponent("element", {
      type: "text",
      anchor: [0, 1, 0, 1],
      pivot: [0, 1],
      fontSize: 32,
      color: new pc.Color(1, 1, 1),
      text: "Coins: 0",
      margin: [10, 10, 0, 0],
    });
    screenEntity.addChild(coinTextEntity);

    this.coinLabel = coinTextEntity.element!;
  }

  private updateCoinCount(): void {
    this.coinsCollected++;
    this.coinLabel.text = `Coins: ${this.coinsCollected}`;
  }

  public update(dt: number): void {
    const collected = this.coin.update(dt, this.player);
    if (collected) {
      this.updateCoinCount();
    }
  }
}
