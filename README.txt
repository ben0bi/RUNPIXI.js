RUNPIXI.js

WARNING: THIS IS v0.5.0 with
DOCUMENTATION FROM v0.3.5
Scrolling Doc is not valid anymore.
+ Please be patient. +

A library to get PIXI.js to run with ease.

By Beni Yager @ 2016

Needs pixi.js.
http://www.pixijs.com/

(MAIN-)USAGE:
-------------

Create a div with a given size and give it an id:

<style>
#pixiscreen
{
	width: 400px;
	height: 400px;
}
</style>

Create the div:
<div id="pixiscreen"></div>

Create a loop function and call initialize:

<script>
function loopfunction() {}
RUNPIXI.initialize("pixiscreen", loopfunction);
</script>

That's about it.

The main stage can be scrolled with the arrow keys and asdw.
There are more and more functionalities, see the documentation below.

COMPOSER
--------

To download RUNPIXI into your project with composer, add those lines to your composer.json:

{
	...	

    "repositories": [

	...,

        {
            "type": "vcs",
            "url": "https://github.com/ben0bi/RUNPIXI.js.git"
        }
    ],
    "require": {
	...,
        "ben0bienterprises/RUNPIXI" : "dev-master@dev"
    },

	...
}

Now you can load RUNPIXI by typing "composer update" into your console.


