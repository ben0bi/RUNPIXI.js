/*
	Version B:
	0.7.0
	
	Successor of Version A: 
	v0.6.5 (v0.6.4 => 0.6.3 => 0.6.2 => 0.6.1 => 
	0.6.0 => 0.5.0 => 0.4.1 => 0.4.0 => 0.3.5 => ???)
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
	var _PIXIWidth = 0;			// width of the PIXI canvas.
	var _PIXIHeight = 0;		// height of the PIXI canvas.

// FUNCTIONS
	// get the renderer.
	this.RENDERER = function() {return _PIXIRenderer;};
	// get the screen size as object.
	this.getScreenSize = function() {var o=new Object();o.x = _PIXIWidth;o.w = _PIXIWidth; o.y=_PIXIHeight; o.h=_PIXIHeight; return o;}
	// set the onFrameUpdate function.
	this.setOnFrameUpdateFunction = function(m)
	{
		console.log("Setting frameupdatefunc");
		if(typeof(m) === 'function')
			_onFrameUpdateFunction = m;
		else
			console.log("ERROR: RUNPIXI.setOnFrameUpdateFunction needs a function as parameter.");
	};
	// set the onResize function.
	this.setOnResizeFunction = function(m)
	{
		if(typeof(m) === 'function')
			_onResizeFunction = m;
		else
			console.log("ERROR: RUNPIXI.setOnResizeFunction needs a function as parameter.");
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
			console.log("ERROR: DOM element for PIXI screen not found. Aborting!");
			return;
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
			var bgcolor = 0x1099bb; // default background color.
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
			_PIXILoopMethod();
		}else{
			console.log("PIXI Screen already initialized.");
		}
	};
	
	// initialize it with default blue if there is no color given.
	this.initialize = function(pixicontainerID, backgroundColor) 
	{
		if(backgroundColor)
			_PIXIInitialize(pixicontainerID, backgroundColor);
		else
			_PIXIInitialize(pixicontainerID, RUNPIXI.defaultBackgroundColor);
	};
	
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

// The default background color.
RUNPIXI.defaultBackgroundColor = 0x1099bb;

// RUNPIXI Singleton instance.
RUNPIXI.instance = new RUNPIXI();

// 0.7.0: Use PIXI directly if possible.
// Get the renderer
PIXI.RunningRenderer = RUNPIXI.RENDERER = RUNPIXI.instance.RENDERER;
// Get the screen size directly in Pixi.
PIXI.getScreenSize = RUNPIXI.getScreenSize = RUNPIXI.instance.getScreenSize;
PIXI.RUN = PIXI.initScreen = RUNPIXI.RUN = function(pixicontainerID, mainLoopFunction, backgroundColor=null) 
{
	console.log("Hello Pixi!");
	RUNPIXI.instance.setOnFrameUpdateFunction(mainLoopFunction);
	if(backgroundColor)
		RUNPIXI.instance.initialize(pixicontainerID, backgroundColor);
	else
		RUNPIXI.instance.initialize(pixicontainerID);
};
