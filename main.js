const prompt = require('prompt-sync')({ sigint: true });

const guaranteeSolvable = true; // assure the hat can be reached from the start position
const debug = false;
const hat = '^';
const hole = 'O';
const fieldChr = '░';
const pathChr = '*';

/* Get a pair of coordinates Y, X in an area by size  height by width
 */
function getRandomCoordinates(height, width) {
    const total = width * height;
    const holePoint = Math.floor(Math.random() * total);
    //console.log('holePoint = ' + holePoint);
    const holeY = Math.floor(holePoint / width);
    //console.log('Y = ' + holeY);
    const holeX = holePoint % width;
    //console.log('X = ' + holeX);
    return [holeY, holeX];
}

/* @points is an array of point objects with {row, col}
 */
function getRandomPoint(points) {
    const index = Math.floor(Math.random() * points.length);
    return [points[index].row, points[index].col, index];
}

function getRegion(matrix, row, col, regionMark) {
    //let region = [];
    if (row < 0 || col < 0 || row >= matrix.length || col >= matrix[row].length) {
        return []; // build the array
    }

    if (matrix[row][col] !== fieldChr) {
        return []; // build the array
    }

    matrix[row][col] = regionMark; // avoid loops
    let region = [{row, col}]; // add to the region
    
    region = getRegion(matrix, row - 1, col, regionMark).concat(region);
    region = getRegion(matrix, row + 1, col, regionMark).concat(region);
    region = getRegion(matrix, row, col - 1, regionMark).concat(region);
    region = getRegion(matrix, row, col + 1, regionMark).concat(region);

    return region;
}

/*
 * Returns an array of all allowed points for hat and star for a solvable game
 */
function getSolvable(matrix) {
    if (debug) {
        console.log(matrix);
    }
    let solvable = JSON.parse(JSON.stringify(matrix)); // remove all unreachable cells from it
    const height = matrix.length;
    const width = matrix[0].length;

    let regions = [];
    let allowed = [];
    let regionMark = 0;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            regionMark += 1;
            if (matrix[row] [col] === fieldChr) {
                let region = getRegion(matrix, row, col, regionMark);
                regions.push(region);  // for debug
                if (allowed.length < region.length) {
                    allowed = JSON.parse(JSON.stringify(region));
                }
            }
        }
    }
    if (debug) {
        console.log('matrix: ');
        console.log(matrix);
        console.log('regions: ');
        console.log(regions);
        console.log('allowed: ');
        console.log(allowed);
    }
    return allowed; 
}

class Field {
    constructor(field) {
        this.field = field;
        this.width = field[0].length;
        this.height = field.length;
        this.currX = 0; // set the defaults in case they are not set
        this.currY = 0;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (field[i][j] === pathChr) {
                    this.currX = j;
                    this.currY = i;
                }
            }
        }
        if (! guaranteeSolvable) {
            if (this.currX === 0 && this.currY === 0) { // default in case no path was set
                field[this.currY][this.currX] = pathChr;
            }
        }
    }

    print() {
        this.field.forEach(element => {
            console.log(element.join(''));
        });
    }

    updatePath(direction) {
        console.log(this.currX + " : " + this.currY);
        if (direction === 'u') {
            if (this.currY - 1 < 0) {
                console.log('Upper bound reached. Try again.');
            } else {
                this.currY--;
            }
        } else if (direction === 'd') {
            if (this.currY >= this.height - 1) {
                console.log('Lower bound reached. Try again.');
            } else {
                this.currY++;
            }
        } else if (direction === 'l') {
            if (this.currX - 1 < 0) {
                console.log('Left bound reached. Try again.');
            } else {
                this.currX--;
            }
        } else if (direction === 'r') {
            if (this.currX >= this.width - 1) {
                console.log('Right bound reached. Try again.')
            } else {
                this.currX++;
            }
        }
        //console.log(this.currX + " : " + this.currY);

        const current = this.field[this.currY][this.currX];
        if (current === hole) {
            return 'hole'; // Fell into a hole
        } else if (current === hat) {
            return 'hat';  // Won
        } else { // Extend the path
            this.field[this.currY][this.currX] = pathChr;
            return 'path';
        }
    }

    play() {
        let endGame = false;

        while (!endGame) {
            this.print();
            let direction = prompt('Which way? ');

            if (direction === 'u' || direction === 'd' || direction === 'l' || direction === 'r') {
                const result = this.updatePath(direction);
                if (result === 'hat') {
                    console.log('You WON!');
                    endGame = true;
                } else if (result === 'hole') {
                    console.log('Sorry, you fell into a HOLE! You LOST.');
                    endGame = true;
                } else {
                    // all good we play
                }
            } // else ignore
        }
    }

    // height and width should be over 3
    static generateField(height, width, percentage) {
        let result = [];
        for (let i = 0; i < height; i++) {
            result.push(new Array(width).fill(fieldChr));
        }
        const total = width * height;
        const numHoles = Math.floor(total * percentage);
        //console.log('numHoles = ' + numHoles);
        for (let j = 0; j < numHoles; j++) {
            const [holeY, holeX] = getRandomCoordinates(height, width); // allow collisions
            result[holeY][holeX] = hole;
        }

        if (guaranteeSolvable) {
            let matrix = JSON.parse(JSON.stringify(result)); // deep copy of the array in one line
            let allowed = getSolvable(matrix);

            // TODO: might not find enough allowed points
            // Put the hat onto one half of the region
            const middle = Math.floor(allowed.length/2);
            const allowedHat = allowed.slice(0, middle);
            const [hatY, hatX, hatIndex] = getRandomPoint(allowedHat);
            if (debug) {
                console.log('hatY ' + hatY + ' hatX ' + hatX);
            }
            result[hatY][hatX] = hat;

            allowed.splice(hatIndex, 1); // hat cell is not allowed to put the star

            // Put the path on the other half of the region
            const allowedPath = allowed.slice(middle);
            const [pathY, pathX, pathIndex] = getRandomPoint(allowedPath);
            if (debug) {
                console.log('pathY ' + pathY + ' pathX ' + pathX);
            }
            result[pathY][pathX] = pathChr; 


        } else {
            const [hatY, hatX] = getRandomCoordinates(height, width); // hat can replace a hole
            result[hatY][hatX] = hat;

            let startPositionFound = false; // pathChr should be put at a different point than the hat
            let [pathY, pathX] = [0, 0];
            while (!startPositionFound) {
                [pathY, pathX] = getRandomCoordinates(height, width); // start can replace a hole
                if (pathY !== hatY && pathX !== hatX) { // let them be in different columns and rows
                    startPositionFound = true;
                }
            }
            result[pathY][pathX] = pathChr;
        }
        return result;
    }
}

const myField = new Field(Field.generateField(10, 10, 0.4));

myField.print();
console.log();

// TEST THE GAME
//myField.play();

/* TEST FIELD
const myField = new Field([
    [pathChr, fieldChr, hole],
    [fieldChr, hole, fieldChr],
    [fieldChr, hat, fieldChr]
  ]);
*/

