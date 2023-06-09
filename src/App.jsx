import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping, PerspectiveCamera } from "three";
import kingImg from "../public/King.glb";
import { useGLTF, Stage, useAnimations } from "@react-three/drei";
import { Physics, usePlane, useBox } from '@react-three/cannon'


function King(props) {
  // this part uses useRef to make an object of loads of data about the box, like its current position and stuff
  const [ref] = useBox(() => ({ mass: 1, position: [0, 5, 0], ...props, args:[1,1,1] }))
  // this bit sets the box to start at the co-ordinates 0,0,0 when the window opens
  const [position, setPosition] = useState([0, 0, 0]);


  // useFrame is whats used to animate things, it basically checks before loading every frame any of the conditional logic inside and makes the changes, the delta part i don't 100% get but it basically by multiplying any change by delta it makes sure that however slow or fast your computer is the animation is smooth

  useFrame((state, delta) => {
    //this part is basically saying if the character is below a certain height let it jump, or if its over 0.7 on the y axis start pushing it down (its accessing the mesh object we made above to get its co-ordinates and then change them)
    if (ref.current.position.y < .7){
    ref.current.position.y += props.jump * delta}
    if (ref.current.position.y >= .7){
      ref.current.position.y -= 0.01 + (1*delta)}

    //this one is what gets the character to stand on the ground, it basically pushes the character down until its at -0.5 on the Y axis
    if (ref.current.position.y > -0.5) {
      ref.current.position.y -= 0.01 + (1*delta);
    }

    //the below is what is stopping it going too far left or right (it starts pushing the box's X axis back when it gets to -4.5 or 4.5)
    if (ref.current.position.x < 4.5) {
      ref.current.position.x += props.cubePosition * delta;
    }
    if (ref.current.position.x > 4.5) {
      ref.current.position.x += -1 * delta;
    }
    if (ref.current.position.x > -4.5) {
      ref.current.position.x += props.cubePosition * delta;
    }
    if (ref.current.position.x < -4.5) {
      ref.current.position.x += 1 * delta;
    }
    
  });

  return (
    <mesh ref={ref} position={position}>
      <Character />
    </mesh>
  );
}

function Cube(props) {
  const [ref] = useBox(() => ({ mass: 1, ...props, args:[1,1,1] }))

  //this useFrame is changing the z axis (forward and backwards) of the ground if moveSpeed has changed, which is set in App when you press the up or down arrow

  useFrame((state, delta) => {
    ref.current.position.z += props.moveSpeed * delta;
    console.log(ref.current.position.z)
  });
  return (
    <mesh ref={ref} position={props.position} >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="yellow" />
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

const Ground = (props) => {
  // const mesh = useRef();
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  //this useFrame is changing the z axis (forward and backwards) of the ground if moveSpeed has changed, which is set in App when you press the up or down arrow

  useFrame((state, delta) => {
    ref.current.position.z += props.moveSpeed * delta;
  });


  // this is making a texture of bricks thats added in as a prop to meshStandardMaterial on line 114
  const texture = new TextureLoader().load("/darkbrown.png");
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1000, 1000);

  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1, 0]}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

const Wall = (props) => {
  const [ref] = useBox(() => ({ mass: 1, ...props, args:[1,1,1] }))
  //this useFrame is changing the z axis (forward and backwards) of the wall if moveSpeed has changed, which is set in App when you press the up or down arrow
  useFrame((state, delta) => {
    ref.current.position.z += props.moveSpeed * delta;
  });


  return (
    <mesh ref={ref} position={props.position} rotation={props.rotation}>
      <boxGeometry args={[100, 5, 0.1]} />
      <meshStandardMaterial color="green"/>
    </mesh>
  );
};

const App = () => {
  const [moveSpeed, setMoveSpeed] = useState(0);
  const [cubePosition, setCubePosition] = useState(0);
  const [jump, setJump] = useState(0);

  
  //this handleKeyDown and handleKeyUp is the functions triggered when its listening for the keys and then changing the moveSpeed and cubePosition props to move stuff about
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

    //this is what is actually listening for the key changes

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <Canvas
    // onKeyDown={(e) => {handleKeyDown(e)}}
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
     
      <Physics>
      <Cube moveSpeed={moveSpeed} position={[0,0,-40]} />
      <King castShadow position={[1.2, 0, 0]} cubePosition={cubePosition} jump={jump} />
      <Ground receiveShadow moveSpeed={moveSpeed} />
      
      <Wall
        position={[5, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        moveSpeed={moveSpeed}
        />
        </Physics>
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
