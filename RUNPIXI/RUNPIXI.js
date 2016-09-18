/* Helper to get PIXI.js to run.
	Needs jQuery and PIXI.js

		Just use RUNPIXI.initialize to get a running PIXI screen.
		RUNPIXI provides you with three stages (containers) to draw on:
			The BACKSTAGE is fixed and used for backgrounds like sky images.
			The SCROLLSTAGE is the main stage, it can be easily scrolled.
			The HUDSTAGE is the most foreground stage, also fixed, used for menus and HUD.
	
	Usage:
		<div id="mypixiscreen" style="width: XXXpx; height: YYYpx"></div>
		<script>
			function loopfunction()
			{
				// add your loop stuff here.
			}
			
			// you need only this single line of code to make pixi run inside your div.
			RUNPIXI.initialize("#mypixiscreen", loopfunction);

			// Additional Stuff:

			// TEXTURE-MANAGER [TODO] 
			var Tex = RUNPIXI.GetTexture("myimage.png"); // just LOADS the texture ONCE...
			var myPixiSprite = new PIXI.Sprite(Tex);

			var Tex2 = RUNPIXI.GetTexture("myimage.png"); // ...now it re-uses the already loaded texture.
			...

			// SCROLLING
			[TODO]			

			// get access to the main stage with RSTAGE(), RUNPIXI.STAGE() or RUNPIXI.instance.SCROLLSTAGE().
			// RBACKSTAGE(), RUNPIXI.BACKSTAGE() or RUNPIXI.instance.BACKSTAGE() for the background stage.
			// RHUDSTAGE(), RUNPIXI.HUDSTAGE() or RUNPIXI.instance.HUDSTAGE() for the foreground stage.		
			RSTAGE().addChild(myPixiSprite);

		</script>
*/

/*
Hierarchy
	ROOT
		RBGSTAGE			- fixed
		RPARALLAXSTAGE 	(RSTAGE)	- moving
		RHUDSTAGE			- fixed
*/

/*
	TODO:
	Scrolling...done.
	Texture Manager
		Load Texture if not loaded.
		Else get it from the list.
*/

