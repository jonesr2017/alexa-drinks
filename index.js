'use strict';
var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers handlers);
    alexa.execute();
};

var states = {
  GUESSMODE: '_GUESSMODE',
  STARTMODE: '_STARTMODE'
};

var newSessionHandlers = {
  'NewSession': function() {
    this.handler.state = states.STARTMODE;
    this.emit(':ask', 'Welcome to the Number Game. Would you like to play?')
  }
};

var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE,{
  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession'); // Equivalent to the Start Mode new session handler
  },

  'NumberGuessIntent': function() {
        var guessNum = parseInt(this.event.request.intent.slots.number.value);
        var targetNum = this.attributes['guessNumber'];

        console.log('user guessed: ' + guessNum);

        if(guessNum > targetNum){
            this.emit('TooHigh', guessNum);
        } else if( guessNum < targetNum){
            this.emit('TooLow', guessNum);
        } else if (guessNum === targetNum){
            // With a callback, use the arrow function to preserve the correct 'this' context
            this.emit('JustRight', () => {
                this.emit(':ask', guessNum.toString() + 'is correct! Would you like to play a new game?',
                'Say yes to start a new game, or no to end the game.');
            });
        } else {
            this.emit('NotANum');
        }
    }
});

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
  'NewSession': function() {
    this.emit('NewSession');
  },

  'AMAZON.HelpIntent': function() {
    var message = "This is the help message";
    this.emit(':ask', message, message);
  },

  'AMAZON.YesIntent': function() {
    this.attributes['guessNumber'] = Math.floor(Math.random() * 100);
    this.handler.state = states.GUESSMODE;
    this.emit(':ask', 'Great! ' + 'Try saying a number to start the game.', 'Try saying a number.');
  }


});

var handlers = {

    'HelloWorldIntent': function () {
        this.emit(':tell', 'Hello World!');
    }

};
