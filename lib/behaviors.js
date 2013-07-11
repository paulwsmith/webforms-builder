var states = [],
	countries = [],
	displayTypes = 'heading,spacer,page-break,hidden-field',
	listTypes = 'dropdown,checkbox,radio',
	behaviors = {
		list: function(field) {
			field.choices = [];
			if(field.settings && field.settings.properties && field.settings.properties.choices) {
				field.settings.properties.choices.forEach(function(choice) {
					field.choices.push({ label:choice, value:choice });
				});
			}
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
		'state-select': function(field) {
			field.choices = [];
			var countryId = 'US';
			if(states) {
				states.forEach(function(state) {
					if(state.countryId === countryId) {
						field.choices.push({ label:state.state, value:state.id });
					}
				});
			}
		},
		'text-area': function(field) {
			var rows = 6, cols = '', inputClass = 'input-xlarge';
			if(field.settings.properties.rows) {
				rows = parseInt(field.settings.properties.rows, 10) || rows;
			}
			if(field.settings.properties.cols) {
				cols = parseInt(field.settings.properties.cols, 10) || cols;
				if(cols) { 
					inputClass = '';
				}
			}
			field.rows = rows;
			field.cols = cols;
			field.class = field.class || inputClass;
		},
		'text-input': function(field) {
			field.class = field.class || 'input-xlarge';
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

	if(field.is_list) {
		behaviors.list(field);
	}

	if(field.type in behaviors) {
		behaviors[field.type](field);
	}
}

module.exports = {
	config: function(statez, countryz) {
		states = statez;
		countries = countryz;
	},
	field: field
};