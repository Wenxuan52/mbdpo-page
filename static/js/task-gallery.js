// Newt MMBench task marquee for the MBDPO project page.
//
// Five rows of 40 rollouts each, scrolling continuously in alternating
// directions (row 1 left-to-right, row 2 right-to-left, ...) at one shared
// speed. Row membership is a fixed, pre-computed shuffle: every row mixes 8-9
// benchmark families and no two neighbours come from the same family.
//
// Each row's track holds its 40 cards plus copies of the leading FILL cards, so
// translating the track by exactly one set width lands on a pixel-identical
// frame and the loop closes with no visible seam.
(function () {
    'use strict';

    const VIDEO_DIR = 'static/videos/newt_200_tasks/videos_xxl/';
    const SPEED = 40;   // px per second — identical for every row
    const FILL = 10;    // leading cards duplicated to close the loop seamlessly

    // Prefix -> how much to strip off the front of the display name.
    const STRIP = ['mw-', 'ms-', 'mujoco-', 'og-', 'rd-', 'pygame-', 'atari-'];

    // Only for names that plain title-casing gets wrong.
    const NAME_OVERRIDES = {
        'atari-beamrider': 'Beam Rider',
        'atari-jamesbond': 'James Bond',
        'atari-ms-pacman': 'Ms. Pac-Man',
        'atari-upndown': "Up'N'Down",
        'atari-yars-revenge': "Yars' Revenge",
        'ms-pick-cube-eepose': 'Pick Cube EE-pose',
        'ms-pick-cube-so': 'Pick Cube SO',
        'ms-pick-cube-xarm6': 'Pick Cube xArm6',
        'ms-reach-eepose': 'Reach EE-pose',
        'ms-reach-xarm6': 'Reach xArm6',
        'mujoco-halfcheetah': 'HalfCheetah',
        'og-antball': 'AntBall',
        'pygame-point-maze-var1': 'Point Maze Var 1',
        'pygame-point-maze-var2': 'Point Maze Var 2',
        'pygame-point-maze-var3': 'Point Maze Var 3'
    };

    const ROWS = [
        ['mw-door-unlock', 'og-ant-arena', 'ms-pick-hammer', 'mw-door-close', 'ms-pick-can', 'lunarlander-hover', 'atari-space-invaders', 'mw-pick-place-wall', 'reacher-easy', 'mw-handle-press-side', 'ms-pick-cube', 'atari-boxing', 'mw-reach', 'pygame-cartpole-balance', 'mw-stick-pull', 'cartpole-swingup', 'mujoco-reacher', 'mw-plate-slide', 'mujoco-halfcheetah', 'pygame-cartpole-tremor', 'mw-button-press-wall', 'ms-reach-xarm6', 'pygame-cartpole-swingup', 'mw-push', 'finger-spin', 'mw-hand-insert', 'hopper-hop', 'mw-plate-slide-side', 'og-ant', 'mw-faucet-close', 'ms-pick-sponge', 'bipedal-walker-uneven', 'ms-pick-knife', 'mw-pick-out-of-hole', 'ms-hopper-stand', 'pygame-pong', 'mw-bin-picking', 'pygame-spaceship', 'mw-door-lock', 'ms-ant-walk'],
        ['mw-plate-slide-back-side', 'pygame-chase-evade', 'mw-window-close', 'ms-pick-cube-eepose', 'pygame-coinrun', 'cheetah-jump', 'pygame-bird-attack', 'ms-pick-banana', 'mw-stick-push', 'spinner-spin', 'bipedal-walker-hills', 'ms-pick-apple', 'mw-plate-slide-back', 'ms-anymal-reach', 'atari-pong', 'ms-place-sphere', 'atari-alien', 'ms-pull-cube', 'mw-button-press', 'atari-battle-zone', 'mw-coffee-push', 'jumper-jump', 'mw-button-press-topdown', 'reacher-three-easy', 'pygame-air-hockey', 'cartpole-swingup-sparse', 'mw-sweep', 'rd-push-green', 'atari-phoenix', 'cartpole-balance-sparse', 'atari-asterix', 'ms-poke-cube', 'rd-open-drawer', 'atari-krull', 'mw-soccer', 'atari-double-dunk', 'ms-stack-cube', 'finger-turn-hard', 'og-ant-bottleneck', 'mw-disassemble'],
        ['ms-cartpole-swingup-sparse', 'mw-sweep-into', 'rd-flat-block-in-bin', 'mw-peg-insert-side', 'og-ant-maze', 'bipedal-walker-obstacles', 'mw-hammer', 'bipedal-walker-rugged', 'cheetah-run-front', 'rd-open-slide', 'acrobot-swingup', 'mw-dial-turn', 'atari-jamesbond', 'reacher-hard', 'mw-pick-place', 'ms-pick-cube-xarm6', 'atari-chopper-command', 'mw-handle-pull', 'ms-lift-peg', 'walker-run', 'mw-handle-pull-side', 'ms-cartpole-balance-sparse', 'mw-coffee-pull', 'pygame-cowboy', 'walker-run-backward', 'mujoco-ant', 'atari-tutankham', 'ms-reach', 'mw-lever-pull', 'ms-pick-orange', 'mw-reach-wall', 'quadruped-walk', 'ms-push-cube', 'mw-push-back', 'og-ant-circle', 'hopper-stand', 'mw-drawer-close', 'rd-push-blue', 'ms-pick-mug', 'mujoco-hopper'],
        ['hopper-hop-backward', 'rd-push-red', 'spinner-jump', 'pygame-point-maze-var3', 'atari-assault', 'cup-spin', 'atari-upndown', 'ms-pick-tennis-ball', 'mw-door-open', 'ms-reach-eepose', 'reacher-three-hard', 'lunarlander-takeoff', 'mw-peg-unplug-side', 'pendulum-swingup', 'mw-box-close', 'walker-walk', 'ms-pull-cube-tool', 'atari-beamrider', 'ms-pick-spoon', 'mw-window-open', 'walker-stand', 'atari-road-runner', 'cheetah-run', 'ms-ant-run', 'mw-handle-press', 'pendulum-spin', 'pygame-point-maze-var1', 'spinner-spin-backward', 'mujoco-inverted-pendulum', 'fish-swim', 'bipedal-walker-flat', 'atari-gopher', 'ms-cartpole-balance', 'pygame-rocket-collect', 'cheetah-run-back', 'og-antball', 'mw-faucet-open', 'atari-crazy-climber', 'quadruped-run', 'atari-ms-pacman'],
        ['pygame-point-maze-var2', 'mw-drawer-open', 'cup-catch', 'og-point-spiral', 'ms-pick-screwdriver', 'atari-robotank', 'cheetah-run-backward', 'pygame-cartpole-swingup-sparse', 'atari-yars-revenge', 'cartpole-balance', 'og-point-bottleneck', 'ms-pick-fork', 'og-point-arena', 'atari-bank-heist', 'og-point-maze', 'lunarlander-land', 'mw-coffee-button', 'walker-walk-backward', 'atari-name-this-game', 'pygame-cartpole-balance-sparse', 'atari-atlantis', 'mw-push-wall', 'mujoco-walker', 'ms-hopper-hop', 'atari-kangaroo', 'mw-basketball', 'pygame-coconut-dodge', 'giraffe-run', 'atari-seaquest', 'mw-button-press-topdown-wall', 'ms-pick-cube-so', 'og-ant-spiral', 'atari-ice-hockey', 'pygame-highway', 'ms-pick-baseball', 'finger-turn-easy', 'pygame-landing', 'ms-cartpole-swingup', 'og-point-circle', 'mw-assembly']
    ];

    function displayName(name) {
        if (NAME_OVERRIDES[name]) return NAME_OVERRIDES[name];
        let bare = name;
        for (let i = 0; i < STRIP.length; i++) {
            if (name.startsWith(STRIP[i])) { bare = name.slice(STRIP[i].length); break; }
        }
        return bare.split('-').map(function (w) {
            return w.charAt(0).toUpperCase() + w.slice(1);
        }).join(' ');
    }

    function buildCard(name) {
        const card = document.createElement('div');
        card.className = 'mm-card';

        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'none';
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.dataset.src = VIDEO_DIR + name + '.mp4';

        const label = document.createElement('span');
        label.className = 'mm-name';
        label.textContent = displayName(name);
        video.setAttribute('aria-label', label.textContent + ' rollout');

        card.appendChild(video);
        card.appendChild(label);
        return card;
    }

    function init() {
        const host = document.getElementById('task-marquee');
        if (!host || !ROWS.length) return;

        const tracks = [];

        ROWS.forEach(function (names, i) {
            const row = document.createElement('div');
            row.className = 'mm-row';
            // Rows 1, 3, 5 run left-to-right; rows 2 and 4 run right-to-left.
            row.dataset.dir = (i % 2 === 0) ? 'ltr' : 'rtl';

            const track = document.createElement('div');
            track.className = 'mm-track';
            names.concat(names.slice(0, FILL)).forEach(function (n) {
                track.appendChild(buildCard(n));
            });

            row.appendChild(track);
            host.appendChild(row);
            tracks.push({el: track, count: names.length});
        });

        // One set width = count * (card width + gap). Deriving the duration from
        // it keeps every row at exactly SPEED px/s at any viewport size.
        // Every read happens before every write, so this costs one layout pass
        // rather than one per row.
        function measure() {
            const specs = tracks.map(function (t) {
                const first = t.el.firstElementChild;
                if (!first) return null;
                const cardWidth = first.getBoundingClientRect().width;
                if (!cardWidth) return null;
                const gap = parseFloat(getComputedStyle(t.el).columnGap) || 0;
                return {el: t.el, distance: t.count * (cardWidth + gap)};
            });
            specs.forEach(function (spec) {
                if (!spec) return;
                spec.el.style.setProperty('--mm-distance', spec.distance + 'px');
                spec.el.style.animationDuration = (spec.distance / SPEED) + 's';
            });
        }

        measure();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(measure, 180);
        });

        const videos = host.querySelectorAll('video');

        if (!('IntersectionObserver' in window)) {
            videos.forEach(function (v) { v.preload = 'auto'; v.src = v.dataset.src; });
            return;
        }

        function attach(v) {
            if (v.src) return;
            // preload only takes effect once there is a src to preload.
            v.preload = 'auto';
            v.src = v.dataset.src;
        }

        // Fetching and playing are deliberately separate observers. Sources are
        // pulled in well before a tile reaches the edge of the screen, but
        // playback starts only once the tile is genuinely visible — the number
        // of simultaneously decoding videos is what makes a wall of video
        // stutter, and hardware decoders run out well before memory does.
        const loader = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                attach(entry.target);
                loader.unobserve(entry.target);
            });
        }, {rootMargin: '200px 400px'});

        const player = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                const v = entry.target;
                if (entry.isIntersecting) {
                    attach(v);
                    const p = v.play();
                    if (p && p.catch) p.catch(function () { /* autoplay blocked */ });
                } else {
                    v.pause();
                }
            });
        });

        videos.forEach(function (v) {
            loader.observe(v);
            player.observe(v);
        });

        // Nothing should be animating or decoding while the reader is elsewhere
        // on the page.
        const section = new IntersectionObserver(function (entries) {
            const live = entries[0].isIntersecting;
            tracks.forEach(function (t) {
                t.el.style.animationPlayState = live ? 'running' : 'paused';
            });
        }, {rootMargin: '100px 0px'});
        section.observe(host);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
