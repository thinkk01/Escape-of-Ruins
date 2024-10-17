import * as pc from "playcanvas";
import { createGround, loadMaterial, stateMachine } from "./common/common";

pc.WasmModule.setConfig("Ammo", {
  glueUrl: "../../AmmoJS/Utils/ammo.wasm.js",
  wasmUrl: "../../AmmoJS/Utils/ammo.wasm.wasm",
  fallbackUrl: "../../AmmoJS/Utils/ammo.js",
});

async function init() {
  await new Promise((resolve) => {
    pc.WasmModule.getInstance("Ammo", resolve);
  });
  //setup canvas
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(document.body),
    keyboard: new pc.Keyboard(window),
    elementInput: new pc.ElementInput(canvas),
  });
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  window.addEventListener("resize", () => app.resizeCanvas());
  app.start();

  const cameraEntity = new pc.Entity("MainCamera");
  cameraEntity.addComponent("camera", {
    clearColor: new pc.Color(0.66, 0.66, 0.66),
  });
  // cameraEntity.setPosition(-1.917, 4.725, -78.249);
  app.root.addChild(cameraEntity);

  // Thêm ánh sáng
  const light = new pc.Entity("DirectionalLight");
  light.addComponent("light", {
    type: "directional",
    color: new pc.Color(1, 1, 1),
    castShadows: true,
    intensity: 2,
    shadowBias: 0.2,
    shadowDistance: 16,
    normalOffsetBias: 0.05,
    shadowResolution: 2048,
  });
  light.setEulerAngles(45, 0, 0);
  app.root.addChild(light);
  //asset
  const assets = {
    charModelAsset: new pc.Asset("model_player", "model", {
      url: "../ex1/assets/models/Mutant.glb",
    }),
    groundAsset: new pc.Asset("ground", "texture", {
      url: "../ex1/assets/ground/large_rock_05_height.jpg",
    }),
    playerTexture: new pc.Asset("texture_player", "texture", {
      url: "../ex1/assets/textures/Mutant_diffuse1.png",
    }),
    playerRunning: new pc.Asset("animation_run_player", "animation", {
      url: "../ex1/assets/animation/run/mixamo.com.glb",
    }),
    playerJump: new pc.Asset("animation_jump_player", "animation", {
      url: "../ex1/assets/animation/jump/mixamo.com (2).glb",
    }),
    playerSlide: new pc.Asset("animation_slide_player", "animation", {
      url: "../ex1/assets/slide/mixamo.com (3).glb",
    }),
    groundModel: new pc.Asset("model_ground", "model", {
      url: "../ex1/assets/ground/ground_1.glb",
    }),
    groundTexture: new pc.Asset("texture_ground", "texture", {
      url: "../ex1/assets/ground/ground.png",
    }),
    cliffsTexture: new pc.Asset("cliffsTexture", "texture", {
      url: "../ex1/assets/ground/ground.png",
    }),
    plantTexture: new pc.Asset("plantTexture", "texture", {
      url: "../ex1/assets/ground/ground.png",
    }),
    playerIdle: new pc.Asset("player_idle", "animation", {
      url: "../ex1/assets/animation/idle/mixamo.com (4).glb",
    }),
  };

  const assetListLoader = new pc.AssetListLoader(
    Object.values(assets),
    app.assets
  );
  assetListLoader.load(() => {
    const textures = [
      assets.groundTexture,
      assets.cliffsTexture,
      assets.plantTexture,
    ];
    const [groundMaterial, cliffsMaterial, plantMaterial] = loadMaterial(
      pc,
      textures
    );
    createGround({
      x: 0,
      y: 1,
      z: 0,
      Cx: 70,
      Cy: 0.25,
      Cz: 11,
      scaleX: 22,
      scaleY: 0.5,
      scaleZ: 142,
      app: app,
      pc: pc,
      groundAsset: assets.groundAsset,
      groundModel: assets.groundModel,
      materialGround: assets.groundTexture,
    });

    //player
    const player = new pc.Entity("Character");
    player.addComponent("model", {
      type: "asset",
      asset: assets.charModelAsset,
    });
    const scale = 1;
    player.setLocalScale(scale, scale, scale);

    player.addComponent("animation", {
      assets: [
        assets.playerIdle,
        assets.playerRunning,
        assets.playerJump,
        assets.playerSlide,
      ],
    });
    let currentAnim = assets.playerIdle.name;
    // create machine for charracter
    const playerStateMachine = new stateMachine("idle");

    // Add state to state machine
    playerStateMachine.addState("idle", () => {
      player.animation?.play(assets.playerIdle.name, 0.2);
    });

    playerStateMachine.addState("running", () => {
      player.animation?.play(assets.playerRunning.name, 0.2);
    });

    playerStateMachine.addState("jump", () => {
      player.animation?.play(assets.playerJump.name, 0.2);
    });

    playerStateMachine.addState("slide", () => {
      player.animation?.play(assets.playerSlide.name, 0.2);
    });
    player.setPosition(0, 5, 6);
    const material = player.model?.meshInstances[0]
      .material as pc.StandardMaterial;
    material.diffuseMap = assets.playerTexture.resource;

    player.addComponent("rigidbody", {
      type: "dynamic",
      mass: 1,
    });
    player.addComponent("collision", {
      type: "capsule",
      linearOffset: new pc.Vec3(0, 1, 0),
    });
    app.root.addChild(player);

    const charMovement = new pc.Vec3();
    charMovement.z = player.getPosition().z;
    // console.log(charMovement);
    let charSpeed = 8;
    const keyboard = new pc.Keyboard(document.body);
    let isJumping = false;
    let jumpTimer = 0;
    let isSlay = false;

    app.on("update", (dt) => {
      const cameraOffsetZ = -10;
      const cameraOffsetY = 4;
      const playerPos = player.getPosition();
      // charMovement.z = playerPos.z;
      cameraEntity.lookAt(playerPos);

      if (keyboard.isPressed(pc.KEY_LEFT)) {
        charMovement.x += charSpeed * dt;
      }
      if (keyboard.isPressed(pc.KEY_RIGHT)) {
        charMovement.x -= charSpeed * dt;
      }
      // if (keyboard.isPressed(pc.KEY_DOWN)) {
      //   player.animation?.play(assets.playerSlide.name, 2);
      // }
      if (
        keyboard.isPressed(pc.KEY_C) &&
        !isJumping &&
        player.rigidbody!.linearVelocity.y === 0
      ) {
        player.animation?.play(assets.playerJump.name, 4);
        // player.rigidbody!.applyImpulse(
        //   0,
        //   playerPos.y,
        //   charMovement.z * charSpeed * dt
        // );
        isJumping = true;
      }

      if (
        keyboard.isPressed(pc.KEY_DOWN) &&
        player.rigidbody!.linearVelocity.y === 0
      ) {
        isJumping = true;
        player.animation?.play(assets.playerSlide.name, 4);
        player.rigidbody!.applyImpulse(
          playerPos.x,
          playerPos.y,
          charSpeed * dt
        );
      }
      if (isJumping) {
        jumpTimer -= dt;
        if (
          jumpTimer <= 0 &&
          Math.floor(Math.abs(player.rigidbody!.linearVelocity.y)) === 0
        ) {
          isJumping = false;
          player.animation?.play(assets.playerRunning.name, 4);
        }
      }
      // console.log(player.rigidbody!.linearVelocity.y);
      charMovement.z += charSpeed * dt;
      const newPos = playerPos.clone().add(charMovement);
      player.setPosition(newPos);
      if (charMovement.length() > 0) {
        const angle = Math.atan2(charMovement.x, charMovement.z);
        player.setEulerAngles(0, angle * pc.math.RAD_TO_DEG, 0);
      }

      cameraEntity.setPosition(
        pc.math.lerp(cameraEntity.getPosition().x, playerPos.x, 1),
        pc.math.lerp(
          cameraEntity.getPosition().y,
          playerPos.y + cameraOffsetY,
          1
        ),
        pc.math.lerp(
          cameraEntity.getPosition().z,
          playerPos.z + cameraOffsetZ,
          1
        )
      );
      charMovement.set(0, 0, 0);
      // console.log(playerPos);
      // if (playerPos.z > 10 || playerPos.x < -5 || playerPos.x > 5) {
      //   player.setPosition(0, playerPos.y, 0);
      // }
    });
  });
}
window.onload = init;
