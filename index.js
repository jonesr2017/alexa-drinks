'use strict';
var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers, handlers);
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

var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {

  'NewSession': function() {
    this.handler.state = '';
    this.emitWithState('NewSession'); // Equivalent to the Start Mode new session handler
  },

  'NumberGuessIntent': function() {
        var guessNum = parseInt(this.event.request.intent.slots.number.value);
        var targetNum = this.attributes['guessNumber'];

        console.log('user guessed: ' + guessNum);

        if(guessNum > targetNum){
            this.emit(':tell', 'Too high');
        } else if( guessNum < targetNum){
            this.emit(':tell', 'Too low');
        } else if (guessNum === targetNum){
            //this.emit(':tell', 'you got it');
            // With a callback, use the arrow function to preserve the correct 'this' context
            this.emit('JustRight', () => {
                this.emit(':ask', guessNum.toString() + 'is correct! Would you like to play a new game?',
                'Say yes to start a new game, or no to end the game.');
            });
        } else {
            this.emit('NotANum');
        }
    },

    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'I am thinking of a number between zero and one hundred, try to guess and I will tell you' +
            ' if it is higher or lower.', 'Try saying a number.');
    },

    'SessionEndedRequest': function () {
       console.log('session ended!');
       this.attributes['endedSessionCount'] += 1;
       this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
   },

   'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
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