CHANGES
-------
0.3.5 + BugFix for getScreenSize();
0.3.4 + RUNPIXI.instance.setResizeFunction - set a function (with event parameter) which is called on resize.
0.3.3 + Return the renderer with RENDERER();
0.3.2 + Return screen size with getScreenSize();
0.3.1
+ Inverted Scrollrate.
+ You can use RUNPIXI.InvertScrollX and RUNPIXI.InvertScrollY to determine if it is inverted.
0.3 + Removed all jQuery references, you can now use this library without jQuery.
0.2 + Capture the whole screen: getScreenToTexture and getScreenToArray
0.1 
+ It'sa working.
+ Scrolling (needs update, it's to much code.)
+ Creating and applying shaders. (Only one at a time.)	


DOCUMENTATION
-------------
+ Only public functions and variables are described here.
+ RUNPIXI is a class with a static instance, RUNPIXI.instance.
+ HTML Documentation will follow later.

RUNPIXI creates three (3) containers/stages for your stuff. 
They are attached to the root stage (which RUNPIXI also creates):
	+ An immobile HUD stage (Foreground)
	+ A scrollable main stage (Main/Scroll)
	+ and an immobile background stage. (Background)

ISSUE: Background color is fixed right now.

GLOBAL VARIABLES
----------------
RUNPIXI.instance 	: The static (singleton) instance of the RUNPIXI class.
RUNPIXI.ScrollWithKeys	: true|false : Enable RUNPIXI to scroll the main stage with the arrow keys and/or ASDW.
RUNPIXI.ScrollRateMin	: Minimum scroll rate (in pixels) when scrolling starts.
RUNPIXI.ScrollRateMax	: Maximum scroll rate in pixels.
RUNPIXI.ScrollRateStep  : How much scroll rate to add each frame(?) until ScrollRateMax is reached.
RUNPIXI.InvertScrollX	: true|false : Invert the scrollrate horizontally?
RUNPIXI.InvertScrollY	: true|false : Invert the scrollrate vertically.

GLOBAL FUNCTIONS
----------------

RUNPIXI.initialize(pixicontainerID, mainLoopFunction)
	Parameters:
		pixicontainerID: The id of the DOM element where pixi should be rendered.
		mainLoopFunction: The function which should be called each frame.
	+ Initializes the pixi screen in the given DOM element and sets the main loop function.
		This is the function for what this library is made for.
	--> See RUNPIXI.instance.initialize and RUNPIXI.instance.setMainLoopFunction

RSTAGE() or RUNPIXI.STAGE()
	+ Returns RUNPIXI.instance.SCROLLSTAGE()

RHUDSTAGE() or RUNPIXI.HUDSTAGE()
	+ Returns RUNPIXI.instance.HUDSTAGE()

RBACKSTAGE() or RUNPIXI.BACKSTAGE()
	+ Returns RUNPIXI.instance.BACKSTAGE()

RUNPIXI.RENDERER()
	+ Returns the pixi renderer.

RUNPIXI.PIXELATED()
	+ Sets the PIXI scale mode to PIXI.SCALE_MODES.NEAREST for pixel perfect rendering.

RUNPIXI.getScreenSize()
	+ Returns the screen size as object with x,y,w,h (x=w, y=h)

RUNPIXI.CreateSprite(texture, x, y, rotation, anchorx, anchory, scalex, scaley)
	--> See RUNPIXI.instance.CreateSprite (below)

RUNPIXI.Sprite(texture, x, y)
	--> CreateSprite with some predefined parameters:
		Anchor is 0.5
		Scale is 1
		Rotation is 0

RUNPIXI.CreateFragmentShader(name, shaderCode)
	--> See RUNPIXI.instance.CreateFragmentShader (below)

RUNPIXI.CreateVertexShader(name, shaderCode)
	--> See RUNPIXI.instance.CreateVertexShader (below)

RUNPIXI.ApplyShader(pixiSprite, shaderName)
	--> See RUNPIXI.instance.ApplyShader (below)

RUNPIXI.GetShader(name)
	--> See RUNPIXI.instance.GetShader (below)

RUNPIXI.GetScreenAsTexture(width, height)
	--> See RUNPIXI.instance.getScreenAsTexture (below)

RUNPIXI.GetScreenAsArray(width, height)
	--> See RUNPIXI.instance.getScreenAsArray (below)


PUBLIC FUNCTIONS
----------------

RUNPIXI.instance.initialize(pixicontainerID)
	Parameters:
		pixicontainerID : The id of the DOM element.
	+ Initializes PIXI in the given DOM element.
		You do not need to use that function directly, use RUNPIXI.initialize instead. 
		This is the main function of this library.
		The element should be a div and should have a given width and height.
		RUNPIXI will notice a resize and adjust the renderer to it, though.

RUNPIXI.instance.setMainLoopFunction(m)
	Parameters:
		m : Function
	+ Sets the function which is called each frame. You do not need to use that function directly.

RUNPIXI.instance.setResizeFunction(m)
	Parameters:
		m : Function
	+ Sets the function which is called after resize.

RUNPIXI.instance.HUDSTAGE()
	+ Returns the foreground container/stage.

RUNPIXI.instance.SCROLLSTAGE()
	+ Returns the scrollable (by RUNPIXI) container/stage, the middle one.

RUNPIXI.instance.BACKSTAGE()
	+ Returns the background container/stage.

RUNPIXI.instance.RENDERER()
	+ Return the pixi renderer.

RUNPIXI.instance.getScreenSize()
	+ Returns the screen size as object with x,y,w,h (x=w, y=h)

RUNPIXI.instance.CreateSprite(texture, x, y, rotation, anchorx, anchory, scalex, scaley)
	Parameters:
		texture : The texture to create the sprite from.
		x	: The x position of the sprite on the stage.
		y	: The y position of the sprite on the stage.
		rotation: The rotation of the sprite on the stage.
		anchorx : Anchor position x on the sprite.
		anchory : Anchor position y on the sprite.
		scalex	: X scaling of the sprite.
		scaley	: Y scaling of the sprite.
	+ Returns a PIXI.Sprite with all the given parameters. 
		Short function to not write each of this lines every time.

RUNPIXI.instance.CreateFragmentShader(name, shadercode)
	Parameters:
		name : The name you give that shader.
		shadercode: The shader code. 
			(I use $('#myshaderscript').html() and <script type="pixishader" ...>)
	+ Creates a fragment (formerly pixel) shader, saves it under the given name 
		in RUNPIXIs shader list and returns it.

RUNPIXI.instance.CreateVertexShader(name, shadercode)
	Parameters:
		name : The name you give that shader.
		shadercode: The shader code. 
			(I use $('#myshaderscript').html() and <script type="pixishader" ...>)
	+ Creates a vertex shader, saves it under the given name 
		in RUNPIXIs shader list and returns it.

RUNPIXI.instance.ApplyShader(pixiSprite, shaderName)
	Parameters:
		pixiSprite : Any PIXI object which has a .shader variable. (NOT filters!)
		shaderName : The name of the shader in RUNPIXIs shader list.
	+ Applies the given shader to the given PIXI object. NO type comparison is done, be carefull.

RUNPIXI.instance.GetShader(name)
	Parameters:
		name : The name of the shader in RUNPIXIs shader list.
	+ Returns the given shader if it exists.

RUNPIXI.instance.getScreenAsTexture(renderWidth, renderHeight)
	Parameters:
		renderWidth  : The desired width of the resulting image.
		renderHeight : The desired height of the resulting image.
	+ Returns the content of the screen in a PIXI.RenderTexture scaled to the given width and height.
		If width or height are <= 0, it will take the size of the original for that value.

RUNPIXI.instance.getScreenAsTexture(renderWidth, renderHeight)
	Parameters:
		renderWidth  : The desired width of the resulting image.
		renderHeight : The desired height of the resulting image.
	+ Returns the content of the screen in a 1-dimensional array, [RGBA](4)*width*height
		scaled to the given width and height.
		If width or height are <= 0, it will take the size of the original for that value.

