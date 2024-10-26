import * as pc from "playcanvas";
import { stateMachine } from "../common/common";
import { Ground } from "./ground";

export class Player {
  private rotateX: number = 10;
  private rotateY: number = 30;
  entity: pc.Entity;
  stateMachine: any;
  isJumping: boolean = false;
  isSliding: boolean = false;
  isFalling: boolean = false;
  jumpStartHeight: number = 0;
  currentLane: number = 1;
  canChangeLane: boolean = true;
  swapLeft: boolean = true;
  swapRight: boolean = true;
  ground: Ground;
  lanes: number[] = [2, 0, -2];
  collisionDebugEntity: pc.Entity | null = null;

  constructor(app: pc.Application, assets: any, ground: Ground) {
    this.ground = ground;
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
        assets.playerJump,
        assets.playerIdle,
        assets.playerSlide,
      ],
    });
    this.entity.addComponent("rigidbody", {
      type: "kinematic",
      angularFactor: new pc.Vec3(0, 0, 0),
      // mass: 1,
    });
    this.entity.addComponent("collision", {
      type: "capsule",
      height: 2,
      radius: 0.55,
      linearOffset: new pc.Vec3(0, 1, 0),
    });
    this.entity.setPosition(this.lanes[this.currentLane], 1, 6);
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

    app.root.addChild(this.entity);
  }
  updateSwapLane(keyboard: pc.Keyboard, dt: number) {
    const currentPos = this.entity.getPosition();
    if (!this.isJumping) {
      if (this.canChangeLane) {
        if (keyboard.isPressed(pc.KEY_LEFT) && this.currentLane > 0) {
          console.log("Di chuyển sang trái");
          this.currentLane -= 1;
          this.canChangeLane = false;
          this.entity.setLocalEulerAngles(0, this.rotateY, -this.rotateX);
        }

        if (
          keyboard.isPressed(pc.KEY_RIGHT) &&
          this.currentLane < this.lanes.length - 1
        ) {
          console.log("Di chuyển sang phải");
          this.currentLane += 1;
          this.canChangeLane = false;
          this.entity.setLocalEulerAngles(0, -this.rotateY, this.rotateX);
        }
      }

      const targetX = this.lanes[this.currentLane];
      const moveSpeed = 4;
      const distance = targetX - currentPos.x;

      if (Math.abs(distance) > 0.1) {
        const moveX = Math.sign(distance) * moveSpeed * dt;
        this.entity.setPosition(
          currentPos.x + moveX,
          currentPos.y,
          currentPos.z
        );
      } else {
        this.entity.setPosition(targetX, currentPos.y, currentPos.z);
        this.canChangeLane = true;
      }

      if (
        !keyboard.isPressed(pc.KEY_LEFT) &&
        !keyboard.isPressed(pc.KEY_RIGHT)
      ) {
        const currentRotation = this.entity.getLocalEulerAngles().z;
        if (currentRotation !== 0) {
          const rotationSpeed = 5;
          const newRotation = pc.math.lerp(
            currentRotation,
            0,
            rotationSpeed * dt
          );
          this.entity.setLocalEulerAngles(0, 0, newRotation);
        }
      }
    }
  }

  handleJump(keyboard: pc.Keyboard, dt: number) {
    if (
      keyboard.isPressed(pc.KEY_SPACE) &&
      !this.isJumping &&
      !this.isFalling
    ) {
      this.stateMachine.changeState("jump");
      this.isJumping = true;
      this.jumpStartHeight = this.entity.getPosition().y;
    }

    if (this.isJumping) {
      const playerPos = this.entity.getPosition();
      const jumpSpeed = 3;
      const jumpHeight = 2;

      this.entity.setPosition(
        this.lanes[this.currentLane],
        playerPos.y + jumpSpeed * dt,
        playerPos.z
      );

      if (playerPos.y >= this.jumpStartHeight + jumpHeight) {
        this.isJumping = false;
        this.isFalling = true;
      }
    }
  }

  updateFall(dt: number) {
    if (this.isFalling) {
      const playerPos = this.entity.getPosition();
      const fallSpeed = -5;

      this.entity.setPosition(
        this.lanes[this.currentLane],
        Math.max(playerPos.y + fallSpeed * dt, 1),
        playerPos.z
      );

      if (playerPos.y <= 1) {
        this.isFalling = false;
        this.stateMachine.changeState("running");
        this.entity.setPosition(this.lanes[this.currentLane], 1, playerPos.z);
      }
    }
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
  update(keyboard: pc.Keyboard, dt: number) {
    console.log(this.entity.getPosition().y);
    this.updateSwapLane(keyboard, dt);
    this.handleJump(keyboard, dt);
    this.updateFall(dt);
    this.handleSlide(keyboard);
  }
  // updatePosition(targetX: number) {
  //   const currentPos = this.entity.getPosition();
  //   this.entity.setPosition(targetX, currentPos.y, currentPos.z);
  // }

  // createCollisionDebug(app: pc.Application) {
  //   this.collisionDebugEntity = new pc.Entity("CollisionDebug");
  //   const material = new pc.StandardMaterial();
  //   material.diffuse = new pc.Color(1, 1, 1, 0.5);
  //   material.update();

  //   this.collisionDebugEntity.addComponent("model", {
  //     type: "capsule",
  //   });
  //   this.collisionDebugEntity.model!.meshInstances[0].material = material;

  //   app.root.addChild(this.collisionDebugEntity);
  // }

  // updateCollisionDebug() {
  //   if (this.entity.collision) {
  //     const collisionPos = this.entity.getPosition();
  //     const scale = this.entity.getLocalScale();

  //     if (this.collisionDebugEntity) {
  //       this.collisionDebugEntity.setPosition(collisionPos);

  //       const scaleX = scale.x;
  //       // console.log(scaleX);
  //       const scaleY = scale.y;
  //       const scaleZ = scale.z;

  //       this.collisionDebugEntity.setLocalScale(scaleX, scaleY, scaleZ);
  //     }
  //   }
  // }
}
