var fs = require('fs'),
	handlebars = require('handlebars'),
	rawTemplate = '',
	templateOptions = {
		show_actions: false,
		show_title: false,
		submit_local: false
	},
	displayTypes = 'heading,spacer,page-break,hidden-field',
	listTypes = 'dropdown,checkbox,radio';

function build(form, fields, states, countries, record, success, error) {
	var template = handlebars.compile(rawTemplate);

	fields.forEach(function(field) {
		field['is-' + field.type] = true;
		field.is_control = displayTypes.indexOf(field.type) === -1;
		field.is_list = listTypes.indexOf(field.type) > -1;
		field.is_required = !!field.settings.validation.required;
		field.required = field.is_required ? 'required' : '';

		if(field.is_list) {
			field.choices = [];
			if(field.settings && field.settings.properties && field.settings.properties.choices) {
				field.settings.properties.choices.forEach(function(choice) {
					field.choices.push({ label:choice, value:choice });
				});
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

		if(field.type === 'year') {
			field.choices = [];
			var year = (new Date()).getYear() + 1900 + 5, end = 1901;
			for(; year >= end; year--) {
					field.choices.push({ label:year.toString(), value:year.toString() });
			}
		}
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
	
	return {
		build: build
	};
};