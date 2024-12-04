import Vector from "./Vector.js";
import SpatialGrid from "./SpatialGrid.js";
import {Point, CircleConstraint} from "./Point.js";
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight*0.9;
const ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

const substeps = 8;

const defaultRadius = 5;

const points = [];
const circleConstraints = [];



var addTimer = 0;
const addPeriod = 4;
const dt = 1/60;

var currentHue = 0;
const cellSize = 2 * defaultRadius;
const grid = new SpatialGrid(cellSize);

function init(){
    circleConstraints.push(new CircleConstraint(width/2,height/2,Math.min(width,height)*0.95*0.5))
    window.requestAnimationFrame(update);
}

function update(){
    canvas.width = window.innerWidth*0.9;
    canvas.height = window.innerHeight*0.9;
    const variance = 40
    if(addTimer == 0){
        points.push(new Point(width/2+(Math.random()*variance)-variance/2,height/2-100+(Math.random()*variance)-variance/2,defaultRadius, [currentHue,100,70]));
        currentHue = (currentHue + 2) % 360
        //console.log(points.length);
    }
    addTimer = (addTimer + 1) % addPeriod;

    ctx.clearRect(0,0,width,height);
    drawPoints();
    drawCircleConstraints();

    for (let i = 0; i < substeps; i++){
        grid.clear();
        for (let p of points) {
            grid.insert(p);
        }
        for(let p of points){
            p.applyGravity(2000);
            p.applyConstraints(circleConstraints);
            //.collide(points);
            p.collide(grid);
            p.move(dt/substeps);
        }
    }

    window.requestAnimationFrame(update);
}
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

function drawCircleConstraints(){
    ctx.fillStyle = "rgb(255 255 255 / 10%)";
    for (let c of circleConstraints){
        ctx.beginPath();
        ctx.arc(c.pos.x, c.pos.y, c.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}


canvas.addEventListener("click", function(e) {
    const rect = e.target.getBoundingClientRect();
    points.push(new Point(e.clientX - rect.left,e.clientY - rect.top,defaultRadius));


});

init();


