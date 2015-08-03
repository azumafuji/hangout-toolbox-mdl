(function (global) {
  "use strict";

  function App() {
    var
      hapi,
      document = global.document,
      console = global.console,
      mainCanvas = null.
      backgroundCanvas = null,
      imageCanvas = null,
      overlays = {},
      i;
      
    if (global.gapi && global.gapi.hangout) {
      hapi = global.gapi.hangout;
    } else {
      console.log("Hangout API not found...");
      return;
    }
    
    function mirrorVideo() {
      hapi.av.setLocalParticipantVideoMirrored(!gapi.hangout.av.isLocalParticipantVideoMirrored());
    }
    
    function getParticipantName() {
      var uid = hapi.getLocalParticipantId();
      var p = hapi.getParticipants();
      for(i = 0; i < p.length; i++) {
        if(p[i].id == uid){
          var user = p[i].person.displayName;
          return user;
        }
      }
    }
    
    function getParticipantImageUrl() {
      var uid = hapi.getLocalParticipantId();
      var p = hapi.getParticipants();
      for(i = 0; i < p.length; i++) {
        if(p[i].id == uid){
          var url = p[i].person.image.url;
          return url;
        }
      }
    }
    
    function createBackground() {
      console.log("creating background");
      
      var pcolor = '#3F51B5';
      var scolor = '#303F9F';
      var fcolor = '#fff';
      backgroundctx.clearRect(0,0,1280,720);
      backgroundctx.fillStyle = pcolor;
      backgroundctx.fillRect(0,600,1024,60);
      backgroundctx.fillStyle = scolor;
      backgroundctx.fillRect(0,660,1024,30);
      //Text
      backgroundctx.font = "300 42px RobotoDraft";
      backgroundctx.fillStyle = fcolor;
      backgroundctx.fillText(document.getElementById('displayname').value,160,645);
  
      backgroundctx.font = "300 22px RobotoDraft";
      backgroundctx.fillStyle = fcolor;
      backgroundctx.fillText(document.getElementById('tagline').value,160,682);
  
      backgroundUrl = backgroundCanvas.toDataURL();
     
      mainctx.clearRect(0,0,1280,720);
      mainctx.drawImage(backgroundCanvas, 0, 0);
    }

    function createProfileCircle(src) {
      console.log("creating profile pic");

      var img = new Image();
      img .setAttribute('crossOrigin', 'anonymous');
      img.onload = function(){ 
        imagectx.clearRect(0,0,1280,720); 
        imagectx.save();  
        imagectx.beginPath();
        imagectx.arc(78, 598, 48, 0, Math.PI*2,true);
        imagectx.clip();
        imagectx.drawImage(img,30,550,96,96);
        mainctx.drawImage(imageCanvas, 0, 0);
      
        console.log(mainCanvas.toDataURL());
        var canvasImage = hapi.av.effects.createImageResource(mainCanvas.toDataURL());
            
        overlays['lowerthird'] = canvasImage.createOverlay({});
        overlays['lowerthird'].setScale(1, hapi.av.effects.ScaleReference.WIDTH);
        overlays['lowerthird'].setPosition(0, 0);
        overlays['lowerthird'].setVisible(true);
      };
      img.src = src;
    }
    
    function toggleLOwerThird() {
      createBackground();
      createProfileCircle(getParticipantImageUrl);
    }
    
    function initialize() {
	    mainCanvas = document.getElementById("mainCanvas");
      backgroundCanvas = document.getElementById("backgroundCanvas");
      imageCanvas = document.getElementById("imageCanvas");
      mainctx = mainCanvas.getContext("2d");
      backgroundctx = backgroundCanvas.getContext("2d");
      imagectx = imageCanvas.getContext("2d");

      document.getElementById("tt1").onclick = mirrorVideo;
      document.getElementById("switch-1").onclick = toggleLowerThird;
      document.getElementById("displayname").value = getParticipantName();
      $('#displaynamediv').addClass('is-dirty');
    }
    
    hapi.onApiReady.add(function (e) {
      if (e.isApiReady) {
        console.log("Hangout API ready!");
        global.setTimeout(initialize, 1);
      }
    });
  }

  global.hangoutapp = new App();
 
}(this));