import * as pc from "playcanvas";
import { createGround, loadMaterial } from "./common/common";
import { Camera } from "./handle/camera";
import { Ground } from "./handle/ground";
import { Coin } from "./handle/coin";
import { Scene } from "./handle/scene";
import { Player } from "./handle/player";
import { Obstacle } from "./handle/obstacle";

pc.WasmModule.setConfig("Ammo", {
  glueUrl: "../../AmmoJS/Utils/ammo.wasm.js",
  wasmUrl: "../../AmmoJS/Utils/ammo.wasm.wasm",
  fallbackUrl: "../../AmmoJS/Utils/ammo.js",
});

async function init() {
  await new Promise((resolve) => {
    pc.WasmModule.getInstance("Ammo", resolve);
  });

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
  light.setEulerAngles(-45, 0, 0);
  app.root.addChild(light);

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
    coinModel: new pc.Asset("coin", "model", {
      url: "../ex1/assets/models/coin/Coin.glb",
    }),
    coinMaterial: new pc.Asset("coinMaterial", "texture", {
      url: "../ex1/assets/models/coin/Coin_ui.png",
    }),
    font: new pc.Asset("font", "font", {
      url: "../ex1/assets/font/courier.json",
    }),
    obstacleModel: new pc.Asset("obstacle", "model", {
      url: "../ex1/assets/obstacles/Fence.glb",
    }),
  };

  const assetListLoader = new pc.AssetListLoader(
    Object.values(assets),
    app.assets
  );

  assetListLoader.load(() => {
    const camera = new Camera(app);

    const initialZ = 0;
    const ground = new Ground(
      app,
      {
        groundModel: assets.groundModel,
        groundTexture: assets.groundTexture,
        obstacleModel: assets.obstacleModel,
        coinModel: assets.coinModel,
      },
      initialZ
    );

    const player = new Player(app, assets, ground);
    // const coin = new Coin(app, assets.coinModel, assets.coinMaterial);

    // const scene = new Scene(app, coin, player.entity, assets.font);
    const cameraOffsetZ = -10;
    const cameraOffsetY = 4;
    const keyboard = new pc.Keyboard(document.body);
    app.on("update", (dt) => {
      ground.update(dt);
      player.updateSwapLane(keyboard, dt);
      player.update(keyboard, dt);
      // player.updateCollisionDebug();
      // coin.update(dt, player.entity);
      // scene.update(dt);

      camera.followPlayer(player.entity, 0, cameraOffsetY, cameraOffsetZ, dt);
    });
  });
}

window.onload = init;
