
document.addEventListener('DOMContentLoaded', function () {
	var as = document.querySelectorAll('.a');
	for(var i = 0; i < as.length; i++) {
		as[i].onclick = function(){
			chrome.tabs.create({url: this.href});
		}
	}
});
