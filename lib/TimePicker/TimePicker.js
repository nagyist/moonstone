require('moonstone');

/**
* Contains the declaration for the {@link moon.TimePicker} kind.
* @module moonstone/TimePicker
*/

var
	kind = require('enyo/kind'),
	platform = require('enyo/platform'),
	Control = require('enyo/Control');

var
	ilib = require('enyo-ilib');

var
	DateTimePickerBase = require('../DateTimePickerBase'),
	$L = require('../i18n'),
	IntegerPicker = require('../IntegerPicker');

/**
* {@link moon.MeridiemPicker} is a helper kind used by {@link moon.TimePicker}.
* It is not intended for use in other contexts.
*
* @namespace moon
* @class moon.MeridiemPicker
* @extends moon.IntegerPicker
* @ui
* @definedby module:moonstone/TimePicker
* @protected
*/
var MeridiemPicker = kind(
	/** @lends  moon.MeridiemPicker.prototype */ {

	/**
	* @private
	*/
	name: 'moon.MeridiemPicker',

	/**
	* @private
	*/
	kind: IntegerPicker,

	/**
	* @private
	*/
	classes: 'moon-date-picker-month',

	/**
	* @private
	*/
	min: 0,

	/**
	* @private
	*/
	max: 1,

	/**
	* @private
	*/
	value: null,

	/**
	* @private
	*/
	wrap: true,

	/**
	* @private
	* @lends moon.MeridiemPicker.prototype
	*/
	published: {
		/**
		* The meridiem text to display if [meridiemEnable]{@link moon.TimePicker#meridiemEnable}
		* is `true`. The first item is used if the `hour` is less than `12`; otherwise, the
		* second is used.
		*
		* @type {String[]}
		* @default [{name: 'AM', start: '00:00', end: '11:59'}, {name: 'PM', start: '12:00', end: '23:59'}]
		* @public
		*/
		meridiems: [{name: 'AM', start: '00:00', end: '11:59'}, {name: 'PM', start: '12:00', end: '23:59'}]
	},

	/**
	* @private
	*/
	valueChanged: function () {
		IntegerPicker.prototype.valueChanged.apply(this, arguments);		
		this.updateOverlays();
	},

	/**
	* @private
	*/
	setupItem: function (inSender, inEvent) {
		var index = inEvent.index % this.range || 0;
		this.$.item.setContent(this.meridiems[index]['name']);
	}
});

/**
* {@link moon.HourMinutePickerBase} is a helper kind used by {@link moon.TimePicker}. 
*  It is not intended for use in other contexts.
*
* @class moon.MinutePicker
* @extends moon.IntegerPicker
* @ui
* @definedby module:moonstone/TimePicker
* @protected
*/
var HourMinutePickerBase = kind(
	/** @lends moon.HourMinutePickerBase.prototype */ {

	/**
	* @private
	*/
	name: 'moon.HourMinutePickerBase',

	/**
	* @private
	*/
	kind: IntegerPicker,

	/**
	* @private
	*/
	classes: 'moon-date-picker-field',

	/**
	* @private
	*/
	formatter: null,

	/**
	* @private
	*/
	wrap: true,

	/**
	* @private
	*/
	create: function () {
		IntegerPicker.prototype.create.apply(this, arguments);
		// Create ilib Date object used for formatting hours
		this.date = ilib.Date.newInstance();
	},

	/**
	* @private
	*/
	setupItem: function (inSender, inEvent) {
		var value = this.format(inEvent.index % this.range || 0);
		this.$.item.setContent(value);
	}
});

/**
* {@link moon.MinutePicker} is a helper kind used by {@link moon.TimePicker}. 
*  It is not intended for use in other contexts.
*
* @class moon.MinutePicker
* @extends moon.HourMinutePickerBase
* @ui
* @definedby module:moonstone/TimePicker
* @protected
*/
var MinutePicker = kind(
	/** @lends moon.MinutePicker.prototype */ {

	/**
	* @private
	*/
	name: 'moon.MinutePicker',
	/**
	* @private
	*/
	kind: HourMinutePickerBase,

	/**
	* @private
	*/
	min: 0,

	/**
	* @private
	*/
	max: 59,

	/**
	 * Formats the minute at `index` for the current locale
	 *
	 * @param  {Number} index - Minute between 0 and 59
	 * @return {String}       - Formatted minute
	 * @private
	 */
	format: function (index) {
		this.date.minute = index;
		return this.formatter.format(this.date);
	}
});