var RUNPIXI = function()
{	
	// this function is called each frame.
	var _MainLoopFunction = function() {};
	this.setMainLoopFunction = function(m)
	{
		if(jQuery.isFunction(m))
			_MainLoopFunction = m;
		else
			console.log("ERROR: RUNPIXI.setMainLoopMethod needs a function as parameter.");
	};

	// SCROLLING STUFF...way to much, minimize it.
	var _actualScrollRate = 0.0;	// this is how much is to be scrolled.
	var _isScrolling = false;	// is it scrolling?
	var _ScrollRX = 0; 		// -1, 0, 1 - also if keys are not pressed.
	var _ScrollRY = 0;		// -1, 0, 1 - also if keys are not pressed.
	var _ScrollKeyDown = false;	// the keys.
	var _ScrollKeyUp = false;
	var _ScrollKeyLeft = false;
	var _ScrollKeyRight = false;

	// activate scrolling in a specific direction.
	var _ScrollActivate = function(ratex, ratey)
	{
		_isScrolling = true;
		if(ratex!=0) _ScrollRX = ratex;
		if(ratey!=0) _ScrollRY = ratey;
	};

	// get scroll keys down
	var _ScrollKeysDown = function(e)
	{
		var k = String.fromCharCode(e.which);

		// scroll keys
                if(e.keyCode == 38 || k.toLowerCase() == 'w')
                {
                	if(!_ScrollKeyUp)
                            _actualScrollRate = RUNPIXI.ScrollRateMin;
                        _ScrollActivate(0,-1);
                        _ScrollKeyUp = true;
                }
                if(e.keyCode == 40 || k.toLowerCase() == 's')
                {
                        if(!_ScrollKeyDown)
                            _actualScrollRate = RUNPIXI.ScrollRateMin;
                        _ScrollActivate(0,1);
                        _ScrollKeyDown = true;
                }
                if(e.keyCode == 37 || k.toLowerCase() == 'a')
                {
                        if(!_ScrollKeyLeft)
                            _actualScrollRate = RUNPIXI.ScrollRateMin;
                        _ScrollActivate(-1,0);
                        _ScrollKeyLeft = true;
                }
                if(e.keyCode == 39 || k.toLowerCase() == 'd')
                {
                        if(!_ScrollKeyRight)
                            _actualScrollRate = RUNPIXI.ScrollRateMin;
                        _ScrollActivate(1,0);
                        _ScrollKeyRight = true;
                }
	};

	// get scroll keys up
	var _ScrollKeysUp = function(e)
	{
		var k = String.fromCharCode(e.which);

		// scroll keys
                if(e.keyCode == 38 || k.toLowerCase() == 'w') {_ScrollKeyUp = false;}
                if(e.keyCode == 40 || k.toLowerCase() == 's') {_ScrollKeyDown = false;}
                if(e.keyCode == 37 || k.toLowerCase() == 'a') {_ScrollKeyLeft = false;}
        	if(e.keyCode == 39 || k.toLowerCase() == 'd') {_ScrollKeyRight = false;}
	};

	// update scrolling
	var _ScrollUpdate = function()
	{
		if(_isScrolling)
		{
			// increase scroll rate.
			if(_actualScrollRate < RUNPIXI.ScrollRateMax)
				_actualScrollRate += RUNPIXI.ScrollRateStep;
			
			// don't go over max scroll rate.
			if(_actualScrollRate > RUNPIXI.ScrollRateMax)
				_actualScrollRate = RUNPIXI.ScrollRateMax;
		}else{
			// decrease scroll rate
			if(_actualScrollRate > RUNPIXI.ScrollRateMin)
				_actualScrollRate -= RUNPIXI.ScrollRateStep;

			// reset if done.
			if(_actualScrollRate <= RUNPIXI.ScrollRateMin)
			{
				_actualScrollRate = 0;
				_ScrollRX=0;
				_ScrollRY=0;
			}
		}

		// reset scrolling if no key is pressed and scrollwithkeys is true.
		if(RUNPIXI.ScrollWithKeys==true)
		{
			// decrease vector 1->0 if no key is pressed.
			if(!_ScrollKeyRight && !_ScrollKeyLeft)
			{
				_ScrollRX *= 0.95;
				if(Math.abs(_ScrollRX)<RUNPIXI.ScrollRateStep)
					_ScrollRX = 0;
			};

			if(!_ScrollKeyUp && !_ScrollKeyDown)
			{
				_ScrollRY *= 0.95;
				if(Math.abs(_ScrollRY)<RUNPIXI.ScrollRateStep)
					_ScrollRY = 0;
			};

			// stop scrolling
			if(!_ScrollKeyRight && !_ScrollKeyLeft && !_ScrollKeyUp && !_ScrollKeyDown)
				_isScrolling = false;
		}
	
		// eventually add the scroll rate.
		_PIXIScrollStage.position.x += _ScrollRX * _actualScrollRate;
		_PIXIScrollStage.position.y += _ScrollRY * _actualScrollRate;
	};
	
	// PIXI STUFF
	// stages
	var _PIXIRootStage = new PIXI.Container();	// all other stages are childs of the root stage.
	var _PIXIBackStage = new PIXI.Container();	// the fixed background stage.
	var _PIXIScrollStage = new PIXI.Container();	// the scrolling flexible stage.
	var _PIXIHUDStage = new PIXI.Container();	// the fixed foreground stage.
	var _shaders = Array();				// array with the shaders.

	this.BACKSTAGE = function() {return _PIXIBackStage;};
	this.SCROLLSTAGE = function() {return _PIXIScrollStage;};
	this.HUDSTAGE = function() {return _PIXIHUDStage;};

	// ground work
	var _PIXIRenderer = null;
	var _PIXIHTMLScreen = null;
	var _PIXIWidth = 0;
	var _PIXIHeight = 0;
	
	// render function.
	// _MainLoopFunction is "your" function.
	var _PIXILoopMethod = function()
	{
		requestAnimationFrame(_PIXILoopMethod);
		_MainLoopFunction();
		_ScrollUpdate();
		_PIXIRenderer.render(_PIXIRootStage);
	};
	
	// Initialize PIXI.
	var _PIXIInitialize = function(pixicontainerID)
	{
		if($(pixicontainerID).length===0)
		{
			console.log("ERROR: No screen given for PIXI. Aborting!");
			return;
		}
		
		// just initialize it once.
		if(_PIXIHTMLScreen == null || _PIXIRenderer == null)
		{
			_PIXIHTMLScreen = $(pixicontainerID);
			_PIXIWidth = _PIXIHTMLScreen.width();
			_PIXIHeight = _PIXIHTMLScreen.height();
		
			_PIXIRenderer = PIXI.autoDetectRenderer(_PIXIWidth, _PIXIHeight,{backgroundColor : 0x1099bb});
			_PIXIHTMLScreen.append(_PIXIRenderer.view);
						
			// create hierarchy
			_PIXIRootStage.addChild(_PIXIBackStage);
			_PIXIRootStage.addChild(_PIXIScrollStage);
			_PIXIRootStage.addChild(_PIXIHUDStage);

			// start the pixi loop.
			_PIXILoopMethod();
		}else{
			console.log("PIXI Screen already initialized.");
		}
	};
	this.initialize = function(pixicontainerID) {_PIXIInitialize(pixicontainerID);};
	
	// create and return a sprite
	this.CreateSprite = function(texture, x, y, rotation, anchorx, anchory, scalex,scaley)
	{
		var s = new PIXI.Sprite(texture);
		s.position.x = x;
		s.position.y = y;
		s.anchor.x =anchorx;
		s.anchor.y =anchory;
		s.rotation =rotation;
		s.scale.x=scalex;
		s.scale.y=scaley;
		return s;
	};

	// shader stuff.
	this.CreatePixelShader = function(name, shadercode) {_shaders[name] = new PIXI.AbstractFilter('', shadercode); return _shaders[name];};
	this.CreateVertexShader = function(name, shadercode) {_shaders[name] = new PIXI.AbstractFilter(shadercode, ''); return _shaders[name];};
	this.GetShader = function(name) {return _shaders[name];};

	// resize renderer if size changes.
	window.addEventListener('resize', function(event){
		if(_PIXIHTMLScreen==null || _PIXIRenderer==null)
			return;
		
		_PIXIWidth = _PIXIHTMLScreen.width();
		_PIXIHeight = _PIXIHTMLScreen.height();
		_PIXIRenderer.resize(_PIXIWidth, _PIXIHeight);
	});

	$(document).ready(function()
	{
		$(document).keydown(function(e)
		{
			if(RUNPIXI.ScrollWithKeys == true)
				_ScrollKeysDown(e);
		});

		$(document).keyup(function(e) 
		{
			if(RUNPIXI.ScrollWithKeys == true)
				_ScrollKeysUp(e);
		});	
	});
};
RUNPIXI.instance = new RUNPIXI();

