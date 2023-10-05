var TwinklGame = TwinklGame || {};

(function (tw) {

    Vue.component('title-screen', {
        props: {
            title: '',
            subtitle: '',
            letsGoText: {
                default: "Let's Go!",
                type: String
            },
            bgimage: {
                default: '',
                type: String
            },
            subtitleFilled: false,
            titleInverted: false,
            titleUndarkened: false,
            explore: false,
            logoColour: {
                default: 'White',
                type: String
            }
        },
        data: function () {
            return {}
        },
        methods: {
            letsgo: function () {
                this.$emit('letsgo');
            }
        },
        template:   // TODO - logo backing
            '<div class="title-screen" v-bind:style="{ backgroundImage: \'url(\' + bgimage + \')\' }" v-bind:class="{ \'explore\': explore }">\
                <div class="title-screen header">\
                    <span class="title-text" v-bind:class="{ \'undarken\': titleUndarkened, \'inverted\': titleInverted }">{{ title }}</span>\
                </div>\
                <div class="text-white title-subtext" v-show="subtitle.length > 0" v-bind:class="{ \'theme-text\': subtitleFilled }">{{ subtitle }}</div>\
                <div class="text-button lets-go" v-on:click="letsgo">{{ letsGoText }}</div>\
                <div class="title-logo-temp" v-bind:class="[ logoColour ]"></div>\
            </div>'
    });

    Vue.component('ingame-sidebar', {
        props: {
            hasMute: {
                type: Boolean,
                default: true
            },
            hasHelp: {
                type: Boolean,
                default: true
            },
            minimal: {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                fullscreen: false,
                muted: false,
                helping: false
            }
        },
        methods: {
            close: function () {
                this.$emit('close');
            },
            help: function () {
                this.helping = !this.helping;
                tw.Utils.track('help', (this.helping ? 1 : 0));
                this.$emit('help');
            },
            toggleFullscreen: function () {
                this.fullscreen = !this.fullscreen;
                this.$emit('fullscreen', this.fullscreen);
                if(this.fullscreen) tw.Utils.makeFullScreen();
                else tw.Utils.leaveFullScreen();
            },
            toggleMuted: function () {
                this.muted = !this.muted;
                if(window.Howler) Howler.mute(this.muted);
                this.$emit('mute', this.muted);
                tw.Utils.track(tw.Utils.eventNames.mute, (this.muted ? 1 : 0));
            }
        },
        template: '\
        <div class="go-navigation-bar" :class="{ \'minimal\': minimal }">\
            <div class="go-nav-panel theme-background-dark">\
                <div class="circle-buttons-container">\
                    <span class="font-button close" v-on:click="close" :class="{ \'inverted\': !minimal }"><span class="path1"></span><span class="path2"></span></span>\
                    <span class="font-button help" v-show="hasHelp" v-on:click="help" :class="{ \'inverted\': !minimal }"><span class="path1"></span><span class="path2"></span><span class="path3"></span></span>\
                    <slot></slot>\
                </div>\
                <div class="square-buttons-container">\
                    <span class="font-button" v-show="hasMute" v-bind:class="{\'sound-off\': !muted, \'sound-on\': muted, \'inverted\': !minimal}" v-on:click="toggleMuted()"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span></span>\
                    <span class="font-button" v-bind:class="{\'expand-screen\': !fullscreen, \'reduce-screen\': fullscreen, \'inverted\': !minimal}" v-on:click="toggleFullscreen()"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span></span>\
                </div>\
            </div>\
        </div>\
        \
        '
    });

    Vue.component('ingame-sidebar-top', {
        props: {
            content: '',
            hasHelp: {
                default: true,
                type: Boolean
            },
            hasReset: false,
            frosty: {
                default: true,
                type: Boolean
            },
            explore: false
        },
        data: function () {
            return {
                helping: false
            }
        },
        methods: {
            close: function () {
                this.$emit('close');
            },
            help: function () {
                this.helping = !this.helping;
                tw.Utils.track('help', (this.helping ? 1 : 0));
                this.$emit('help');
            },
            reset: function () {

            }
        },
        computed: {

        },
        template:
            '<div class="ingame-sidebar top" v-bind:class="{\'frosty\': frosty}">\
                <div style="width: 99%">\
                    <div class="button-backing" v-show="explore"></div>\
                    <!--<span class="font-button close" v-on:click="close"><span class="path1"></span><span class="path2"></span></span>-->\
                    <!--<span data-micromodal-trigger="help-modal" class="font-button help" v-on:click="help" v-show="hasHelp"><span class="path1"></span><span class="path2"></span><span class="path3"></span></span>-->\
                    <span class="font-button reset" v-on:click="reset" v-show="hasReset"><span class="path1"></span><span class="path2"></span></span>\
                    <slot></slot>\
                    <div v-html="content"></div>\
                </div>\
            </div>'
    });

    Vue.component('ingame-sidebar-bottom', {
        props: {
            content: '',
            hasMute: {
                type: Boolean,
                default: true
            },
            fullscreenContainerSelector: {
                type: String,
                default: ''
            }
        },
        data: function () {
            return {
                fullscreenContainerRef: null,
                fullscreen: false,
                muted: false
            }
        },
        methods: {
            toggleFullscreen: function () {
                this.fullscreen = !this.fullscreen;
                this.$emit('fullscreen', this.fullscreen);
                if(this.fullscreen) {
                    var fsEl = this.$parent.$el ? this.$parent.$el : undefined;
                    if(this.fullscreenContainerRef !== null) fsEl = this.fullscreenContainerRef;
                    tw.Utils.makeFullScreen(fsEl);
                }
                else tw.Utils.leaveFullScreen();
            },
            toggleMuted: function () {
                this.muted = !this.muted;
                if(window.Howler) Howler.mute(this.muted);
                this.$emit('mute', this.muted);
            }
        },
        mounted: function () {
            if(this.fullscreenContainerSelector.length > 0)
                this.fullscreenContainerRef = document.querySelector(this.fullscreenContainerSelector);
        },
        template:
            '<div class="ingame-sidebar bottom">\
                <div class="button-container">\
                    <span class="font-button" v-bind:class="{\'expand-screen\': !fullscreen, \'reduce-screen\': fullscreen}" v-on:click="toggleFullscreen()"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span></span>\
                    <span class="font-button" v-show="hasMute" v-bind:class="{\'sound-off\': !muted, \'sound-on\': muted}" v-on:click="toggleMuted()"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span></span>\
                </div>\
                <slot></slot>\
                <div v-html="content"></div>\
            </div>'
    });

    Vue.component('frosty-stack', {
        props: {
            content: {
                type: Array,
                default: function () {
                    return ['Score | 0', '02:00', '<span class="font-button difficulty easy"><span class="path1"></span><span class="path2"></span></span>']
                }
            }
        },
        data: function () {
            return {}
        },
        methods: {

        },
        template:
            '<div class="main-screen frosty-stack no-select no-events">\
                <div v-for="item in content" class="frosty-stacker theme-colour" v-html="item" v-show="item.length > 0"></div>\
            </div>'
    });

    Vue.component('pause-menu', {
        props: {
            titleText: {
                type: String,
                default: 'Game paused'
            },
            hasVolume: {
                type: Boolean,
                default: true
            },
            hasFullscreen: {
                type: Boolean,
                default: true
            },
            closeText: {
                type: String,
                default: 'Quit game'
            },
            backgroundUrl: {
                type: String,
                default: ''
            },
            autoPause: {
                type: Boolean,
                default: false
            },
            noEvents: {
                type: Boolean,
                default: true
            },
            options: {
                type: Array,
                default: function () {
                    return []
                }
            }
        },
        data: function () {
            return {
                paused: false,
                muted: false,
                idleTime: 0
            }
        },
        methods: {
            togglePause: function () {
                this.paused = !this.paused;
                if(window.Howler) Howler.volume(this.paused ? 0.5 : 1.0);
                if(window.Tone) Tone.Master.volume.value = this.paused ? -6 : 0;
                // dim elements outside ?
                this.$emit('pause', this.paused);
            },
            toggleMute: function () {
                this.muted = !this.muted;
                if(window.Howler) Howler.mute(this.muted);
                if(window.Tone) Tone.Master.mute = this.muted;
                this.$emit('mute', this.muted);
            },
            toggleFullscreen: function () {

            },
            close: function () {
                this.paused = false;
                this.$emit('close');
                tw.Utils.track('close');
            }
        },
        mounted: function () {
            // auto pause on tab change
            document.addEventListener('visibilitychange', function () {
                if(document.hidden && !this.paused && this.autoPause) this.togglePause();
            }.bind(this));
            // set up pause timer if left 5 min
            setInterval(function () {
                this.idleTime++;
                if(this.idleTime >= (5 * 60) && !this.paused && this.autoPause) this.togglePause();
            }.bind(this), 1000);
            var resetIdleTime = function () { this.idleTime = 0 }.bind(this);
            document.addEventListener('mousedown', resetIdleTime);
            document.addEventListener('keydown', resetIdleTime);
            document.addEventListener('touchstart', resetIdleTime);
        },
        template:
            '<div class="main-screen pause-menu-container" :class="{ \'no-events\': noEvents }">\
                <span class="font-button" v-on:click="togglePause" :class="paused ? \'play\' : \'pause\'"><span class="path1"></span><span class="path2"></span></span>\
                <div class="pause-menu backgrounded" v-show="paused" :style="{ \'background-image\': \'url(\' + backgroundUrl + \')\' }" :class="{ \'pause-menu-custom-back\': backgroundUrl.length > 0 }">\
                    <div class="pause-menu-title theme-colour-dark no-select">{{ titleText }}</div>\
                    <div class="text-button" v-on:click="togglePause">\
                        <span class="pause-icon"><span class="font-button play"><span class="path1"></span><span class="path2"></span></span></span>\
                        <span class="pause-text-area flex-vert-center"><span class="pause-text">Resume</span></span>\
                    </div>\
                    <div class="text-button" v-on:click="toggleMute" v-if="hasVolume">\
                        <span class="pause-icon"><span class="font-button sound-off"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span></span></span>\
                        <span class="pause-text-area flex-vert-center"><span class="pause-text">Volume</span></span>\
                    </div>\
                    <div class="text-button" v-on:click="toggleFullscreen" v-if="hasFullscreen">\
                        <span class="pause-icon"><span class="font-button expand-screen"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span></span></span>\
                        <span class="pause-text-area flex-vert-center"><span class="pause-text">Fullscreen</span></span>\
                    </div>\
                    <div class="text-button" v-for="option in options" v-on:click="option.handler">\
                        <span class="pause-icon"><span class="font-button" :class="option.icon"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span></span></span>\
                        <span class="pause-text-area flex-vert-center"><span class="pause-text">{{ option.text }}</span></span>\
                    </div>\
                    <div class="text-button" v-on:click="close">\
                        <span class="pause-icon"><span class="font-button close"><span class="path1"></span><span class="path2"></span></span></span>\
                        <span class="pause-text-area flex-vert-center"><span class="pause-text">{{ closeText }}</span></span>\
                    </div>\
                </div>\
                <slot name="extra"></slot>\
            </div>'
    });

    Vue.component('jodal', {
        props: {
            visible: {
                default: false,
                type: Boolean
            },
            title: {
                default: 'How to play:',
                type: String
            },
            content: {
                default: '',
                type: String
            },
            playable: {
                default: true,
                type: Boolean
            },
            closeable: false,
            differentiated: false,
            buttontext: {
                default: 'Play',
                type: String
            },
            backgroundUrl: {
                default: '',
                type: String
            }
        },
        data: function () {
            return {}
        },
        methods: {
            selectDifficulty: function (difficulty) {
                this.$emit('difficulty', difficulty);
            },
            play: function () {
                this.$emit('play');
            },
            close: function () {
                this.$emit('close');
            }
        },
        template:
            '<transition name="jodal">\
                <div class="jodal" v-show="visible">\
                    <div class="jodal-back backgrounded" :style="{ \'background-image\': \'url(\' + backgroundUrl + \')\' }" :class="{ \'jodal-custom-back\': backgroundUrl.length > 0 }"></div>\
                    <span class="font-button close" v-on:click="close" v-show="closeable"><span class="path1"></span><span class="path2"></span></span>\
                    <span class="jodal-title">{{ title }}</span>\
                    <span class="jodal-text">\
                        <slot>Can you solve the puzzle of Fibonacci\'s very unusual clock?</slot>\
                        <span v-html="content"></span>\
                        <span class="font-button difficulty easy" v-show="differentiated" v-on:click="selectDifficulty(\'easy\')"><span class="path1"></span><span class="path2"></span></span>\
                        <span class="font-button difficulty medium" v-show="differentiated" v-on:click="selectDifficulty(\'medium\')"><span class="path1"></span><span class="path2"></span><span class="path3"></span></span>\
                        <span class="font-button difficulty hard" v-show="differentiated" v-on:click="selectDifficulty(\'hard\')"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span></span>\
                    </span>\
                    <div class="text-button jodal-main-button" v-show="!differentiated && playable" v-on:click="play">{{ buttontext }}</div>\
                </div>\
            </transition>'
    });

    Vue.component('ipad-keypad', {
        props: {
            calculatorlayout: {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                value: '',
                visible: true,
                larr: '&larr;'
            }
        },
        methods: {
            toggleHidden: function () {
                this.visible = !this.visible;
            },
            press: function (e) {
                if(e.target.tagName === 'INPUT') {
                    switch(e.target.value) {
                        case '<':
                            this.$emit('keypad-backspace');
                            this.value = this.value.slice(0, this.value.length - 1);
                            break;
                        case 'Enter':
                            this.$emit('keypad-enter', this.value);
                            break;
                        default:
                            this.$emit('keypad-number', Number(e.target.value));
                            this.value += Number(e.target.value);
                            break;
                    }
                }
            }
        },
        template:
            '<div v-show="visible" class="ipad-keypad" v-on:click="press">\
                <input class="keypad-btn theme-background" type="button" v-bind:value="calculatorlayout ? \'7\' : \'1\'">\
                <input class="keypad-btn theme-background" type="button" v-bind:value="calculatorlayout ? \'8\' : \'2\'" />\
                <input class="keypad-btn theme-background" type="button" v-bind:value="calculatorlayout ? \'9\' : \'3\'" /><br/>\
                <input class="keypad-btn theme-background" type="button" value="4" />\
                <input class="keypad-btn theme-background" type="button" value="5" />\
                <input class="keypad-btn theme-background" type="button" value="6" /><br/>\
                <input class="keypad-btn theme-background" type="button" v-bind:value="calculatorlayout ? \'1\' : \'7\'" />\
                <input class="keypad-btn theme-background" type="button" v-bind:value="calculatorlayout ? \'2\' : \'8\'" />\
                <input class="keypad-btn theme-background" type="button" v-bind:value="calculatorlayout ? \'3\' : \'9\'" /><br/>\
                <input class="keypad-btn backspace theme-background" alt="<" type="image" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik00MTMuNDQyIDMzMi4zMDdhOC4wMDcgOC4wMDcgMCAwIDEgMi4zNzIgNS43MSA3Ljk4NCA3Ljk4NCAwIDAgMS0yLjM3MiA1LjcwN2wtMjEuODIzIDIxLjkwNWE3Ljk3MyA3Ljk3MyAwIDAgMS01LjY5MSAyLjM3MWMtMi4wNzEgMC00LjEzOC0uNzg1LTUuNjk1LTIuMzcxbC03Ni4yMy03Ni40NjEtNzYuMjMgNzYuNDYxYTcuOTQ3IDcuOTQ3IDAgMCAxLTUuNjk1IDIuMzcxIDcuOTc1IDcuOTc1IDAgMCAxLTUuNjkyLTIuMzcxbC0yMS44MjQtMjEuOTA1YTcuOTkgNy45OSAwIDAgMS0yLjM3My01LjcwN2MwLTIuMTQ4Ljg0Ni00LjIgMi4zNzMtNS43MUwyNzEuMDk4IDI1NmwtNzYuNzM4LTc2LjI5N2MtMy4xNDYtMy4xNTMtMy4xNDYtOC4yNzMgMC0xMS40MjdsMjEuODA3LTIxLjkxOWE4LjA0OCA4LjA0OCAwIDAgMSA1LjY5Ni0yLjM1N2MyLjE1MiAwIDQuMTg5Ljg0NyA1LjY5MSAyLjM1N2w3Ni40NDggNzUuNTMzIDc2LjQ0Ny03NS41MzNhOC4wMDYgOC4wMDYgMCAwIDEgNS42OTMtMi4zNTdjMi4xNDMgMCA0LjE3OS44NDcgNS42OTUgMi4zNTdsMjEuODA3IDIxLjkxOWMzLjE0NiAzLjE1MyAzLjE0NiA4LjI3MyAwIDExLjQyN0wzMzYuOTA0IDI1Nmw3Ni41MzggNzYuMzA3eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik00OTguOTQxIDkzLjU1OUM0OTAuMDM3IDg0LjY1NCA0NzguNjk2IDgwIDQ2NS44NzUgODBIMTY4Yy0yNC4zMDMgMC00My43MTcgOS40MDItNTcuNzA2IDI4LjQ0MUwwIDI1NS45MzhsMTEwLjQgMTQ2LjUyOC4xOC4yMzEuMTg0LjIzMmM2LjkwNCA4Ljg1NSAxNC40MjQgMTUuNzAxIDIyLjk5IDIwLjQxN0MxNDMuODgzIDQyOC45MjQgMTU1LjQwNSA0MzIgMTY4IDQzMmgyOThjMjYuMTkxIDAgNDYtMjIuMjU3IDQ2LTQ5VjEyN2MwLTEyLjgyMS00LjE1NC0yNC41MzctMTMuMDU5LTMzLjQ0MXpNNDgwIDM4M2MwIDguODM3LTUuMTYzIDE3LTE0IDE3SDE2OGMtMTUuMTY3IDAtMjQuMzMzLTYuNjY2LTMyLTE2LjVMNDAgMjU2bDk2LTEyOC40MzhjOS41LTEzIDIxLjE2Ny0xNS41NjIgMzItMTUuNTYyaDI5Ny41YzguODM3IDAgMTQuNSA2LjE2MyAxNC41IDE1djI1NnoiLz48L3N2Zz4=" value="<" title="Backspace" />\
                <input class="keypad-btn theme-background" type="button" value="0" />\
                <input class="keypad-btn enter theme-background" type="button" value="Enter" title="Enter" />\
            </div>'
    });

    Vue.component('play-audio-button', {
        props: ['src'],
        methods: {
            playSound: function () {

                this.$emit('play');

                if(this.src && window.Howl) {
                    var sound = new Howl({
                        src: [this.src],
                        autoplay: true
                    });

                    sound.on('end', function () {
                        sound.unload();
                    });
                }
            }
        },
        template:
            '<div class="text-button play-sound flex-vert-center" v-on:click="playSound">\
                <span class="play-sound-inner">\
                    <span class="flex-vert-center">Click to listen.</span>\
                    <img src="data:image/svg+xml;base64,CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjQ0cHgiIGhlaWdodD0iNDRweCIgdmlld0JveD0iMCAwIDQ0IDQ0Ij4KPGRlZnM+CjxnIGlkPSJMYXllcjBfMF9NRU1CRVJfMF9GSUxMIj4KPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSJub25lIiBkPSIKTSAzNCAxNwpRIDM0IDEwIDI5IDUgMjQgMCAxNyAwIDkuOTUgMCA1IDUgMCAxMCAwIDE3IDAgMjQuMDUgNSAyOS4wNSA5Ljk1IDM0IDE3IDM0IDI0IDM0IDI5IDI5LjA1IDM0IDI0LjA1IDM0IDE3Ck0gMjYuOSA3LjEKUSAzMSAxMS4yNSAzMSAxNyAzMSAyMi44IDI2LjkgMjYuOSAyMi44IDMxIDE3IDMxIDExLjIgMzEgNy4xIDI2LjkgMyAyMi44IDMgMTcgMyAxMS4yIDcuMSA3LjEgMTEuMiAzIDE3IDMgMjIuOCAzIDI2LjkgNy4xIFoiLz4KPC9nPgoKPGcgaWQ9IkxheWVyMF8wX01FTUJFUl8xX0ZJTEwiPgo8cGF0aCBmaWxsPSIjRkZGRkZGIiBzdHJva2U9Im5vbmUiIGQ9IgpNIDI2LjA1IDE3ClEgMjYuMTUgMTYuMyAyNS40IDE1LjkKTCAxMy4zIDkuMQpRIDEyLjk1IDguOSAxMi42NSA4LjkgMTIuMTUgOC45IDExLjcgOS4yNSAxMS4zIDkuNjUgMTEuMyAxMC4yCkwgMTEuMyAyMy44NQpRIDExLjMgMjQuNDUgMTEuNyAyNC43NSAxMi4xIDI1LjE1IDEyLjY1IDI1LjE1IDEyLjggMjUuMTUgMTMuMyAyNC45NQpMIDI1LjQgMTguMTUKUSAyNi4xNSAxNy43NSAyNi4wNSAxNyBaIi8+CjwvZz4KPC9kZWZzPgoKPGcgdHJhbnNmb3JtPSJtYXRyaXgoIDEuMjU3MzI0MjE4NzUsIDAsIDAsIDEuMjU3MzI0MjE4NzUsIDAuNzUsMC41KSAiPgo8dXNlIHhsaW5rOmhyZWY9IiNMYXllcjBfMF9NRU1CRVJfMF9GSUxMIi8+CjwvZz4KCjxnIHRyYW5zZm9ybT0ibWF0cml4KCAxLjI1NzMyNDIxODc1LCAwLCAwLCAxLjI1NzMyNDIxODc1LCAwLjc1LDAuNSkgIj4KPHVzZSB4bGluazpocmVmPSIjTGF5ZXIwXzBfTUVNQkVSXzFfRklMTCIvPgo8L2c+Cjwvc3ZnPgo=" alt="play">\
                </span>\
            </div>'
    });

    Vue.component('go-burn', {
        props: [],
        template:
            '<div class="go-burn-container">\
                <img id="go-burn" src="/assets/svg/logo/Twinkl-Burn.svg">\
            </div>'
    });

    Vue.component('preloader', {
        props: {
            preloaded: {
                default: false,
                type: Boolean
            }
        },
        data: function () {
            return {
                // preloaded: false
            }
        },
        template:
            '<div id="preload-div" v-bind:class="{ loading: !preloaded }">\
                <span style="display: inline-block; height: 100%; vertical-align: middle;"></span>\
                <img src="/assets/twinkl_preloader.gif" style="vertical-align: middle; max-height: 100%">\
            </div>',
        // mounted: function () {
        //     this.preloaded = true;
        // }
    });

    var comp = Vue.component('interactive-resource', {
        data: function () {
            return {
                stage: 'title'
            }
        },
        template: '<div v-show="stage === \'title\'"></div><div v-show="stage === \'main\'"></div>'
    });

// console.log(comp);

// how to handle variable number of pages, each containing diff content ? some will be constant eg title + result screen, but rest will be diff

})(TwinklGame);
