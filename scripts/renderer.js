import * as CG from './transforms.js';
import { Matrix } from './matrix.js';

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    constructor(canvas, limit_fps_flag, fps) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.limit_fps = limit_fps_flag;
        this.fps = fps;
        this.start_time = null;
        this.prev_time = null;

        this.models = {
            slide0: [
                // example model (diamond) -> should be replaced with actual model
                {
                    // vertices: [
                    //     CG.Vector3(400, 150, 1),
                    //     CG.Vector3(500, 300, 1),
                    //     CG.Vector3(400, 450, 1),
                    //     CG.Vector3(300, 300, 1)
                    // ],

                    position: { x: canvas.width / 2, y: canvas.height / 2 }, // Initial position at the center of the canvas
                    velocity: { x: 300, y: 150 }, // Initial velocity

                    radius: 20,
                    color: [255, 0, 0, 255], // Red

                    // Initialize prev_time
                    prev_time: null,
                    transform: new Matrix(3, 3) // Initialize with an identity matrix
                }
            ],
            slide1: [],
            slide2: [],
            slide3: []
        };
    }

    // flag:  bool
    limitFps(flag) {
        this.limit_fps = flag;
    }

    // n:  int
    setFps(n) {
        this.fps = n;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
    }

    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;
        //console.log('animate(): t = ' + time.toFixed(1) + ', dt = ' + delta_time.toFixed(1));

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.drawSlide();

        // Invoke call for next frame in animation
        if (this.limit_fps) {
            setTimeout(() => {
                window.requestAnimationFrame((ts) => {
                    this.animate(ts);
                });
            }, Math.floor(1000.0 / this.fps));
        }
        else {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
    }

    //
    drawSlide() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0();
                break;
            case 1:
                this.drawSlide1();
                break;
            case 2:
                this.drawSlide2();
                break;
            case 3:
                this.drawSlide3();
                break;
        }
    }

    //
    drawSlide0() {
        const ball = this.models.slide0[0];

        // Function to update the position of the ball using transformation matrices
        const updateBallPosition = (deltaTime) => {
            // Get the current position vector
            let currentPosition = new CG.Vector3(ball.position.x, ball.position.y, 1);

            // Define the translation matrix based on velocity and time
            let translationMatrix = new Matrix(3, 3);
            CG.mat3x3Translate(translationMatrix, this.models.slide0[0].velocity.x * deltaTime, this.models.slide0[0].velocity.y * deltaTime);

            // Apply translation to the current position vector
            let newPosition = Matrix.multiply([translationMatrix, currentPosition]);

            // Update the position of the ball
            this.models.slide0[0].position.x = newPosition.values[0][0];
            this.models.slide0[0].position.y = newPosition.values[1][0];

            // Check for collisions with canvas edges and adjust position if necessary
            handleCanvasEdgesCollision();
        };

        // Function to handle collisions with canvas edges
        const handleCanvasEdgesCollision = () => {
            if (ball.position.x <= ball.radius || ball.position.x >= this.canvas.width - ball.radius) {
                ball.velocity.x *= -1;

            }
            if (ball.position.y <= ball.radius || ball.position.y >= this.canvas.height - ball.radius) {
                ball.velocity.y *= -1;

            }
        };

        // Function to draw the ball on the canvas
        const drawBall = () => {
            this.ctx.fillStyle = `rgba(${ball.color})`;
            this.ctx.beginPath();
            this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
        };

        // Function to animate the bouncing ball
        const animateBall = (timestamp) => {
            const deltaTime = (timestamp - this.models.slide0[0].prev_time) / 1000;

            // Update ball position using transformation matrices
            updateBallPosition(deltaTime);

            // Clear the canvas and draw the ball
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            drawBall();

            // Request next animation frame
            requestAnimationFrame(animateBall);

            // Update lastTimestamp
            this.models.slide0[0].prev_time = timestamp;
        };

        // Start the animation
        animateBall(this.models.slide0[0].prev_time);

        // Following lines are example of drawing a single polygon
        // (this should be removed/edited after you implement the slide)
        // let teal = [0, 128, 128, 255];
        // this.drawConvexPolygon(this.models.slide0[0].vertices, teal);
    }

    //
    drawSlide1() {
        // TODO: draw at least 3 polygons that spin about their own centers
        //   - have each polygon spin at a different speed / direction


    }

    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions


    }

    //
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)


    }

    // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
    // color:        array of int [R, G, B, A]
    drawConvexPolygon(vertex_list, color) {
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
        let x = vertex_list[0].values[0][0] / vertex_list[0].values[2][0];
        let y = vertex_list[0].values[1][0] / vertex_list[0].values[2][0];
        this.ctx.moveTo(x, y);
        for (let i = 1; i < vertex_list.length; i++) {
            x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
};

export { Renderer };