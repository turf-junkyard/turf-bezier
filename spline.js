 /**
   * BezierSpline
   * https://github.com/leszekr/bezier-spline-js
   *
   * @copyright
   * Copyright (c) 2013 Leszek Rybicki
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */

  /*
  Usage:

    var spline = new Spline({
      points: array_of_control_points,
      duration: time_in_miliseconds,
      sharpness: how_curvy,
      stepLength: distance_between_points_to_cache
    });

  */
  
var util = require('./geojsonutil')

var Spline = function(options){
    this.points = options.points || [];
    this.duration = options.duration || 10000;
    this.sharpness = options.sharpness || 0.85;
    this.centers = [];
    this.controls = [];
    this.stepLength = options.stepLength || 60;
    this.length = this.points.length;
    this.delay = 0;
    // this is to ensure compatibility with the 2d version
    for(var i=0; i<this.length; i++) this.points[i].z = this.points[i].z || 0;
    
    const isRing = util.isLinearRing(this.points)
    for(var i=0; i<this.length-1; i++){
      this.centers.push(computeCenter(this.points[i], this.points[i+1]));
    }
    for(var i=0; i<this.centers.length-1; i++){
      this.controls.push(this.computeControlPoints(this.centers[i], this.centers[i+1], this.points[i+1]));
    }
    if (isRing) {
      // control points for end and start will be the same
      var cp = this.computeControlPoints(this.centers[this.centers.length-1], this.centers[0], this.points[0]);
      this.controls.unshift(cp); // sets the control points for the start
      this.controls.push(cp); // sets the control points for the end
    } else {
      this.controls.unshift([this.points[0],this.points[0]]);
      this.controls.push([this.points[this.length-1],this.points[this.length-1]]);
    }
    
    this.steps = this.cacheSteps(this.stepLength);
    if (isRing) {
      this.steps[this.steps.length-1] = this.steps[0]
    }
    return this;
  };
  
  /*
    Caches an array of equidistant (more or less) points on the curve.
  */
  Spline.prototype.cacheSteps = function(mindist){
    var steps = [];
    var laststep = this.pos(0);
    steps.push(0);
    for(var t=0; t<this.duration; t+=10){
      var step = this.pos(t);
      var dist = Math.sqrt((step.x-laststep.x)*(step.x-laststep.x)+(step.y-laststep.y)*(step.y-laststep.y)+(step.z-laststep.z)*(step.z-laststep.z));
      if(dist>mindist){
        steps.push(t);
        laststep = step;
      }
    }
    return steps;
  };

  /*
    returns angle and speed in the given point in the curve
  */
  Spline.prototype.vector = function(t){
    var p1 = this.pos(t+10);
    var p2 = this.pos(t-10);
    return {
      angle:180*Math.atan2(p1.y-p2.y, p1.x-p2.x)/3.14,
      speed:Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y)+(p2.z-p1.z)*(p2.z-p1.z))
    };
  };

  /*
    Gets the position of the point, given time.

    WARNING: The speed is not constant. The time it takes between control points is constant.

    For constant speed, use Spline.steps[i];
  */
  Spline.prototype.pos = function(time){

    function bezier(t, p1, c1, c2, p2){
      var B = function(t) {
        var t2=t*t, t3=t2*t;
        return [(t3),(3*t2*(1-t)),(3*t*(1-t)*(1-t)),((1-t)*(1-t)*(1-t))]
      }
      var b = B(t)
      var pos = {
        x : p2.x * b[0] + c2.x * b[1] +c1.x * b[2] + p1.x * b[3],
        y : p2.y * b[0] + c2.y * b[1] +c1.y * b[2] + p1.y * b[3],
        z : p2.z * b[0] + c2.z * b[1] +c1.z * b[2] + p1.z * b[3]
      }
      return pos;
    }
    var t = time-this.delay;
    if(t<0) t=0;
    if(t>this.duration) t=this.duration-1;
    //t = t-this.delay;
    var t2 = (t)/this.duration;
    if(t2>=1) return this.points[this.length-1];

    var n = Math.floor((this.points.length-1)*t2);
    var t1 = (this.length-1)*t2-n;
    return bezier(t1,this.points[n],this.controls[n][1],this.controls[n+1][0],this.points[n+1]);
  }

  Spline.prototype.computeControlPoints = function (center1, center2, supportPoint) {
    var p1 = center1;
    var p2 = center2;
    var dx = supportPoint.x - (p1.x + p2.x) / 2;
    var dy = supportPoint.y - (p1.y + p2.y) / 2;
    var dz = supportPoint.z - (p1.y + p2.z) / 2;
    var sharpnessCompl = 1.0 - this.sharpness;
    return [{
      x: sharpnessCompl * supportPoint.x + this.sharpness * (p1.x + dx),
      y: sharpnessCompl * supportPoint.y + this.sharpness * (p1.y + dy),
      z: sharpnessCompl * supportPoint.z + this.sharpness * (p1.z + dz)
    },{
      x: sharpnessCompl * supportPoint.x + this.sharpness * (p2.x + dx),
      y: sharpnessCompl * supportPoint.y + this.sharpness * (p2.y + dy),
      z: sharpnessCompl * supportPoint.z + this.sharpness * (p2.z + dz)
    }];
  }

  function computeCenter (p1, p2) {
    return {x:(p1.x+p2.x)/2, y:(p1.y+p2.y)/2, z:(p1.z+p2.z)/2};
  }

  module.exports = Spline;
