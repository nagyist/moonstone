/**
 * moon.Panels kind definition
 * @author: Lex Podgorny
 */

enyo.kind({
	name				: 'moon.Panels',
	kind 				: 'enyo.Panels',
	spotlight			: true,
	spotlightDecorate	: false,	

	published: {
	},
	handlers: {
		onSpotlightFocused			: 'onSpotlightFocused',
		onSpotlightContainerEnter	: 'onSpotlightPanelEnter',
		onSpotlightContainerLeave	: 'onSpotlightPanelLeave',
		ontap						: 'onTap',
	},

	/************ PROTECTED **********/
	
	// Was last spotted control the panels's child?
	_hadFocus: function() {
		return enyo.Spotlight.Util.isChild(this, enyo.Spotlight.getLastControl());
	},
	
	/************ PUBLIC *************/
	
	create: function(oSender, oEvent) {
		this.inherited(arguments);
		for (var n=0; n<this.getPanels().length; n++) {
			this.getPanels()[n].spotlight = 'container';
		}
	},
	
	onTap: function(oSender, oEvent) {
		var n = this.getPanelIndex(oEvent.originator);
			
		if (n != -1 && n != this.getIndex()) {
			this.setIndex(n);
			enyo.Spotlight.setLast5WayControl(oEvent.originator);
			enyo.Spotlight.setPointerMode(false);
			return true;
		}
		return false; //
	},
	
	// Focus left one of the panels
	onSpotlightPanelLeave: function(oSender, oEvent) {
		if (enyo.Spotlight.getPointerMode()) { return true; }
		var sEvent,
			nIndex = this.getIndex();
		
		switch (oEvent.direction) {
			case 'LEFT':
				if (nIndex > 0) {
					this.setIndex(nIndex - 1);
					return true;
				}
				sEvent = 'onSpotlightLeft';
				break;
			case 'RIGHT':
				if (nIndex < this.getPanels().length - 1) {
					this.setIndex(nIndex + 1);
					return true;
				}
				sEvent = 'onSpotlightRight';
				break;
			case 'UP':
				sEvent = 'onSpotlightUp';
				break;
			case 'DOWN':
				sEvent = 'onSpotlightDown';
				break;
			
		}
		
		if (typeof oEvent.direction != 'undefined') {
			enyo.Spotlight.Util.dispatchEvent('onSpotlightBlur', null, enyo.Spotlight.getCurrent());
			enyo.Spotlight.setCurrent(this.parent)
			enyo.Spotlight.Util.dispatchEvent(sEvent, null, this.parent);
		}
		return true;
	},

	onSpotlightFocused: function(oSender, oEvent) {
		if (oEvent.originator !== this) { return false; }
		if (enyo.Spotlight.getPointerMode()) { return false; }
		
		if (!this._hadFocus()) {									// Focus came from without
			// console.log('PANELS FOCUS ENTER');
			enyo.Spotlight.spot(this.getActive());
		} else {
			// console.log('PANELS FOCUS LEAVE');
		}
		
		return false;
	},
	
	// Get index of a panel by it's reference
	getPanelIndex: function(oControl) {
		var oPanel 	= null;
		
		while (oControl.parent) {
			if (oControl.parent === this) {
				oPanel = oControl;
				break;
			}
			oControl = oControl.parent;
		}
		
		if (oPanel) {
			for (var n=0; n<this.getPanels().length; n++) {
				if (this.getPanels()[n] == oPanel) {
					return n;
				}
			}
		}
		
		return -1;
	},
	
	setIndex: function(n) {
		this.inherited(arguments);
		this.getActive().spotlight = 'container';
		enyo.Spotlight.spot(this.getActive());
	}
});