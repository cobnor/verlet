import SpatialGrid from "./SpatialGrid.js";
import Vector from "./Vector.js";
class Point{
    constructor(x=0, y=0, radius = 1, colour = [255,255,255]){
        //remember - velocity calculated from Δpos
        this.pos = new Vector(x,y);
        this.prevPos = new Vector(x,y);

        this.acc = new Vector();

        this.radius = radius;
        this.colour = colour;
    }
    move(dt){ // time elapsed between frames taken as argument
        const vel = this.pos.subtract(this.prevPos);
        this.prevPos = new Vector(this.pos.x,this.pos.y); //copy pos byVal to prevPos

        this.pos = this.pos.add(vel.add(this.acc.multiply(dt*dt))); //verlet equation of motion p_n+1 = p_n + v + a*dt^2
        this.acc.x = 0;
        this.acc.y = 0; 
    }
    applyGravity(g=1000){
        this.acc.y += g;
    }
    applyConstraints(circleConstraints){
        for (let c of circleConstraints){
            let dist = this.pos.subtract(c.pos).length();
            if(dist > c.radius-this.radius){
                let distToEdge = dist - c.radius+this.radius;
                let toCentre = this.pos.subtract(c.pos).setLength(distToEdge);
                this.pos = this.pos.subtract(toCentre);
            }

        }
    }
    collide(grid) {
        const potentialCollisions = grid.query(this);
        for (let p of potentialCollisions) {
            if (p !== this) {
                const collisionAxis = this.pos.subtract(p.pos);
                const distSquared = collisionAxis.x * collisionAxis.x + collisionAxis.y * collisionAxis.y;

                if (distSquared < (this.radius + p.radius) * (this.radius + p.radius)) {
                    const dist = Math.sqrt(distSquared);
                    const n = collisionAxis.multiply(1 / dist); // Normalize collision axis
                    const delta = this.radius + p.radius - dist;

                    this.pos = this.pos.add(n.multiply(0.5 * delta));
                    p.pos = p.pos.subtract(n.multiply(0.5 * delta));
                }
            }
        }
    }

}
class CircleConstraint extends Point{}

export {Point,CircleConstraint}