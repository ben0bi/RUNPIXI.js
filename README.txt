RUNPIXI.js
v0.1-alpha

A library to get PIXI.js to run with ease.

By Beni Yager @ 2016

Needs jQuery and pixi.js.

Usage:

Create a div with a given size:

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
RUNPIXI.initialize("#pixiscreen", loopfunction);
</script>

That's about it.

The main stage can be scrolled with the arrow keys and asdw.

[more later]
