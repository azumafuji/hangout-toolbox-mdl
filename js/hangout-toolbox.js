(function (global) {
  "use strict";

  function App() {
    var
      hapi,
      document = global.document,
      console = global.console,
      mainCanvas = null,
      backgroundCanvas = null,
      imageCanvas = null,
      overlays = {},
      globalMuted = false,
      i, mainctx, backgroundctx, imagectx, backgroundUrl;
      
    if (global.gapi && global.gapi.hangout) {
      hapi = global.gapi.hangout;
    } else {
      console.log("Hangout API not found...");
      return;
    }
    /*
    ####################### LOWER THIRD ############################
    */
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
      backgroundctx.font = "42px Arial";
      backgroundctx.fillStyle = fcolor;
      backgroundctx.fillText(document.getElementById('displayname').value,160,645);
  
      backgroundctx.font = "22px Arial";
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
      
        var canvasImage = hapi.av.effects.createImageResource(mainCanvas.toDataURL());
            
        overlays['lowerthird'] = canvasImage.createOverlay({});
        overlays['lowerthird'].setScale(1, hapi.av.effects.ScaleReference.WIDTH);
        overlays['lowerthird'].setPosition(0, 0);
        overlays['lowerthird'].setVisible(true);
      };
      img.src = src;
    }
    
    function toggleLowerThird() {
      if($('#switch-1-label').hasClass('is-checked') === true) {
        if(overlays['lowerthird']){
          console.log("Removing overlay");
          overlays['lowerthird'].setVisible(false);
          overlays['lowerthird'].dispose();
          delete overlays['lowerthird'];
        }
      } else {
        createBackground();
        var imageUrl = getParticipantImageUrl();
        createProfileCircle(imageUrl);
      }
    }
    
    /*
    ####################### VOLUME CONTROL ###################
    */
    
    function generateParticipantList() {
      var uid = hapi.getLocalParticipantId();
  	  var p   = hapi.getParticipants();
  	  var plist  = jQuery("#participant-list");
  	  jQuery("div",plist).remove();
  	  for(i = 0; i < p.length; i++) {
  	    var cUser = p[i];
  	    var pitemdiv = createElement("div", {"id": "participant_" + cUser.id, "class":"participant-item"}).data("participant",cUser);
  	    var pimagediv = createElement("div", {"class": "participant-image"});
  	    var pimage = createElement("img", {"src": cUser.person.image.url, "title": cUser.person.displayName, "class": "circle"}).appendTo(pimagediv);
  	    var pcontrolsdiv = createElement("div", {"class": "participant-controls"});
  	    var slider = document.createElement('input');
  	    slider.className = "mdl-slider mdl-js-slider";
  	    slider.setAttribute("type", "range");
  	    slider.setAttribute("min", "0");
  	    slider.setAttribute("max", "2");
  	    slider.setAttribute("id", cUser.id);
  	    slider.setAttribute("step", "0.1");
  	    slider.setAttribute("value", hapi.av.getParticipantAudioLevel(cUser.id)[0]);
  	   // componentHandler.upgradeElement(slider);
  	    pcontrolsdiv.append(slider);
  	    pitemdiv.append(pimagediv);
  	    pitemdiv.append(pcontrolsdiv);
  	    plist.append(pitemdiv);
  	    componentHandler.upgradeElement(slider);
  	    slider.addEventListener("change", onSliderChange);
  	  }
    }
    
    function onSliderChange(evt) {
      console.log(evt);
      var level = evt.target.value;
      var id = evt.target.id;
      if(level < 1){
		    level = parseFloat(level);
		    gapi.hangout.av.setParticipantAudioLevel(id, level);
    	}else{
    		if(level < 1.9){
    			level = ((level - 1) * 10) + 1;	
    		}else{
    			level = ((level - 1) * 10);
    		}
    		gapi.hangout.av.setParticipantAudioLevel(id, level);
    	}
    }
  
    function createElement(type, attr) {
	    return jQuery("<" + type + ">").attr(attr || {});
    }
    
    function initialize() {
      gapi.hangout.onParticipantsChanged.add(generateParticipantList);
      mainCanvas = $('<canvas id="mainCanvas" height="720px" width="1280px" style="font-family: Roboto, arial, sans-serif; font-size: 42px;"/>');
      mainCanvas = mainCanvas.get(0);
      backgroundCanvas = $('<canvas id="backgroundCanvas" height="720px" width="1280px"  style="font-family: Roboto, arial, sans-serif; font-size: 22px;"/>');
      backgroundCanvas = backgroundCanvas.get(0);
      imageCanvas = $('<canvas id="imageCanvas" height="720px" width="1280px"  style="font-family: Roboto, arial, sans-serif;"/>');
      imageCanvas = imageCanvas.get(0);
      mainctx = mainCanvas.getContext("2d");
      backgroundctx = backgroundCanvas.getContext("2d");
      imagectx = imageCanvas.getContext("2d");

      document.getElementById("tt1").onclick = mirrorVideo;
      document.getElementById("switch-1").onclick = toggleLowerThird;
      document.getElementById("displayname").value = getParticipantName();
      $('#displaynamediv').addClass('is-dirty');
      
      generateParticipantList();
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