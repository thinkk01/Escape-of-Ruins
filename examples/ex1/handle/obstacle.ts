import * as pc from "playcanvas";

export class Obstacle {
  private app: pc.Application;
  private entity: pc.Entity;

  constructor(
    app: pc.Application,
    modelAsset: pc.Asset,
    x: number,
    y: number,
    z: number
  ) {
    this.app = app;
    this.entity = new pc.Entity("obstacle");

    // Thêm component model cho obstacle
    this.entity.addComponent("model", {
      type: "asset",
      asset: modelAsset,
    });
    this.entity.setPosition(x, y, z);
    this.entity.setLocalScale(1, 1, 1);
    // Thêm entity vào scene
    this.app.root.addChild(this.entity);
  }

  // Bạn có thể thêm các phương thức khác nếu cần
  public getEntity(): pc.Entity {
    return this.entity;
  }
}
