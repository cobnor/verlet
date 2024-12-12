import Vector from "./Vector.js";
import RectConstraint from "./RectConstraint.js";
import SpatialGrid from "./SpatialGrid.js";
import {Point, CircleConstraint} from "./Point.js";
import Link from "./Link.js";
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth*0.9;
canvas.height = window.innerHeight*0.9;
const ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

const loadPresetBtn = document.getElementById("loadPresetBtn");
const resetBtn = document.getElementById("reset");
const addEmitterBtn = document.getElementById("addEmitterBtn");
const selectedPreset = document.getElementById("loadPreset");
const selectedBound = document.getElementById("boundType");
selectedPreset.value = "default";

const collideBox = document.getElementById("collision");
const boundBox = document.getElementById("bounds");
const sliceBox = document.getElementById("slice");

var substeps = 8;

var defaultRadius = 2;

var points = [];
var links = []; //note: links are rigid
var circleConstraints = [];
var rectConstraints = [];

var emitting = false;
var slicing = false;
var sliceStart = new Vector(0,0);
var sliceEnd = new Vector(0,0);


var addTimer = 0;
const addPeriod = 4;
const dt = 1/60;

var currentHue = 0;
var cellSize = 2 * defaultRadius;
var grid = new SpatialGrid(cellSize);


function init(){
    reset();
    collideBox.checked = true;
    boundBox.checked = true;
    sliceBox.checked = false;
    selectedBound.value = "circle";
    updateBounds();
    window.requestAnimationFrame(update);
}


function addRope(x,y,length,segmentSize){
    const startIndex = points.length;
    for (let i = 0; i<length; i++){
        points.push(new Point(x + i, y - i * segmentSize, defaultRadius));
        if(i!=0){
            links.push(new Link(points[i-1 + startIndex],points[i + startIndex]))
        }
    }
    points[0].locked = true
}
function addCloth(x,y,w,h,segmentSize){
    const startIndex = points.length;
    for (let i = 0; i < w; i++){
        for(let j = 0; j < h; j++){
            points.push(new Point(x + i * segmentSize, y + j * segmentSize, defaultRadius));
            if(j!=0){ // vertical links
                links.push(new Link(points[i * h + j-1 + startIndex],points[i * h + j + startIndex]))
            }
            if(i!=0){ // horizontal links
                links.push(new Link(points[(i-1) * h + j + startIndex],points[i * h + j + startIndex]))
            }
        }
    }
    /*for (let i = 0; i < w; i++){
        points[i*w].colour = [100,50,50];
    }
    for (let j = 0; j < h; j++){
        points[j].colour = [300,50,50];
    }*/
    points[startIndex].locked = true;
    points[h*(w-1)].locked = true;
    points[h*(Math.floor(w/4))].locked = true;
    points[h*(Math.floor(w/2))].locked = true;
    points[h*(Math.floor(3*w/4))].locked = true;

}



function update(){
    canvas.width = window.innerWidth*0.9;
    canvas.height = window.innerHeight*0.9;
    width = canvas.width;
    width = canvas.width;
    const variance = 40
    if(addTimer == 0 && emitting){
        points.push(new Point(width/2+(Math.random()*variance)-variance/2,height/2-100+(Math.random()*variance)-variance/2,defaultRadius, [currentHue,100,70]));
        currentHue = (currentHue + 2) % 360
    }
    addTimer = (addTimer + 1) % addPeriod;

    ctx.clearRect(0,0,width,height);
    drawConstraints();
    drawLinks();
    drawPoints();
    if(slicing){
        drawSlice();
    }
    for (let i = 0; i < substeps; i++){
        grid.clear();
        for (let p of points) {
            grid.insert(p);
        }
        for(let p of points){
            if(!p.locked){
                p.applyGravity(2000);
                p.applyConstraints(circleConstraints,rectConstraints);
                if(collideBox.checked){
                    p.collide(grid);
                }
                p.move(dt/substeps);
            }
            
        }
        for(let l of links){
            l.update();
        }
    }

    window.requestAnimationFrame(update);
}

//util function for line segment intersection
function ccw(A,B,C){
    return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x);
}

// returns true if line segments AB and CD intersect
function intersect(A,B,C,D){
    return ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D);
}
    
function applySlice(){
    for(let i = 0; i<links.length; i++){
        if(intersect(links[i].p1.pos, links[i].p2.pos, sliceStart, sliceEnd)){
            links.splice(i,1);
        }
    }
}

