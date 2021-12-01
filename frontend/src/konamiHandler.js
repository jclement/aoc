const domQry = selector => document.querySelector(selector);

const recolour = selector => {
  let el = typeof(selector) === 'string' ? domQry(selector) : selector;
  el.className += ' bg-warning text-dark';
};

const shush = el => el.innerHTML = `🤐${el.innerHTML}🤐`;

const darken = () => {
  var body = domQry('body');
  if (body.className && body.className.length) {
    return;
  }

  recolour('#root > div >.container-fluid');
  recolour('.card');
  recolour('body');

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

const konamiSequence = [
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
];

export { darken, konamiSequence };
