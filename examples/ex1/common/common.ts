export function loadMaterial(pc: any, textures: any[]) {
  const materials = textures.map((textureAsset) => {
    const material = new pc.StandardMaterial();
    material.diffuseMap = textureAsset.resource;
    material.update();
    return material;
  });
  return materials;
}
export function createGround(props: any) {
  const {
    x,
    y,
    z,
    scaleX,
    scaleY,
    scaleZ,
    Cx,
    Cy,
    Cz,
    app,
    pc,
    groundModel,
    materialGround,
    cliffsMaterial,
    plantMaterial,
  } = props;
  const ground = new pc.Entity("ground");
  ground.addComponent("model", { type: "asset", asset: groundModel });

  ground.setLocalScale(scaleX, scaleY, scaleZ);
  ground.setPosition(x, y, z);
  const scale1 = 1;
  ground.setLocalScale(scale1, scale1, scale1);
  if (materialGround && materialGround.resource) {
    const groundMaterial = new pc.StandardMaterial();
    groundMaterial.diffuseMap = materialGround.resource;
    groundMaterial.update();

    ground.model!.meshInstances.forEach((meshInstance) => {
      meshInstance.material = groundMaterial;
    });
  }
  ground.model.on("set:asset", function () {
    const meshInstances = ground.model.meshInstances;
    if (meshInstances.length >= 3) {
      meshInstances[0].material = materialGround;
      meshInstances[1].material = cliffsMaterial;
      meshInstances[2].material = plantMaterial;
    } else {
      console.error("Không đủ meshInstances để áp dụng các vật liệu khác nhau");
    }
  });
  // console.log(ground.model.meshInstances[2]);
  ground.addComponent("rigidbody", {
    type: "static",
    restitution: 0.5,
  });
  ground.addComponent("collision", {
    type: "box",
    halfExtents: new pc.Vec3(scaleX / 2, 0, scaleZ / 2),
  });
  app.root.addChild(ground);
  return ground;
}
export class stateMachine {
  private currentState: string;
  private states: { [key: string]: () => void };

  constructor(initialState: string) {
    this.currentState = initialState;
    this.states = {};
  }

  addState(name: string, action: () => void) {
    this.states[name] = action;
  }

  changeState(newState: string) {
    if (this.states[newState]) {
      this.currentState = newState;
      this.states[newState]();
    }
  }

  getCurrentState() {
    return this.currentState;
  }
}
