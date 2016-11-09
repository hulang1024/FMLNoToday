"use strict";

var config = new Config();
config.load();
var menu = new Menu(config);
menu.init();

// message from content script
chrome.extension.onMessage.addListener(function(req, sender, respCallback) {
	if(req.act == 'loadConfig') {
		respCallback(config);
		config.load();
		menu.update();
	}
});

function Config() {
	var localStorageID = 'http://jandan.net' + '_FMLNoToday';
	this.store = {};

	this.initDefaults = function() {
		this.store.auto = true;
		this.store.cmdOnChecked = true;
	}

	this.save = function() {
		//JSON.stringify(this.store)
		var json = '{';
		for(var k in this.store) {
			json += '"' + k + '"' + ':' + this.store[k] + ',';
		}
		json = json.substring(0, json.length - 1) + '}';

		localStorage[localStorageID] = json;
	}

	this.load = function() {
		this.initDefaults();

		var json = localStorage[localStorageID];
		if(json) {
			//cant use JSON.parse(json) or eval? :c
			//this.store = eval('(' + json + ')');
			var self = this;
			json.substring(1, json.length-1).split(',').forEach(function(attr, idx, arr){
				var key = attr.split(':')[0], key = key.substring(1, key.length-1);
				var val = attr.split(':')[1], val = val == 'true';
				self.store[key] = val;
			});
		} else {
			this.save();
		}
	}
}

function Menu(config) {
	var cmdMenuItemId;
	this.init = function() {
		cmdMenuItemId = createMenuItem({
			title: "去除'今天'",
			type: "checkbox",
			onclick: cmdOnClick,
			checked: config.store['cmdOnChecked']
		});

		createMenuItem({
			title: "记住选择", type: "checkbox", checked: config.store['auto'],
			onclick: autoOnClick
		});

		function createMenuItem(opts) {
			opts.documentUrlPatterns = ['http://jandan.net/*/*/*/fuck-my-life-*'];
			return chrome.contextMenus.create(opts);
		}

		function cmdOnClick(info) {
			var cmd = info.checked ? 'remove' : 'reset';
			chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {cmd: cmd}, function(ret){});

				if(config.store['auto']) {
					config.store['cmdOnChecked'] = info.checked;
					config.save();
				}
			});
		}

		function autoOnClick(info) {
			config.store['auto'] = info.checked;
			if(!config.store['auto']) {
				config.store['cmdOnChecked'] = false;
			}
			config.save();
		}
	}

	this.update = function() {
		chrome.contextMenus.update(cmdMenuItemId, {checked: config.store['cmdOnChecked']});
	}
}
