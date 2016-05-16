// dependencies
var MersenneTwister = require('mersenne-twister');
var paperGen = require('./paper')
var Color = require('color')
var colors = require('./colors')

// parameters
var shapeCount = 4
var colorWobble = 30
var maxWidth = 1000
var angleMod = 3
var possibleRotations = 21
var excessShown = 3
var minOpacity = 0.7

// export
module.exports = generateIdenticon

// main
var generator
function generateIdenticon(diameter, seed) {
  console.log(`GENERATING IDENTICON ${seed}`)
  generator = new MersenneTwister(seed);

  var elements = paperGen(diameter)
  var paper = elements.paper
  var container = elements.container

  var remainingColors = hueShift(colors.slice(), generator)

  var diam = diameter
  var str = `M 0,0 L ${diam},0 L ${diam},${diam} L 0,${diam} L 0,0`
  var bkgnd = paper.path(str);
  bkgnd.attr("fill", genColor(remainingColors));
  bkgnd.attr('stroke', 'none');

  var msgs = []
  for(var i = 0; i < shapeCount - 1; i++) {
    var msg = newGenShape(paper, remainingColors, diameter, i, shapeCount - 1)
    msgs.push(msg)
  }

  container.onclick = function() {
    console.log('ELEMENT GENERATED WITH SEED ' + seed)
    console.dir(msgs)
  }
  return container
}

function newGenShape(paper, remainingColors, diam, i, total) {
  var mult = (generator.random() * 90) + 45
  var width = mult * maxWidth

  var rad = mult / 2

  var d = diam.toFixed(2)
  var str = `M 0,0 `
  str += `L ${d*2},${((d*generator.random()*angleMod) - d*(angleMod/2)).toFixed(2)} `
  str += `L ${d*2},${d*2} `
  str += `L 0,${d*2} `
  str += `L 0,0 `

  var msg = `Path str is: ${str}\n`

  var shape = paper.path(str);

  var fudge = total + excessShown
  var transRange = diam / fudge
  var fixed = transRange * (i + 1)

  var transX = fixed + (transRange * generator.random() * i)
  var transY = fixed + (transRange * generator.random() * i)

  var transforms = JSON.stringify({
    transRange,
    fixed,
    transX,
    transY,
  }, null, 2)
  console.log(transforms)
  msg += `Transforms are: ${transforms}`

  shape.rotate(360 / ((generator.random() * possibleRotations) % possibleRotations), rad, rad)
  shape.translate(transX, transY)

  //shape.rotate(180* generator.random(), rad, rad)

  var alpha = minOpacity + (generator.random() * (1 - minOpacity))
  shape.attr('fill', Color(genColor(remainingColors)).alpha(alpha).rgbString());
  shape.attr('stroke', 'none');

  return msg
}

function genShape(paper, remainingColors, diam, i, total) {
  var str = `M 0,0 L ${diam},0 L ${diam},${diam} L 0,${diam} L 0,0`
  var shape = paper.path(str);

  shape.rotate(360 * generator.random())

  var trans = diam / total * generator.random() + (i * diam / total)
  shape.translate(trans)

  shape.rotate(180 * generator.random())
  shape.attr('fill', genColor(remainingColors));
  shape.attr('stroke', 'none');
}

function genColor(colors) {
  var rand = generator.random()
  var idx = Math.floor(colors.length * generator.random())
  var color = colors.splice(idx,1)[0]
  return color
}

function hueShift(colors, generator) {
  var amount = (generator.random() * colorWobble) - (colorWobble / 2)
  return colors.map(function(hex) {
    var color = Color(hex)
    color.rotate(amount)
    return color.hexString()
  })
}
