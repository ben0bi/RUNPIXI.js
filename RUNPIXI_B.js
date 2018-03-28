var RUNPIXIVERSION = "0.7.2 (B)"
/*
	Version B:
	0.7.2 <= 0.7.1 <= 0.7.0

	Successor of Version A: 
	v0.6.5 (v0.6.4 <= 0.6.3 <= 0.6.2 <= 0.6.1 <= 
	0.6.0 <= 0.5.0 <= 0.4.1 <= 0.4.0 <= 0.3.5 <= ???)
*/
/* Helper to get PIXI.js to run.
	Needs PIXI.js

(TODO)	Just use PIXI.initScreen or PIXI.RUN to get a running PIXI screen.
(TODO)	RUNPIXI provides you with three stages (containers) to draw on:
(TODO)		The BACKSTAGE is fixed and used for backgrounds like sky images.
(TODO)		The SCROLLSTAGE is the main stage, it can be easily scrolled.
(TODO)		The HUDSTAGE is the most foreground stage, also fixed, used for menus and HUD.

	Usage:
		<div id="mypixiscreen" style="width: XXXpx; height: YYYpx"></div>
		<script>
			function loopfunction()
			{
				// add your loop stuff here.
				// this function gets called after a frame has rendered.
			}

			// you need only this single line of code to make pixi run inside your div.
			PIXI.RUN("mypixiscreen", loopfunction);

			// Additional Stuff:

			// get access to the main stage with RSTAGE(), RUNPIXI.STAGE() or RUNPIXI.instance.SCROLLSTAGE().
			// RBACKSTAGE(), RUNPIXI.BACKSTAGE() or RUNPIXI.instance.BACKSTAGE() for the background stage.
			// RHUDSTAGE(), RUNPIXI.HUDSTAGE() or RUNPIXI.instance.HUDSTAGE() for the foreground stage.		

			RSTAGE().addChild(myPixiSprite);

			// more in the readme file.
		</script>
*/

// 0.7.1: Like null, but with typeof==="function"
var nullFunc = nuff = NUFF = function() {};

// 0.7.1: check if a variable is defined.
var isDefined = function(param) {return typeof(param)==="undefined"?false:true;};

// 0.7.1: Rewriteable log function.
var RPlog = function(txt) {console.log(txt);return txt;}

// The runpixi class. It will create a new one with PIXI.RUN, if there is none.
var RUNPIXI = function()
{
// PRIVATE VARIABLES
	// The root container of RUNPIXI.
	var _PIXIRootContainer = new PIXI.Container();	// all other containers are childs 
													// of the root stage.	
	// This function is called after each frame.
	var _onFrameUpdateFunction = null;
	// This function is called after a resize.
	var _onResizeFunction = null;

	// A little dirty ground work.
	var _PIXIRenderer = null;	// The PIXI renderer.

	var _PIXIDOMScreen = null; 	// ...while not using jquery.
	var _PIXIWidth = 0;		// width of the PIXI canvas.
	var _PIXIHeight = 0;		// height of the PIXI canvas.
	
	// the default background color.
	var _defaultBackgroundColor = 0x1199bb;

// FUNCTIONS
	// get the stage
	this.getStage = function() {return _PIXIRootContainer;};

	// get the renderer.
	this.RENDERER = function() {return _PIXIRenderer;};
	// get the screen size as object.
	this.getScreenSize = function() {var o=new Object();o.x = _PIXIWidth;o.w = _PIXIWidth; o.y=_PIXIHeight; o.h=_PIXIHeight; return o;}
	// set the onFrameUpdate function.
	this.setOnFrameUpdateFunction = function(m)
	{
		if(typeof(m) === 'function')
		{
			_onFrameUpdateFunction = m;
			RPlog("[ OK ] RUNPIXI got an onFrameUpdate callback function.");
		}else{
			RPlog("[!ERR] RUNPIXI.setOnFrameUpdateFunction needs a function as parameter.");
		}	
	};
	// set the onResize function.
	this.setOnResizeFunction = function(m)
	{
		if(typeof(m) === 'function')
		{
			_onResizeFunction = m;
			RPlog("[ OK ] RUNPIXI got an onResize callback function.");
		}else{
			RPlog("[!ERR] RUNPIXI.setOnResizeFunction needs a function as parameter.");
		}
	};

	// render function.
	// _MainLoopFunction is "your" function.
	var _PIXILoopMethod = function()
	{
		requestAnimationFrame(_PIXILoopMethod);
		_onFrameUpdateFunction();
		//_ScrollUpdate();
		_PIXIRenderer.render(_PIXIRootContainer);
	};

	// Initialize PIXI.
	/*
		pixicontainerID is the HTML ID of the container where pixi should run in.
		backgroundColor (not offensive to older versions.):
			Use "transparent" for a transparent background.
			You can use hex colors: 0xRRGGBB (R = Red, G = Green, B = Blue), e.g. 0x00FF00 for full green.
	*/
	var _PIXIInitialize = function(pixicontainerID, backgroundColor)
	{
		if(document.getElementById(pixicontainerID) == null)
		{
			RPlog("[!ERR] DOM element for PIXI screen not found. Aborting!");
			return;
		}else{		
			RPlog("[ OK ] DOM element for PIXI screen found.");
		}

		// just initialize it once.
		if(_PIXIDOMScreen == null || _PIXIRenderer == null)
		{
			// get screen and screen size.
			_PIXIDOMScreen = document.getElementById(pixicontainerID);
			_PIXIWidth = _PIXIDOMScreen.clientWidth;
			_PIXIHeight = _PIXIDOMScreen.clientHeight;

			// set background color.
			var transpar = false;
			var bgcolor = 0xFF3333; // absolute default background color, something is wrong when you see this red.
			// use "transparent" for a transparent screen. (no background color)			
			if(backgroundColor=="transparent")
			{
				bgcolor = 0x000000;
                		transpar = true;
            		}else {
		                bgcolor = backgroundColor;
            		}
			// create the renderer and add it to the DOM.
			_PIXIRenderer = PIXI.autoDetectRenderer(_PIXIWidth, _PIXIHeight,{backgroundColor : bgcolor, transparent : transpar});
			_PIXIDOMScreen.appendChild(_PIXIRenderer.view);

			//(TODO) create hierarchy
			//_PIXIRootStage.addChild(_PIXIBackStage);
			//_PIXIRootStage.addChild(_PIXIScrollStage);
			//_PIXIRootStage.addChild(_PIXIHUDStage);

			// start the pixi loop.
			RPlog("[ OK ] PIXI screen initialized. Have Fun!");
			_PIXILoopMethod();
		}else{
			RPlog("[WARN] PIXI screen already initialized.");
		}
	};

	// initialize it with default blue if there is no color given.
	this.initialize = function(pixicontainerID, backgroundColor) 
	{
		if(backgroundColor)
			return _PIXIInitialize(pixicontainerID, backgroundColor);
		else
			return _PIXIInitialize(pixicontainerID, _defaultBackgroundColor);
	};
	
	// create and return a sprite with properties in one line. (0.6.5 => 0.7.2)
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

	// 0.7.2 easy setup of a sprite.
	this.SimpleSprite = function(texture, x, y)
	{return this.CreateSprite(texture, x,y,0.0,0.0,0.0,1.0,1.0);}
	
	// return the global mouse position.
	this.GlobalMousePosition = function()
	{
		if(_PIXIRenderer!=null)
			return _PIXIRenderer.plugins.interaction.mouse.global;
        	return {'x':0,'y':0};
	};

// RESIZE HOOK
	// resize renderer if size changes.
	window.addEventListener('resize', function(event){
		if(_PIXIDOMScreen==null || _PIXIRenderer==null)
			return;

		_PIXIWidth = _PIXIDOMScreen.clientWidth;
		_PIXIHeight = _PIXIDOMScreen.clientHeight;
		_PIXIRenderer.resize(_PIXIWidth, _PIXIHeight);
		if(typeof(_onResizeFunction) === 'function')
			_onResizeFunction(event);
	});
}

