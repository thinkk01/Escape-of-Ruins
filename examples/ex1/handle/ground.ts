import * as pc from "playcanvas";

interface GroundAssets {
  groundModel: pc.Asset;
  groundTexture: pc.Asset;
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
    console.log("map0" + this.grounds[0].getPosition());
    console.log("map1" + this.grounds[1].getPosition());
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

  public update(dt: number): void {
    const speed = 5;
    const groundLength = 94;

    this.grounds.forEach((ground) => {
      const groundPos = ground.getPosition();
      ground.setPosition(groundPos.x, groundPos.y, groundPos.z - dt * speed);
    });

    if (this.grounds[0].getPosition().z < -groundLength) {
      const lastGroundZ =
        this.grounds[this.grounds.length - 1].getPosition().z + groundLength;
      this.grounds[0].setPosition(0, 1, lastGroundZ);

      this.grounds.push(this.grounds.shift()!);
      this.createGround(0, 1, lastGroundZ);
    }
  }
}
