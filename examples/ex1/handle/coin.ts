import * as pc from "playcanvas";

export class Coin {
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
    this.entity = new pc.Entity("coin");

    // Thêm component model cho coin
    this.entity.addComponent("model", {
      type: "asset",
      asset: modelAsset,
    });
    this.entity.setPosition(x, y, z);
    this.entity.setLocalScale(1, 1, 1);

    // Thêm entity vào scene
    this.app.root.addChild(this.entity);
  }

  // Các phương thức khác cho coin (ví dụ xử lý thu thập)
  public getEntity(): pc.Entity {
    return this.entity;
  }
}
