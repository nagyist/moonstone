require('moonstone');

/**
* Contains the declaration for the {@link module:moonstone/ProgressBar~ProgressBar} kind.
* @module moonstone/ProgressBar
*/

var
	kind = require('enyo/kind'),
	Control = require('enyo/Control'),
	Animator = require('enyo/Animator');

var
	dom = require('enyo/dom'),
	ri = require('enyo/resolution'),
	util = require('enyo/utils'),
	log = require('enyo/logger'),
	Control = require('enyo/Control'),
	Popup = require('enyo/Popup');

var
	NumFmt = require('enyo-ilib/NumFmt');

/**
* Fires when progress bar finishes animating to a position. No event-specific data
* is sent with this event.
*
* @event module:moonstone/ProgressBar~ProgressBar#onAnimateProgressFinish
* @type {Object}
* @public
*/

/**
* {@link module:moonstone/ProgressBar~ProgressBar} is a [control]{@link module:enyo/Control~Control} that shows the current
* progress of a process in a horizontal bar.
*
* ```javascript
* 	var
* 		kind = require('enyo/kind'),
* 		ProgressBar = require('moonstone/ProgressBar');
*
* 	{kind: ProgressBar, progress: 10}
* ```
*
* To animate a progress change, call the
* [animateProgressTo()]{@link module:moonstone/ProgressBar~ProgressBar#animateProgressTo} method:
*
* ```javascript
* 	this.$.progressBar.animateProgressTo(50);
* ```
*
* You may customize the color of the bar by applying a style via the
* [barClasses]{@link module:moonstone/ProgressBar~ProgressBar#barClasses} property, e.g.:
*
* ```javascript
* 	var
* 		kind = require('enyo/kind'),
* 		ProgressBar = require('moonstone/ProgressBar');
*
* 	{kind: ProgressBar, barClasses: 'class-name'}
* ```
*
* For more information, see the documentation on [Progress
* Indicators]{@linkplain $dev-guide/building-apps/controls/progress-indicators.html}
* in the Enyo Developer Guide.
*
* @class ProgressBar
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:moonstone/ProgressBar~ProgressBar.prototype */ {

	/**
	* @private
	*/
	name: 'moon.ProgressBar',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'moon-progress-bar',

	/**
	* @private
	* @lends module:moonstone/ProgressBar~ProgressBar.prototype
	*/
	published: {

		/**
		* Current position of progress bar.
		*
		* @type {Number}
		* @default 0
		* @public
		*/
		progress: 0,

		/**
		* Minimum progress value (i.e., no progress made).
		*
		* @type {Number}
		* @default 0
		* @public
		*/
		min: 0,

		/**
		* Maximum progress value (i.e., process complete).
		*
		* @type {Number}
		* @default 100
		* @public
		*/
		max: 100,

		/**
		* CSS classes to apply to progress bar.
		*
		* @type {String}
		* @default 'moon-progress-bar-bar'
		* @public
		*/
		barClasses: 'moon-progress-bar-bar',

		/**
		* CSS classes to apply to background progress bar.
		*
		* @type {String}
		* @default 'moon-progress-bg-bar'
		* @public
		*/
		bgBarClasses: 'moon-progress-bg-bar',

		/**
		* Completion percentage for background process.
		*
		* @type {Number}
		* @default 0
		* @public
		*/
		bgProgress: 0,

		/**
		* CSS classes to apply to the popup label.
		*
		* @type {String}
		* @default 'moon-progress-bar-popup-label'
		* @public
		*/
		popupLabelClasses: 'moon-large-button-text moon-progress-bar-popup-label',

		/**
		* Color value of the popup.
		*
		* @type {String}
		* @default '#4d4d4d'
		* @public
		*/
		popupColor: '#4d4d4d',

		/**
		* When `true`, a popup bubble is displayed at the point of progress
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		popup: false,

		/**
		* When `true`, the popup displays a percentage value (rather than an absolute value).
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showPercentage: true,

		/**
		* Popup width in pixels.
		*
		* @type {Number|String}
		* @default 'auto'
		* @public
		*/
		popupWidth: 'auto',

		/**
		* Popup height in pixels; value should be less than `72`.
		*
		* @type {Number|String}
		* @default 67
		* @public
		*/
		popupHeight: 67,

		/**
		* Popup offset in pixels.
		*
		* @type {Number}
		* @default 8
		* @public
		*/
		popupOffset: 8,

		/**
		* Custom popup content (ignored if `null`).
		*
		* @type {String|null}
		* @default null
		* @public
		*/
		popupContent: null,

		/**
		* When [orientation]{@link module:moonstone/ProgressBar~ProgressBar#orientation} is set to
		* 'vertical', the popup will show on the listed side.
		*
		* @type {String}
		* @default 'right'
		* @public
		*/
		popupSide: 'right',

		/**
		* When `true`, popup content will have locale-safe uppercasing applied.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		uppercase: true,

		/**
		* Sets the orientation of ProgressBar. Choices are: 'horizontal' (default) or 'vertical'.
		* Horizontal progressbars move right and left, vertical progressbars move up and down.
		*
		* @type {String}
		* @default 'horizontal'
		* @public
		*/
		orientation: 'horizontal',

		/**
		* @deprecated Replaced by [uppercase]{@link module:moonstone/Slider~Slider#uppercase}.
		*
		* Formerly defaulted to `true`, now defaults to `null` and will only have
		* an effect when explicitly set (for complete backward compatibility).
		*
		* @type {Boolean}
		* @default null
		* @public
		*/
		popupContentUpperCase: null
	},

	/**
	* @private
	*/
	events: {

		/**
		* {@link module:moonstone/ProgressBar~ProgressBar#onAnimateProgressFinish}
		*/
		onAnimateProgressFinish: ''
	},

	/**
	* @private
	*/
	components: [
		{name: 'progressAnimator', kind: Animator, onStep: 'progressAnimatorStep', onEnd: 'progressAnimatorComplete'},
		{name: 'bgbar', kind: Control},
		{name: 'bar', kind: Control}
	],

	/**
	* @private
	*/
	popupLeftCanvasWidth: 27, // Popup left canvas width in pixel

	/**
	* @private
	*/
	popupRightCanvasWidth: 27, // Popup right canvas width in pixel

	/**
	* @private
	*/
	popupComponents: [
		{name: 'popup', kind: Popup, classes: 'moon-progress-bar-popup above', accessibilityDisabled: true, components: [
			{name: 'drawingLeft', kind: Control, tag: 'canvas', classes: 'moon-progress-bar-popup-left'},
			{name: 'popupLabel', kind: Control, classes: 'moon-progress-bar-popup-center' },
			{name: 'drawingRight', kind: Control, tag: 'canvas', classes: 'moon-progress-bar-popup-right'}
		]}
	],

	/**
	* @private
	*/
	create: function () {
		this._nf = new NumFmt({type: 'percentage', useNative: false});
		Control.prototype.create.apply(this, arguments);
		this.initPopup();
		this.orientationChanged();
		this.progressChanged();
		this.barClassesChanged();
		this.bgBarClassesChanged();
		this.bgProgressChanged();
	},

	/**
	* @private
	*/
	initPopup: function () {
		if (this.popup) {
			// FIXME: Backwards-compatibility for deprecated property - can be removed when
			// the popupContentUpperCase property is fully deprecated and removed. The legacy
			// property takes precedence if it exists.
			if (this.popupContentUpperCase !== null) this.uppercase = this.popupContentUpperCase;
			this.createPopup();
			this.initPopupStyles();
		}
	},

	/**
	* @private
	*/
	createPopup: function () {
		this.createComponents(this.popupComponents, {owner: this});
		this.$.popup.setAutoDismiss(false);
		this.$.popup.show();
	},

	/**
	* @private
	*/
	initPopupStyles: function () {
		this.popupLabelClassesChanged();
		this.popupContentChanged();
		this.updatePopupLabelColor();
		this.updatePopupHeight();
		this.updatePopupOffset();
		this.popupWidthChanged();
	},

	/**
	* @private
	*/
	destroy: function () {
		if(this._nf){
			delete this._nf;
		}
		Control.prototype.destroy.apply(this, arguments);
	},

	rendered: function () {
		Control.prototype.rendered.apply(this, arguments);
		if(this.$.popup){
			this.drawToCanvas(this.popupColor);
		}
	},

	/**
	* @private
	*/
	orientationChanged: function () {
		var orient = this.get('orientation');
		this.addRemoveClass('moon-progress-bar-vertical', orient == 'vertical');
		this.addRemoveClass('moon-progress-bar-horizontal', orient == 'horizontal');
	},

	/**
	* @private
	*/
	popupSideChanged: function () {
		this.updatePopup(this.progress);
	},

	/**
	* @private
	*/
	barClassesChanged: function (inOld) {
		this.$.bar.removeClass(inOld);
		this.$.bar.addClass(this.barClasses);
	},

	/**
	* @private
	*/
	bgBarClassesChanged: function (inOld) {
		this.$.bgbar.removeClass(inOld);
		this.$.bgbar.addClass(this.bgBarClasses);
	},

	/**
	* @private
	*/
	bgProgressChanged: function () {
		this.bgProgress = this.clampValue(this.min, this.max, this.bgProgress);
		var p = this.calcPercent(this.bgProgress);
		this.updateBgBarPosition(p);
	},

	/**
	* @private
	*/
	progressChanged: function () {
		this.progress = this.clampValue(this.min, this.max, this.progress);
		this.updateBarPosition(this.calcPercent(this.progress));
		if (this.popup) {
			this.updatePopup(this.progress);
		}
	},

	/**
	* @private
	*/
	showPercentageChanged: function () {
		this.updatePopup(this.progress);
	},

	/**
	* @private
	*/
	clampValue: function (inMin, inMax, inValue) {
		return Math.max(inMin, Math.min(inValue, inMax));
	},

	/**
	* @private
	*/
	calcRatio: function (inValue) {
		return (inValue - this.min) / (this.max - this.min);
	},

	/**
	* @private
	*/
	calcPercent: function (inValue) {
		return this.calcRatio(inValue) * 100;
	},

	/**
	* @private
	*/
	updateBarPosition: function (inPercent) {
		this.$.bar.applyStyle(this.get('orientation') == 'vertical' ? 'height' : 'width', inPercent + '%');
	},

	/**
	* @private
	*/
	updateBgBarPosition: function (inPercent) {
		this.$.bgbar.applyStyle(this.get('orientation') == 'vertical' ? 'height' : 'width', inPercent + '%');
	},

	/**
	* Animates progress to the passed-in value.
	*
	* @param {Number} inValue  The destination number
	* @public
	*/
	animateProgressTo: function (inValue) {
		this.$.progressAnimator.play({
			startValue: this.progress,
			endValue: inValue,
			node: this.hasNode()
		});
	},

	/**
	* @private
	*/
	progressAnimatorStep: function (inSender) {
		this.setProgress(inSender.value);
		return true;
	},

	/**
	* @fires module:moonstone/ProgressBar~ProgressBar#onAnimateProgressFinish
	* @private
	*/
	progressAnimatorComplete: function (inSender) {
		this.doAnimateProgressFinish();
		return true;
	},

	/**
	* @private
	*/
	popupChanged: function () {
		if (this.popup && !this.$.popup) {
			this.createPopup();
			this.initPopupStyles();
			this.orientationChanged();
			this.render();
		} else if (!this.popup && this.$.popup) {
			this.$.popup.destroy();
		}
	},

	/**
	* @private
	*/
	updatePopup: function (val) {
		var usePercentage, percent, popupLabel, flip;
		if (this.popup) {
			usePercentage = this.showPercentage && this.popupContent === null;
			percent = this.calcPercent(val);
			popupLabel = usePercentage ? percent : val;
			flip = (this.get('orientation') == 'vertical') ? (this.get('popupSide') == 'left') : percent > 50;

			this.updatePopupPosition(percent);
			this.$.popup.addRemoveClass('moon-progress-bar-popup-flip-h', flip);
			this.$.popupLabel.addRemoveClass('moon-progress-bar-popup-flip-h', flip);

			this.updatePopupLabel(popupLabel);
		}
	},

	/**
	* Refactored out so that Slider can position the knob instead of the popup
	*
	* @private
	*/
	updatePopupPosition: function (percent) {
		if (this.popup) {
			this.$.popup.applyStyle(this.get('orientation') == 'vertical' ? 'bottom' : 'left', percent + '%');
		}
	},

	/**
	* @private
	*/
	popupLabelClassesChanged: function (was) {
		if (this.popup) {
			this.$.popupLabel.removeClass(was);
			this.$.popupLabel.addClass(this.popupLabelClasses);
		}
	},

	/**
	* @private
	*/
	updatePopupOffset: function () {
		if (this.popup) {
			this.$.popup.applyStyle('top', dom.unit(-(ri.scale(this.getPopupHeight() + this.getPopupOffset() + 5)), 'rem'));
		}
	},

	/**
	* Updates popup offset.
	*
	* @private
	*/
	popupOffsetChanged: function () {
		if (this.popup) {
			this.updatePopupOffset();
			this.drawToCanvas(this.popupColor);
		}
	},

	/**
	* Updates popup width.
	*
	* @private
	*/
	popupWidthChanged: function () {
		if (this.popup && this.popupWidth != 'auto') {
			this.$.popupLabel.applyStyle('width', dom.unit( this.getPopupWidth() - (this.popupLeftCanvasWidth + this.popupRightCanvasWidth) , 'rem'));
		}
	},

	/**
	* @private
	*/
	updatePopupHeight: function () {
		var h = this.getPopupHeight(),
			hRem = ri.scale(h);

		this.$.drawingLeft.setAttribute('height', hRem);
		this.$.drawingRight.setAttribute('height', hRem);
		this.$.popupLabel.applyStyle('height', dom.unit(ri.scale(h - 7), 'rem'));
		this.$.popup.applyStyle('height', dom.unit(hRem, 'rem'));
		this.$.popup.applyStyle('line-height', dom.unit(ri.scale(h - 6), 'rem'));
	},

	/**
	* Updates popup height.
	*
	* @private
	*/
	popupHeightChanged: function () {
		if (this.popup) {
			if (this.getPopupHeight() >= 72) {
				log.warn('This popupHeight API is designed for under 72 pixels.');
			}

			this.updatePopupHeight();
			this.popupOffsetChanged();
		}
	},

	/**
	* @private
	*/
	updatePopupLabelColor: function () {
		if (this.popup) {
			this.$.popupLabel.applyStyle('background-color', this.popupColor);
		}
	},

	/**
	* Updates popup color.
	*
	* @private
	*/
	popupColorChanged: function () {
		if (this.popup) {
			this.drawToCanvas(this.popupColor);
			this.updatePopupLabelColor();
		}
	},

	/**
	* Updates popup content.
	*
	* @private
	*/
	popupContentChanged: function () {
		var content;
		if (this.popup) {
			content = this.getPopupContent();
			this._popupContent = this.get('uppercase') ? util.toUpperCase(content) : content;
			// != null allows 0 but avoids undefined and null
			if (this._popupContent != null && this._popupContent !== '') {
				this.$.popupLabel.set('content', this._popupContent);
			}
		}
	},

	/**
	* @private
	*/
	uppercaseChanged: function () {
		// FIXME: Backwards-compatibility for deprecated property - can be removed when
		// popupContentUpperCase is fully deprecated and removed.
		if (this.popupContentUpperCase != this.uppercase) this.popupContentUpperCase = this.uppercase;
		this.popupContentChanged();
	},

	/**
	* @private
	*/
	popupContentUpperCaseChanged: function () {
		if (this.uppercase != this.popupContentUpperCase) this.uppercase = this.popupContentUpperCase;
		this.uppercaseChanged();
	},

	/**
	* @private
	*/
	updatePopupLabel: function (val) {
		var label;
		if (this.popup) {
			label = this._popupContent || this.calcPopupLabel(val);
			if (label != null && label !== '') {
				this.$.popupLabel.set('content', label);
			}
		}
	},

	/**
	* @private
	*/
	calcPopupLabel: function (val) {
		if (this.showPercentage) {
			val = this._nf.format(Math.round(val));
		}
		return val;
	},

		/**
	* @private
	*/
	drawToCanvas: function (bgColor) {
		bgColor = bgColor  || dom.getComputedStyleValue(this.$.knob.hasNode(), 'background-color');
		var h = ri.scale( this.getPopupHeight()+1 ), // height total
			hb = h - ri.scale(8), // height bubble
			hbc = (hb)/2, // height of bubble's center
			wre = ri.scale(26), // width's edge
			r = hbc, // radius is half the bubble height
			bcr = ri.scale(50), // bottom curve radius 50
			bcy = hb + bcr, //calculate the height of the center of the circle plus the radius to get the y coordinate of the circle to draw the bottom irregular arc
			lw = 1, // line width that will be tucked under the neighboring dom element's edge
			drawingLeft = this.$.drawingLeft,
			drawingRight = this.$.drawingRight,
			ctxLeft, ctxRight;

		if (drawingLeft) {
			ctxLeft = drawingLeft.hasNode().getContext('2d'),
			drawingLeft.setAttribute('width', ri.scale( this.popupLeftCanvasWidth) );

			// Set styles. Default color is knob's color
			ctxLeft.fillStyle = bgColor;
			// Draw shape with arrow on left
			ctxLeft.moveTo(0, h);
			// arc(x, y, radius, startAngle, endAngle, counterClockwise);
			ctxLeft.arc(wre, bcy, bcr, 1.35 * Math.PI, 1.485 * Math.PI, false);
			ctxLeft.lineTo(wre, hb);
			ctxLeft.lineTo(wre, 0);
			ctxLeft.arcTo(0, 0, 0, hbc, r);
			ctxLeft.lineTo(0, h);
			ctxLeft.fill();
			// Add a spacer line
			ctxLeft.beginPath();
			ctxLeft.lineWidth = lw+1;
			ctxLeft.strokeStyle = bgColor;
			ctxLeft.moveTo(wre+lw, 0);
			ctxLeft.lineTo(wre+lw, hb);
			ctxLeft.stroke();
		}

		if (drawingRight) {
			ctxRight = drawingRight.hasNode().getContext('2d');
			drawingRight.setAttribute('width', ri.scale( this.popupRightCanvasWidth) );

			// Set styles. Default color is knob's color
			ctxRight.fillStyle = bgColor;
			// Draw shape with arrow on right
			ctxRight.moveTo(lw, hb);
			ctxRight.arcTo(wre+lw, hb, wre+lw, hbc, r);

			ctxRight.arcTo(wre+lw, 0, lw, 0, r);
			ctxRight.lineTo(0, 0);
			ctxRight.fill();
			// Add a spacer line
			ctxRight.beginPath();
			ctxRight.lineWidth = lw+1;
			ctxRight.strokeStyle = bgColor;
			ctxRight.moveTo(0, 0);
			ctxRight.lineTo(0, hb);
			ctxRight.stroke();
		}
	},

	// Accessibility

	/**
	* @default progressbar
	* @type {String}
	* @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
	* @public
	*/
	accessibilityRole: 'progressbar',

	/**
	* Custom value for accessibility (ignored if `null`).
	*
	* @type {String|null}
	* @default null
	* @public
	*/
	accessibilityValueText: null,

	/**
	* When `true`, VoiceReadout will be prevented.
	*
	* @default true
	* @type {Boolean}
	* @public
	*/
	accessibilityDisabled: true,

	/**
	* ProgressBar isn't spottable so we'll make it focusable manually
	*
	* @private
	*/
	tabIndex: -1,

	/**
	* @private
	*/
	ariaObservers: [
		// TODO: Observing $.popupLabel.content to minimize the observed members. Some refactoring
		// of the label determination could help here - rjd
		{path: ['accessibilityValueText', 'progress', 'popup', 'popupContent', 'showPercentage'], method: 'ariaValue'}
	],

	/**
	* Determines the text or value to set as the accessible value for the progress bar
	*
	* @private
	*/
	ariaValue: function () {
		var value = this.$.progressAnimator.isAnimating() ? this.$.progressAnimator.endValue : this.progress,
			usePercent = this.popup && this.showPercentage && !this.popupContent,
			text = this.accessibilityValueText ||
					this.popup && this.popupContent ||
					usePercent && this.calcPopupLabel(this.calcPercent(value)) ||
					value;
		this.setAriaAttribute('aria-valuetext', text);
	}
});