//should implement a way to make points just stroke not fill
function drawPoints(){
    //ctx.fillStyle = "rgb(255 255 255)";
    ctx.strokeStyle = "rgb(255 255 255)";
    ctx.lineWidth = 1;
    for (let p of points){
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "hsl(" + p.colour[0] +" "+ p.colour[1] +"% "+ p.colour[2] + "%)";
        //ctx.strokeStyle = "hsl(" + p.colour[0] +" "+ p.colour[1] +"% "+ p.colour[2] + "%)";

        ctx.fill();
        //ctx.stroke();
    }
}
function drawLinks(){
    ctx.strokeStyle = "rgb(255 255 255)";
    for(let l of links){
        ctx.beginPath();
        ctx.moveTo(l.p1.pos.x,l.p1.pos.y);
        ctx.lineTo(l.p2.pos.x,l.p2.pos.y);
        ctx.stroke();
    }
}
function drawConstraints(){
    ctx.fillStyle = "rgb(255 255 255 / 10%)";
    for (let c of circleConstraints){
        ctx.beginPath();
        ctx.arc(c.pos.x, c.pos.y, c.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    for(let c of rectConstraints){
        ctx.beginPath();
        ctx.rect(c.x,c.y,c.width,c.height);
        ctx.fill();
    }
}
function drawSlice(){
    ctx.strokeStyle = "rgb(255 132 132)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sliceStart.x,sliceStart.y);
    ctx.lineTo(sliceEnd.x,sliceEnd.y);
    ctx.stroke();
    ctx.lineWidth = 1;
}
function updateBounds(){
    rectConstraints = [];
    circleConstraints = [];
    switch (selectedBound.value){
        case "box":
            if (boundBox.checked){
                rectConstraints.push(new RectConstraint(10,10, width - 20, height - 20))
            }
            break;
        case "circle":
            if (boundBox.checked){
                circleConstraints.push(new CircleConstraint(width/2,height/2,Math.min(width,height)*0.95*0.5))
            }
            break;
    }
    
}
function reset(){
    substeps = 8;

    defaultRadius = 10;

    points = [];
    links = []; //note: links are rigid
    circleConstraints = [];
    rectConstraints = [];

    emitting = false;
    slicing = false;
    sliceStart = new Vector(0,0);
    sliceEnd = new Vector(0,0);

    currentHue = 0;
    cellSize = 2 * defaultRadius;
    grid = new SpatialGrid(cellSize);
    collideBox.checked = true;
    boundBox.checked = true;
    sliceBox.checked = false;
    selectedBound.value = "circle";
    updateBounds();
}
loadPresetBtn.onclick = function(){
    console.log(selectedPreset.value);
    switch(selectedPreset.value){
        case "default":
            reset();
            break;
        case "emptyBox":
            reset();
            collideBox.checked = true;
            boundBox.checked = true;
            sliceBox.checked = false;
            selectedBound.value = "circle";
            updateBounds();
            break;
        case "cloth":
            reset();
            defaultRadius = 2;
            collideBox.checked = false;
            boundBox.checked = false;
            sliceBox.checked = true;
            rectConstraints = [];
            circleConstraints = [];
            selectedBound.value = "box";
            addCloth(width/4,height/6,50,30,width/100);
            break;
        case "circleEmitter":
            reset();
            defaultRadius = 6;
            emitting = true;
            collideBox.checked = true;
            boundBox.checked = true;
            sliceBox.checked = false;
            selectedBound.value = "circle";
            updateBounds();
            break;
        case "rope":
            reset();
            defaultRadius = 4;
            emitting = false;
            collideBox.checked = true;
            boundBox.checked = true;
            sliceBox.checked = false;
            selectedBound.value = "circle";
            updateBounds();
            addRope(width/2, height/2-30,30,10);
            break;
    }

};
resetBtn.onclick = function(){reset()};
addEmitterBtn.onclick = function(){
    emitting = !emitting;

};
selectedBound.addEventListener("change", function(e){
    updateBounds();
});
canvas.addEventListener("click", function(e) {
    if(!sliceBox.checked){
        const rect = e.target.getBoundingClientRect();
        points.push(new Point(e.clientX - rect.left,e.clientY - rect.top,defaultRadius));
    }
});

//slicing
canvas.addEventListener("mousedown", function(e) {
    if(sliceBox.checked){
        const rect = e.target.getBoundingClientRect();

        sliceStart.x = e.clientX - rect.left;
        sliceStart.y = e.clientY - rect.top;
        slicing = true;
    }
});
canvas.addEventListener("mouseup", function(e) {
    if(sliceBox.checked){
        applySlice();
        sliceStart.x += 1;
        sliceStart.y += 1;
        applySlice();
        slicing = false;
    }
})
canvas.addEventListener("mousemove", function(e) {
    const rect = e.target.getBoundingClientRect();

    sliceEnd.x = e.clientX - rect.left;
    sliceEnd.y = e.clientY - rect.top;
});

boundBox.addEventListener("change", function(e) {
    updateBounds();
});
init();