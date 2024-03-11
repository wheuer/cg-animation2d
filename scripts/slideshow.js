import { createApp, reactive, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { Renderer } from './renderer.js';

let app = createApp({
    setup() {
        return {
            view: reactive({
                id: 'view',
                width: 800,
                height: 600
            }),
            renderer: ref(null),
            slide_description: ref([
                'Bouncing Ball',
                'Spinning Polygons',
                'Grow / Shrink',
                'Fun!',
                'Double the Fun!'
            ]),
            slide_idx: ref(0),
            limit_fps: ref(false),
            fps: ref(10),
            ball_count: ref(1)
        };
    },

    watch: {
        limit_fps(new_value, old_value) {
            this.renderer.limitFps(new_value);
        },
        fps(new_value, old_value) {
            this.renderer.setFps(parseInt(new_value));
        },
        ball_count(new_value, old_value) {
            this.renderer.setBallCount(parseInt(new_value));
        }
    },

    methods: {
        prevSlide() {
            if (this.slide_idx > 0) {
                this.slide_idx -= 1;
                this.renderer.setSlideIndex(this.slide_idx);
            }
        },
        
        nextSlide() {
            if (this.slide_idx < this.slide_description.length - 1) {
                this.slide_idx += 1;
                this.renderer.setSlideIndex(this.slide_idx);
            }
        }
    }
}).mount('#content');
    
app.renderer = new Renderer(app.view, app.limit_fps, app.fps, app.ball_count);
window.requestAnimationFrame((timestamp) => {
    app.renderer.animate(timestamp);
});
