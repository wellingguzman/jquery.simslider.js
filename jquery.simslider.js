;(function($){

	var Slider = function(element, options){

		this.$element	= $(element);
		this.options 	= $.extend({}, defaults, options, {});

		this.init();
	}

	Slider.prototype.init = function(){

		var currentSlideIndex = this.options.start_index || 0;

		this.is_animating 	= false;
		this.is_playing 	= false;
		this.slide_direction= 'right';

		this.$element.css({
			position: 	"relative",
			overflow: 	"hidden",
			width: 		this.options.width,
			height:		this.options.height
		});

		this.$element.children().css({
			width: 		this.options.width,
			height:		this.options.height
		});

		this.$element.wrap('<div class="simslider-wrapper">');
		this.$element
				.children()
					.wrap('<div class="'+this.options.slide_class+'">');

		this.$element.children().css({
			'display': 	'block',
			'position': 'absolute',
			'z-index': 	0,
			'top': 		0
		});
		
		$(this).data('current_slide_index', currentSlideIndex);
		$(this).data('slides_count', this.$element.children().length)

		this._createNavigation();
		this._createPagination();

		this.setCurrentSlide( currentSlideIndex );
		this.$element.children(':eq(' + currentSlideIndex + ')').css({
			'z-index': 2
		});
		this.$element.children(':not(:eq(' + currentSlideIndex + '))').hide();

		if ( this.options.auto_play )
			this.play();
	}

	Slider.prototype._createNavigation = function(){

		var self = this;
		var nextButton = this._createNavigationButton('Next', 'next');
		var prevButton = this._createNavigationButton('Previous', 'previous');
		var playButton = this._createNavigationButton('Play', 'play');
		var stopButton = this._createNavigationButton('Stop', 'stop');

		nextButton.on('click', function(e){
			
			e.preventDefault();

			var nextSlideIndex = $(self).data('current_slide_index') + 1;
			self.slide_direction = 'right';
			self.goTo( nextSlideIndex );
		});

		prevButton.on('click', function(e){
			
			e.preventDefault();

			var prevSlideIndex = $(self).data('current_slide_index') - 1;
			self.slide_direction = 'left';
			self.goTo( prevSlideIndex );
		});

		playButton.on('click', function(e){
			
			e.preventDefault();
			self.play();
		});

		stopButton.on('click', function(e){
			
			e.preventDefault();
			self.stop();
		});

		this.$element.parent().append($('<div>').addClass('simslider-pagination'));

	};

	Slider.prototype._createNavigationButton = function(label, className){

		return $('<a>')
				.attr('href', '#')
				.addClass('simslider-navigation simslider-navigation-' + className)
				.text( label )
				.appendTo( this.$element.parent() )

	};

	Slider.prototype._createPagination = function(){

		var self = this;

		this.$pagination = $('<div>').addClass('simslider-pagination').appendTo(this.$element.parent());
		
		var pagination_list = $('<ul>').appendTo(this.$pagination);
		
		for(var i=0;i<$(this).data('slides_count');i++)
		{
			var link 	= $('<a>').attr('href', '#'+i).html(i+1);
			var li 		= $('<li>').append(link);

			pagination_list.append(li);
		}

		pagination_list.find('li a').on('click', function(e){

			e.preventDefault();
			
			self.stop();

			var nextSlideIndex = $(this).parent().index();

			self.goTo( nextSlideIndex );

			if ( self.options.auto_play )
				self.play();
		})
	}



	Slider.prototype.play = function(){

		var self 			= this;

		if ( this.is_playing )
			return;

		this.is_playing 		= true;
		this.slide_direction 	= 'right';

		$(this).data("playInterval", setInterval(function(){
			
			self._doPlay();

		}, this.options.delay));
	};

	Slider.prototype.stop = function(){

		this.is_playing 	= false;

		clearInterval($(this).data('playInterval'));

		this._stopAnimation();

	};

	Slider.prototype._stopAnimation = function(){

		this.$element.children().clearQueue();

	};

	Slider.prototype.goTo = function(nextSlideIndex){

		var currentSlideIndex 	= $(this).data('current_slide_index');
		var slidesCount 		= $(this).data('slides_count');
		
		if ( currentSlideIndex == nextSlideIndex || this.is_animating )
			return;

		if ( nextSlideIndex >= slidesCount )
			nextSlideIndex = 0;

		if ( nextSlideIndex < 0 )
			nextSlideIndex = slidesCount - 1;
		
		this.$element.children().finish();

		if ( typeof this['_'+this.options.effect] === 'function' )
			this['_'+this.options.effect]( nextSlideIndex );
		else
			this._slide( nextSlideIndex );

		$(this).data('current_slide_index', nextSlideIndex);
	};

	Slider.prototype._doPlay = function(){

		var currentSlideIndex 	= $(this).data('current_slide_index'),
			nextSlideIndex 		= currentSlideIndex + 1;

		this.goTo( nextSlideIndex );
	};

	Slider.prototype._fade = function( nextSlideIndex ){

		var $slides = this.$element,
			self	= this;

		this.is_animating = true;

		$slides.children(':eq(' + nextSlideIndex + ')').css({
			'z-index': 2,
			'opacity': 0,
			'display': 'block'
		}).animate({
			'opacity': 1
		}, {
			duration: this.options.effect_delay,
			'complete': function(){
				$(this).css({
					'z-index': 2
				});

				self.is_animating = false;
			},
			queue: false
		});
		
		$slides.children(':not(:eq(' + nextSlideIndex + '))').css({
			'z-index':0,
			'opacity': 1
		}).animate({
			'opacity': 0,
		}, {
			duration: this.options.effect_delay,
			complete: function(){
				$(this).hide();
			},
			queue: false
		});

		
		this.setCurrentSlide(nextSlideIndex);
	};

	Slider.prototype._slide = function( nextSlideIndex ){

		var $slides 			= this.$element,
			currentSlideIndex 	= $(this).data('current_slide_index'),
			self				= this,
			currentMoveTo		= -(this.options.width),
			nextMoveTo			= (this.options.width);

		if ( this.slide_direction == 'left' || (currentSlideIndex > nextSlideIndex && nextSlideIndex > 0) )
		{
			currentMoveTo 	= (this.options.width);
			nextMoveTo		= -(this.options.width);
		}

		this.is_animating = true;

		$slides.children(':eq(' + currentSlideIndex + ')').animate({
			'left': currentMoveTo
		}, 1000);

		$slides.children(':eq(' + nextSlideIndex + ')').css({
			'position': 'absolute',
			'top': 0,
			'z-index': 2,
			'left': nextMoveTo
		}).show().animate({
			'left': 0
			}, this.options.effect_delay, function(){

			$slides.children(':not(:eq(' + nextSlideIndex + '))').css({
				'z-index':0
			}).hide();

			self.is_animating = false;

		});
		
		this.setCurrentSlide(nextSlideIndex);
	};

	Slider.prototype.setCurrentSlide = function( nextSlideIndex){
		
		this.$pagination.find('li').removeClass('active');
		this.$pagination.find('li:eq(' + nextSlideIndex + ')').addClass('active');
	};


	
	$.fn.simslider = function(options){

    	return this.each(function(){
        	$(this).data('Slider', new Slider(this, options));
    	});

	};

	var defaults = {
		width: 			600,
		height: 		300,

		delay: 			2000,

		start_index: 	2,
		auto_play: 		true,

		effect: 		'slide',
		effect_delay: 	1000,

		slide_class: 'simslider-slide'
	};

})(jQuery);