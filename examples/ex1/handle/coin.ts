import * as pc from "playcanvas";

export class Coin {
  private app: pc.Application;
  private coins: pc.Entity[];
  private coinTexture: pc.Asset;

  constructor(app: pc.Application, coinTexture: pc.Asset) {
    this.app = app;
    this.coinTexture = coinTexture;
    this.coins = [];

    this.spawnCoins();
  }

  private spawnCoins() {
    const coinCount = 5;
    const coinSpacing = 5;

    for (let i = 0; i < coinCount; i++) {
      const coin = this.createCoin(0, 2, 15 + i * 2);
      this.coins.push(coin);
    }
  }

  private createCoin(x: number, y: number, z: number): pc.Entity {
    const coin = new pc.Entity("coin");

    coin.addComponent("model", {
      type: "asset",
      asset: this.coinTexture,
    });

    if (this.coinTexture && this.coinTexture.resource) {
      const coinMaterial = new pc.StandardMaterial();
      coinMaterial.diffuseMap = this.coinTexture.resource;
      coinMaterial.update();

      coin.model!.meshInstances.forEach((meshInstance) => {
        meshInstance.material = coinMaterial;
      });
    }

    coin.setPosition(x, y, z);
    coin.setLocalScale(1, 1, 1);

    this.app.root.addChild(coin);

    return coin;
  }

  public checkCollision(player: pc.Entity): boolean {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];

      const distance = player.getPosition().distance(coin.getPosition());
      // console.log(distance);
      if (distance < 1) {
        this.app.root.removeChild(coin);

        this.coins.splice(i, 1);

        console.log("thu thap duoc coin");
        return true;
      }
    }
    return false;
  }

  public update(dt: number, player: pc.Entity): boolean {
    this.coins.forEach((coin) => {
      const speed = 2;
      const coinPos = coin.getPosition();
      coin.setPosition(coinPos.x, coinPos.y, coinPos.z - dt * speed);
    });
    return this.checkCollision(player);
  }
}
