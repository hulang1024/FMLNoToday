"use strict";

var noToday = new NoToday();

if(noToday.isFMLPostPage()) {
	chrome.extension.sendMessage({act: 'loadConfig'}, function(config) {
		if(config.store['auto'] && config.store['cmdOnChecked']) {
			noToday.remove();
		}
	});
}

// message from background
chrome.extension.onMessage.addListener(function(req, sender, respCallback) {
	respCallback( noToday[req.cmd]() );
});

function NoToday() {
	var self = this;
	this.store = [];//for reset

	this.remove = function() {
		if(!this.isFMLPostPage()) {
			return 1;
		}

		var ps = $('.current-post').next().next().find('p');
		ps.each(function(index, elem){
			var childNodes = $(this).get(0).childNodes;
			var lastNode = childNodes[childNodes.length - 1];
			if(childNodes.length > 2 && lastNode.nodeType == Node.TEXT_NODE) {
				self.store[index] = lastNode.nodeValue;
				removeToday(lastNode);
			}
		});
		return 0;

		function removeToday(fmlTextNode) {
			var reg = new RegExp("^今天|today",'i');
			var str = fmlTextNode.nodeValue.trim();

			while(reg.test(str)) {
				str = str.replace(reg, '');
			}
			str = str.trim();
			while(str[0] == '，' || str[0] == ',') {
				str = str.substring(1).trim();
			}
			fmlTextNode.nodeValue = str;
		}
	}

	this.reset = function() {
		if(this.store.length == 0 || !this.isFMLPostPage()) {
			return 1;
		}

		var ps = $('.current-post').next().next().find('p');
		ps.each(function(index, elem){
			var childNodes = $(this).get(0).childNodes;
			var lastNode = childNodes[childNodes.length - 1];
			if(childNodes.length > 2 && lastNode.nodeType == Node.TEXT_NODE) {
				lastNode.nodeValue = self.store[index];
			}
		});
		return 0;
	}

	this.isFMLPostPage = function() {
		var tagText = $('.current-post').next().find('a').text().trim();
		return tagText == '发霉啦';
	}
}