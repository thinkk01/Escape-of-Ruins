import * as pc from "playcanvas";
import { createGround, loadMaterial, stateMachine } from "./common/common";
import { StartScreen } from "../ex1/handle/screenStart";
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
  // screen
  // const startScreen = new StartScreen(app);
  // start
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
      url: "../ex1/assets/animation/jump/mixamo.com (5).glb",
    }),
    playerSlide: new pc.Asset("animation_slide_player", "animation", {
      url: "../ex1/assets/animation/slide/mixamo.com (3).glb",
    }),
    groundModel: new pc.Asset("model_ground", "model", {
      url: "../ex1/assets/ground/ground_1.glb",
    }),
    groundTexture: new pc.Asset("texture_ground", "texture", {
      url: "../ex1/assets/ground/ground.png",
    }),
    // cliffsTexture: new pc.Asset("cliffsTexture", "texture", {
    //   url: "../ex1/assets/ground/ground.png",
    // }),
    // plantTexture: new pc.Asset("plantTexture", "texture", {
    //   url: "../ex1/assets/ground/ground.png",
    // }),
    playerIdle: new pc.Asset("player_idle", "animation", {
      url: "../ex1/assets/animation/idle/mixamo.com (4).glb",
    }),
    coinModel: new pc.Asset("coin", "texture", {
      url: "../ex1/assets/models/Coin_ui.png",
    }),
  };

  const assetListLoader = new pc.AssetListLoader(
    Object.values(assets),
    app.assets
  );
  assetListLoader.load(() => {
    const textures = [
      assets.groundTexture,
      // assets.cliffsTexture,
      // assets.plantTexture,
    ];
    const [groundMaterial, cliffsMaterial, plantMaterial] = loadMaterial(
      pc,
      textures
    );
    createGround({
      x: 0,
      y: 1,
      z: 0,
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
        assets.playerRunning,
        assets.playerIdle,
        assets.playerJump,
        assets.playerSlide,
      ],
    });
    let currentAnim = assets.playerIdle.name;
    const playerStateMachine = new stateMachine("idle");
    playerStateMachine.addState("running", () => {
      player.animation?.play(assets.playerRunning.name, 0.2);
    });
    playerStateMachine.addState("idle", () => {
      player.animation?.play(assets.playerIdle.name, 0.2);
    });

    playerStateMachine.addState("jump", () => {
      player.animation?.play(assets.playerJump.name, 0.2);
    });

    playerStateMachine.addState("slide", () => {
      player.animation?.play(assets.playerSlide.name, 0.2);
    });
    player.setPosition(0, 2, 6);
    const material = player.model?.meshInstances[0]
      .material as pc.StandardMaterial;
    material.diffuseMap = assets.playerTexture.resource;

    player.addComponent("rigidbody", {
      type: "dynamic",
      angularFactor: new pc.Vec3(0, 0, 0),
      mass: 1,
    });
    player.addComponent("collision", {
      type: "capsule",
      linearOffset: new pc.Vec3(0, 1, 0),
    });
    app.root.addChild(player);

    const charMovement = new pc.Vec3();
    charMovement.z = player.getPosition().z;
    const keyboard = new pc.Keyboard(document.body);
    cameraEntity.setPosition(0, 5, 20);

    let charSpeed = 8;
    let isJumping = false;
    const lanes = [2, 0, -2];
    let currentLane = 1;
    const cameraOffsetZ = -10;
    const cameraOffsetY = 4;
    let swapRight = true;
    let swapLeft = true;
    let canChangeLane = true;
    let isSliding = false;

    app.on("update", (dt) => {
      const playerPos = player.getPosition();
      //auto move
      const groundMovement = new pc.Vec3(0, 0, -charSpeed * dt);
      app.root.setPosition(app.root.getPosition().add(groundMovement));
      //camera
      cameraEntity.lookAt(playerPos);

      //swaplane
      if (canChangeLane) {
        if (keyboard.isPressed(pc.KEY_LEFT) && currentLane > 0 && swapLeft) {
          currentLane -= 1;
          canChangeLane = false;
        }
        if (currentLane < 1) {
          swapLeft = false;
          swapRight = true;
        }
        if (currentLane > 1) {
          swapRight = false;
          swapLeft = true;
        }
        if (
          keyboard.isPressed(pc.KEY_RIGHT) &&
          currentLane < lanes.length - 1 &&
          swapRight
        ) {
          currentLane += 1;
          canChangeLane = false;
        }
      }
      if (
        !keyboard.isPressed(pc.KEY_LEFT) &&
        !keyboard.isPressed(pc.KEY_RIGHT)
      ) {
        canChangeLane = true;
      }
      const targetX = lanes[currentLane];

      const newPos = new pc.Vec3(targetX, playerPos.y, playerPos.z);
      player.setPosition(newPos);

      // jump
      if (
        keyboard.isPressed(pc.KEY_SPACE) &&
        !isJumping &&
        player.rigidbody!.linearVelocity.y < 0.5
      ) {
        playerStateMachine.changeState("jump");
        player.rigidbody!.applyImpulse(new pc.Vec3(0, 5, 0));
        isJumping = true;
        console.log(true);
      }
      if (isJumping) {
        if (player.rigidbody!.linearVelocity.y <= 0) {
          if (playerPos.y <= 1.5) {
            player.rigidbody!.linearVelocity = new pc.Vec3(0, 0, 0);
            player.setPosition(targetX, 1, playerPos.z);
            playerStateMachine.changeState("running");
            isJumping = false;
          }
        }
      }
      if (keyboard.isPressed(pc.KEY_DOWN) && !isSliding) {
        isSliding = true; // Đánh dấu là đang trượt
        playerStateMachine.changeState("slide");

        // Chuyển đổi hình dạng va chạm sang hình chữ nhật khi trượt
        player.collision!.type = "capsule"; // Chọn loại box
        player.collision!.halfExtents.set(0, 1, 0); // Điều chỉnh kích thước box (x, y, z)
        player.collision!.height = 1;
        // Thời gian trượt
        setTimeout(() => {
          player.collision!.type = "capsule";
          player.collision!.halfExtents.set(0, 1, 0);
          player.collision!.height = 2;
          playerStateMachine.changeState("running");
          isSliding = false;
        }, 600);
      }

      // Các phần còn lại của m
      console.log(playerPos);
      cameraEntity.setPosition(
        pc.math.lerp(cameraEntity.getPosition().x, playerPos.x, 0.1),
        pc.math.lerp(
          cameraEntity.getPosition().y,
          playerPos.y + cameraOffsetY,
          0.1
        ),
        pc.math.lerp(
          cameraEntity.getPosition().z,
          playerPos.z + cameraOffsetZ,
          0.1
        )
      );

      // Đặt lại chuyển động
      charMovement.set(0, 0, 0);
    });
  });
}
window.onload = init;
