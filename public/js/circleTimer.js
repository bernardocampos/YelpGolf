var initialCount 	= 3,
 	  count 			  = initialCount,
 	  timerPause		= false;

function timer() {	    	
	if (!timerPause) {
	  	count = count - 1;
	  	if (count <= 0) {
	  		count = initialCount;
	        var el = $(".circle-timer");
	        el.before( el.clone(true) ).remove();
	  	} 
	  	$(".timer .count").text(count);
  	}
}
setInterval(timer, 1000);

$(".circle-timer").click( function(){
	$(this).toggleClass('paused');
	if ($(this).hasClass('paused')) {
		timerPause = true;
	} else {
		timerPause = false;
	}
});
