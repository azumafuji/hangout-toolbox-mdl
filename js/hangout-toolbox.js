(function (global) {
  "use strict";

  function App() {
    var
      hapi,
      document = global.document,
      console = global.console,
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
    
    function initialize() {
      document.getElementById("tt1").onclick = mirrorVideo;
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