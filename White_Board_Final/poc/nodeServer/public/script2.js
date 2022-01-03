// const { name } = require("ci-info");

const canvas = document.querySelector("canvas");
// const socket= io('http://localhost:8000');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
// const Name= prompt("Enter your name to join");
// socket.emit('new-user-joined',Name);

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




let comp=-1;
let check=0;
let allLayersUndo=[];
let allLayersRedo=[];
for(let i=0;i<5;i++){
  let undoStack=[];
  let redoStack=[];
  allLayersUndo.push(undoStack);
  allLayersRedo.push(redoStack);
}
let stickyPad= document.querySelector(".stickyPad");
stickyPad.style.display="none";
function fun(val){
  redraw();
  if(comp!=val||check==-1){
    return;
  }
  let isMouseDown = false;
  canvas.addEventListener("mousedown", function (e) {
  // console.log("Mouse down event is x: " + e.clientX + " , y: " + getCoordinates(e.clientY));
  tool.beginPath();
  let x=e.clientX,y=getCoordinates(e.clientY);
  tool.moveTo(x, y);
  isMouseDown = true;
  let pointDesc={
    x: x,
    y: y,
    desc: "md"
  }
  allLayersUndo[val].push(pointDesc);
})

// debouncing

canvas.addEventListener("mousemove", function (e) {
  if(comp!=val||check==-1){
    return;
  }
  // console.log("Mouse move event is x: " + e.clientX + " , y: " + getCoordinates(e.clientY));
  if (isMouseDown == true) {
    let x= e.clientX,y=getCoordinates(e.clientY);
    tool.lineTo(x,y);
    tool.stroke();
    let pointDesc={
      x: x,
      y: y,
      desc: "mm"
    }
    allLayersUndo[val].push(pointDesc);
  }
})

function getCoordinates(y){
  if(comp!=val||check==-1){
    return;
  }
  let bounds= canvas.getBoundingClientRect();
  return y-bounds.y;
}
canvas.addEventListener("mouseup", function (e) {
  isMouseDown=false;
})

let tools= document.querySelectorAll(".tool-image");
for(let i=0;i<tools.length;i++){

  tools[i].addEventListener("click",function(e){
    let cTool= e.currentTarget;
    let name= cTool.getAttribute("id");
    if(name=="pencil"){
      socket.emit("message","Pencil was selected");
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
  if(comp!=val||check==-1){
    return;
  }
  // clear board
  tool.clearRect(0,0,canvas.width,canvas.height);
  // pop last point
  // alert(undoStack1.length);
  while(allLayersUndo[val].length>0){
    let curObj=allLayersUndo[val][allLayersUndo[val].length-1];
    if(curObj.desc=="md"){
      allLayersRedo[val].push(allLayersUndo[val].pop());
      break;
    }    
    else if(curObj.desc=="mm"){
      allLayersRedo[val].push(allLayersUndo[val].pop());
    }
  }
  // redraw
  redraw();
}


// redo
function redomaker(){
  if(comp!=val||check==-1){
    return;
  }
  tool.clearRect(0,0,canvas.width,canvas.height);
  
  while(allLayersRedo[val].length>0){
    let curObj= allLayersRedo[val][allLayersRedo[val].length-1];
    if(curObj.desc=="md"){
      allLayersUndo[val].push(allLayersRedo[val].pop());
      break;
    }
    else if(curObj.desc=="mm"){
      allLayersUndo[val].push(allLayersRedo[val].pop());
    }
  }
  redraw();
}


function redraw(){
  if(comp!=val||check==-1){
    return;
  }
  tool.clearRect(0,0,canvas.width,canvas.height);
  // if(val!=0){
  //   for(let i=0;i<allLayersUndo[0].length;i++){
  //     let {x ,y ,desc}=allLayersUndo[0][i];
  //     if (desc == "md") {
  //       tool.beginPath();
  //       tool.moveTo(x, y);
  //     } else if (desc == "mm") {
  //       tool.lineTo(x, y);
  //       tool.stroke();
  //     }
  //   }
  // }
  for(let i=0;i<allLayersUndo[val].length;i++){
    let {x ,y ,desc}=allLayersUndo[val][i];
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
  if(comp!=val){
    return;
  }
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
}
function redraw(val){
  if(comp!=val){
    return;
  }
  tool.clearRect(0,0,canvas.width,canvas.height);
  if(val!=0){
    for(let i=0;i<allLayersUndo[0].length;i++){
      let {x ,y ,desc}=allLayersUndo[0][i];
      if (desc == "md") {
        tool.beginPath();
        tool.moveTo(x, y);
      } else if (desc == "mm") {
        tool.lineTo(x, y);
        tool.stroke();
      }
    }
  }
  for(let i=0;i<allLayersUndo[val].length;i++){
    let {x ,y ,desc}=allLayersUndo[val][i];
    if (desc == "md") {
      tool.beginPath();
      tool.moveTo(x, y);
    } else if (desc == "mm") {
      tool.lineTo(x, y);
      tool.stroke();
    }
  }
}



// layering

let layer1 = document.querySelector(".Layer1");
let layer2_1 = document.querySelector(".Layer2_1");
let layer2_2 = document.querySelector(".Layer2_2");
let layer3_1 = document.querySelector(".Layer3_1");
let layer3_2 = document.querySelector(".Layer3_2");
let layer4_1 = document.querySelector(".Layer4_1");
let layer4_2 = document.querySelector(".Layer4_2");
let layer5_1 = document.querySelector(".Layer5_1");
let layer5_2 = document.querySelector(".Layer5_2");
let Import1ToLayer2= document.querySelector(".Import1ToLayer2");
let Import1ToLayer3= document.querySelector(".Import1ToLayer3");
let Import1ToLayer4= document.querySelector(".Import1ToLayer4");
let Import1ToLayer5= document.querySelector(".Import1ToLayer5");
let Import2ToLayer1= document.querySelector(".Import2ToLayer1");
let Import3ToLayer1= document.querySelector(".Import3ToLayer1");
let Import4ToLayer1= document.querySelector(".Import4ToLayer1");
let Import5ToLayer1= document.querySelector(".Import5ToLayer1");

layer1.addEventListener("click",function(){
  comp=0;
  check=0;
  fun(0);
})
layer2_1.addEventListener("click",function(){
  comp=0;
  check=-1;
  redraw(0);
})
layer2_2.addEventListener("click",function(){
  comp=1;
  check=0;
  fun(1);
})
layer3_1.addEventListener("click",function(){
  comp=0;
  check=-1;
  redraw(0);
})
layer3_2.addEventListener("click",function(){
  comp=2;
  check=0;
  fun(2);
})
layer4_1.addEventListener("click",function(){
  comp=0;
  check=-1;
  redraw(0);
})
layer4_2.addEventListener("click",function(){
  comp=3;
  check=0;
  fun(3);
})
layer5_1.addEventListener("click",function(){
  comp=0;
  check=-1;
  redraw(0);
})
layer5_2.addEventListener("click",function(){
  comp=4;
  check=0;
  fun(4);
})





// import


function importLayer1toAny(val){
  for(let i=0;i<allLayersUndo[0].length;i++){
    let pointDesc=allLayersUndo[0][i];
    let pd={
      x: pointDesc.x,
      y: pointDesc.y,
      desc: pointDesc.desc
    }
    allLayersUndo[val].push(pd);
  }


  // while(allLayersUndo[0].length>0){
  //   let curObj=allLayersUndo[0][allLayersUndo[0].length-1];
  //   if(curObj.desc=="md"){
  //     allLayersUndo[0].pop();
  //     break;
  //   }    
  //   else if(curObj.desc=="mm"){
  //     allLayersUndo[0].pop();
  //   }
  // }
  //   for(let i=0;i<allLayersUndo[val].length;i++){
  //     let pointDesc=allLayersUndo[val][i];
  //     let pd={
  //       x: pointDesc.x,
  //       y: pointDesc.y,
  //       desc: pointDesc.desc
  //     }
  //     allLayersUndo[0].push(pd);
  // }


  // comp=0;
  // redraw(0);
}

function importLayerAnyto1(val){
  while(allLayersUndo[0].length>0){
    let curObj=allLayersUndo[0][allLayersUndo[0].length-1];
    if(curObj.desc=="md"){
      allLayersUndo[0].pop();
      break;
    }    
    else if(curObj.desc=="mm"){
      allLayersUndo[0].pop();
    }
  }
    for(let i=0;i<allLayersUndo[val].length;i++){
      let pointDesc=allLayersUndo[val][i];
      let pd={
        x: pointDesc.x,
        y: pointDesc.y,
        desc: pointDesc.desc
      }
      allLayersUndo[0].push(pd);
  }
}


Import1ToLayer2.addEventListener("click",function(){
  check=-1;
  importLayer1toAny(1);
})
Import1ToLayer3.addEventListener("click",function(){
  check=-1;
  importLayer1toAny(2);
})
Import1ToLayer4.addEventListener("click",function(){
  check=-1;
  importLayer1toAny(3);
})
Import1ToLayer5.addEventListener("click",function(){
  check=-1;
  importLayer1toAny(4);
})
Import2ToLayer1.addEventListener("click",function(){
  check=-1;
  importLayerAnyto1(1);
})
Import3ToLayer1.addEventListener("click",function(){
  check=-1;
  importLayerAnyto1(2);
})
Import4ToLayer1.addEventListener("click",function(){
  check=-1;
  importLayerAnyto1(3);
})
Import5ToLayer1.addEventListener("click",function(){
  check=-1;
  importLayerAnyto1(4);
})



socket.on("broadcast", function(data){
  alert(data);
})

socket.on("broadcast2", function(data){
  redraw(1);
})