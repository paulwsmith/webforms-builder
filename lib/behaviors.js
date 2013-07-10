var states = [],
	countries = [],
	behaviors = {
	list: function(field) {
		field.choices = [];
		if(field.settings && field.settings.properties && field.settings.properties.choices) {
			field.settings.properties.choices.forEach(function(choice) {
				field.choices.push({ label:choice, value:choice });
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
	'country-select': function(field) {
		field.choices = [];
		if(countries) {
			countries.forEach(function(country) {
				field.choices.push({ label:country.country, value:country.id });
			});
		}
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