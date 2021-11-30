const domQry = selector => document.querySelector(selector);

const setDark = selector => {
  let el = typeof(selector) === 'string' ? domQry(selector) : selector;
  el.className += ' bg-dark text-light';
};

const shush = el => el.innerHTML = `🤐${el.innerHTML}🤐`;

const darken = () => {
  setDark('#root > div >.container-fluid');
  setDark('.card');
  setDark('body');

  let questionEl = domQry('.card-text');
  while (questionEl.firstChild) {
    questionEl.removeChild(questionEl.firstChild);
  }
  let secret = document.createElement('p');
  secret.appendChild(
    document.createTextNode('Hey! You found a secret! Instead of the answer you had, enter only the zipped mouth emoji (🤐) for bonus points.')
  );
  questionEl.appendChild(secret);

  let tags = domQry('#tags .card-body');
  if (tags) {
    tags.className = 'card-body bg-dark text-light';
  }

  let txtEls = document.querySelectorAll('label, h1, .card-footer button');
  for(var i = 0, txtCount = txtEls.length; i < txtCount; i++) {
    shush(txtEls[i]);
  }
};

const keyCodeStacks = function() {
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

  stacks.watch(
    [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a'
    ],
    darken
  );

  return {
    handle: stacks.handle
  };
}();

const keyHandler = evt => {
  evt.stopPropagation();
  keyCodeStacks.handle(evt.key);
}

export default keyHandler;
