(function() {
  const initPage = function() {
  };

  const checkSupport = function() {
    const link = document.createElement('link');
    const template = document.createElement('template');

    if ('registerElement' in document && 'import' in link && 'content' in template) {
      initPage();
      return;
    }

    const elem = document.createElement('script');
    elem.src = '/components/bower/webcomponentsjs/webcomponents-lite.min.js';
    elem.onload = initPage;

    document.head.appendChild(elem);
  };

  checkSupport();
})();
