import * as CG from './transforms.js';
import { Matrix } from './matrix.js';

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    // ball_count:          int
    constructor(canvas, limit_fps_flag, fps, ball_count) {
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

        this.ball_count = ball_count;
        this.balls = [
            // Ball 0 (always present)
            {
                position: { x: canvas.width / 2, y: canvas.height / 2 }, // Position of center of ball, start with ball centered on window
                velocity: { x: 0.5, y: 0.5 }, // Start with ball moving towards the top right
                radius: 20,
                color: [255, 0, 0, 255], // Red
            },
        ]

        this.models = {
            slide0: [
                {
                    ball_radius_min: 10,
                    ball_radius_max: 25,
                    current_balls: 1
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
                    position: { x: 400, y: 400 },
                    color: [255, 0, 0, 255],
                    maximum_scale_x: 3,
                    maximum_scale_y: 3,
                    minimum_scale_x: 0.5,
                    minimum_scale_y: 0.5,
                    scale_factor_x: 0.002,
                    scale_factor_y: -0.002,
                    scale_direction_x: 1,
                    scale_direction_y: 1,
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
                    position: { x: 400, y: 200 },
                    color: [66, 245, 75, 255],
                    maximum_scale_x: 2,
                    maximum_scale_y: 2,
                    minimum_scale_x: 0.5,
                    minimum_scale_y: 0.5,
                    scale_factor_x: -0.002,
                    scale_factor_y: 0.001, 
                    scale_direction_x: 1,
                    scale_direction_y: 1,
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
            ],
            slide3: [
                // Maybe a bunch of spinning polygons overlayed on a growing mass to look like some kind of entity?
                // Add a little dude with a gun in the background who shoots at the entity
                // Make the balls turn invisible after reaching the entity?

                // Shot 1
                {
                    position: { x: 150, y: canvas.height / 2 + 50 },
                    velocity: { x: 0.6, y: 0 },
                    radius: 10,
                    color: [255, 255, 0, 255], // Yellow
                },

                // Shot 2
                {
                    position: { x: 150, y: canvas.height / 2 - 50 },
                    velocity: { x: 0.6, y: 0 },
                    radius: 10,
                    color: [255, 255, 0, 255], // Yellow
                },

                // Body
                {
                    vertices: [
                        CG.Vector3(0, 250, 1),
                        CG.Vector3(176.8, 176.8, 1),
                        CG.Vector3(250, 0, 1),
                        CG.Vector3(176.8, -176.8, 1),
                        CG.Vector3(0, -250, 1),
                        CG.Vector3(-176.8, -176.8, 1),
                        CG.Vector3(-250, 0, 1),
                        CG.Vector3(-176.8, 176.8, 1)
                    ],
                    position: { x: canvas.width - 100, y: canvas.height / 2 },
                    color: [128, 0, 128, 255], // Purple
                    scale_factor: 1, // Initial scale factor
                    scale_direction: 1, // Initial scale direction
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Eye1
                {
                    vertices: [
                        CG.Vector3(25, 0, 1),
                        CG.Vector3(18, 18, 1),
                        CG.Vector3(0, 25, 1),
                        CG.Vector3(-18, 18, 1),
                        CG.Vector3(-25, 0, 1),
                        CG.Vector3(-18, -18, 1),
                        CG.Vector3(0, -25, 1),
                        CG.Vector3(18, -18, 1)
                    ],
                    position: { x: canvas.width - 250, y: canvas.height / 2 + 50 },
                    color: [255, 255, 255, 255], // White
                    scale_factor: 0.5, // Initial scale factor
                    scale_direction: 1, // Initial scale direction
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Eye2
                {
                    vertices: [
                        CG.Vector3(25, 0, 1),
                        CG.Vector3(18, 18, 1),
                        CG.Vector3(0, 25, 1),
                        CG.Vector3(-18, 18, 1),
                        CG.Vector3(-25, 0, 1),
                        CG.Vector3(-18, -18, 1),
                        CG.Vector3(0, -25, 1),
                        CG.Vector3(18, -18, 1)
                    ],
                    position: { x: canvas.width - 30, y: canvas.height / 2 + 50 },
                    color: [255, 255, 255, 255], // White
                    scale_factor: 0.5, // Initial scale factor
                    scale_direction: 1, // Initial scale direction
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Mouth1
                {
                    vertices: [
                        CG.Vector3(85, 85, 1),
                        CG.Vector3(-85, 85, 1),
                        CG.Vector3(-85, -85, 1),
                        CG.Vector3(85, -85, 1),
                    ],
                    angular_velocity: -0.02,
                    position: { x: canvas.width - 140, y: canvas.height / 2 - 120 },
                    color: [255, 165, 0, 255], // Bright orange
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Mouth2
                {
                    vertices: [
                        CG.Vector3(75, 75, 1),
                        CG.Vector3(-75, 75, 1),
                        CG.Vector3(-75, -75, 1),
                        CG.Vector3(75, -75, 1),
                    ],
                    angular_velocity: -0.04,
                    position: { x: canvas.width - 140, y: canvas.height / 2 - 120 },
                    color: [255, 255, 0, 255], // Bright yellow
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
                    angular_velocity: -0.06,
                    position: { x: canvas.width - 140, y: canvas.height / 2 - 120 },
                    color: [255, 255, 255, 255], // White
                    rotate_matrix: new Matrix(3, 3), // Current rotation
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
            ],
            slide4: [
                // Color settings
                {
                    wheel_angle: 0,
                    wheel_angular_velocity: 0.005
                },
                // Inner wheel
                {
                    color_stop_count: 40,
                    color_shift_velocity: 0.4,
                    color_stops: [
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255]
                    ]
                },
                // Triangle
                {
                    default_color: [0,0,0,255],
                    color_stop_count: 30,
                    color_shift_velocity: 0.3,
                    color_stops: [
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255]
                    ],                    
                    vertices: [
                        CG.Vector3(0, 100, 1),
                        CG.Vector3(-86.6, -50, 1),
                        CG.Vector3(86.6, -50, 1)
                    ],
                    position: { x: canvas.width / 2, y: canvas.height / 2},
                    color: [255, 255, 255, 255],
                    angular_velocity: -0.001,
                    rotate_matrix: new Matrix(3, 3), // Current rotate value
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Square
                {
                    default_color: [255,0,0,255],
                    color_stop_count: 20,
                    color_shift_velocity: 0.2,
                    color_stops: [
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255]
                    ],                    
                    vertices: [
                        CG.Vector3(-100, 100, 1),
                        CG.Vector3(100, 100, 1),
                        CG.Vector3(100, -100, 1),
                        CG.Vector3(-100, -100, 1),
                    ],
                    position: { x: canvas.width / 2, y: canvas.height / 2},
                    color: [255, 255, 255, 255],
                    angular_velocity: 0.001,
                    rotate_matrix: new Matrix(3, 3), // Current rotate value
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Hexagon
                {
                    default_color: [0,255,0,255],
                    color_stop_count: 10,
                    color_shift_velocity: 0.2,
                    color_stops: [
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255],
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255]
                    ], 
                    vertices: [
                        CG.Vector3(165, 0, 1),
                        CG.Vector3(82, 142, 1),
                        CG.Vector3(-82, 142, 1),
                        CG.Vector3(-165, 0, 1),
                        CG.Vector3(-82, -142, 1),
                        CG.Vector3(82, -142, 1)
                    ],
                    position: { x: canvas.width / 2, y: canvas.height / 2},
                    color: [255, 255, 255, 255],
                    angular_velocity: -0.001,
                    rotate_matrix: new Matrix(3, 3), // Current rotate value
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Outer Square 1
                {
                    default_color: [0,0,255,255],
                    color_stop_count: 5,
                    color_shift_velocity: 0.2,
                    color_stops: [
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255]
                    ], 
                    vertices: [
                        CG.Vector3(-this.canvas.width/2, this.canvas.height/2, 1),
                        CG.Vector3(this.canvas.width/2, this.canvas.height/2, 1),
                        CG.Vector3(this.canvas.width/2, -this.canvas.height/2, 1),
                        CG.Vector3(-this.canvas.width/2, -this.canvas.height/2, 1),
                    ],
                    position: { x: canvas.width / 2, y: canvas.height / 2},
                    maximum_scale_x: 1,
                    maximum_scale_y: 1,
                    minimum_scale_x: 0.3,
                    minimum_scale_y: 0.3,
                    scale_factor_x: 0.0005,
                    scale_factor_y: 0.0005,
                    scale_direction_x: 1,
                    scale_direction_y: 1,
                    angular_velocity: -0.0015,
                    rotate_matrix: new Matrix(3, 3), // Current rotate value
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                },
                // Outer Square 2
                {
                    default_color: [0,0,255,255],
                    color_stop_count: 5,
                    color_shift_velocity: 0.25,
                    color_stops: [
                        [234,0,128,255],
                        [65,23,206,255],
                        [150,76,0,255],
                        [10,105,12,255],
                        [184,127,19,255]
                    ], 
                    vertices: [
                        CG.Vector3(-this.canvas.width/2, this.canvas.height/2, 1),
                        CG.Vector3(this.canvas.width/2, this.canvas.height/2, 1),
                        CG.Vector3(this.canvas.width/2, -this.canvas.height/2, 1),
                        CG.Vector3(-this.canvas.width/2, -this.canvas.height/2, 1),
                    ],
                    position: { x: canvas.width / 2, y: canvas.height / 2},
                    maximum_scale_x: 1,
                    maximum_scale_y: 1,
                    minimum_scale_x: 0.4,
                    minimum_scale_y: 0.4,
                    scale_factor_x: -0.0005,
                    scale_factor_y: -0.0005,
                    scale_direction_x: -1,
                    scale_direction_y: -1,
                    angular_velocity: 0.001,
                    rotate_matrix: new Matrix(3, 3), // Current rotate value
                    scale_matrix: new Matrix(3, 3), // Current scale
                    translate_matrix: new Matrix(3, 3) // Current translation from origin
                }
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

    // new_ball_count: int
    setBallCount (new_ball_count) {
        this.ball_count = new_ball_count;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
        // Turn on/off ball count slider
        let slider = document.getElementById("ui_extension");
        if (idx == 0) {
            slider.style.display = 'flex';
        } else {
            slider.style.display = 'none';
        }
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
                for (let i = this.balls.length; i < this.ball_count; i++) {
                    this.balls.push({
                        position: { x: this.canvas.width / 2, y: this.canvas.height / 2 }, // Position of center of ball, start with ball centered on window
                        velocity: { x: -1 + 2*Math.random(), y: -1 + 2*Math.random() }, // Start with ball moving towards the top right
                        radius:  Math.floor((Math.random() * (this.models.slide0[0].ball_radius_max - this.models.slide0[0].ball_radius_min)) + this.models.slide0[0].ball_radius_min),
                        color: [Math.floor(Math.random() * 255), 
                                Math.floor(Math.random() * 255), 
                                Math.floor(Math.random() * 255), 
                                255],
                       })
                }
                
                while (this.balls.length != this.ball_count) this.balls.pop();

                for (let i = 0; i < this.balls.length; i++) {
                    // Check and handle if the new position will result in an edge collision
                    // const ball = this.models.slide0[1];
                    const ball = this.balls[i];
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
                    Slide 2 (Growing/Shrinking Polygons)
                    Update the polygon transformation matrices based on the new time.
                    Once each polygon grows/shrinks to a certain size, reverse direction
                */
                for (let i = 0; i < this.models.slide2.length; i++) {
                    let polygon = this.models.slide2[i];
                    let current_scale_x = polygon.scale_matrix.values[0][0];
                    let current_scale_y = polygon.scale_matrix.values[1][1];
                    //console.log(current_scale_x + " | " + current_scale_y);

                    // Check if scaling factor exceeds set maximum or minimum value
                    if (current_scale_x >= polygon.maximum_scale_x || current_scale_x <= polygon.minimum_scale_x) {
                        polygon.scale_direction_x *= -1;
                    }

                    if (current_scale_y >= polygon.maximum_scale_y || current_scale_y <= polygon.minimum_scale_y) {
                        polygon.scale_direction_y *= -1; 
                    }

                    CG.mat3x3Scale(polygon.scale_matrix, current_scale_x + (polygon.scale_factor_x * polygon.scale_direction_x * delta_time), current_scale_y + (polygon.scale_factor_y * polygon.scale_direction_y * delta_time));
                    CG.mat3x3Translate(polygon.translate_matrix, polygon.position.x, polygon.position.y);
                    
                }
                break;
            case 3:
                // Draw the shots being fired
                for (let i = 0; i < 2; i++) {
                    const shot = this.models.slide3[i];
                    let delta_x2 = delta_time * shot.velocity.x;

                    // Check for a collision in the X dimension
                    if (shot.position.x + delta_x2 >= (this.canvas.width - shot.radius - 150) && shot.velocity.x > 0) {
                        shot.position.x = shot.radius + 180;
                    } else {
                        shot.position.x += delta_x2;
                    }
                }

                // Draw the body
                let polygon = this.models.slide3[2];

                // Adjust scale factor based on time and direction
                polygon.scale_factor += polygon.scale_direction * delta_time * 0.001; // Adjust the scale factor

                // Check if scaling factor exceeds certain limits to reverse direction
                if (polygon.scale_factor >= 1.5) {
                    polygon.scale_factor = 1.5;
                    polygon.scale_direction = -1; // Reverse direction
                } else if (polygon.scale_factor <= 1.25) {
                    polygon.scale_factor = 1.25;
                    polygon.scale_direction = 1; // Reverse direction
                }

                CG.mat3x3Scale(polygon.scale_matrix, polygon.scale_factor, polygon.scale_factor);
                CG.mat3x3Translate(polygon.translate_matrix, polygon.position.x, polygon.position.y);

                for (let i = 3; i < 5; i++) {
                    let eye = this.models.slide3[i];

                    // Adjust scale factor based on time and direction
                    eye.scale_factor += eye.scale_direction * delta_time * 0.001; // Adjust the scale factor

                    // Check if scaling factor exceeds certain limits to reverse direction
                    if (eye.scale_factor >= 1.5) {
                        eye.scale_factor = 1.5;
                        eye.scale_direction = -1; // Reverse direction
                    } else if (eye.scale_factor <= 1) {
                        eye.scale_factor = 1;
                        eye.scale_direction = 1; // Reverse direction
                    }

                    CG.mat3x3Scale(eye.scale_matrix, eye.scale_factor, eye.scale_factor);
                    CG.mat3x3Translate(eye.translate_matrix, eye.position.x, eye.position.y);
                }

                for (let i = 5; i < this.models.slide3.length; i++) {
                    CG.mat3x3Rotate(this.models.slide3[i].rotate_matrix, (time * this.models.slide3[i].angular_velocity) % (2 * Math.PI));
                    CG.mat3x3Translate(this.models.slide3[i].translate_matrix, this.models.slide3[i].position.x, this.models.slide3[i].position.y);
                }
                break;
            case 4:
                // Triangle, Square, and Hexagon
                for (let i = 2; i < 5; i++) {
                    let model = this.models.slide4[i];
                    CG.mat3x3Rotate(model.rotate_matrix, (time * model.angular_velocity) % (2 * Math.PI));
                    CG.mat3x3Translate(model.translate_matrix, model.position.x, model.position.y);
                    CG.mat3x3Scale(model.scale_matrix, 1, 1);
                }

                // Outer Squares
                for (let i = 5; i < 7; i++) {
                    let outer_square = this.models.slide4[i];
                    let current_scale_x = outer_square.scale_matrix.values[0][0];
                    let current_scale_y = outer_square.scale_matrix.values[1][1];

                    // Check if scaling factor exceeds set maximum or minimum value
                    if (current_scale_x >= outer_square.maximum_scale_x || current_scale_x <= outer_square.minimum_scale_x) {
                        outer_square.scale_direction_x *= -1;
                    }

                    if (current_scale_y >= outer_square.maximum_scale_y || current_scale_y <= outer_square.minimum_scale_y) {
                        outer_square.scale_direction_y *= -1; 
                    }
                    
                    CG.mat3x3Rotate(outer_square.rotate_matrix, (time * outer_square.angular_velocity) % (2 * Math.PI));
                    CG.mat3x3Scale(outer_square.scale_matrix, current_scale_x + (outer_square.scale_factor_x * outer_square.scale_direction_x * delta_time), current_scale_y + (outer_square.scale_factor_y * outer_square.scale_direction_y * delta_time));
                    CG.mat3x3Translate(outer_square.translate_matrix, outer_square.position.x, outer_square.position.y);
                }

                let color_settings = this.models.slide4[0];
                color_settings.wheel_angle = (time * color_settings.wheel_angular_velocity) % (2 * Math.PI);
                for (let i = 1; i < this.models.slide4.length; i++) {
                    let current_model = this.models.slide4[i];
                    let wheel_colors = current_model.color_stops;
                    for (let i = 0; i < current_model.color_stop_count; i++) {
                        for (let j = 0; j < 3; j++) {
                            let scale = Math.random();
                            wheel_colors[i][j] = Math.floor(wheel_colors[i][j] + (delta_time * current_model.color_shift_velocity * scale)) % 255;
                        }
                    }
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
            case 4:
                this.drawSlide4();
                break;
        }
    }

    drawSlide0() {
        // Draw the ball in it's current position
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            this.ctx.fillStyle = `rgba(${ball.color})`;
            this.ctx.beginPath();
            this.ctx.arc(Math.floor(ball.position.x), Math.floor(ball.position.y), ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
        } 
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
        this.ctx.drawImage(this.image, 5, (this.canvas.height - this.canvas.height / 3) / 2, this.canvas.width / 4.5, this.canvas.height / 3);

        // Draw the body
        const body = this.models.slide3[2];
        this.ctx.fillStyle = `rgba(${body.color})`;
        this.ctx.beginPath();
        for (let i = 0; i < body.vertices.length; i++) {
            let transformedVertex = Matrix.multiply([body.translate_matrix, body.scale_matrix, body.vertices[i]]);
            this.ctx.lineTo(transformedVertex.values[0][0], transformedVertex.values[1][0]);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Draw eye1
        const eye1 = this.models.slide3[3];
        this.ctx.fillStyle = `rgba(${eye1.color})`;
        this.ctx.beginPath();
        for (let i = 0; i < eye1.vertices.length; i++) {
            let transformedVertex = Matrix.multiply([eye1.translate_matrix, eye1.scale_matrix, eye1.vertices[i]]);
            this.ctx.lineTo(transformedVertex.values[0][0], transformedVertex.values[1][0]);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Draw eye2
        const eye2 = this.models.slide3[4];
        this.ctx.fillStyle = `rgba(${eye2.color})`;
        this.ctx.beginPath();
        for (let i = 0; i < eye2.vertices.length; i++) {
            let transformedVertex = Matrix.multiply([eye2.translate_matrix, eye2.scale_matrix, eye2.vertices[i]]);
            this.ctx.lineTo(transformedVertex.values[0][0], transformedVertex.values[1][0]);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Draw Mouth
        for (let i = 5; i < this.models.slide3.length; i++) {
            let renderedPolygon = [];
            for (let j = 0; j < this.models.slide3[i].vertices.length; j++) {
                renderedPolygon.push(Matrix.multiply([this.models.slide3[i].translate_matrix, this.models.slide3[i].rotate_matrix, this.models.slide3[i].vertices[j]]));
            }
            this.drawConvexPolygon(renderedPolygon, this.models.slide3[i].color);
        }

        // Draw shots
        for (let i = 0; i < 2; i++) {
            const shot = this.models.slide3[i];
            this.ctx.fillStyle = `rgba(${shot.color})`;
            this.ctx.beginPath();
            this.ctx.arc(Math.floor(shot.position.x), Math.floor(shot.position.y), shot.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

    }

    drawSlide4() {
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fill();

        let renderedPolygon = [];
        for (let i = this.models.slide4.length - 1; i >= 1; i--) {
            let model = this.models.slide4[i];
            if (i != 1) {
                for (let j = 0; j < this.models.slide4[i].vertices.length; j++) {
                    renderedPolygon.push(Matrix.multiply([model.translate_matrix, model.scale_matrix, model.rotate_matrix, model.vertices[j]]));
                }
            }
            
            let gradient = this.ctx.createConicGradient(this.models.slide4[0].wheel_angle, this.canvas.width/2, this.canvas.height/2);
            let colors = model.color_stops;
            let stop_increment = 1.0 / (model.color_stop_count - 1);
            for (let j = 0; j <  model.color_stop_count; j++) {
                gradient.addColorStop(stop_increment * j, `rgba(${colors[j][0]}, ${colors[j][1]}, ${colors[j][2]}, 255)`);
            }
            this.ctx.fillStyle = gradient;

            if (i == 1) {
                this.ctx.beginPath();
                this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 50, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.drawConvexPolygonRainbow(renderedPolygon);
            }

            renderedPolygon = [];
        }
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

    drawConvexPolygonRainbow(vertex_list) {
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