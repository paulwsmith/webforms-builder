var fs = require('fs'),
	handlebars = require('handlebars'),
	rawTemplate = '',
	templateOptions = {
		show_actions: false
	},
	displayTypes = 'heading,spacer,page-break,hidden-field',
	listTypes = 'dropdown,checkbox,radio';

function build(form, fields, states, countries, success, error) {
	var template = handlebars.compile(rawTemplate);

	fields.forEach(function(field) {
		field['is-' + field.type] = true;
		field.is_control = displayTypes.indexOf(field.type) === -1;
		field.is_list = listTypes.indexOf(field.type) > -1;
		field.required = field.settings.validation.required ? 'required' : '';

		if(field.is_list) {
			field.choices = [];
			field.choices = [{ label:"Choice 1", value:1 }, { label:"Choice 2", value:2 }, { label:"Choice 3", value:3 }, { label:"Choice 4", value:4 }];
			if(field.settings && field.settings.properties && field.settings.properties.choices) {
				field.choices = field.settings.properties.choices;
			}
		}

		if(field.type === 'state-select') {
			field.choices = [];
			var countryId = 'US';
			if(states) {
				states.forEach(function(state) {
					if(state.countryId === countryId) {
						field.choices.push({ label:state.state, value:state.id });
					}
				});
			}
		}

		if(field.type === 'country-select') {
			field.choices = [];
			if(countries) {
				countries.forEach(function(country) {
					field.choices.push({ label:country.country, value:country.id });
				});
			}
		}
	});

	var content = '';
	try {
		content = template({ form:form, fields:fields, states:states, countries:countries, options:templateOptions });
	} catch(e) {
		console.log('Handlebars template error: ', e);
		error('Render error');
		return;
	}

	success(content);
}

function setLocalTemplate() {
	if(!fs) {
		throw "Cannot load template without fs module.";
	}
	rawTemplate = fs.readFileSync(__dirname + '/partials/webform.html', 'utf8');
}

module.exports = function builder(options) {
	rawTemplate = options.template || '';
	if(options.localTemplate) {
		setLocalTemplate();
	}
	templateOptions.show_actions = !!options.showActions;
	
	return {
		build: build
	};
};