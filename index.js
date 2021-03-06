var fs = require('fs'),
	handlebars = require('handlebars'),
	behaviors = require('./lib/behaviors'),
	rawTemplate = '',
	templateOptions = {
		show_actions: false,
		show_title: false,
		submit_local: false
	},
	isPublic = true;

handlebars.registerHelper('getStyles', function(style) {
	// e.g. pass form.settings.style.heading
	ret = "";
	if (style.bold) ret += "font-weight: bold;";
	if (style.color) ret += "color: " + style.color + ";";
	if (style.fontFace) ret += "font-face: " + style.fontFace + ";";
	if (style.italic) ret += "font-style: italic;";
	if (style.size) ret += "font-size: " + style.size + "pt;";
	if (style.underline) ret += "text-decoration: underline;";
	if (style.backgroundColor) ret += "background-color: " + style.backgroundColor + ";";
	
	return ret;
});

function build(form, fields, states, countries, record, success, error) {
	var accessible = true;
	if(isPublic) {
		accessible = form.isPublic && form.isActive;

		if(form.start) {
			var start = new Date(Date.parse(form.start));
			if(start > new Date()) {
				accessible = false;
			}
		}
		if(form.end) {
			var end = new Date(Date.parse(form.end));
			if(end < new Date()) {
				accessible = false;
			}
		}
	}

	if(accessible) {
		behaviors.config(states, countries);

		var template = handlebars.compile(rawTemplate);

		fields.forEach(function(field) {
			behaviors.field(field);
		});

		var content = '';
		try {
			content = template({ form:form, fields:fields, states:states, countries:countries, record:record, options:templateOptions });
		} catch(e) {
			console.log('Handlebars template error: ', e);
			error('Render error');
			return;
		}

		success(content);
	} else {
		success(form.settings.terminology.closedError);
	}
}

function setLocalTemplate() {
	if(!fs) {
		throw "Cannot load template without fs module.";
	}
	rawTemplate = fs.readFileSync(__dirname + '/partials/webform.html', 'utf8');
}

module.exports = function builder(options) {
	rawTemplate = options.template || '';
	if(options.local) {
		options.localTemplate = templateOptions.show_actions = templateOptions.show_title = templateOptions.submit_local = true;
	} else {
		templateOptions.show_actions = !!options.showActions;
		templateOptions.show_title = !!options.showTitle;
		templateOptions.submit_local = !!options.submitLocal;
	}
	if(options.localTemplate) {
		setLocalTemplate();
	}
	isPublic = options.isPublic !== false;
	
	return {
		build: build
	};
};
