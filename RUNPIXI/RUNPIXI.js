// v0.4.0 (<= 0.3.5)
/* Helper to get PIXI.js to run.
	Needs PIXI.js

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
			RUNPIXI.initialize("mypixiscreen", loopfunction);

			// Additional Stuff:
		
			// get access to the main stage with RSTAGE(), RUNPIXI.STAGE() or RUNPIXI.instance.SCROLLSTAGE().
			// RBACKSTAGE(), RUNPIXI.BACKSTAGE() or RUNPIXI.instance.BACKSTAGE() for the background stage.
			// RHUDSTAGE(), RUNPIXI.HUDSTAGE() or RUNPIXI.instance.HUDSTAGE() for the foreground stage.		

			RSTAGE().addChild(myPixiSprite);

			// more in the readme file.
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
	Texture Manager
		Load Texture if not loaded.
		Else get it from the list.
*/

// 0.4.0 NEW RUNPIXIKEY
// Funcs need one param p.
var RUNPIXIKEY = function()
{
	var _keyCode = -1;
	var _keyChar = '';
	var _func_keyDown = null;
	var _func_keyUp = null;
	var _func_params_down = null;
	var _func_params_up = null;

	// set that stuff.
	this.Set = function(keycode, keychar, keydownfunc, keyupfunc)
	{
		_keyCode = keycode;
		_keyChar = keychar;
		_func_keyDown = keydownfunc;
		_func_keyUp = keyupfunc;
	};

	this.SetDownFuncParams = function(params) {_func_params_down = params;};
	this.SetUpFuncParams = function(params) {_func_params_up = params;};

	var _state = function(e)
	{
		var k = String.fromCharCode(e.which);		

		if((_keyCode > 0 && e.keyCode == _keyCode) || 
		(_keyChar != '' && _keyChar.toLowerCase() == k.toLowerCase()))
			return true;

		return false;
	};

	// called if a key is pressed down.
	this.Down = function(event)
	{
		// return if it is not a function.
		if(typeof(_func_keyDown) !== 'function')
			return;
		if(_state(event)==true)
			_func_keyDown(_func_params_down);
	};

	// called if a key is released.
	this.Up = function(event)
	{
		// return if it is not a function.
		if(typeof(_func_keyUp) !== 'function')
			return;		
		if(_state(event)==true)
			_func_keyUp(_func_params_up);
	};
};
// ENDOF 0.4.0