/**
* {@link moon.HourPicker} is a helper kind used by {@link moon.TimePicker}. It is
*  not intended for use in other contexts.
*
* @class moon.HourPicker
* @extends moon.HourMinutePickerBase
* @ui
* @definedby module:moonstone/TimePicker
* @protected
*/
var HourPicker = kind(
	/** @lends moon.HourPicker.prototype */ {

	/**
	* @private
	*/
	name: 'moon.HourPicker',

	/**
	* @private
	*/
	kind: HourMinutePickerBase,

	/**
	* @private
	*/
	min: 0,

	/**
	* @private
	*/
	max: 23,


	/**
	 * Formats the hour at `index` for the current locale
	 *
	 * @param  {Number} index - Hour between 0 and 24
	 * @return {String}       - Formatted hour
	 * @private
	 */
	format: function (index) {
		this.date.hour = index;
		return this.formatter.format(this.date);
	},

	/**
	 * If the formatted new and old values are the same, skip animating by not passing
	 * the old value to `IntegerPicker.scrollToValue`.
	 *
	 * If the hour is changed by more than 12 but the locale is using 12 hour formatting, this
	 * will not prevent a big scroll through all intermediate values (e.g. from 3pm to 2am) even
	 * though it only has to scroll 1 index. This can be seen most easily by selecting a time
	 * between 2 and 3 pm on day when DST springs forward and then changing the meridiem to AM.
	 * 
	 * @see moon.IntegerPicker.scrollToValue
	 * @private
	 */
	scrollToValue: function(old) {
		// try to avoid the format calls if the old and current values
		// don't mod to the same value
		var maybeSame = old !== undefined && old%12 === this.value%12;
		if(maybeSame && this.format(old) === this.format(this.value)) {
			HourMinutePickerBase.prototype.scrollToValue.call(this);
		} else {
			HourMinutePickerBase.prototype.scrollToValue.apply(this, arguments);
		}
	}
});
/**
* {@link moon.TimePicker} is a [control]{@link enyo.Control} used to allow the
* selection of (or to simply display) a time expressed in hours and minutes, with an
* optional meridiem indicator ('am' or 'pm').
*
* ```
* {kind: 'moon.TimePicker', content: 'Time', meridiemEnable: true, onChange: 'changed'}
* ```
* Set the [value]{@link moon.TimePicker#value} property to a standard JavaScript
* {@glossary Date} object to initialize the picker, or to change it programmatically at
* runtime.
*
* @class moon.TimePicker
* @extends moon.DateTimePickerBase
* @ui
* @definedby module:moonstone/TimePicker
* @public
*/
var TimePicker = module.exports = kind(
	/** @lends moon.TimePicker.prototype */ {

	/**
	* @private
	*/
	name: 'moon.TimePicker',

	/**
	* @private
	*/
	kind: DateTimePickerBase,

	/**
	* @private
	* @lends moon.TimePicker.prototype
	*/
	published: {

		/**
		* When `true`, the picker will use a 12-hour clock. (When [iLib]{@glossary ilib} is loaded,
		* this value will be ignored and the current locale's rules will determine whether a
		* 12-hour or 24-hour clock is used.)
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		meridiemEnable: false,

		/**
		* Optional label for hour.
		*
		* @type {String}
		* @default 'moon.$L('hour')'
		* @public
		*/
		hourText: $L('hour'),			// i18n 'HOUR' label in moon.TimePicker widget

		/**
		* Optional label for minute.
		*
		* @type {String}
		* @default 'moon.$L('minute')'
		* @public
		*/
		minuteText: $L('minute'),		// i18n 'MINUTE' label in moon.TimePicker widget

		/**
		* Optional label for meridiem.
		*
		* @type {String}
		* @default 'moon.$L('meridiem')'
		* @public
		*/

		meridiemText: $L('meridiem'),	// i18n 'MERIDIEM' label in moon.TimePicker widget
		/**
		* When `true`, midnight (and noon, if `meridiemEnable: true`) will be represented as `0`
		* instead of `24` (and `12`). (When [iLib]{@glossary ilib} is loaded, this value will be
		* ignored and the current locale's rules will determine whether `0` is used.)
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		hoursStartAtZero: false,

		/**
		* When `true`, hours will be zero-padded. (When [iLib]{@glosary ilib} is loaded, this
		* value will be ignored and the current locale's rules will determine whether
		* zero-padding is used.)
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		hoursZeroPadded: false,

		/**
		* When `true`, bottom text will be displayed
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showPickerLabels: true
	},

	/**
	* @private
	*/
	observers: {
		refresh: ['hoursStartAtZero', 'meridiemEnable', 'hoursZeroPadded']
	},

	/**
	* @private
	*/
	iLibFormatType  : 'time',

	/**
	* @private
	*/
	defaultOrdering : 'hma',


	/**
	* @private
	*/
	initILib: function () {
		DateTimePickerBase.prototype.initILib.apply(this, arguments);

		// Set picker format 12 vs 24 hour clock
		var li = new ilib.LocaleInfo(this.locale || undefined);
		var clockPref = li.getClock();
		this.meridiemEnable = (clockPref == '12');

		var fmtParams = {
			type: 'time',
			time: 'h',
			clock: clockPref !== 'locale' ? clockPref : undefined,
			useNative: false,
			timezone: 'local'
		};
		if (this.locale) {
			fmtParams.locale = this.locale;
		}
		this.hourFormatter = new ilib.DateFmt(fmtParams);

		fmtParams.time = 'm';
		this.minuteFormatter = new ilib.DateFmt(fmtParams);

		// Get localized meridiem values
		if (this.meridiemEnable) {
			fmtParams = {
				template: 'a',
				clock: clockPref !== 'locale' ? clockPref : undefined,
				useNative: false,
				timezone: 'local'
			};
			if (this.locale) {
				fmtParams.locale = this.locale;
			}
			var merFormatter = new ilib.DateFmt(fmtParams);
			this.meridiems = merFormatter.getMeridiemsRange(fmtParams);
		}
	},

	/**
	* @private
	*/
	setupPickers: function (ordering) {
		var orderingArr = ordering.toLowerCase().split('');
		var doneArr = [];
		var o,f,l;
		for(f = 0, l = orderingArr.length; f < l; f++) {
			o = orderingArr[f];
			if (doneArr.indexOf(o) < 0) {
				doneArr.push(o);
			}
		}

		for(f = 0, l = doneArr.length; f < l; f++) {
			o = doneArr[f];
			var valueHours = this.value ? this.value.getHours() : 0;
			var valueMinutes = this.value ? this.value.getMinutes() : 0;

			switch (o){
			case 'h':
			case 'k':
				this.wrapComponent(
					{name: 'timeWrapper', kind: Control, classes: 'moon-time-picker-wrap'},
					{kind: Control, classes: 'moon-date-picker-wrap', components:[
						{name: 'hour', kind: HourPicker, formatter: this.hourFormatter || this, value: valueHours, onChange: 'hourPickerChanged'},
						{name: 'hourLabel', kind: Control, content: this.hourText, classes: 'moon-date-picker-label moon-divider-text', renderOnShow: true}
					]},
					this
				);
				break;
			case 'm':
				this.wrapComponent(
					{name: 'timeWrapper', kind: Control, classes: 'moon-time-picker-wrap'},
					{kind: Control, classes: 'moon-date-picker-wrap', components:[
						{name: 'minute', kind: MinutePicker, formatter: this.minuteFormatter || this, value: valueMinutes, onChange: 'minutePickerChanged'},
						{name: 'minuteLabel', kind: Control, content: this.minuteText, classes: 'moon-date-picker-label moon-divider-text', renderOnShow: true}
					]},
					this
				);
				break;
			case 'a':
				if (this.meridiemEnable === true) {
					this.createComponent(
						{kind: Control, classes: 'moon-date-picker-wrap', components:[
							{name: 'meridiem', kind: MeridiemPicker, classes: 'moon-date-picker-field', value: valueHours > 12 ? 1 : 0, meridiems: this.meridiems || ['am','pm'], onChange: 'meridiemPickerChanged'},
							{name: 'meridiemLabel', kind: Control, content: this.meridiemText, classes: 'moon-date-picker-label moon-divider-text', renderOnShow: true}
						]}
					);
				}
				break;
			default:
				break;
			}

		}
		this.showPickerLabelsChanged();
		DateTimePickerBase.prototype.setupPickers.apply(this, arguments);
	},

	/**
	* @private
	*/
	wrapComponent: function (wrapperProps, compProps, owner) {
		var wrapper = this.$[wrapperProps.name];
		if (!wrapper) {
			wrapper = this.createComponent(wrapperProps);
		}
		wrapper.createComponent(compProps, {owner: owner});
	},

	/**
	* @private
	*/
	formatValue: function () {
		if (!this.value) {
			return (this.noneText);
		}
		return this._tf.format(ilib.Date.newInstance({unixtime: this.value.getTime(), timezone:'Etc/UTC'}));
	},

	/**
	* @private
	*/
	formatHour: function (hour) {
		if (this.meridiemEnable) {
			if (hour > 12) {
				hour -= 12;
			}
			if (this.hoursStartAtZero) {
				if (hour == 12) {
					hour = 0;
				}
			} else {
				hour = hour || 12;
			}
		} else {
			if (!this.hoursStartAtZero) {
				hour = hour || 24;
			}
		}
		if (this.hoursZeroPadded) {
			hour = ('0' + hour).slice(-2);
		}
		return hour;
	},

	/**
	* @private
	*/
	formatMinute: function (minute) {
		return minute;
	},

	/**
	* @private
	*/
	hourPickerChanged: function (sender, event) {
		if(this.syncingPickers) return true;

		var hour = event.value;

		if (this.value) {
			this.updateHours(hour);
		}

		return true;
	},

	/**
	* @private
	*/
	minutePickerChanged: function (sender, event) {
		if(this.syncingPickers) return true;

		var minutes = event.value;

		if (this.value) {
			this.value.setMinutes(minutes);
			this.set('value', this.value, {force: true});
		}

		return true;
	},

	/**
	* @private
	*/
	meridiemPickerChanged: function (sender, event) {
		if(this.syncingPickers) return true;

		var hour = this.$.hour.get('value'),
			value = event.value;

		if (this.value) {
			// value is 0 for am, 1 for pm
			// reset the hour to < 12 and then add 12 if it's pm
			hour = hour%12 + value*12;
			this.updateHours(hour);
		}

		return true;
	},

	/**
	* webOS TVs which rounds down when setting the hour to the skipped hour of DST
	* whereas other implementations round up. 
	*
	* @private
	*/
	dstOffset: platform.webos? 3600000 : -3600000,

	/**
	* @private
	*/
	updateHours: function (hour) {
		var valueTime = this.value.getTime();

		this.value.setHours(hour);

		// in the rare case that the value didn't change because it was snapped back to the
		// same value due to DST rules, push it back another hour.
		if (valueTime == this.value.getTime()) {
			this.value = new Date(valueTime + this.dstOffset);
		}

		this.set('value', this.value, {force: true});
	},

	/**
	* @private
	*/
	setChildPickers: function (inOld) {
		if (this.value) {
			var hour = this.value.getHours();
			this.$.hour.setValue(hour);
			this.$.minute.setValue(this.value.getMinutes());
			if (this.meridiemEnable === true) {
				this.$.meridiem.setValue(hour > 11 ? 1 : 0);
			}
		}
		this.$.currentValue.setContent(this.formatValue());
	},

	/**
	* @private
	*/
	hourTextChanged: function (inOldvalue, inNewValue) {
		this.$.hourLabel.setContent(inNewValue);
	},

	/**
	* @private
	*/
	minuteTextChanged: function (inOldvalue, inNewValue) {
		this.$.minuteLabel.setContent(inNewValue);
	},

	/**
	* @private
	*/
	meridiemTextChanged: function (inOldvalue, inNewValue) {
		this.$.meridiemLabel.setContent(inNewValue);
	},

	/**
	* @private
	*/
	showPickerLabelsChanged: function (inOldvalue, inNewValue) {
		this.$.hourLabel.set('showing', this.showPickerLabels);
		this.$.minuteLabel.set('showing', this.showPickerLabels);
		if(this.meridiemEnable){
			this.$.meridiemLabel.set('showing', this.showPickerLabels);
		}
 	}
});

TimePicker.HourPicker = HourPicker;
TimePicker.MinutePicker = MinutePicker;
TimePicker.MeridiemPicker = MeridiemPicker;