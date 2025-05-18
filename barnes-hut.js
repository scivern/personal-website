class Point {
    constructor(x, y, vx, vy, mass) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;

        this.mass = mass;
    }
}

class Rectangle {

    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point) {
        return (point.x >= this.x - this.w &&
            point.x < this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y < this.y + this.h)
    }
}

class Quadtree {

    constructor(boundary) {
        this.boundary = boundary;
        this.points = [];
        this.divided = false;

        this.com = {"x": null, "y": null};
        this.mass = null;
    }

    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;

        let ne = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
        this.northeast = new Quadtree(ne);

        let nw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
        this.northwest = new Quadtree(nw);

        let se = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
        this.southeast = new Quadtree(se);

        let sw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
        this.southwest = new Quadtree(sw);

        this.divided = true;
    }

    insert(point, rearrangePoints=false) {
        if (!this.boundary.contains(point)) { return false }

        if (!rearrangePoints) {
            this.calculateCOM(point)
            // this.mass++;
            this.mass += point.mass;
        }

        if (this.points.length < 1) {
            this.points.push(point);
            return true;
        }
        
        if (!this.divided) {
            this.subdivide();
            this.pushIntoChildren();
        }

        if (this.northwest.insert(point)) { return true };
        if (this.northeast.insert(point)) { return true };
        if (this.southwest.insert(point)) { return true };
        if (this.southeast.insert(point)) { return true };
    }

    pushIntoChildren() {
        for (const point of this.points) {
            this.insert(point, true);
        }
    }

    flush() {
        if (this.divided) {
            this.points = [];
            this.northwest.flush();
            this.northeast.flush();
            this.southwest.flush();
            this.southeast.flush();
        }
    }

    calculateCOM(point, a) {
        // console.log(point);
        // this.com.x = (this.mass * this.com.x + 1 * point.x) / (this.mass + 1);
        // this.com.y = (this.mass * this.com.y + 1 * point.y) / (this.mass + 1);
        this.com.x = (this.mass * this.com.x + point.mass * point.x) / (this.mass + point.mass);
        this.com.y = (this.mass * this.com.y + point.mass * point.y) / (this.mass + point.mass);
    }

    calculateDistance(point) {
        return Math.sqrt((point.x - this.boundary.x)**2 + (point.y - this.boundary.y)**2);
    }

    query(point, F) {
        if ((point.x == this.com.x && point.y == this.com.y) || this.mass == null) {
            return;
        }

        if (this.divided == false) {
            // calculate force as single body
            this.force(point, F);
            return;
        }

        const ratio = this.boundary.w * 2 / this.calculateDistance(point)
        if (ratio < threshold) {
            // calculate force using COM
            this.force(point, F);
            return;
        }

        this.northwest.query(point, F);
        this.northeast.query(point, F);
        this.southwest.query(point, F);
        this.southeast.query(point, F);
    }

    force(point, F) {
        // F = G * m1 * m2 / r**2
        // F_x = G * m1 * m2 * (x' - x) / r**3
        // G, m1 = 1
        const distance = Math.sqrt((point.x - this.com.x) ** 2 + (point.y - this.com.y) ** 2 + softening **2);
        F[0] += forceScaling * this.mass * (this.com.x - point.x) / distance ** 3;
        F[1] += forceScaling * this.mass * (this.com.y - point.y) / distance ** 3;

        return F;
    }
}


function initialVelocityCircular(point, center, velMag) {
    x = point[0];
    y = point[1];

    if (x == center[0] && y == center[1]) {return [0, 0]}

    dx = center[0] - x;
    dy = center[1] - y;
    r = Math.sqrt(dx**2 + dy**2)
    angle = Math.atan2(dy, dx);
    
    massWithin = 0
    for (other of prePoints) {

        if (other != point && r > Math.sqrt((center[0] - other[0]) ** 2 + (center[1] - other[1]) ** 2)) {
            // massWithin ++;
            massWithin += other[2];
        }
    }

    vx = Math.sin(angle) * (velMag * massWithin / r) ** 0.5 
    vy = -Math.cos(angle) * (velMag * massWithin / r) ** 0.5

    return [vx, vy]
} 


function initializeParticles(center, largeMass) {

    points = [];

    // Large central mass
    // points.push(new Point(center[0], center[1], 0, 0, largeMass));

    // Standard Normal dist using Box-Muller transform
    function gaussianRandom(mean = 0, stdev = 1) {
        const u = 1 - Math.random(); // Converting [0,1) to (0,1]
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        // Transform to the desired mean and standard deviation:
        return z * stdev + mean;
    }

    prePoints = []

    prePoints.push([center[0], center[1], largeMass])

    for (let i = 0; i < num; i++) {
        // prePoints.push([Math.random(), Math.random()])
        prePoints.push([gaussianRandom(center[0], 0.1), gaussianRandom(center[1], 0.1), 1])
    }

    // let a = []
    for (point of prePoints) {
        vels = initialVelocityCircular(point = point, center, velMag)
        // console.log(point[0]);
        // console.log(vels);
        points.push(new Point(point[0], point[1], vels[0], vels[1], point[2]))
        // console.log(points);
        // a.push(vels[0])
    }
    console.log(points);
    return points;
}


