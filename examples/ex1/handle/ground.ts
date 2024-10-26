import * as pc from "playcanvas";
import { Obstacle } from "./obstacle";
import { Coin } from "./coin";

interface GroundAssets {
  groundModel: pc.Asset;
  groundTexture: pc.Asset;
  obstacleModel: pc.Asset;
  coinModel: pc.Asset;
}

export class Ground {
  private app: pc.Application;
  private assets: GroundAssets;
  private grounds: pc.Entity[];

  constructor(app: pc.Application, assets: GroundAssets, initialZ: number) {
    this.app = app;
    this.assets = assets;
    this.grounds = [];

    const groundLength = 100;
    const initialGrounds = 2;

    for (let i = 0; i < initialGrounds; i++) {
      const ground = this.createGround(0, 1, initialZ + i * groundLength);
      this.grounds.push(ground);
    }
  }

  private createGround(x: number, y: number, z: number): pc.Entity {
    const ground = new pc.Entity("ground");
    ground.addComponent("model", {
      type: "asset",
      asset: this.assets.groundModel,
    });

    ground.setPosition(x, y, z);
    ground.setLocalScale(1, 1, 1);

    if (this.assets.groundTexture && this.assets.groundTexture.resource) {
      const groundMaterial = new pc.StandardMaterial();
      groundMaterial.diffuseMap = this.assets.groundTexture.resource;
      groundMaterial.update();

      ground.model!.meshInstances.forEach((meshInstance) => {
        meshInstance.material = groundMaterial;
      });
    }

    for (let i = 0; i < 100; i += 30) {
      this.addObstaclesAndCoin(ground, i);
    }

    ground.addComponent("rigidbody", {
      type: "static",
      restitution: 0.5,
    });
    ground.addComponent("collision", {
      type: "box",
      halfExtents: new pc.Vec3(5, 0.01, 50),
      linearOffset: new pc.Vec3(0, 0, 50),
    });

    this.app.root.addChild(ground);
    return ground;
  }

  private addObstaclesAndCoin(ground: pc.Entity, zOffset: number): void {
    const positions = [2, 0, -2];
    const selectedPositions = this.getRandomPositions(positions, 2);

    // Tạo hai obstacles tại hai vị trí ngẫu nhiên
    selectedPositions.forEach((posX) => {
      const obstacle = new Obstacle(
        this.app,
        this.assets.obstacleModel,
        posX,
        0,
        zOffset
      );
      ground.addChild(obstacle.getEntity());
    });

    // Vị trí còn lại sẽ là coin
    const coinPosition = positions.find(
      (pos) => !selectedPositions.includes(pos)
    )!;
    const coin = new Coin(
      this.app,
      this.assets.coinModel,
      coinPosition,
      0.5,
      zOffset
    );
    ground.addChild(coin.getEntity());
  }

  private getRandomPositions(arr: number[], count: number): number[] {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  public update(dt: number): void {
    const speed = 5;
    const groundLength = 94;

    this.grounds.forEach((ground) => {
      const groundPos = ground.getPosition();
      ground.setPosition(groundPos.x, groundPos.y, groundPos.z - dt * speed);
    });

    if (this.grounds[0].getPosition().z < -groundLength - 10) {
      const lastGroundZ =
        this.grounds[this.grounds.length - 1].getPosition().z + groundLength;
      this.grounds[0].setPosition(0, 1, lastGroundZ);

      this.grounds.push(this.grounds.shift()!);
      this.createGround(0, 1, lastGroundZ);
    }
  }
}
