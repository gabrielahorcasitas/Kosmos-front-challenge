import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [images, setImages] = useState([]);

  //Fetch images from API, save in array url of each image, and store in images state;
  //secondary effect a.k.a. fetch function will occur when the component mounts (see array of dependencies);
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/photos")
      //take the response stream and parsing the body text as JSON.
      .then((response) => {
        return response.json();
      })
      //store url of each image in array
      .then((data) => {
        const imagesArr = data.map((image) => {
          return image.url;
        });
        //update state with array of url
        setImages(imagesArr);
      });
  }, []);


  //Function that creates the new moveable component tobe executed onClick of button
  const addMoveable = () => {
    //add new moveable compontent with new image to the array of moveable components
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: images[Math.floor(Math.random() * images.length)],
        updateEnd: true
      },
    ]);
  };

  //update state of moveableComponents with all the moveable components
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  //identify div parent element of moveables
  let parent = document.getElementById("parent");
  //stablish parent bounds
  let parentBounds = parent?.getBoundingClientRect();


  //Handle rezise of moveable -> update height and width values of moveable  while resizing & secure the moveable 
  //doesn't go beyond parent bounds
  const onResize = async (e) => {
    // update width and heigth when executing resize of the moveable
    let newWidth = e.width;
    let newHeight = e.height;

    let positionMaxTop = top + newHeight;
    let positionMaxLeft = left + newWidth;

    //conditions for resizing if moveable tries to go beyond parent bounds
    if (top === 0 && top + newHeight > 0) {
      positionMaxTop = 0;
      newHeight = height;
      top = 0;
    } else {
      positionMaxTop = top + newHeight;
    }

    if (left === 0 && left + newWidth > 0) {
      positionMaxLeft = 0;
      newWidth = height;
      left = 0;
    } else {
      positionMaxLeft = left + newWidth;
    }

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // Update 'nodo de referencia'
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

   //Handle rezise of moveable -> update height and width values of moveable once resize is finished & secure the moveable 
  //doesn't go beyond parent bounds
  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    let positionMaxTop = top + newHeight;
    let positionMaxLeft = left + newWidth;

    //conditions for resizing if moveable tries to go beyond parent bounds
    if (top === 0 && top + newHeight > 0) {
      positionMaxTop = 0;
      newHeight = height;
      top = 0;
    } else {
      positionMaxTop = top + newHeight;
    }

    if (left === 0 && left + newWidth > 0) {
      positionMaxLeft = 0;
      newWidth = height;
      left = 0;
    } else {
      positionMaxLeft = left + newWidth;
    }

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
