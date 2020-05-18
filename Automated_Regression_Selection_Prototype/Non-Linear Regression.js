window.onLoad = smoothCurve();

var x = [], y = [];

var linear_fixed=false, poly_fixed=false, exp_fixed=false;

var canvas = document.getElementById("canvas");
canvas.addEventListener("click", function(event){
	add_point(event.clientX, event.clientY);
});

function add_point(pos_x, pos_y){
	pos_y-=canvas.offsetTop;
	pos_x-= canvas.offsetLeft;

	//sort data for easy plotting and single line rendering
	if(x.length >= 1){
		for(var i=0;i<x.length;i++){
			if(pos_x < x[i]){
				x.splice(i, 0, pos_x);
				y.splice(i, 0, pos_y);
				break;
			}
		}
		if(i>=x.length){
			x.push(pos_x);
			y.push(pos_y);
		}
	}
	else{
		x.push(pos_x);
		y.push(pos_y);
	}

	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.arc(pos_x, pos_y, 5, 0, 2 * Math.PI, false);
	ctx.fillStyle = 'green';
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = '#003300';
	ctx.stroke();

	if(x.length >= 2)
		init();
}



function init(){
	var div = document.getElementById("Details");
	var checkBoxes = document.getElementsByName("regression");
	var ctx = document.getElementById("canvas").getContext("2d");

	ctx.clearRect(0, 0, 900, 600);

	var h_l = linear_reg(y, x), h_p = polynomial_reg(y, x), h_e = exponential_reg(y, x);
	var rmse_l = 0, rmse_p = 0, rmse_e = 0, n = x.length;
	var y_reg = 0, x_reg = 0;


	for(let i=0;i<n;i++){
		rmse_l+=(h_l[0][i]-y[i])*(h_l[0][i]-y[i]);
		rmse_p+=(h_p[0][i]-y[i])*(h_p[0][i]-y[i]);
		rmse_e+=(h_e[0][i]-y[i])*(h_e[0][i]-y[i]);
	}

	//Edge case for 2 points. poly_reg returns NAN
	if(n == 2)
		rmse_p = 1;

	rmse_l/=n;
	rmse_p/=n;
	rmse_e/=n;

	rmse_l = Math.sqrt(rmse_l);
	rmse_p = Math.sqrt(rmse_p);
	rmse_e = Math.sqrt(rmse_e);

	if(rmse_l < rmse_p && rmse_l < rmse_e){
		div.innerHTML = "</br><u><strong>SELECTED : </strong>Linear</u></br></br></br><strong><u>ERRORS:</u></strong></br>Linear = "+rmse_l.toFixed(4)+"</br>Polynomial = "+rmse_p.toFixed(4)+"</br>Exponential = "+rmse_e.toFixed(4);
		auto = 0;
	}
	else if(rmse_p < rmse_l && rmse_p < rmse_e){
		div.innerHTML = "</br><u><strong>SELECTED : </strong>Polynomial</u></br></br></br><strong><u>ERRORS:</u></strong></br>Linear = "+rmse_l.toFixed(4)+"</br>Polynomial = "+rmse_p.toFixed(4)+"</br>Exponential = "+rmse_e.toFixed(4);
		auto = 1;
	}
	else{
		div.innerHTML = "</br><u><strong>SELECTED : </strong>Exponential</u></br></br></br><strong><u>ERRORS:</u></strong></br>Linear = "+rmse_l.toFixed(4);+"</br>Polynomial = "+rmse_p.toFixed(4)+"</br>Exponential = "+rmse_e.toFixed(4);
		auto = 2;
	}

	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	for(let i=0;i<n;i++){
		ctx.beginPath();
		ctx.arc(x[i], y[i], 5, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'green';
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#003300';
		ctx.stroke();
	}

	if(checkBoxes[0].checked || (!checkBoxes[0].checked && !checkBoxes[1].checked && !checkBoxes[2].checked && auto==0))
		draw_line(h_l[0], h_l[1], ctx, "rgba(255, 0, 0, 1)");

	if(checkBoxes[1].checked || (!checkBoxes[0].checked && !checkBoxes[1].checked && !checkBoxes[2].checked && auto==1))
		draw_line(h_p[0], h_p[1], ctx, "rgba(255, 255, 0, 1)");

	if(checkBoxes[2].checked || (!checkBoxes[0].checked && !checkBoxes[1].checked && !checkBoxes[2].checked && auto==2))
		draw_line(h_e[0], h_e[1], ctx, "rgba(0, 0, 255, 1)");
}



function draw_line(y_reg, x_reg, ctx, rgba){
	ctx.beginPath();
	var arr = [];
	for(let i=0;i<x_reg.length;i++){
		arr.push(x_reg[i]);
		arr.push(y_reg[i]);
	}

	ctx.strokeStyle = rgba;
	ctx.moveTo(arr[0], arr[1]);
	ctx.curve(arr);
	ctx.stroke();
}


function linear_reg(y, x){
	var mean_x=0, mean_y=0, quo=0, denom=0, n=x.length;
	
	for(let i=0;i<n;i++){
		mean_x+=x[i];
		mean_y+=y[i];
	}
	mean_x/=n;
	mean_y/=n;

	for(let i=0;i<n;i++){
		quo+= (x[i]-mean_x) * (y[i]-mean_y);
		denom+= (x[i]-mean_x) * (x[i]-mean_x);
	}

	var m = quo/denom;
	var c = mean_y - (m*mean_x);

	var new_x = [], new_y = [];

	//Calculate y for each x from xmin to xmax
	for(let i = 0; i <n; i++){
		new_y.push((m*x[i])+c);
		new_x.push(x[i]);
	}

  return [new_y, new_x];
}


function polynomial_reg(y, x) {
  var m = 0,
    z = 0,
    n = y.length,
    q = 0,
    w = 0,
    r = 0,
    e = 0,
    v = 0;

  for (let i = 0; i < n; i++) {
    m += y[i];
    z += x[i] * y[i];
    v += x[i] * x[i] * y[i];
    q += x[i];
    w += (x[i] * x[i]);
    e += (x[i] * x[i] * x[i]);
    r += (x[i] * x[i] * x[i] * x[i]);
  }

  var t = w - (q * q) / n,
    f = z - (q * m) / n,
    u = e - (w * q) / n,
    l = v - (w * m) / n,
    o = r - (w * w) / n;

  //Co-efficients for equation --> y = ax^2 + bx + c
  var a = ((l * t) - (f * u)) / ((t * o) - (u * u));
  var b = ((f * o) - (l * u)) / ((t * o) - (u * u));
  var c = (m / n) - (b * (q / n)) - (a * (w / n));

  var new_x = [],
    new_y = [];

  //Calculate y for each x from xmin to xmax
  for (let i = 0; i <n; i++) {
    new_y.push(a * x[i] * x[i] + b * x[i] + c);
    new_x.push(x[i]);
  }

  return [new_y, new_x];
}




function exponential_reg(y, x){
	var sum_x = 0, sum_y = 0, sum_x_y = 0, sum_x2 = 0, n = x.length;

	for(let i=0;i<n;i++){
		sum_x+=x[i];
		sum_y+=Math.log10(y[i]);
		sum_x_y+=x[i]*Math.log10(y[i]);
		sum_x2+=x[i]*x[i];
	}

	var c = ((sum_y*sum_x2) - (sum_x*sum_x_y)) / ((n*sum_x2) - (sum_x*sum_x));
	var b = ((n*sum_x_y) - (sum_x*sum_y)) / ((n*sum_x2) - (sum_x*sum_x));

	var r = Math.pow(10, b);
	var a = Math.pow(10, c);

	var new_x = [], new_y = [];

	for(let i=0;i<n;i++){
		new_x.push(x[i]);
		new_y.push(a*Math.pow(r, x[i]));
	}

	return [new_y, new_x];
}






function smoothCurve(){
	CanvasRenderingContext2D.prototype.curve=function(h,r,f,c){
		r=(typeof r==="number")?r:0.5;f=f?f:20;var j,k=[],e=h.length,d,a=new Float32Array((f+2)*4),b=4;j=h.slice(0);if(c){j.unshift(h[e-1]);j.unshift(h[e-2]);j.push(h[0],h[1])}else{j.unshift(h[1]);j.unshift(h[0]);j.push(h[e-2],h[e-1])}a[0]=1;for(d=1;d<f;d++){var m=d/f,n=m*m,p=n*m,o=p*2,q=n*3;a[b++]=o-q+1;a[b++]=q-o;a[b++]=p-2*n+m;a[b++]=p-n}a[++b]=1;g(j,a,e);if(c){j=[];j.push(h[e-4],h[e-3],h[e-2],h[e-1]);j.push(h[0],h[1],h[2],h[3]);g(j,a,4)}function g(B,u,w){for(var v=2;v<w;v+=2){var x=B[v],y=B[v+1],z=B[v+2],A=B[v+3],D=(z-B[v-2])*r,E=(A-B[v-1])*r,F=(B[v+4]-x)*r,G=(B[v+5]-y)*r;for(var C=0;C<=f;C++){var s=C*4;k.push(u[s]*x+u[s+1]*z+u[s+2]*D+u[s+3]*F,u[s]*y+u[s+1]*A+u[s+2]*E+u[s+3]*G)}}}for(d=0,e=k.length;d<e;d+=2){this.lineTo(k[d],k[d+1])}return k};

}