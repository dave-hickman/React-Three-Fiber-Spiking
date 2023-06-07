import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping, PerspectiveCamera } from "three";
import kingImg from "../public/King.glb";
import { useGLTF, Stage, useAnimations } from "@react-three/drei";

// Wall width figures need to dynamic so that we don't need to hardcode in the wall width

function Box({ cubePosition, jump }) {
  const mesh = useRef();
  const [position, setPosition] = useState([0, 0, 0]);

  useFrame((state, delta) => {
    if (mesh.current.position.y < .7){
    mesh.current.position.y += jump * delta}
    if (mesh.current.position.y >= .7){
      mesh.current.position.y -= 0.01 + (1*delta)}
    if (mesh.current.position.y > -0.5) {
      mesh.current.position.y -= 0.01 + (1*delta);
    }
    if (mesh.current.position.x < 4.5) {
      mesh.current.position.x += cubePosition * delta;
    }
    if (mesh.current.position.x > 4.5) {
      mesh.current.position.x += -1 * delta;
    }
    if (mesh.current.position.x > -4.5) {
      mesh.current.position.x += cubePosition * delta;
    }
    if (mesh.current.position.x < -4.5) {
      mesh.current.position.x += 1 * delta;
    }
    
  });

  return (
    <mesh ref={mesh} position={position}>
      {/* <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" roughness={1}/> */}
      <Character />
    </mesh>
  );
}

function Character() {
  const king = useGLTF(kingImg);
  const kingAnimations = useAnimations(king.animations, king.scene);
  const charName= "CharacterArmature|Run"

  useEffect(() => {
    const action = kingAnimations.actions[charName];
    action.reset().fadeIn(0.5).play();

    return () => {
      action.fadeOut(0.5);
    };
  }, [kingAnimations.actions, charName]);
  return (
    <>
      <primitive
        object={king.scene}
        scale={[.8, .8, .8]}
        position={[0, 0, 0]}
        rotation-y={3}
        rotation-z={0}
        rotation-x={0}
      />
    </>
  );
}

const Background = () => {
  return (
    <mesh scale={[1000, 100, 1]} position={[0, 0, -50]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="blue" />
    </mesh>
  );
};

const Ground = ({ moveSpeed }) => {
  const mesh = useRef();

  useFrame((state, delta) => {
    mesh.current.position.z += moveSpeed * delta;
  });

  const texture = new TextureLoader().load("/darkbrown.png");
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1000, 1000);

  return (
    <mesh
      ref={mesh}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1, 0]}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

const Wall = ({ position, rotation, moveSpeed }) => {
  const mesh = useRef();
  useFrame((state, delta) => {
    mesh.current.position.z += moveSpeed * delta;
  });


  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <boxGeometry args={[100, 5, 0.1]} />
      <meshStandardMaterial color="green"/>
    </mesh>
  );
};

const App = () => {
  const [moveSpeed, setMoveSpeed] = useState(0);
  const [cubePosition, setCubePosition] = useState(0);
  const [jump, setJump] = useState(0);

  

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "ArrowUp") {
        setMoveSpeed(20);
      } else if (event.code === "ArrowDown") {
        setMoveSpeed(-20);
      } else if (event.code === "ArrowLeft") {
        setCubePosition(-1);
      } else if (event.code === "ArrowRight") {
        setCubePosition(1);
      }
        else if (event.code === 'Space'){
          setJump(10)
        }
    };

    const handleKeyUp = (event) => {
      if (event.code === "ArrowUp" || event.code === "ArrowDown") {
        setMoveSpeed(0);
      }
      if (event.code === "ArrowRight" || event.code === "ArrowLeft") {
        setCubePosition(0);
      } else if (event.code === "Space") {
        setJump(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 3, 5], fov: 75 }}
      style={{ height: "70vh", width: "100%" }}
    >
      {/* <PerspectiveCamera
        makeDefault
        // rotation={[Math.PI, 0, 0]}
        fov={75}
        position={[240, -420, 240]}
        near={1}
        far={1000}
      ></PerspectiveCamera> */}
      <ambientLight/>
      <pointLight castShadow position={[10, 10, 10]}  />
      <Background />
      {/* <Character position={[1.2,0,0]}/> */}
      <Box castShadow position={[1.2, 0, 0]} cubePosition={cubePosition} jump={jump} />
      <Ground receiveShadow moveSpeed={moveSpeed} />
      <Wall
        position={[5, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        moveSpeed={moveSpeed}
      />
      <Wall
        position={[-5, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        moveSpeed={moveSpeed}
      />
      <Wall
        position={[0, 0, -60]}
        rotation={[0, 0, 0]}
        moveSpeed={moveSpeed}
      />
    </Canvas>
  );
};

export default App;
