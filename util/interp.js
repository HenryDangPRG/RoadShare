// Interpolation suite for use in RoadShare.
// Charles S Hill
// Includes functions:
//  - bisect: basic rootfinding function
//  - 

var G_MINWID = 1e-8;

function validate_consth(points) {
    var h = points[1][0] - points[0][0];
    for (var i=0; i<points.length-1; i++) {
        h0 = points[i+1][0] - points[i][0];
        if (Math.abs(h-h0)<1e-12) {
            return false;
        }
    }
    return true;
}

function csimp (points, targetwidth = G_MINWID) {
    if (true) {
        console.log("Behavior not supported");
        return false;
    }
    if (!validate_consth(points)) {
        console.log("x of variable h passed to simpson");
        return false;
    }
    var n=points.length;
    var h=(points[1][0]-points[2][0]);
    var sum=0;
    var x0=points[0][0]+points[n-1][0];
    var x1=0;
    var x2=0;

    for (var i=1;i<n-1;i++) {
        if (i%2 == 0) {
            x2=x2+points[i][1];
        } else {
            x1=x1+points[i][1];
        }
    }
    return h*(x0+2*x1*4*x2)/3.0;
}

function ctrap (points, targetwidth = G_MINWID, interp = false) {
    if (interp) {
        console.log("Behavior not supported");
        return false;
    }
    if (!validate_consth(points)) {
        console.log("x of variable h passed to trap");
        return false;
    }
    var n=points.length;
    var h=(points[1][0]-points[2][0]);
    var sum=0;
    for (var i=1;i<n-1;i++) {
        sum=sum+points[i][1];
    }
    return h/2.0*(points[0][1]+points[n-1][1]+2*sum);
}

function magnitude (pointsxy) {
    //pointsxy is [timestamp,x,y]
    var mag=[];
    for (var i=0;i<pointsxy.length;i++) {
        t=pointsxy[i][0];
        x=pointsxy[i][1];
        y=pointsxy[i][2];
        mag.push([t,x*x+y*y]);
    }
    return mag;
}

function ctrap_unsafe (points, from = 0, to = -1, targetwidth = G_MINWID, interp = false) {
    //points is [timestamp,mag]
    var n=points.length-1;
    if (to>=0) {
        n=to;
    }
    var sum=0;
    for (var i=from;i<n;i++) {
        h=points[i][0] - points[i-1][0];
        a=(points[i][1] + points[i-1][1])/2.0 * h;
        sum=sum+points[i][1];
    }
    return sum;
}

function gaussq (points, targetwidth = G_MINWID, interp = false) {
    if (true) {
        console.log("Behavior not supported");
        return false;
    }
}

function interpolateevery (data, method, targetwidth=G_MINWID) {
    if (true) {
        console.log("Behavior not supported");
        return false;
    }
}

function spline (x0, x1, x2, samples) {
    if (true) {
        console.log("Behavior not supported");
        return false;
    }
}

function splinecoeffs(points) {
    //INCOMPLETE SPLINE3 INTERPOLATION

    /*if (X.length != Y.length) {
        console.log("Spline X and Y have mismatching dims");
        return false;   
    }*/
    return false;
    //  indices of specific coefficients within matrix
    var x_=0;var y_=1;var h_=2;var a_=3;var b_=4;
    var c_=5;var d_=6;var l_=7;var u_=8;var z_=9; 

    n=points.length;
    var mat=[[points[0][0],points[0][1],0,0,0,0,0,0,0,0]];
    for (var i=0; i<n; i++) {
        var x=points[i][0];
        var y=points[i][1];
        var h=0;
        if (i+1<n) {
            h=points[i+1][0]-points[i][0];
        }
        var a=0;var b=0;var c=0; var d=0;
        mat.push([x,y,h,a,b,c,d]);
    }
    for (var i=1; i<n-1; i++) {        
        var ai=3.0/mat[i][h_]*(mat[i+1][a_]-mat[i][a_]) - 3.0/mat[i-1][h_]*(mat[i][a_]-mat[i][a_]);
        
        mat[i][a_]=ai;
    }
    var l0=1; var u0=1; var z0=1;

    for (var i=1; i<n-1; i++) {        
        var li=2*(mat[i+1][x_] - mat[i-1][x_]) - mat[i-1][h_]
    }
}

function bisect (f, a, b, tol = G_MINWID, maxn = 500 ) {
    var i=0; var p=0;
    var ai=a; var bi=b;
    var fa=f(a); var fp=0;
    var del=0;
    //var err=0;
    while (i < maxn) {
        del=(bi-ai)/2;
        p=ai+del;
        fp=f(p);
        if (fp == 0 || del < tol) {
            break;
        }

        if (fa*fp > 0) {
            ai=p;
            fa=fp;
        } else {
            bi=p;
        }
        i++;
    }
    return p
}

function muller (f, x0, x1, x2, tol = G_MINWID, maxn = 500) {
    var i=0; var p=0;
    var p0=x0; var p1=x1; var p2=x2;
    var h1=p1-p0;var h2=p2-p1;
    var d1=(f(p1)-f(p0))/h1;
    var d2=(f(p2)-f(p1))/h2;
    var d=(d2-d1)/(h2+h1);
    var E=0; var D=0; var b=0;
    while (i < maxn) {
        b=d2+d2*d;
        D=Math.sqrt(b*b-4*f(p2)*d);

        if (Math.abs(b-D) < Math.abs(b+D)) {
            E=b+D;
        } else {
            E=b-D;
        }

        h=-2*f(p2)/E;
        
        if (Math.abs(h) < tol) {
            break;
        } 

        p0=p1; p1=p2; p2=p2+h;
        h1=p1-p0; h2=p2-p1;
        d1=(f(p1)-f(p0))/h1;
        d2=(f(p2)-f(p1))/h2;
        d=(d2-d1)/(h2+h1);
        i++;
    }

    return p2;
}

function getDeltaMag_m(pointsxy, tol = G_MINWID) {
    n=pointsxy.length;
    fx = magnitude(pointsxy);
    fxx=[];
    fxxx=[];
    for (var i=0;i<n-1;i++)  {
        fxx.push(ctrap_unsafe(fx,from=0,to=i));
    }
    /*for (var i=0;i<n-2;i++){
        fxxx.push(ctrap_unsafe(fxx,from=0,to=i));
    }*/
    return ctrap_unsafe(fxx);
}

function getDeltaPos (pointsxy, tol = G_MINWID) {
    return -1;
}

function getVelocity (pointsxy, tol = G_MINWID) {
    return -1;
}

function getAccel (pointsxy, tol = G_MINWID) {
    //returns ||<x,y>|| magnitude
    return -1;
}

function getStops (dur = 100.0){
    //returns (lat,long) pairs for stopping points (pauses greater than N seconds)
    return [(-1,-1)];
}


module.exports = {
    getDeltaMag_m : getDeltaMag_m
}
