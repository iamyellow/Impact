export default function (ig, wm) {

wm.SelectFileDropdown = ig.Class.extend({
	input: null,
	boundShow: null,
	boundHide: null,
	div: null,
	filetype: '',

	init: function( elementId, filetype ) {
		this.filetype = filetype || '';
		this.input = $(elementId);
		this.boundHide = this.hide.bind(this);
		this.input.bind('focus', this.show.bind(this) );

		this.div = $('<div/>', {'class':'selectFileDialog'});
		this.input.after( this.div );
		this.div.bind('mousedown', this.noHide.bind(this) );
	},


	selectFile: function( event ) {
		this.input.val( $(event.target).attr('title') );
		this.input.blur();
		this.hide();
		return false;
	},


	setData: function( data ) {
		this.div.empty();
		for( var i = 0, l = data.length; i < l; i++ ) {
			var file = $('<a/>', {'class':'file', href: data[i].src, html: data[i].name, title: data[i].name});
			file.bind( 'click', this.selectFile.bind(this) );
			this.div.append( file );
		}
	},


	noHide: function(event) {
		event.stopPropagation();
	},


	show: function( event ) {
		var inputPos = this.input.position();//this.input.getPosition(this.input.getOffsetParent());
		var inputHeight = parseInt(this.input.innerHeight()) + parseInt(this.input.css('margin-top'));
		var inputWidth = this.input.innerWidth();
		$(document).bind( 'mousedown', this.boundHide );
		this.div.css({
			'top': inputPos.top + inputHeight + 1,
			'left': inputPos.left,
			'width': inputWidth
		}).slideDown(100);
	},


	hide: function() {
		$(document).unbind( 'mousedown', this.boundHide );
		this.div.slideUp(100);
	}
});

};