// RUNPIXI Singleton instance. (0.7.1 -> if condition.)
if(!isDefined(RUNPIXI.instance))
{
	RUNPIXI.instance = new RUNPIXI();
	console.log("[ OK ] RUNPIXI singleton created.");
}else{
	console.log("[WARN] No RUNPIXI singleton created. Is it already there?");
	RUNPIXI.instance = nuff;
}

// 0.7.1 check if PIXI is defined.
if(!isDefined(PIXI))
{
	console.log("[FATALITY] PIXI not loaded. Please load it before RUNPIXI gets loaded.");
	PIXI = nuff;
}

// The default background color.
PIXI.setDefaultBackgroundColor = RUNPIXI.setDefaultBackgroundColor =  function(hexRGBvalue) 
{return RUNPIXI.instance.setDefaultBackgroundColor(hexRGBvalue);}

// 0.7.0: Use PIXI directly if possible.
// Get the renderer
PIXI.RunningRenderer = RUNPIXI.RENDERER = RUNPIXI.instance.RENDERER;
// Get the screen size directly in Pixi.
PIXI.getScreenSize = RUNPIXI.getScreenSize = RUNPIXI.instance.getScreenSize;
PIXI.RUN = PIXI.initScreen = RUNPIXI.RUN = function(pixicontainerID, mainLoopFunction, backgroundColor=null) 
{
	RUNPIXI.instance.setOnFrameUpdateFunction(mainLoopFunction);
	if(backgroundColor)
		RUNPIXI.instance.initialize(pixicontainerID, backgroundColor);
	else
		RUNPIXI.instance.initialize(pixicontainerID);
	RPlog("");
	RPlog("╰( ͡° ͜ʖ ͡° )つ──☆.-・°*,.*°☆ Thanks for using RUNPIXI!");
	RPlog("");
};

// Helper to create a pixelart screen. (0.6.5 => 0.7.1)
PIXI.PIXELATED = RUNPIXI.PIXELATED = function(){PIXI.SCALE_MODES.DEFAULT=PIXI.SCALE_MODES.NEAREST;};

// Create a sprite. (0.6.5 => 0.7.2)
PIXI.CreateSpriteDefault=RUNPIXI.CreateSprite=RUNPIXI.instance.CreateSprite;
PIXI.CreateSpriteExtended=RUNPIXI.CreateSpriteExtended=RUNPIXI.instance.CreateSpriteExtended;

// 0.7.2 Get the Stage.
PIXI.STAGE = RUNPIXI.STAGE = RUNPIXI.instance.getStage();
