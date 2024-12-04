export default class Vector{
    constructor(x=0,y=0){ //default to zero vector
        this.x = x;
        this.y = y;
    }
    add(v){
        return new Vector(this.x + v.x, this.y + v.y);
    }
    subtract(v){
        return new Vector(this.x - v.x, this.y - v.y);
    }
    multiply(c){ // scalar multiplication
        return new Vector(this.x * c, this.y * c);
    }
    dot(v){
        return this.x * v.x + this.y * v.y;
    }
    length(){
        return (this.x*this.x + this.y*this.y) ** 0.5;
    }
    setLength(l){
        return this.multiply(l/this.length());
    }
    normalise(){
        return this.setLength(1);
    }
    toString(){
        return "[" + this.x + ", " + this.y + "]";
    }
}