function draw_bounds(qt) {
    const bounds = qt.boundary;
    ctx.strokeStyle = 'green';
    ctx.strokeRect((bounds.x - bounds.w) * canvasScale, (bounds.y - bounds.h) * canvasScale, 2 * bounds.w * canvasScale, 2 * bounds.h * canvasScale)

    if (qt.divided) {
        draw_bounds(qt.northeast);
        draw_bounds(qt.northwest);
        draw_bounds(qt.southeast);
        draw_bounds(qt.southwest);
    }
}


function animate() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boundary = new Rectangle(center[0], center[1], qtWidth, qtHeight);
    quadtree = new Quadtree(boundary, 1);

    // Central mass
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc((points[0].x) * canvasScale - pointSize / 2, points[0].y * canvasScale - pointSize / 2, centralPointSize, 0, 2 * Math.PI);
    ctx.fill();
    quadtree.insert(points[0]);

    // Particles
    for (let point of points.slice(1)) {
        ctx.fillStyle = 'red';
        ctx.fillRect((point.x) * canvasScale - pointSize / 2, point.y * canvasScale - pointSize / 2, pointSize, pointSize);

        quadtree.insert(point);
    }

    for (let point of points) {

        const distance = Math.sqrt((0.5 - point.x) ** 2 + (0.5 - point.y) ** 2 + softening ** 2)
        let F = [null, null];
        // let F = [forceScaling * 10 * (0.5 - point.x) / (distance) ** 3, forceScaling * 10 * (0.5 - point.y) / (distance) ** 3];

        quadtree.query(point, F);

        point.vx += F[0] * dt
        point.vy += F[1] * dt

        point.x += point.vx * dt
        point.y += point.vy * dt

        // point.x += point.vx * dt + 0.5 * F[0] * dt ** 2;
        // point.y += point.vy * dt + 0.5 * F[1] * dt ** 2;

        // point.vx += F[0] * dt;
        // point.vy += F[1] * dt;
    }

    if (drawBounds) {draw_bounds(quadtree)};
    requestAnimationFrame(animate);
}


let checkBox = document.getElementById('toggleTreeCheckBox');
checkBox.addEventListener("change", (event) => {
    checkBox.checked ? drawBounds = true : drawBounds = false
})

const nSliderValue = document.querySelector("#nSliderValue");
const nSlider = document.querySelector("#nSlider");
nSliderValue.textContent = nSlider.value;
nSlider.addEventListener("input", (event) => {
    nSliderValue.textContent = event.target.value;
    num = parseFloat(nSliderValue.textContent);
});

const dtSliderValue = document.querySelector("#dtSliderValue");
const dtSlider = document.querySelector("#dtSlider");
dtSliderValue.textContent = dtSlider.value;
dtSlider.addEventListener("input", (event) => {
    dtSliderValue.textContent = event.target.value;
    dt = parseFloat(dtSliderValue.textContent);
});

const centralMassSliderValue = document.querySelector("#centralMassSliderValue");
const centralMassSlider = document.querySelector("#centralMassSlider");
centralMassSliderValue.textContent = centralMassSlider.value;
centralMassSlider.addEventListener("input", (event) => {
    centralMassSliderValue.textContent = event.target.value;
    points[0].mass = parseFloat(centralMassSliderValue.textContent);
});

const forceScaleSliderValue = document.querySelector("#forceScaleSliderValue");
const forceScaleSlider = document.querySelector("#forceScaleSlider");
forceScaleSliderValue.textContent = forceScaleSlider.value;
forceScaleSlider.addEventListener("input", (event) => {
    forceScaleSliderValue.textContent = event.target.value;
    forceScaling = parseFloat(forceScaleSliderValue.textContent);
    console.log(forceScaling);
});



let canvasScale = 800;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const width = 1 * canvasScale;
const height = 1 * canvasScale;
canvas.width = 2 * width;
canvas.height = 2 * height;
canvas.style.width = "800px";
canvas.style.height = "800px";
const dpi = window.devicePixelRatio;
ctx.translate(0, canvas.height);
canvas.getContext('2d').scale(dpi, -dpi);


let threshold = 0.5;
let softening = 0.05//0.01;
let dt = 0.005;
let forceScaling = 1e-5;
let velMag = 0.000005
let pointSize = 2;
let centralPointSize = 10;

let largeMass = 10000;

let num = 5000;

let center = [0.5, 0.5]
let qtWidth = 0.5;
let qtHeight = 0.5;

let drawBounds = false;

points = initializeParticles(center, largeMass);

animate();

console.log(quadtree);