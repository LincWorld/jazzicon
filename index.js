var svg2img = require('svg2img');
var MersenneTwister = require('mersenne-twister');
var Color = require('color');
var colors = require('./colors');
var shapeCount = 4;
var wobble = 30;
var angleMod = 3;
var jsdom = require("jsdom");
var pngToJpeg = require('png-to-jpeg');
var svgns = 'http://www.w3.org/2000/svg';
var generator;

function hueShift(colors, generator) {
	var amount = (generator.random() * 30) - (wobble / 2);
	return colors.map(function(hex) {
		var color = Color(hex);
		color.rotate(amount);
		return color.hexString();
	});
}

function genColor(colors) {
	var rand = generator.random();
	var idx = Math.floor(colors.length * generator.random());
	var color = colors.splice(idx, 1)[0];
	return color;
}

function genShape(document, remainingColors, diameter, i, total, svg) {
	var center = diameter / 2;
	var pseudoDiam = diameter * (0.7 + Math.random() * 0.3);
	var shape = document.createElementNS(svgns, 'rect');
	shape.setAttributeNS(null, 'x', '0');
	shape.setAttributeNS(null, 'y', '0');
	shape.setAttributeNS(null, 'width', pseudoDiam);
	shape.setAttributeNS(null, 'height', pseudoDiam);

	var firstRot = generator.random();
	var angle = Math.PI * 2 * firstRot;
	var velocity = pseudoDiam / total * generator.random() + (i * pseudoDiam / total);

	var tx = (Math.cos(angle) * velocity);
	var ty = (Math.sin(angle) * velocity);

	var translate = 'translate(' + tx + ' ' + ty + ')';

	// Third random is a shape rotation on top of all of that.
	var secondRot = generator.random();
	var rot = (firstRot * 360) + secondRot * 180;
	var rotate = 'rotate(' + rot.toFixed(1) + ' ' + center + ' ' + center + ')';
	var transform = translate + ' ' + rotate;
	shape.setAttributeNS(null, 'transform', transform);
	var fill = Color(genColor(remainingColors)).alpha(0.5 + Math.random() * 0.5).rgbString();
	shape.setAttributeNS(null, 'fill', fill);

	svg.appendChild(shape);
}

function generateIdenticon(diameter, seed) {
	generator = new MersenneTwister(seed);
	var remainingColors = hueShift(colors.slice(), generator);
	var dom = new jsdom.JSDOM('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Title of the document</title></head><body></body></html>');
	var bgColor = genColor(remainingColors);

	var svg = dom.window.document.createElementNS(svgns, 'svg');
	svg.setAttributeNS(null, 'x', '0');
	svg.setAttributeNS(null, 'y', '0');
	svg.setAttributeNS(null, 'width', diameter);
	svg.setAttributeNS(null, 'height', diameter);

	//Set BG
	var shape = dom.window.document.createElementNS(svgns, 'rect');
	shape.setAttributeNS(null, 'x', '0');
	shape.setAttributeNS(null, 'y', '0');
	shape.setAttributeNS(null, 'width', diameter);
	shape.setAttributeNS(null, 'height', diameter);
	shape.setAttributeNS(null, 'fill', bgColor);
	svg.appendChild(shape);

	for (var i = 0; i < shapeCount - 1; i++) {
		genShape(dom.window.document, remainingColors, diameter, i, shapeCount - 1, svg);
	}

	return new Promise(function(resolve, reject) {
		svg2img(svg.outerHTML, {
			format: 'png'
		}, function(err, buffer) {
			if (err) {
				return reject(err);
			}
			pngToJpeg({
				quality: 80
			})(buffer).then(resolve).catch(reject);
		});
	});
}

module.exports = generateIdenticon;