var RUNPIXI = function()
{	
	// this function is called each frame.
	var _MainLoopFunction = function() {};
	this.setMainLoopFunction = function(m)
	{
		if(typeof(m) === 'function')
			_MainLoopFunction = m;
		else
			console.log("ERROR: RUNPIXI.setMainLoopMethod needs a function as parameter.");
	};

	// this is called after resize.	
	var _resizeFunction = null;
	this.setResizeFunction = function(m)
	{
		if(typeof(m) === 'function')
			_resizeFunction = m;
		else
			console.log("ERROR: RUNPIXI.setResizeMethod needs a function as parameter.");
	};

	// PIXI STUFF
	// stages
	var _PIXIRootStage = new PIXI.Container();	// all other stages are childs of the root stage.
	var _PIXIBackStage = new PIXI.Container();	// the fixed background stage.
	var _PIXIScrollStage = new PIXI.Container();	// the scrolling flexible stage.
	var _PIXIHUDStage = new PIXI.Container();	// the fixed foreground stage.

	var _shaders = Array();				// array with the shaders.
	var _keys = Array();				// 0.4.0 array with registered keys.

	// 0.4.0 Register a key.
	this.registerKey = function(keycode, keychar, downfunction, upfunction, downparams, upparams)
	{
		var k = new RUNPIXIKEY();
		k.Set(keycode, keychar, downfunction, upfunction);
		k.SetDownFuncParams(downparams);
		k.SetUpFuncParams(upparams);
		_keys.push(k);
	};

	// 0.4.0 clear all keys.
	this.clearAllKeys = function() {_keys = new Array();};

	this.BACKSTAGE = function() {return _PIXIBackStage;};
	this.SCROLLSTAGE = function() {return _PIXIScrollStage;};
	this.HUDSTAGE = function() {return _PIXIHUDStage;};

	// ground work
	var _PIXIRenderer = null;
	// 0.3.3: get renderer
	this.RENDERER = function() {return _PIXIRenderer;};

	var _PIXIDOMScreen = null; 	// [new] not using jquery.
	var _PIXIWidth = 0;
	var _PIXIHeight = 0;

	// 0.3.2: Return screen size.
	this.getScreenSize = function() {var o=new Object();o.x = _PIXIWidth;o.w = _PIXIWidth; o.y=_PIXIHeight; o.h=_PIXIHeight; return o;}

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
		if(document.getElementById(pixicontainerID) == null)
		{
			console.log("ERROR: DOM element for PIXI screen not found. Aborting!");
			return;
		}
		
		// just initialize it once.
		if(_PIXIDOMScreen == null || _PIXIRenderer == null)
		{
			_PIXIDOMScreen = document.getElementById(pixicontainerID);

			_PIXIWidth = _PIXIDOMScreen.clientWidth;
			_PIXIHeight = _PIXIDOMScreen.clientHeight;
		
			_PIXIRenderer = PIXI.autoDetectRenderer(_PIXIWidth, _PIXIHeight,{backgroundColor : 0x1099bb});
			_PIXIDOMScreen.appendChild(_PIXIRenderer.view);
						
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

// 0.4.0
// NEW SCROLLING ENGINE
	var _ScrollDirX = 0; // -1, 0, 1
	var _ScrollDirY = 0; // -1, 0, 1
	var _ScrollRateX = 0;
	var _ScrollRateY = 0;
	
	this.ScrollX= function(direction) {_scrollActivate(direction, false);};
	this.ScrollY= function(direction) {_scrollActivate(direction, true);};

	var _scrollActivate = function(direction, isvertical)
	{
		var v = _ScrollDirX;
		if(isvertical) 
			v = _ScrollDirY;

		if(direction == 0)
			v = 0;
		else
			v += direction;

		if(v < -1) v = -1;
		if(v > 1) v = 1;

		if(isvertical)
			_ScrollDirY = v;
		else
			_ScrollDirX = v;
	};

	var _scrollIt = function(isvertical)
	{
		var v = _ScrollDirX;
		var r = _ScrollRateX;
		if(isvertical) 
		{
			v = _ScrollDirY;
			r = _ScrollRateY;
		}

		if(v == 0)
		{
			r *= 0.9;
			if(Math.abs(r) < 0.5)
				r = 0;
		}else{
			r += v * (RUNPIXI.ScrollRateMax * 0.1);
		}

		if(r < -RUNPIXI.ScrollRateMax) r = -RUNPIXI.ScrollRateMax;
		if(r > RUNPIXI.ScrollRateMax) r = RUNPIXI.ScrollRateMax;

		if(isvertical)
			_ScrollRateY = r;
		else
			_ScrollRateX = r;
	};

	var _ScrollUpdate = function()
	{
		var r = RUNPIXI.ScrollRateMax;
		
		_scrollIt(false);
		_scrollIt(true);

		_PIXIScrollStage.position.x += _ScrollRateX;
		_PIXIScrollStage.position.y += _ScrollRateY;		
	};
// ENDOF NEW

	
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
	// WARNING: It uses the .shader variable, not the .filters array!
	this.CreateFragmentShader = function(name, shadercode) 
	{
		_shaders[name] = new PIXI.AbstractFilter('', shadercode);
		console.log("RUNPIXI: Fragment shader {"+name+"} created.");
		return _shaders[name];
	};
	this.CreateVertexShader = function(name, shadercode) 
	{
		_shaders[name] = new PIXI.AbstractFilter(shadercode, '');
		console.log("RUNPIXI: Vertex shader {"+name+"} created."); 
		return _shaders[name];
	};
	this.GetShader = function(name) {return _shaders[name];};
	this.ApplyShader = function(pixiSprite, shaderName) 
	{
		var shader = this.GetShader(shaderName);
		if(shader)
			pixiSprite.shader = shader;
	};

	// render the screen to a texture and return that.
	this.getScreenAsTexture = function(renderWidth, renderHeight)
	{
		// _PIXIRootStage is the container which has to be scaled and rendered to texture.
		// _PIXIRenderer is the renderer of this class.

		var renderer = _PIXIRenderer;

		// set render size if <= 0
		if(renderWidth <= 0)
			renderWidth = renderer.width;
		if(renderHeight <= 0)
			renderHeight = renderer.height;
		
		// compute scaling factor.
		var scale = 1;
		var sc = renderWidth;
		var sc2 = renderer.width;
		if(renderHeight<renderWidth)
		{
			sc = renderHeight;
			sc2 = renderer.height;
		}
		if(sc > 0 && sc2 > 0)
			scale = sc / sc2;

		// first, render the screen to a texture.
		var origTex = new PIXI.RenderTexture(renderer, renderer.width, renderer.height);
		origTex.render(_PIXIRootStage);

		// create sprite and container to resize the texture
		var stage = new PIXI.Container();
		var sprite = new PIXI.Sprite(origTex);
		sprite.scale.x = scale;
		sprite.scale.y = scale;
		stage.addChild(sprite);
		
		// render the original again in scaled mode.
		var renderTex = new PIXI.RenderTexture(renderer, renderWidth, renderHeight);
		renderTex.render(stage);

		// remove the unused stuff.
		stage.destroy();
		sprite.destroy();
		origTex.destroy();

		// finally return the scaled texture.
 		return renderTex;
	};

	// returns the screen as an array of size 4*width*height, rgba
	this.getScreenAsArray = function(width, height)
	{
		if(_PIXIRenderer==null)
			return;
		var rtex = this.getScreenAsTexture(width, height);
		var data = rtex.getPixels();
		rtex.destroy();
		return data;
	};

	// press or release a registered key.
	var _key = function(event, keystate)
	{
		for(var i = 0; i < _keys.length; i++)
		{
			if(keystate=='down')
				_keys[i].Down(event);
			if(keystate=='up')
				_keys[i].Up(event);
		};
	};

	// resize renderer if size changes.
	window.addEventListener('resize', function(event){
		if(_PIXIDOMScreen==null || _PIXIRenderer==null)
			return;
		
		_PIXIWidth = _PIXIDOMScreen.clientWidth;
		_PIXIHeight = _PIXIDOMScreen.clientHeight;
		_PIXIRenderer.resize(_PIXIWidth, _PIXIHeight);
		if(typeof(_resizeFunction) === 'function')
			_resizeFunction(event);
	});

	// keydown and keyup.
	document.addEventListener('keydown', function(e){_key(e,'down');});
	document.addEventListener('keyup', function(e) {_key(e,'up');});

};
RUNPIXI.instance = new RUNPIXI();

// SCROLL stuff
RUNPIXI.ScrollRateMax = 10; // Maximum scroll speed in pixels/frame.

// 0.4.0 register some keys for scrolling.
RUNPIXI.instance.registerKey(-1,'a',RUNPIXI.instance.ScrollX,RUNPIXI.instance.ScrollX, -1, 0);
RUNPIXI.instance.registerKey(-1,'d',RUNPIXI.instance.ScrollX,RUNPIXI.instance.ScrollX, 1, 0);
RUNPIXI.instance.registerKey(-1,'w',RUNPIXI.instance.ScrollY,RUNPIXI.instance.ScrollY, -1, 0);
RUNPIXI.instance.registerKey(-1,'s',RUNPIXI.instance.ScrollY,RUNPIXI.instance.ScrollY, 1, 0);
// ENDOF Scroll stuff.

// 0.3.2: Return PIXI size.
RUNPIXI.getScreenSize = function() {return RUNPIXI.instance.getScreenSize();}

// create sprite with position, rotation, anchor and size.
RUNPIXI.CreateSprite = function(texture, x, y, rotation, anchorx, anchory, scalex, scaley) {return RUNPIXI.instance.CreateSprite(texture,x,y,rotation,anchorx,anchory, scalex, scaley);};
// short of createsprite, only with position - anchor is 0.5, scale is 1, rotation is 0
RUNPIXI.Sprite = function(texture, x, y) {return RUNPIXI.instance.CreateSprite(texture, x, y,0,0.5,0.5,1,1);};

// Shader stuff.
RUNPIXI.CreateFragmentShader = function(name, shadercode) {return RUNPIXI.instance.CreateFragmentShader(name,shadercode);};
RUNPIXI.CreateVertexShader = function(name, shadercode) {return RUNPIXI.instance.CreateVertexShader(name,shadercode);};
RUNPIXI.ApplyShader = function(pixiSprite, shaderName) {return RUNPIXI.instance.ApplyShader(pixiSprite,shaderName);};
RUNPIXI.GetShader = function(name) {return RUNPIXI.instance.GetShader(name);};

// shorts to the stages.
RUNPIXI.STAGE = function() {return RUNPIXI.instance.SCROLLSTAGE();};
RUNPIXI.BACKSTAGE = function() {return RUNPIXI.instance.BACKSTAGE();};
RUNPIXI.HUDSTAGE = function() {return RUNPIXI.instance.HUDSTAGE();};

// shorter short for RUNPIXI.STAGE() or RUNPIXI.instance.STAGE()
RSTAGE = function() {return RUNPIXI.instance.SCROLLSTAGE();};
RBACKSTAGE = function() {return RUNPIXI.instance.BACKSTAGE();};
RHUDSTAGE = function() {return RUNPIXI.instance.HUDSTAGE();};

// Get renderer.
RUNPIXI.RENDERER = function() {return RUNPIXI.instance.RENDERER();};

// the MAIN function. ;)
RUNPIXI.initialize = function(pixicontainerID, mainLoopFunction) 
{
	RUNPIXI.instance.initialize(pixicontainerID);
	RUNPIXI.instance.setMainLoopFunction(mainLoopFunction);
};

// Helper to create a pixelart screen.
RUNPIXI.PIXELATED = function() {PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;};

// get screen as texture.
RUNPIXI.GetScreenAsTexture = function(w,h) {return RUNPIXI.instance.getScreenAsTexture(w,h);};
// ..and as array.
RUNPIXI.GetScreenAsArray = function(w,h) {return RUNPIXI.instance.getScreenAsArray(w,h);}
