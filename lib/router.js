var idMethods = ['del', 'get', 'patch', 'put'];
var methods = ['list', 'post'].concat(idMethods);

function Router(name, param) {
	this.routes = {
		del: [],
		get: [],
		list: [],
		patch: [],
		post: [],
		put: [],
	};

	this.name = name;
	this.param = param;
}

Router.prototype.extend = function add(router) {
	var prefix = this.makePath(true);
	var routes = this.routes;

	function eachRoute(method, route) {
		var path = prefix + route.path;

		var extendedRoute = {
			handlers: route.handlers,
			path: path,
		};

		routes[method].unshift(extendedRoute);
	}

	router.iterateRoutes(eachRoute.bind(this));
};

Router.prototype.iterateRoutes = function iterateRoutes(cb) {
	methods.forEach(function eachMethod(method) {
		this.routes[method].forEach(function eachRoute(route) {
			cb(method, route);
		});
	}.bind(this));
};

Router.prototype.routify = function setRoutes(app) {
	function eachRoute(method, route) {
		var methodLocal = method === 'list' ? 'get' : method;
		app[methodLocal].apply(app, [route.path].concat(route.handlers));
	}

	this.iterateRoutes(eachRoute);
};

Router.prototype.makePath = function makePath(method) {
	if (!this.name) {
		return '';
	}
	var path = '/' + this.name;
	var useParam = this.param &&
		(method === true || idMethods.indexOf(method) !== -1);

	if (useParam) {
		path += '/:' + this.param;
	}

	return path;
};

methods.forEach(function eachMethod(method) {
	Router.prototype[method] = function methodSetter() {
		var handlers = new Array(arguments.length);
		var idx;

		for (idx = 0; idx < handlers.length; idx++) {
			handlers[idx] = arguments[idx];
		}

		this.routes[method].push({
			handlers: handlers,
			path: this.makePath(method),
		});

		return this;
	};
});

module.exports = Router;
