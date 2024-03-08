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

        this.image = new Image();
        this.image.src = 'images/galaga.png';

        this.models = {
            slide0: [
                // Ball
                {
                    position: { x: canvas.width / 2, y: canvas.height / 2 }, // Position of center of ball, start with ball centered on window
                    velocity: { x: 0.5, y: 0.5 }, // Start with ball moving towards the top right
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
                    position: { x: 150, y: 150 },
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
                    position: { x: 500, y: 200 },
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
                    position: { x: 400, y: 400 },
                    color: [66, 135, 245, 255],
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                }
            ],
            slide2: [
                // Polygon 1
                {
                    vertices: [
                        CG.Vector3(50, 50, 1),
                        CG.Vector3(-50, 50, 1),
                        CG.Vector3(-50, -50, 1),
                        CG.Vector3(50, -50, 1),
                    ],
                    position: { x: 150, y: 150 },
                    color: [255, 0, 0, 255],
                    scale_factor: 1, // Initial scale factor
                    scale_direction: 1, // Initial scale direction
                    scale_matrix: new Matrix(3, 3), // Current scale
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
                    position: { x: 500, y: 200 },
                    color: [66, 245, 75, 255],
                    scale_factor: 1, // Initial scale factor
                    scale_direction: 1, // Initial scale direction
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
            ],
            slide3: [
                // Maybe a bunch of spinning polygons overlayed on a growing mass to look like some kind of entity?
                // Add a little dude with a gun in the background who shoots at the entity
                // Make the balls turn invisible after reaching the entity?

                // Shot
                {
                    position: { x: 200, y: canvas.height / 2 }, // Position of center of ball, start with ball centered on window
                    velocity: { x: 0.6, y: 0 }, // Start with ball moving towards the top right
                    radius: 20,
                    color: [255, 255, 0, 255], // Red
                },

                // Body
                {
                    vertices: [
                        CG.Vector3(50, 50, 1),
                        CG.Vector3(-50, 50, 1),
                        CG.Vector3(-50, -50, 1),
                        CG.Vector3(50, -50, 1),
                    ],
                    position: { x: 150, y: 150 },
                    color: [255, 0, 0, 255],
                    scale_factor: 1, // Initial scale factor
                    scale_direction: 1, // Initial scale direction
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Eye1
                {
                    vertices: [
                        CG.Vector3(50, 50, 1),
                        CG.Vector3(-50, 50, 1),
                        CG.Vector3(-50, -50, 1),
                        CG.Vector3(50, -50, 1),
                    ],
                    angular_velocity: -0.001,
                    position: { x: 150, y: 150 },
                    color: [255, 0, 0, 255],
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Eye2
                {
                    vertices: [
                        CG.Vector3(50, 50, 1),
                        CG.Vector3(-50, 50, 1),
                        CG.Vector3(-50, -50, 1),
                        CG.Vector3(50, -50, 1),
                    ],
                    angular_velocity: -0.001,
                    position: { x: 150, y: 150 },
                    color: [255, 0, 0, 255],
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Mouth1
                {
                    vertices: [
                        CG.Vector3(50, 50, 1),
                        CG.Vector3(-50, 50, 1),
                        CG.Vector3(-50, -50, 1),
                        CG.Vector3(50, -50, 1),
                    ],
                    angular_velocity: -0.001,
                    position: { x: 150, y: 150 },
                    color: [255, 0, 0, 255],
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Mouth2
                {
                    vertices: [
                        CG.Vector3(50, 50, 1),
                        CG.Vector3(-50, 50, 1),
                        CG.Vector3(-50, -50, 1),
                        CG.Vector3(50, -50, 1),
                    ],
                    angular_velocity: -0.001,
                    position: { x: 150, y: 150 },
                    color: [255, 0, 0, 255],
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Mouth3
                {
                    vertices: [
                        CG.Vector3(50, 50, 1),
                        CG.Vector3(-50, 50, 1),
                        CG.Vector3(-50, -50, 1),
                        CG.Vector3(50, -50, 1),
                    ],
                    angular_velocity: -0.001,
                    position: { x: 150, y: 150 },
                    color: [255, 0, 0, 255],
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
            ]
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
                    CG.mat3x3Rotate(this.models.slide1[i].rotate_matrix, (time * this.models.slide1[i].angular_velocity) % (2 * Math.PI));
                    CG.mat3x3Translate(this.models.slide1[i].translate_matrix, this.models.slide1[i].position.x, this.models.slide1[i].position.y);
                }
                break;
            case 2:
                /*
                    Slide 0 (Growing/Shrinking Polygons)
                    Update the polygon transformation matrices based on the new time.
                    Once each polygon grows/shrinks to a certain size, reverse direction
                */
                for (let i = 0; i < this.models.slide2.length; i++) {
                    let polygon = this.models.slide2[i];

                    // Adjust scale factor based on time and direction
                    polygon.scale_factor += polygon.scale_direction * delta_time * 0.001; // Adjust the scale factor

                    // Check if scaling factor exceeds certain limits to reverse direction
                    if (polygon.scale_factor >= 2) {
                        polygon.scale_factor = 2;
                        polygon.scale_direction = -1; // Reverse direction
                    } else if (polygon.scale_factor <= 0.5) {
                        polygon.scale_factor = 0.5;
                        polygon.scale_direction = 1; // Reverse direction
                    }

                    CG.mat3x3Scale(polygon.scale_matrix, polygon.scale_factor, polygon.scale_factor);
                    CG.mat3x3Translate(polygon.translate_matrix, polygon.position.x, polygon.position.y);
                }
                break;
            case 3:
                const shot = this.models.slide3[0];
                let delta_x2 = delta_time * shot.velocity.x;

                // Check for a collision in the X dimension
                if (shot.position.x + delta_x2 >= (this.canvas.width - shot.radius) && shot.velocity.x > 0) {
                    shot.position.x = shot.radius + 180;
                } else {
                    shot.position.x += delta_x2;
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
        for (let i = 0; i < this.models.slide2.length; i++) {
            let renderedPolygon = [];
            for (let j = 0; j < this.models.slide2[i].vertices.length; j++) {
                renderedPolygon.push(Matrix.multiply([this.models.slide2[i].translate_matrix, this.models.slide2[i].scale_matrix, this.models.slide2[i].vertices[j]]));
            }
            this.drawConvexPolygon(renderedPolygon, this.models.slide2[i].color);
        }
    }

    //
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)
        this.ctx.drawImage(this.image, 5, (this.canvas.height - this.canvas.height / 3) / 2, this.canvas.width / 4.5, this.canvas.height / 3);

        // Draw the ball in it's current position
        const shot = this.models.slide3[0];
        this.ctx.fillStyle = `rgba(${shot.color})`;
        this.ctx.beginPath();
        this.ctx.arc(Math.floor(shot.position.x), Math.floor(shot.position.y), shot.radius, 0, Math.PI * 2);
        this.ctx.fill();

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