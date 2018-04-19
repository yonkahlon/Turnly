/*
  Zooming and rotating HTML5 video player
  Homepage: http://github.com/codepo8/rotatezoomHTML5video
  Copyright (c) 2011 Christian Heilmann
  Code licensed under the BSD License:
  http://wait-till-i.com/license.txt
*/
(function(){

/* predefine zoom and rotate */
  var zoom1 = 1,
      zoom2 = 1,
      zoom_inc = 0.2,
      pan_inc = 10;

/* Grab the necessary DOM elements */
  var stage1 = document.getElementById('colRemoteVideo1'),
      stage2 = document.getElementById('colRemoteVideo2'),
      v1 = document.getElementById('remoteVideo'),
      v2 = document.getElementById('remoteVideo2'),
      controls1 = document.getElementById('controls_video1'),
      controls2 = document.getElementById('controls_video2');
      
  
/* Array of possible browser specific settings for transformation */
  var properties = ['transform', 'WebkitTransform', 'MozTransform',
                    'msTransform', 'OTransform'],
      prop = properties[0];

/* Iterators and stuff */    
  var i,j,t;
  
/* Find out which CSS transform the browser supports */
  for(i=0,j=properties.length;i<j;i++){
    if(typeof stage1.style[properties[i]] !== 'undefined'){
      prop = properties[i];
      break;
    }
  }

/* Position video */
  v1.style.left = 0;
  v1.style.top = 0;
  v2.style.left = 0;
  v2.style.top = 0;

/* If a button was clicked (uses event delegation)...*/
  controls1.addEventListener('click',function(e){
    t = e.target;
    if(t.nodeName.toLowerCase()==='button'){
        if(t.classList.contains('zoomin'))
        {
            zoom1 = zoom1 + zoom_inc;
            v1.style[prop]='scale('+zoom1+')';
        }
        else if(t.classList.contains('zoomout'))
        {
            zoom1 = zoom1 - zoom_inc;
            v1.style[prop]='scale('+zoom1+')';
        }
        else if(t.classList.contains('left'))
        {
            v1.style.left = (parseInt(v1.style.left,10) - pan_inc) + 'px';
        }
        else if(t.classList.contains('right'))
        {
            v1.style.left = (parseInt(v1.style.left,10) + pan_inc) + 'px';
        }
        else if(t.classList.contains('up'))
        {
            v1.style.top = (parseInt(v1.style.top,10) - pan_inc) + 'px';
        }
        else if(t.classList.contains('down'))
        {
            v1.style.top = (parseInt(v1.style.top,10) + pan_inc) + 'px';
        }
/* Check the class name of the button and act accordingly */    
      //switch(t.classList){

/* Increase zoom and set the transformation */
       /* case 'zoomin':
          zoom1 = zoom1 + 0.1;
          v1.style[prop]='scale('+zoom1+')';
        break;
*/
/* Decrease zoom and set the transformation */
   /*     case 'zoomout':
          
        break;
*/
/* Move video around by reading its left/top and altering it */
 /*       case 'left':
          
        break;
        case 'right':
          
        break;
        case 'up':
          
        break;
        case 'down':
          
        break;
*/
/* Reset all to default */
/*        case 'reset':
          zoom1 = 1;
          v1.style.top = 0 + 'px';
          v1.style.left = 0 + 'px';
          v1.style[prop]='scale('+zoom1+')';
        break;
      }        
*/
      e.preventDefault();
    }
  },false);
})();