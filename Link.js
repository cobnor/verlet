import {Point, CircleConstraint} from "./Point.js";
export default class Link{
    constructor(p1,p2,length = -1,rigid = false){
        this.p1 = p1;
        this.p2 = p2;
        //if no length provided take length to be the initial distance between points
        if(length == -1){
            this.length = p1.pos.subtract(p2.pos).length();
        }
        else{
            this.length = length;
        }
        this.rigid = rigid
    }
    update(){
        if(this.p1.pos.subtract(this.p2.pos).length() < this.length && !this.rigid){
            return;
        }
        const mid = this.p1.pos.add(this.p2.pos).multiply(1/2); // midpoint of link
        const toMid = this.p1.pos.subtract(this.p2.pos).setLength(this.length / 2); //vector to midpoint

        if(!this.p1.locked){
            this.p1.pos = mid.add(toMid);
        }
        if(!this.p2.locked){
            this.p2.pos = mid.subtract(toMid);
        }

    }
}