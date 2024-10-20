import * as pc from "playcanvas";

export class Camera {
  entity: pc.Entity;

  constructor(app: pc.Application) {
    this.entity = new pc.Entity("MainCamera");
    this.entity.addComponent("camera", {
      clearColor: new pc.Color(0.66, 0.66, 0.66),
    });
    app.root.addChild(this.entity);
  }

  followPlayer(
    player: pc.Entity,
    offsetX: number,
    offsetY: number,
    offsetZ: number
  ) {
    const playerPos = player.getPosition();
    this.entity.setPosition(
      pc.math.lerp(this.entity.getPosition().x, playerPos.x + offsetX, 0.1),
      pc.math.lerp(this.entity.getPosition().y, playerPos.y + offsetY, 0.1),
      pc.math.lerp(this.entity.getPosition().z, playerPos.z + offsetZ, 0.1)
    );
    this.entity.lookAt(playerPos);
  }
}
