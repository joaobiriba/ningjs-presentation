var sceneCache = {};

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyApQY-Ley5-D5u3zvFmSENla8aUf22nUX0",
    authDomain: "aframepresent.firebaseapp.com",
    databaseURL: "https://aframepresent.firebaseio.com",
    storageBucket: "aframepresent.appspot.com",
    messagingSenderId: "966908679025"
  };
  firebase.initializeApp(config);
  var ref = firebase.database().ref();

// https://github.com/hakimel/reveal.js#configuration
Reveal.initialize({
  history: true,
  // https://github.com/hakimel/reveal.js#dependencies
  dependencies: [
    {src: 'src/vendor/plugin/markdown/marked.js'},
    {src: 'src/vendor/plugin/markdown/markdown.js'},
    {src: 'src/vendor/plugin/notes/notes.js', async: true},
    {src: 'src/vendor/plugin/highlight/highlight.js', async: true, callback: function () {
      hljs.initHighlightingOnLoad();
    }}
  ],
  margin: 0,
  showNotes: false
});

// 'slidechanged' event listener to update the firebase JSON whenever there is a change in slide.
// This can be further improved to have firebase authentication to restrict slide update only by the presenter.
Reveal.addEventListener( 'slidechanged', function( event ) {
  ref.set({currentslideX : Reveal.getState().indexh,
         currentslideY : Reveal.getState().indexv
        })
});

// Fix Markdown wrapping <img> in <p>.
fixWrappedImages();
Reveal.addEventListener('ready', fixWrappedImages);
Reveal.addEventListener('slidechanged', fixWrappedImages);
function fixWrappedImages () {
  var imgs = document.querySelectorAll('section > p > img');
  for (var i = 0; i < imgs.length; i++) {
    var img = imgs[i];
    var p = img.parentNode;
    var section  = p.parentNode;
    section.insertBefore(img, p);
    section.removeChild(p);
  }
  console.log("Slide changed event");
}

// Whenever there is a change in slide position, the same will be updated in the client using Reveal.slide() function .
ref.on("value", function(snapshot) {
  Reveal.slide(snapshot.val().currentslideX,snapshot.val().currentslideY);
  console.log("slide changed received");
});
/**
 * Fetch all scenes.
 */
function fetchScenes () {
  var i;
  var scenes;
  var src;

  scenes = document.querySelectorAll('[data-aframe-scene]');
  for (i = 0; i < scenes.length; i++) {
    // Fetch scene from external file.
    src = scenes[i].dataset.aframeScene;
    if (sceneCache[src]) { continue; }

    req = new XMLHttpRequest();
    sceneCache[src] = new Promise(function (resolve) {
      req.addEventListener('load', function () {
        resolve(this.responseText);
      });
      req.open('GET', src);
      req.send();
    });
  }
}

// Initialize A-Frame scenes.
Reveal.addEventListener('slidechanged', function sceneResize (evt) {
  var i;
  var req;
  var sceneContainer;
  var scenes;
  var src;

  sceneContainer = evt.currentSlide.querySelector('[data-aframe-scene]');
  if (!sceneContainer) { return; }

  // Remove all scenes on slide change to only render one scene at a time.
  scenes = document.querySelectorAll('a-scene');
  for (i = 0; i < scenes.length; i++) { scenes[i].parentNode.removeChild(scenes[i]); }

  // Grab scene HTML.
  fetchScenes();
  sceneCache[sceneContainer.dataset.aframeScene].then(function (sceneHTML) {
    setTimeout(function () {
      sceneContainer.innerHTML = sceneHTML;
    }, 800);
  });
});
