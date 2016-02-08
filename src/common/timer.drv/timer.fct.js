/**
 * Created by pery on 07/02/2016.
 */
module.exports = angular.module(__filename,[])
    .factory('Timer', function ($rootScope,$timeout) {
        var _duration = Symbol('_duration');
        var _on = Symbol('_on');
        var _emit = Symbol('_emit');

        function Timer(durationText){
            var me = this;
            this[_on]= {};
            this[_emit]= {};
            this.state = {
                 pause : true
            };
            var previousCycle = new Date();

            /*generet events code*/
            var events = 'start,pause,reset,setduration,update,timeEnd'.split(',');
            events.forEach(function (eventName) {
                var queue = me[_on][eventName] = [];
                /*listeners*/
                me['on'+_.capitalize(eventName)] =  queue.push.bind(queue);
                /*emits*/
                me[_emit][eventName] = function () {
                    _.over(queue).apply(me,arguments);
                };
            });

            this.setDuration( durationText );
            cycle(updateTimer);
            /*cycle*/
            function cycle(callback){
                var time = Date.now();
                callback(time, previousCycle);
                previousCycle = time;
                requestAnimationFrame(cycle.bind(this,callback));
            }

            function updateTimer(time,prevTime){
                if(me.state.pause) return ;
                if(me.state.stop) return ;

                var timePass = time - prevTime;
                var duration = me[_duration];
                duration.subtract(timePass,'milliseconds');
                if( duration.asMilliseconds() <= 0 ){
                    duration.add(- duration.asMilliseconds() );
                    me.pause();
                    me.state.timeEnd = true;
                    me.state.stop = true;
                    me[_emit].timeEnd(duration)
                }
                me[_emit].update(duration);

                //!$rootScope.$$phase && $rootScope.$digest(); //bad way
                $timeout()//good way
            }
        }
        var events = 'reset'.split(',');
        _.extend(Timer.prototype,{
            setDuration: function setDuration( durationText ) {
                this.durationText = durationText ||  this.durationText;
                this[_duration] =  moment.duration( this.durationText );
                /*state*/
                this.state.timeEnd = false;
                /*event*/
                this[_emit].setduration( this[_duration] );
                this[_emit].update( this[_duration] )
            },
            start: function start(){
                /*state*/
                this.state.start = true;
                this.state.pause = false;
                this.state.stop = false;
                this.state.timeEnd = false;
                /*event*/
                this[_emit].start( this[_duration] );

            },
            pause: function pause () {
                //ga('create', 'UA-XXXXX-Y', 'auto', 'stop timter');
                //_trackEvent('timer', 'start', time)
                /*state*/
                this.state.start = false;
                this.state.pause = true;
                this.state.stop = false;
                this.state.timeEnd = false;
                /*event*/
                this[_emit].pause( this[_duration] );
            },
            reset: function reset(){
                this.setDuration();
                /*state*/
                this.state.start = false;
                this.state.pause = true;
                this.state.stop = true;
                this.state.timeEnd = false;

                this[_emit].reset( this[_duration] );
            },
            restart: function restart () {
                //ga('create', 'UA-XXXXX-Y', 'auto', 'start timer');
                this.reset();
                this.start();
            }
        });


        return Timer;
    });


/*****************
 ** WEBPACK FOOTER
 ** ./src/common/timer.drv/timer.fct.js
 ** module id = 133
 ** module chunks = 0
 **/