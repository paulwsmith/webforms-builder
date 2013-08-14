	var states = [],
	countries = [],
	displayTypes = 'heading,spacer,page-break,hidden-field,text,html',
	listTypes = 'dropdown,checkbox,radio',
	validators = {
		alpha: 'alpha',
		alphaNumeric: 'alpha-numeric',
		currencyDollar: 'currency="dollar"',
		date: 'date',
		dateUS: 'date-us',
		emailAddress: 'email',
		numeric: 'number',
		url: 'url',
		zipCode: 'zipcode'
	},
	behaviors = {
		list: function(field) {
			field.choices = [];
			if(field.settings && field.settings.properties && field.settings.properties.choices) {
				if(field.settings.properties.choices.forEach) {
					field.settings.properties.choices.forEach(function(choice) {
						var parts = choice.split(':'),
							value = parts[0]
							label = parts[1] || value;
						field.choices.push({ label:label, value:value });
					});
				} else if(typeof field.settings.properties.choices === 'object') {
					for(var choiceVal in field.settings.properties.choices) {
						field.choices.push({ label:field.settings.properties.choices[choiceVal], value:choiceVal });
					}
				}
			}
		},
		validation: function(field) {
			var field_validators = [];
			for(var key in validators) {
				if(field.settings.validation[key]) {
					field_validators.push(validators[key]);
				}
			}
			if(field.settings.properties.maxlength) {
				var maxlength = parseInt(field.settings.properties.maxlength, 10);
				if(maxlength) {
					field_validators.push('ng-maxlength="' + maxlength + '"');
				}
			}
			field.validators = field_validators.join(' ');
		},
		'country-select': function(field) {
			field.choices = [];
			if(countries) {
				countries.forEach(function(country) {
					field.choices.push({ label:country.country, value:country.id });
				});
			}
		},
		'date-picker': function(field) {
			field.placeholder = field.placeholder || 'mm/dd/yyyy';
		},
		'dropdown': function(field) {
			field.multiple = field.settings.properties.multiple ? 'multiple' : '';
			field.size = field.multiple ? 5 : 1;
			if(field.settings.properties.size) {
				field.size = parseInt(field.settings.properties.size, 10) || field.size;
			}
		},
		'state-select': function(field) {
			var provinces = !!field.settings.properties.provinces;
			field.choices = [];
			var countryId = 'US';
			if(states) {
				states.forEach(function(state) {
					if(provinces || state.id.startsWith('US-')) {
						field.choices.push({ label:state.state, value:state.id, selected:(field.settings.properties.placeholder === state.id || field.settings.properties.placeholder === state.state) });	
					}
				});
			}
		},
		'text-area': function(field) {
			behaviors['text-input'](field);

			var rows = 6;
			if(field.settings.properties.rows) {
				rows = parseInt(field.settings.properties.rows, 10) || rows;
			}
			field.rows = rows;
		},
		'text-input': function(field) {
			var cols = '', inputClass = 'input-xlarge';
			if(field.settings.properties.cols) {
				cols = parseInt(field.settings.properties.cols, 10) || cols;
				if(cols) { 
					inputClass = '';
				}
			}
			field.inputClass = inputClass;
		},
		year: function(field) {
			field.choices = [];
			var year = (new Date()).getYear() + 1900 + 5, end = 1901;
			for(; year >= end; year--) {
				field.choices.push({ label:year.toString(), value:year.toString() });
			}
		}
	};

function field(field) {
	field['is-' + field.type] = true;
	field.is_control = displayTypes.indexOf(field.type) === -1;
	field.is_list = listTypes.indexOf(field.type) > -1;
	field.is_required = !!field.settings.validation.required;
	field.class = field.settings.properties.class || '';
	field.required = field.is_required ? 'required' : '';
	field.placeholder = field.settings.properties.placeholder || '';

	behaviors.validation(field);

	if(field.is_list) {
		behaviors.list(field);
	}

	if(field.type in behaviors) {
		behaviors[field.type](field);
	}
}

module.exports = {
	config: function(cfgStates, cfgCountries) {
		states = cfgStates;
		countries = cfgCountries;
	},
	field: field
};