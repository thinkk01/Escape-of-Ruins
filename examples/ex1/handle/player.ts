import * as pc from "playcanvas";
import { stateMachine } from "../common/common";

export class Player {
  entity: pc.Entity;
  stateMachine: any;
  isJumping: boolean = false;
  isSliding: boolean = false;

  constructor(app: pc.Application, assets: any) {
    this.entity = new pc.Entity("Character");

    // Add model and animations
    this.entity.addComponent("model", {
      type: "asset",
      asset: assets.charModelAsset,
    });
    const scale = 1;
    this.entity.setLocalScale(scale, scale, scale);

    this.entity.addComponent("animation", {
      assets: [
        assets.playerRunning,
        assets.playerIdle,
        assets.playerJump,
        assets.playerSlide,
      ],
    });

    this.stateMachine = new stateMachine("idle");
    this.stateMachine.addState("running", () => {
      this.entity.animation?.play(assets.playerRunning.name, 0.2);
    });
    this.stateMachine.addState("idle", () => {
      this.entity.animation?.play(assets.playerIdle.name, 0.2);
    });
    this.stateMachine.addState("jump", () => {
      this.entity.animation?.play(assets.playerJump.name, 0.2);
    });
    this.stateMachine.addState("slide", () => {
      this.entity.animation?.play(assets.playerSlide.name, 0.2);
    });

    // Set up rigidbody and collision
    this.entity.addComponent("rigidbody", {
      type: "dynamic",
      angularFactor: new pc.Vec3(0, 0, 0),
      mass: 1,
    });
    this.entity.addComponent("collision", {
      type: "capsule",
      linearOffset: new pc.Vec3(0, 1, 0),
    });

    app.root.addChild(this.entity);
  }

  handleJump(keyboard: pc.Keyboard) {
    if (
      keyboard.isPressed(pc.KEY_SPACE) &&
      !this.isJumping &&
      this.entity.rigidbody!.linearVelocity.y < 0.5
    ) {
      this.stateMachine.changeState("jump");
      this.entity.rigidbody!.applyImpulse(new pc.Vec3(0, 5, 0));
      this.isJumping = true;
    }
  }

  handleSlide(keyboard: pc.Keyboard) {
    if (keyboard.isPressed(pc.KEY_DOWN) && !this.isSliding) {
      this.isSliding = true;
      this.stateMachine.changeState("slide");

      // Chuyển đổi hình dạng va chạm khi trượt
      this.entity.collision!.type = "capsule";
      this.entity.collision!.height = 1;

      setTimeout(() => {
        this.entity.collision!.height = 2;
        this.stateMachine.changeState("running");
        this.isSliding = false;
      }, 600);
    }
  }

  updatePosition(targetX: number) {
    const currentPos = this.entity.getPosition();
    this.entity.setPosition(targetX, currentPos.y, currentPos.z);
  }

  updateJump() {
    if (this.isJumping) {
      const playerPos = this.entity.getPosition();
      if (this.entity.rigidbody!.linearVelocity.y <= 0) {
        if (playerPos.y <= 1.5) {
          this.entity.rigidbody!.linearVelocity = new pc.Vec3(0, 0, 0);
          this.entity.setPosition(playerPos.x, 1, playerPos.z);
          this.stateMachine.changeState("running");
          this.isJumping = false;
        }
      }
    }
  }
}
