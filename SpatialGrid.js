export default class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map(); // To store points in grid cells
    }

    // Hash function to compute grid cell index
    _hash(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);  
        return `${col},${row}`; // Use a string as the key
    }

    // Add a point to the grid
    insert(point) {
        const cellIndex = this._hash(point.pos.x, point.pos.y);
        //console.log(cellIndex);
        if (!this.grid.has(cellIndex)) {
            this.grid.set(cellIndex, []);
        }
        this.grid.get(cellIndex).push(point);
    }

    // Get points in neighbouring cells
    query(point) {
        const x = point.pos.x;
        const y = point.pos.y;
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);

        const neighbours = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const neighbourCell = this._hash((cellX + dx)*this.cellSize, (cellY + dy)*this.cellSize);
                if (this.grid.has(neighbourCell)) {
                    neighbours.push(...this.grid.get(neighbourCell));
                }
            }
        }
        return neighbours;
    }

    // Clear the grid for reuse each frame
    clear() {
        this.grid.clear();
    }
}
