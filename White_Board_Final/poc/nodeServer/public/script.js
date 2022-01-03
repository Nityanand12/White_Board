const canvas = document.querySelector("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;



// tool hai jisse aap 2d me draw kr skte ho


// The CanvasRenderingContext2D interface, part of the Canvas API, provides the 2D rendering context for the drawing surface of a <canvas> element. It is used for drawing shapes, text, images, and other objects.

// saara kaam tool hi karega
const tool = canvas.getContext("2d");


// rectangle
// by default black color hota h
// tool.fillRect(0, 0, canvas.width, canvas.height);
// tool.fillStyle = "Blue";
// tool.strokeStyle = "Red";
// tool.lineWidth = 10;
// tool.strokeRect(10, 10, canvas.width / 2, canvas.height / 2);
// tool.fillRect(10, 10, canvas.width / 2, canvas.height / 2);

// for line draw

// tool.beginPath();
// tool.moveTo(canvas.width / 2, canvas.height / 2);
// tool.lineTo(canvas.width / 2 + 100, canvas.height / 2 + 100);
// tool.lineTo(canvas.width / 2 + 200, canvas.height / 2 + 100);
// tool.lineTo(canvas.width / 2 + 200, canvas.height / 2 + 200);
// tool.closePath();
// tool.strokeStyle = "Green";
// tool.stroke();






let undoStack=[];
let redoStack=[];
let isMouseDown = false;

canvas.addEventListener("mousedown", function (e) {
  console.log("Mouse down event is x: " + e.clientX + " , y: " + getCoordinates(e.clientY));
  tool.beginPath();
  let x=e.clientX,y=getCoordinates(e.clientY);
  tool.moveTo(x, y);
  isMouseDown = true;
  let pointDesc={
    x: x,
    y: y,
    desc: "md"
  }
  undoStack.push(pointDesc);
})

// debouncing

canvas.addEventListener("mousemove", function (e) {
  console.log("Mouse move event is x: " + e.clientX + " , y: " + getCoordinates(e.clientY));
  if (isMouseDown == true) {
    let x= e.clientX,y=getCoordinates(e.clientY);
    tool.lineTo(x,y);
    tool.stroke();
    let pointDesc={
      x: x,
      y: y,
      desc: "mm"
    }
    undoStack.push(pointDesc);
  }
})

function getCoordinates(y){
  let bounds= canvas.getBoundingClientRect();
  return y-bounds.y;
}
canvas.addEventListener("mouseup", function (e) {
  isMouseDown=false;
})
let tools= document.querySelectorAll(".tool-image");
let stickyPad= document.querySelector(".stickyPad");
stickyPad.style.display="none";
for(let i=0;i<tools.length;i++){

  tools[i].addEventListener("click",function(e){
    let cTool= e.currentTarget;
    let name= cTool.getAttribute("id");
    if(name=="pencil"){
      tool.strokeStyle="black";
    }
    else if(name=="eraser"){
      tool.strokeStyle="white";
    }
    else if(name=="sticky"){
      if(stickyPad.style.display=="none"){
        stickyPad.style.display="block";
      }
      else{
        stickyPad.style.display="none";
      }
    }
    else if(name=="undo"){
      undomaker();
    }
    else if(name=="redo"){
      redomaker();
    }
    else if(name=="download"){
      downloadBoard();
    }
  })
}


let initialX=null;
let initialY=null;
let isStickyDown=false;
let isMinimised=true;
let navBar = document.querySelector(".nav-bar");

let close= document.querySelector(".close");
let minimize= document.querySelector(".minimize");
let textArea= document.querySelector(".text-area");

// sticky code
navBar.addEventListener("mousedown",function(e){
  initialX= e.clientX;
  initialY= e.clientY;
  isStickyDown=true;
});

canvas.addEventListener("mousemove",function(e){
  if(isStickyDown==true){
    // final point
    let finalX=e.clientX;
    let finalY=e.clientY; 
    // distance
    let dx=finalX-initialX;
    let dy= finalY-initialY;
    // move sticky
    let { top, left }= stickyPad.getBoundingClientRect();
    stickyPad.style.top=top+dy+"px";
    stickyPad.style.left=left+dx+"px";
    initialX=finalX;
    initialY=finalY;
  }
}); 
window.addEventListener("mouseup",function(){
  isStickyDown=false;
});


minimize.addEventListener("click",function(){
  if(isMinimised){
    textArea.style.display="none";
  }
  else{
    textArea.style.display="block";
  }
  isMinimised=!isMinimised;
})

close.addEventListener("click",function(){
  stickyPad.style.display="none";
})






// undo
const undo= document.querySelector("#undo");

function undomaker(){
  // clear board
  tool.clearRect(0,0,canvas.width,canvas.height);
  // pop last point
  // alert(undoStack.length);
  while(undoStack.length>0){
    let curObj=undoStack[undoStack.length-1];
    if(curObj.desc=="md"){
      redoStack.push(undoStack.pop());
      break;
    }    
    else if(curObj.desc=="mm"){
      redoStack.push(undoStack.pop());
    }
  }
  // redraw
  redraw();
}


// redo
function redomaker(){
  tool.clearRect(0,0,canvas.width,canvas.height);
  
  while(redoStack.length>0){
    let curObj= redoStack[redoStack.length-1];
    if(curObj.desc=="md"){
      undoStack.push(redoStack.pop());
      break;
    }
    else if(curObj.desc=="mm"){
      undoStack.push(redoStack.pop());
    }
  }
  redraw();
}


function redraw(){
  for(let i=0;i<undoStack.length;i++){
    let {x ,y ,desc}=undoStack[i];
    if (desc == "md") {
      tool.beginPath();
      tool.moveTo(x, y);
    } else if (desc == "mm") {
      tool.lineTo(x, y);
      tool.stroke();
    }
  }
}



// upload download image
let imgInput= document.querySelector("#accepting");
function uploadFile(){
  // dialog box
  imgInput.click();
  imgInput.addEventListener("change",function(){
    let imgObj= imgInput.files[0];
    // console.log(imgObj);
    // img => link
    let imgLink= URL.createObjectURL("img");
    let textBox= createBox();
    let img= document.createElement("img");
    img.setAttribute("class","upload-img");
    img.src= imgLink;
    textBox.appenChild(img);
  })
}

function downloadBoard(){
  // create and anchor
  // e.preventDefalut();
  let a= document.createElement("a");
  // set file name to tis download attribute
  a.download="file.png";
  // convert board to URL
  let url= canvas.toDataURL("image/png;base64");
  // set as href anchor
  a.href= url;
  // click the anchor
  a.click();
  // reload behavour does not get triggered
  a.remove();
}