(function() {
  window.xyz = window.xyz || {};

  // slightly adapated from http://www.fun-stuff-to-do.com/wittyquips.html
  const QUIPS = [
    'What happens on the farm, stays on the farm',
    'Miracle eggs for sale - if it is a good one, it is a miracle',
    'Do not sit, stand or climb on the fences. The animals might eat you and they will get sick',
    'The insane are at play, please stay close to the doors',
    'With one person sufferring from a delusion it is called insanity, with many it is called normality',
    'Keep dangerous weapons out of the hands of fools, starting with keyboards',
    'The biggest argument against democracy is a five minute discussion with the average voter',
    'The brain digests philosophy into folly, science into superstition, and art into pedantry',
    'Learning is not compulsory, neither is survival',
    'We learn from experience that men never learn anything from experience',
    'There is more stupidity than hydrogen in the universe, and it has a longer shelf life',
    'If you cannot convince them, confuse them',
    'All right everyone, line up alphabetically according to your height',
    'Good judgment comes from experience, and often experience comes from bad judgment',
    'You look into his eyes, and you get the feeling someone else is driving',
    'Advice is what we ask for when we already know the answer but wish we didn\'t',
    'If you cannot get rid of the family skeleton, you may as well make it dance',
    'Ordinarily he is insane. But he has lucid moments when he is only stupid',
    'He was about as useful in a crisis as a sheep',
    'In any contest between power and patience, bet on patience',
    'Show me a sane man and I will cure him for you',
    'Never wear anything that panics the cat',
    'My Father had a profound influence on me, he was a lunatic',
    'If two wrongs don\'t make a right, try three',
    'It is even harder for the average ape to believe that he has descended from man',
    'My computer might beat me at checkers, but I sure beat it at kickboxing',
    'I like long walks, especially when they are taken by people who annoy me',
    'Everything in life is luck',
    'Life consists not in holding good cards but in playing those you hold well',
    'The perfectly normal person is very rare in our civilization',
    'When we remember we are all mad, the mysteries disappear and life stands explained',
    'You will never plough a field if you only turn it over in your mind'
  ];

  window.xyz.Quip = {
    ready: function() {
      this.quip = `... ${QUIPS[_.random(QUIPS.length - 1)]}`;
    }
  };

  Polymer({ // eslint-disable-line new-cap
    is: 'xyz-quip',
    behaviors: [window.xyz.Quip]
  });
})();
