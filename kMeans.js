const BOUND = 300;
const SPREAD = 2;
const ANCHORCOUNT = 3;

let anchors = [];
let data = [];


function isEqual(a, b)
{
    if (a instanceof Array && b instanceof Array)
    {
        if (a.length !== b.length) {
            return false;
        }
 
        for (var i = 0; i < a.length; i++)
        {
            if (!isEqual(a[i], b[i])) {
                return false;
            }
        }
 
        return true;
    }
 
    return a === b;
}


let createData = (count = 100, noise = false)=> {

    for(let i = 0;i < ANCHORCOUNT;i++) {
        let x = parseInt(Math.random()*BOUND);
        let y = parseInt(Math.random()*BOUND);
        anchors.push([x,y])
    }
    
    for(let i = 0;i<count;i++) {
        let x_Offset = parseInt(Math.random()*BOUND/SPREAD) - BOUND/SPREAD/2;
        let y_Offset = parseInt(Math.random()*BOUND/SPREAD) - BOUND/SPREAD/2;
        let target = parseInt(Math.random()*ANCHORCOUNT);
        data.push([x_Offset + anchors[target][0], y_Offset + anchors[target][1]]);
    }

    if(noise) {
        for(let i = 0;i < noise;i++) {
            let x = parseInt(Math.random()*BOUND);
            let y = parseInt(Math.random()*BOUND);
            data.push([x,y]);
        }
    }

}

let renderData = (canvasID)=> {
    let canvas = document.getElementById(canvasID);
    let ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    for(let i = 0;i<data.length;i++) {
        ctx.fillRect(data[i][0], data[i][1], 5, 5);
    }
    
    ctx.fillStyle = "red";
    for(let i = 0;i < anchors.length;i++) {
        ctx.fillRect(anchors[i][0], anchors[i][1], 7, 7)
    }
    
} 

/**
 * Calculates clusters and new centroids
 * @param {Number} k Anchorcount
 * @param {Array} centr Centroids
 * @returns {Object}
 */
let cluster = (k = ANCHORCOUNT, centr = false) => {
    /**
     * Calculates distanz between two 2d points
     * @param {Array} centr 
     * @param {Array} point 
     * @returns {Number}
     */
    function dist(centr, point) {
        let x = centr[0] - point[0];
        let y = centr[1] - point[1];

        return Math.sqrt(x**2 + y**2);
    }

    let centroids = [];
    let groups = []; //Cluster named groups to be able to acces own function

    /**
     * Copies or assigns random centroids
     */
    if(!centr) {
        for(let i = 0;i < k;i++) {
            let x = parseInt(Math.random()*BOUND);
            let y = parseInt(Math.random()*BOUND);
            centroids.push([x,y])
        }
    }else {
        centroids = centr;
    }

    let newCentroids = [];
    /**
     * Inits arrays
     */
    for(let i = 0;i < centroids.length;i++) {
        newCentroids.push([0,0]);
        groups.push([]);
    }

    //ASSIGN CLUSTER
    for(let i = 0;i < data.length;i++) {
        let smallestDist = Infinity;
        let currIndex = 0;
        for(let j = 0;j < centroids.length;j++) {
            let currDist = dist(centroids[j], data[i]);
            if(currDist < smallestDist) {
                smallestDist = currDist;
                currIndex = j;
            }
        }
        groups[currIndex].push(data[i]);
        //ADDING UP FOR MEAN
        newCentroids[currIndex][0] += data[i][0];
        newCentroids[currIndex][1] += data[i][1];
    }

    //FINAL CALCULATIONS FOR MEAN AKA NEW CENTROIDS
    for(let i = 0;i < newCentroids.length;i++) {
        newCentroids[i][0] /= groups[i].length;
        newCentroids[i][1] /= groups[i].length;
    }
        

    return {
        "cluster": groups,
        "centroids": centroids,
        "newCentroids": newCentroids
    }
}

let bestCluster = (k = ANCHORCOUNT) => {
    let lastCentroids;
    let newCentroids = false;
    let groups;
    let MAXDEPTH = 10000;//MAX RECURSION DEPTH (AGAINST FREESING)
    let depth = 0;
    while(true) {
        depth++;
        let erg = cluster(k,newCentroids);
        lastCentroids = erg.centroids;
        newCentroids = erg.newCentroids;
        //CHECKS IF CENTROIDS EQUAL OR MAXDEPTH HAS BEEN REACHED
        if(isEqual(lastCentroids,newCentroids) || depth > MAXDEPTH) {
            groups = erg.cluster;
            break;
        }
    }

    return {
        "cluster": groups,
        "centroids": newCentroids
    }
}


let renderSet = (canvasID, set, color, size = 5) => {
    let canvas = document.getElementById(canvasID);
    let ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    for(let i = 0;i<set.length;i++) {
        ctx.fillRect(set[i][0], set[i][1], size, size);
    }
}

export {
    createData,
    renderData,
    cluster,
    renderSet,
    bestCluster
}