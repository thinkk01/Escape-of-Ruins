import * as pc from "playcanvas";
import { Coin } from "./coin";

export class Scene {
  private app: pc.Application;
  private coin: Coin;
  private player: pc.Entity;
  private coinsCollected: number;
  private coinLabel: pc.ElementComponent;
  private assetsFont: pc.Asset;

  constructor(
    app: pc.Application,
    coin: Coin,
    player: pc.Entity,
    assetsFont: pc.Asset
  ) {
    this.app = app;
    this.coin = coin;
    this.player = player;
    this.coinsCollected = 0;
    this.assetsFont = assetsFont;

    this.createUIScreen();
  }

  private createUIScreen(): void {
    const screenEntity = new pc.Entity("UI Screen");

    screenEntity.addComponent("screen", {
      screenSpace: true,
      referenceResolution: new pc.Vec2(1280, 720),
      scaleBlend: 0.5,
      scaleMode: pc.SCALEMODE_BLEND,
    });
    screenEntity.setPosition(0, 5, -50);
    screenEntity.setLocalScale(0.01, 0.01, 0.01);

    this.app.root.addChild(screenEntity);
    console.log(screenEntity);
    const coinTextEntity = new pc.Entity("coinLabel");
    // console.log(this.assetsFont);
    coinTextEntity.addComponent("element", {
      type: pc.ELEMENTTYPE_TEXT,
      fontAsset: this.assetsFont,
      pivot: new pc.Vec2(0.5, 0.5),
      anchor: new pc.Vec4(0.5, 0.5, 0.5, 0.5),
      fontSize: 32,
      text: "Coins: 0",
      color: new pc.Color(1, 1, 1),
      // screenSpace: false,
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