// SCROLL stuff
RUNPIXI.ScrollWithKeys = true; 	// enable keys for scrolling.
RUNPIXI.ScrollRateMin = 5;	// minimum scroll speed.
RUNPIXI.ScrollRateMax = 20;	// maximum scroll speed.
RUNPIXI.ScrollRateStep = 0.5;	// how fast from minimum to maximum scroll speed?
// ENDOF Scroll stuff.

// create sprite with position, rotation, anchor and size.
RUNPIXI.CreateSprite = function(texture, x, y, rotation, anchorx, anchory, scalex, scaley) {return RUNPIXI.instance.CreateSprite(texture,x,y,rotation,anchorx,anchory, scalex, scaley);};
// short of createsprite, only with position - anchor is 0.5, scale is 1, rotation is 0
RUNPIXI.Sprite = function(texture, x, y) {return RUNPIXI.instance.CreateSprite(texture, x, y,0,0.5,0.5,1,1);};

// Shader stuff.
RUNPIXI.CreateShader = function(name, shadercode) {return RUNPIXI.instance.CreateShader(name,shadercode);};
RUNPIXI.GetShader = function(name) {return RUNPIXI.instance.GetShader(name);};

// shorts to the stages.
RUNPIXI.STAGE = function() {return RUNPIXI.instance.SCROLLSTAGE();};
RUNPIXI.BACKSTAGE = function() {return RUNPIXI.instance.BACKSTAGE();};
RUNPIXI.HUDSTAGE = function() {return RUNPIXI.instance.HUDSTAGE();};

// shorter short for RUNPIXI.STAGE() or RUNPIXI.instance.STAGE()
RSTAGE = function() {return RUNPIXI.instance.SCROLLSTAGE();};
RBACKSTAGE = function() {return RUNPIXI.instance.BACKSTAGE();};
RHUDSTAGE = function() {return RUNPIXI.instance.HUDSTAGE();};

// the MAIN function. ;)
RUNPIXI.initialize = function(pixicontainerID, mainLoopFunction) 
{
	RUNPIXI.instance.initialize(pixicontainerID);
	RUNPIXI.instance.setMainLoopFunction(mainLoopFunction);
};

// Helper to create a pixelart screen.
RUNPIXI.PIXELATED = function() {PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;};

