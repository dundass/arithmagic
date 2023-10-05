var TwinklGame = TwinklGame || {};

(function (tw) {

    tw.mixins = {

        goFontResize: {
            data: function () {
                return {
                    isFullscreen: false,
                    screenIsSmall: true
                }
            },
            created: function () {
                if(typeof $ === 'undefined') console.error('it\'s all over, you\'ve got to include jQuery in your <head>');

                window.onresize = this.resizeHandler;

                var scope = this;

                $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function () {
                    scope.isFullscreen = !scope.isFullscreen;
                    // tw.Utils.track('fullscreen', (scope.isFullscreen ? 1 : 0));
                    scope.resizeHandler();
                });

                Vue.nextTick(function () {
                    scope.resizeHandler.call(scope);
                });

                // $('.expand-screen').on('click')
            },
            methods: {
                resizeHandler: function () {

                    // console.log('fired')

                    var smallDisplay = true;

                    if(window.innerWidth >= 1200) smallDisplay = false; // old = 1184

                    if(this.isFullscreen) smallDisplay = true;

                    if(smallDisplay !== this.screenIsSmall) {
                        this.screenIsSmall = !this.screenIsSmall;
                        if(this.screenIsSmall) {
                            tw.Utils.removeClass(this.$el, 'interactive-large');
                        } else {
                            tw.Utils.addClass(this.$el, 'interactive-large');
                        }

                    }

                },
                toggleFullscreen: function () {
                    if(this.isFullscreen) tw.Utils.makeFullScreen(document.getElementById('wrapper'));
                    else tw.Utils.leaveFullScreen();
                }
            }
        },

        getAsset: {
            methods: {
                getAssetUrl: function (key, fromObject) {
                    return tw.Utils.getAssetUrl(key, fromObject);
                },
                getConfigAssetUrl: function (assetObject) {
                    return tw.Utils.getConfigAssetUrl(assetObject);
                }
            }
        },

        capitalise: {
            methods: {
                capitalise: function (word) {
                    return tw.Utils.capitalise(word);
                }
            }
        },

        timer: {
            data: function () {
                return {
                    timerData: {
                        timerID: null,
                        timeLeft: 1,
                        paused: false
                    }
                }
            },
            computed: {
                timeString: function () {
                    return tw.Utils.mmss(this.timeNumber);
                },
                timeNumber: function () {
                    return Math.ceil(this.timerData.timeLeft);
                }
            },
            methods: {
                startTimer: function (seconds, finishedCallback, focusElement) {
                    seconds = seconds || 60;
                    finishedCallback = finishedCallback || tw.Utils.noOp;
                    this.timerData.timeLeft = seconds;
                    this.timerData.paused = false;
                    var scope = this;

                    if(tw.Utils.canAutofocus() && typeof focusElement !== 'undefined') {
                        Vue.nextTick(function () {
                            focusElement.focus();
                        });
                    }
                    scope.clearTimer();

                    scope.timerData.timerID = setInterval(function () {

                        if(!scope.timerData.paused) scope.timerData.timeLeft -= 0.02;

                        if(scope.timerData.timeLeft <= 0) {
                            scope.clearTimer();
                            if(typeof finishedCallback === 'function') finishedCallback();
                        }
                    }, 20);

                },
                clearTimer: function () {
                    this.resumeTimer();
                    if(this.timerData.timerID !== null) {
                        clearInterval(this.timerData.timerID);
                    }
                },
                pauseTimer: function () {
                    this.setTimerPaused(true);
                },
                resumeTimer: function () {
                    this.setTimerPaused(false);
                },
                setTimerPaused: function (paused) {
                    this.timerData.paused = paused;
                },
                getTimerPaused: function () {
                    return this.timerData.paused;
                },
                getTimerTime: function () {
                    return this.timeNumber;
                },
                getTimerTimeFloat: function () {
                    return this.timerData.timeLeft;
                }
            }
        }
    }

})(TwinklGame);