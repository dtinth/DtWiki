/*
 * DtWiki by Thai Pangsakulyanont
 * https://github.com/dtinth/DtWiki
 *
 * Main file that implements a hook system and loads the essential libraries and the loader.
 * MIT Licensed. See http://www.opensource.org/licenses/mit-license.php
 */

// the namespace for DtWiki
var DtWiki = {};

/**
 * Loads a script synchronously.
 * @param path the URL to the script to load
 */
DtWiki.loadScriptSync = function(path) {
	document.write('<script src="' + path + '"></script>');
};

// create a hook queue
DtWiki.createHookable = function() {
	var handlers = [];
	return {
		addHandler: function(handler, priority) {
			priority = priority || 0;
			handlers.push({ handler: handler, priority: priority });
		},
		notify: function(context, callback) {
			context = context || null;
			var currentHandlers = handlers.slice();
			currentHandlers.sort(function(a, b) {
				return a.priority - b.priority;
			});
			function callHandler(index) {
				function next(err) {
					if (err) {
						if (callback) {
							callback.call(context, err);
						} else {
							throw err;
						}
					} else {
						callHandler(index + 1);
					}
				}
				if (index >= currentHandlers.length) {
					return callback && callback.call(context, null);
				}
				try {
					handlers[index].handler.call(context, next);
				} catch (e) {
					next(e);
				}
			}
			callHandler(0, null);
		}
	};
};

// the list of hooks
DtWiki.hooks = {};

/**
 * Register a hook to run
 * @param name the name of hook
 * @param handler the handler function object, receives one argument "next". You must call next() to continue the queue.
 * @param priority the priority, lower number runs first
 */
DtWiki.hook = function(name, handler, priority) {
	var hookable = DtWiki.hooks[name] || (DtWiki.hooks[name] = DtWiki.createHookable());
	hookable.addHandler(handler, priority);
};

/**
 * Runs a hook
 * @param name the name of hook
 * @param context the object to send to the hook
 * @param callback the function to be run when it finished, receives one argument "error". If it is null then everything went fine.
 */
DtWiki.runHook = function(name, context, callback) {
	console && console.log && console.log('hook called: ' + name);
	var hookable = DtWiki.hooks[name];
	if (hookable) hookable.notify(context, callback);
};

/**
 * Checks if there is a hook with this name.
 * @param name the name of hook
 * @return true if there is a hook with this name, false otherwise
 */
DtWiki.hasHook = function(name) {
	return DtWiki.hooks[name] != null;
};

DtWiki.loadScriptSync('js/lib/jquery-1.7.1.min.js');
DtWiki.loadScriptSync('js/core/loader.js');

window.onload = function() {
	DtWiki.runHook('load');
};
