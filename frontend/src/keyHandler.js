const keyCodeStacks = function(eggs) {
  // eggs: [
  //   {
  //     sequence: [
  //       's',
  //       'e',
  //       'c',
  //       'r',
  //       'e',
  //       't'
  //     ],
  //     handler: evt => { do something cool }
  //   }
  // ]

  var makeWatcher = function(sequence, easterEggHandler) {
    var _seqLen = sequence.length;
    if (typeof(sequence) === 'string') {
      var seqArr = [];
      for(var i = 0; i < _seqLen; i++) {
        seqArr.push(sequence.charAt(i));
      }
      sequence = seqArr;
    }
    var _seqCursor = 0;
    var _reset = () => _seqCursor = 0;

    var _handleKey = (key, onReset) => {
      if (key === sequence[_seqCursor]) {
        if (++_seqCursor === _seqLen) {
          easterEggHandler();
          _reset();
        }
      } else {
        _reset();

        // The key that breaks the sequence may be the start of this sequence
        // Ensure we don't loop forever
        if (!onReset) {
          _handleKey(key, true);
        }
      }
    };

    return {
      handle: _handleKey,
      reset: _reset
    };
  };

  var stacks = function() {
    var _stacks = [];
    var _addToStack = (sequence, easterEggHandler) => {
      _stacks.push(makeWatcher(sequence, easterEggHandler));
    };

    var _timer = null;
    var _resetAll = () => _stacks.forEach(stack => stack.reset());

    var _handleAll = key => {
      // set up clear after 2s
      if (_timer !== null) {
        window.clearTimeout(_timer);
      }
      _timer = window.setTimeout(_resetAll, 2000);

      // notify all known stacks
      _stacks.forEach(stack => stack.handle(key));
    };

    return {
      watch: _addToStack,
      handle: _handleAll
    };
  }();

  eggs.forEach(e => stacks.watch( e.sequence, e.handler ));

  return {
    handle: stacks.handle
  };
};

export default keyCodeStacks;
