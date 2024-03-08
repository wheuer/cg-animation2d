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
                // Ball
                {
                    position: { x: canvas.width / 2, y: canvas.height / 2 }, // Position of center of ball, start with ball centered on window
                    velocity: { x: 0.5, y: 0.5}, // Start with ball moving towards the top right
                    radius: 20,
                    color: [255, 0, 0, 255], // Red
                }
            ],
            slide1: [
                // Spin is negative for clock-wise and positive for counter-clock wise
                // Polygon 1
                {
                    vertices: [
                        CG.Vector3(50, 50, 1),
                        CG.Vector3(-50, 50, 1),
                        CG.Vector3(-50, -50, 1),
                        CG.Vector3(50, -50, 1),
                    ],
                    angular_velocity: -0.001,
                    position: {x: 150, y: 150},
                    color: [255, 0, 0, 255],
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Polygon 2
                {
                    vertices: [
                        CG.Vector3(193 - 100, 116 - 100, 1),
                        CG.Vector3(114 - 100, 109 - 100, 1),
                        CG.Vector3(3 - 100, 90 - 100, 1),
                        CG.Vector3(8 - 100, 74 - 100, 1),
                        CG.Vector3(63 - 100, 69 - 100, 1),
                        CG.Vector3(116 - 100, 80 - 100, 1)
                    ],
                    angular_velocity: 0.001,
                    position: {x: 500, y: 200},
                    color: [66, 245, 75, 255],
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Polygon 3
                {
                    vertices: [
                        CG.Vector3(0, 100, 1),
                        CG.Vector3(-86.6, -50, 1),
                        CG.Vector3(86.6, -50, 1)
                    ],
                    angular_velocity: -0.001,
                    position: {x: 400, y: 400},
                    color: [66, 135, 245, 255],
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                }
            ],
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
        switch (this.slide_idx) {
            case 0:
                /*
                    Slide 0 (Bounding Ball)
                    Here we just need to update the current position for the ball based on the delta_time while accounting for edge collisions
                */
                // Check and handle if the new position will result in an edge collision
                const ball = this.models.slide0[0];
                let delta_x = delta_time * ball.velocity.x;
                let delta_y = delta_time * ball.velocity.y;
                
                // Check for a collision in the X dimension
                if (ball.position.x + delta_x <= ball.radius && ball.velocity.x < 0) {
                    // Ball is outside the positive x dimension, we need to re-position the ball inside the x dimension 
                    //      with the distance it would have traveled backwards if the velocity had swapped at impact
                    ball.position.x = Math.abs(delta_x) - (ball.position.x - ball.radius) + ball.radius;
                    ball.velocity.x *= -1;
                } else if (ball.position.x + delta_x >= (this.canvas.width - ball.radius) && ball.velocity.x > 0) {
                    // Ball is outside the negative x dimension, we need to re-position the ball inside the x dimension 
                    //      with the distance it would have traveled backwards if the velocity had swapped at impact
                    ball.position.x = this.canvas.width - (Math.abs(delta_x) - (this.canvas.width - (ball.position.x + ball.radius))) - ball.radius;
                    ball.velocity.x *= -1;
                } else {
                    // Ball is inside the x dimension, ok to set new x position
                    ball.position.x += delta_x;                    
                }
                
                // Check for a collision in the Y dimension
                if (ball.position.y + delta_y <= ball.radius && ball.velocity.y < 0) {
                    // Ball is outside the negative y dimension, we need to re-position the ball inside the y dimension
                    //      with the distance it would have traveled backwards ifthe velocity had swapped at impact
                    ball.position.y = Math.abs(delta_y) - (ball.position.y - ball.radius) + ball.radius;
                    //ball.position.y = (delta_y - (ball.position.y - ball.radius));
                    ball.velocity.y *= -1;
                } else if (ball.position.y + delta_y >= (this.canvas.height - ball.radius) && ball.velocity.y > 0) {
                    // Ball is outside the negative y dimension, we need to re-position the ball inside the y dimension
                    //      with the distance it would have traveled backwards ifthe velocity had swapped at impact
                    ball.position.y = this.canvas.height - (Math.abs(delta_y) - (this.canvas.height - (ball.position.y + ball.radius))) - ball.radius;
                    ball.velocity.y *= -1;
                } else {
                    // Ball is inside the y dimension, ok to set new y position
                    ball.position.y += delta_y;
                }
                break;
            case 1:
                /*
                    Just need to update the polygon transformation matrices based on the new time
                */
                for (let i = 0; i < this.models.slide1.length; i++) {
                    CG.mat3x3Rotate(this.models.slide1[i].rotate_matrix, (time * this.models.slide1[i].angular_velocity) % (2*Math.PI));
                    CG.mat3x3Translate(this.models.slide1[i].translate_matrix, this.models.slide1[i].position.x, this.models.slide1[i].position.y);
                }
                break;
            default:
                break;
        }
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

    drawSlide0() {
        // Draw the ball in it's current position
        const ball = this.models.slide0[0];
        this.ctx.fillStyle = `rgba(${ball.color})`;
        this.ctx.beginPath();
        this.ctx.arc(Math.floor(ball.position.x), Math.floor(ball.position.y), ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    //
    drawSlide1() {
        for (let i = 0; i < this.models.slide1.length; i++) {
            let renderedPolygon = [];
            for (let j = 0; j < this.models.slide1[i].vertices.length; j++) {
                renderedPolygon.push(Matrix.multiply([this.models.slide1[i].translate_matrix, this.models.slide1[i].rotate_matrix, this.models.slide1[i].vertices[j]]));
            }
            this.drawConvexPolygon(renderedPolygon, this.models.slide1[i].color);
        }
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