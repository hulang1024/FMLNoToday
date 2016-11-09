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
			var childNodes = this.childNodes;
			for(var i = 0; i < childNodes.length; i++) {
				if(childNodes[i].nodeType == Node.TEXT_NODE) {
					var node = childNodes[i];
					self.store[index] = node.nodeValue;
					removeToday(node);
				}
			}
		});
		return 0;

		function removeToday(fmlBodyTextNode) {
			var reg = new RegExp("^今天|today",'i');
			var str = fmlBodyTextNode.nodeValue.trim();

			while(reg.test(str)) {
				str = str.replace(reg, '');
			}
			str = str.trim();
			while(str[0] == '，' || str[0] == ',') {
				str = str.substring(1).trim();
			}
			fmlBodyTextNode.nodeValue = str;
		}
	}

	this.reset = function() {
		if(this.store.length == 0 || !this.isFMLPostPage()) {
			return 1;
		}

		var ps = $('.current-post').next().next().find('p');
		ps.each(function(index, elem){
			var childNodes = this.childNodes;
			for(var i = 0; i < childNodes.length; i++) {
				if(childNodes[i].nodeType == Node.TEXT_NODE) {
					lastNode.nodeValue = self.store[index];
				}
			}
		});
		return 0;
	}

	this.isFMLPostPage = function() {
		var tagText = $('.current-post').next().find('a').text().trim();
		return tagText == '发霉啦';
	}
}