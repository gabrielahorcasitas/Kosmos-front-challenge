// React imports
import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

//Style sheets
import './styles.css';

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  //Add state for images
  const [images, setImages] = useState([]);

  //with use effect the fetching will be done once the component is mounted (check the array of dependencies)
  useEffect(() => {
    //Save all url images in images state
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => {
        //parse response stream to JSON
        return response.json();
      })
      .then((data) => {
        //access url property:value pair in the data of the api
        const imagesArr = data.map((image) => {
          return image.url;
        });
        //update state of images with array 
        setImages(imagesArr);
      });
  }, []);

  //Create a new moveable component when onclick on button
  const addMoveable = () => {
    //add moveable object with image as background to the array of moveableComponents
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: images[Math.floor(Math.random() * images.length)],
        updateEnd: true,
      },
    ]);
  };

  // Update array of moveable components with new moveables (with updateEnd on false)
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  //Handle the start rezising point of the moveable
  const handleResizeStart = (index, e) => {
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
    <main id='main-container'style={{ height: "100vh", width: "100vw" }}>
      <button className='button' onClick={addMoveable}>Add moveable</button>
      <div
        id="parent"
        style={{
          position: "relative",
          height: "80vh",
          width: "85vw",
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
            moveableComponents={moveableComponents}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

//Moveable component
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

  //Store a mutable value of nodes and not cause a re-render of the app each time they change
  const ref = useRef();

  //Create state for reference node
  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  //Identify parent div and its boundaries
  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  //Add an on drag handler for the component while being dragged 
  const onDrag = async (e) => {
    let top = e.top;
    let left = e.left;

    //If the drag of the element goes beyond the edge of the parent div, the component will be position at the 
    //heigth edge of the div
    if (parentBounds?.height - top < e.height) {
      top = parentBounds?.height - e.height;
    }
    if (top < 0) {
      top = 0;
    }

    //If the drag of the element goes beyond the edge of the parent div, the component will be position at the 
    //width edge of the div
    if (parentBounds?.width - left < e.width) {
      left = parentBounds?.widt - e.width;
    }
    if (left < 0) {
      left = 0;
    }

    //Update values of the moveable component that was dragged
    updateMoveable(id, {
      top: top,
      left: left,
      width,
      height,
      color,
    });
  };

  const onResize = async (e) => {
    // Update width and height on resize
    let newWidth = e.width;
    let newHeight = e.height;

    // Make positionMaxTop and positionMaxLeft adaptable variables for being capable of update its values on resizing
    let positionMaxTop;
    let positionMaxLeft;

    //The next section should be replicated for the onResizeEnd function, which manages the component properties once resized.
    //For reasons of time I only indicate it as a comment.

    //If the component while been resized goes beyond the height edge of the parent div, 
    //the positionMaxTop value and the top value goes to zero, meaning the edge of the parent div.
    //Also the heigth is updated with the new height value;
    if(top == 0 && top + newHeight > 0){
      positionMaxTop = 0;
      top = 0;
      newHeight = height;
    }

    //Same procedure for the width edges
    if(left == 0 && left + newWidth > 0){
      positionMaxLeft = 0;
      left = 0;
      newWidth = width;
    }


    if (parentBounds?.height - positionMaxTop < 100) {
      positionMaxTop = parentBounds?.height - newHeight;
      newHeight = height;
    }
    if (parentBounds?.width - positionMaxLeft < 100) {
      positionMaxLeft = parentBounds?.widt - newWidth;
      newWidth = width;
    }

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
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

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;
    
    let positionMaxTop;
    let positionMaxLeft;

    if (parentBounds?.height - positionMaxTop < 100) {
      positionMaxTop = parentBounds?.height - newHeight;
      newHeight = height;
    }
    if (parentBounds?.width - positionMaxLeft < 100) {
      positionMaxLeft = parentBounds?.widt - newWidth;
      newWidth = width;
    }

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
        backgroundImage: `url(${color})`,
        objectFit: "contain",
      }}
      onClick={() => setSelected(id)}
    />

    <Moveable
      target={isSelected && ref.current}
      resizable
      draggable
      onDrag={onDrag}
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