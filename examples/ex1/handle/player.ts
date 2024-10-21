import * as pc from "playcanvas";
import { stateMachine } from "../common/common";

export class Player {
  entity: pc.Entity;
  stateMachine: any;
  isJumping: boolean = false;
  isSliding: boolean = false;
  currentLane: number = 1;
  canChangeLane: boolean = false;
  swapLeft: boolean = true;
  swapRight: boolean = true;
  lanes: number[] = [2, 0, -2];
  collisionDebugEntity: pc.Entity | null = null;

  constructor(app: pc.Application, assets: any) {
    this.entity = new pc.Entity("Character");

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
    this.entity.setPosition(0, 5, 6);
    const material = this.entity.model?.meshInstances[0]
      .material as pc.StandardMaterial;
    material.diffuseMap = assets.playerTexture.resource;

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

    this.entity.addComponent("rigidbody", {
      type: "dynamic",
      angularFactor: new pc.Vec3(0, 0, 0),
      mass: 1,
    });
    this.entity.addComponent("collision", {
      type: "capsule",
      height: 2,
      radius: 0.5,
      linearOffset: new pc.Vec3(0, 1, 0),
    });

    app.root.addChild(this.entity);

    // this.createCollisionDebug(app);
  }

  handleJump(keyboard: pc.Keyboard) {
    if (
      keyboard.isPressed(pc.KEY_C) &&
      !this.isJumping &&
      this.entity.rigidbody!.linearVelocity.y < 0.5
    ) {
      this.stateMachine.changeState("jump");
      this.entity.rigidbody!.applyImpulse(new pc.Vec3(0, 5, 0));
      this.isJumping = true;
    }
  }

  updateSwapLane(keyboard: pc.Keyboard) {
    if (this.canChangeLane) {
      if (
        keyboard.isPressed(pc.KEY_LEFT) &&
        this.currentLane > 0 &&
        this.swapLeft
      ) {
        this.currentLane -= 1;
        this.canChangeLane = false;
      }
      if (this.currentLane < 1) {
        this.swapLeft = false;
        this.swapRight = true;
      }
      if (this.currentLane > 1) {
        this.swapRight = false;
        this.swapLeft = true;
      }
      if (
        keyboard.isPressed(pc.KEY_RIGHT) &&
        this.currentLane < this.lanes.length - 1 &&
        this.swapRight
      ) {
        this.currentLane += 1;
        this.canChangeLane = false;
      }
    }
    if (!keyboard.isPressed(pc.KEY_LEFT) && !keyboard.isPressed(pc.KEY_RIGHT)) {
      this.canChangeLane = true;
    }

    const targetX = this.lanes[this.currentLane];
    const currentPos = this.entity.getPosition();
    this.entity.setPosition(new pc.Vec3(targetX, currentPos.y, currentPos.z));
  }

  handleSlide(keyboard: pc.Keyboard) {
    if (keyboard.isPressed(pc.KEY_DOWN) && !this.isSliding) {
      this.isSliding = true;
      this.stateMachine.changeState("slide");

      this.entity.collision!.type = "capsule";
      this.entity.collision!.height = 1;
      this.entity.collision!.linearOffset = new pc.Vec3(0, 0.5, 0);

      setTimeout(() => {
        this.entity.collision!.height = 2;
        this.entity.collision!.linearOffset = new pc.Vec3(0, 1, 0);
        this.stateMachine.changeState("running");
        this.isSliding = false;
      }, 550);
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
  createCollisionDebug(app: pc.Application) {
    this.collisionDebugEntity = new pc.Entity("CollisionDebug");
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(1, 1, 1, 0.5);
    material.update();

    this.collisionDebugEntity.addComponent("model", {
      type: "capsule",
    });
    this.collisionDebugEntity.model!.meshInstances[0].material = material;

    app.root.addChild(this.collisionDebugEntity);
  }

  updateCollisionDebug() {
    if (this.entity.collision) {
      const collisionPos = this.entity.getPosition();
      const scale = this.entity.getLocalScale();

      if (this.collisionDebugEntity) {
        this.collisionDebugEntity.setPosition(collisionPos);

        const scaleX = scale.x;
        console.log(scaleX);
        const scaleY = scale.y;
        const scaleZ = scale.z;

        this.collisionDebugEntity.setLocalScale(scaleX, scaleY, scaleZ);
      }
    }
  }
}
