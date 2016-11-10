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

	var reg = new RegExp("^今天|today",'i');

	this.remove = function() {
		if(!this.isFMLPostPage()) {
			return 1;
		}

		var ps = $('.current-post').next().next().find('p');
		ps.each(function(index, elem){
			for(var i = 0; i < this.childNodes.length; i++) {
				var node = this.childNodes[i];
				if(node.nodeType == Node.TEXT_NODE && reg.test(node.nodeValue.trim())) {
					var o = {};
					o.index = i;
					o.value = node.nodeValue;
					self.store[index] = o;
					removeToday(node);
				}
			}
		});
		return 0;

		function removeToday(fmlBodyTextNode) {
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
			for(var i = 0; i < this.childNodes.length; i++) {
				var node = this.childNodes[i];
				if(node.nodeType == Node.TEXT_NODE && self.store[index].index == i) {
					node.nodeValue = self.store[index].value;
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