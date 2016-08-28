$(function(){
    var $select = $(".age");
    for (i=1;i<=100;i++){
        $select.append($('<option></option>').val(i).html(i))
    }
});

var margin = {top: 150, right: 50, bottom: 30, left: 80},
    width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var bisectAge = d3.bisector(function(d) { return d.age; }).left;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");


var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(3);


var line = d3.svg.line()
    .x(function(d) { return x(d.age); })
    .y(function(d) { return y(d.value); });

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity",0);

var totalPopulation = 0; 

d3.tsv("data.tsv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.age = +d.age;
    d.value = +d.value;
    totalPopulation = d.value + totalPopulation;
  });


  x.domain(d3.extent(data, function(d) { return d.age; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

  //X axis label
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Age (years)");
      

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  //y axis label
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("number (people)");

  var mainLine = svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .style("opacity",.6);


  var verticalText = svg.append("text");
  var verticalFixed = svg.append("line");
  var verticalCircle = svg.append("circle")
      .attr("r", 4.5).style("opacity",0);

  var rect = svg.append("rect")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("fill","transparent");

  var verticalLine = svg.append('line')
// .attr('transform', 'translate(100, 50)')
.attr({
    'x1': 0,
    'y1': 0,
    'x2': 0,
    'y2': height + margin.top + margin.bottom
})
    .attr("stroke", "steelblue")
    .attr('class', 'verticalLine');

circle = svg.append("circle")
    .attr("opacity", 0)
    .attr({
    r: 6,
    fill: 'darkred'

});

    rect.on('mousemove', function () {

    var xPos = d3.mouse(this)[0];
    d3.select(".verticalLine").attr("transform", function () {
        return "translate(" + xPos + ",0)";
    });


    var pathLength = mainLine.node().getTotalLength();
    var fx = xPos;
    var beginning = fx,
        end = pathLength,
        target;
    while (true) {
        target = Math.floor((beginning + end) / 2);
        pos = mainLine.node().getPointAtLength(target);
        if ((target === end || target === beginning) && pos.x !== fx) {
            break;
        }
        if (pos.x > fx) end = target;
        else if (pos.x < fx) beginning = target;
        else break; //position found
    }
    circle.attr("opacity", 1)
        .attr("cx", fx)
        .attr("cy", pos.y);
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectAge(data, x0,1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.age > d1.age - x0 ? d1 : d0;
    div.transition().style("opacity", .6); 
    div.html("age: "+d.age + "<br/>"  + "people: "+d.value)  
                    .style("left", (d3.event.pageX)-65 + "px")   
                    .style("top", 365+ "px"); 

});

  // var focus = svg.append("g")
  //     .attr("class", "focus")
  //     .style("display", "none");

  // focus.append("circle")
  //     .attr("r", 3);

      

  // var rect = svg.append("rect")
  //     .attr("class", "overlay")
  //     .attr("width", width)
  //     .attr("height", height)
  //     .on("mousemove", mousemove)
  //     .on("mouseover", mouseover)
  //     .on("mouseout",function() { 
  //       focus.style("display", "none");
  //       div.transition().style("opacity", 0);
  //       vertical.transition().style("opacity", 0);
  //     });

  //     var vertical = d3.select(".chart")
  //       .append("div")
  //       .attr("class", "remove")
  //       .style("position", "absolute")
  //       .style("background", "black")
  //       .style("opacity",.6);

      
  
  // function mousemove() {
  //   var x0 = x.invert(d3.mouse(this)[0]),
  //       i = bisectAge(data, x0,1),
  //       d0 = data[i - 1],
  //       d1 = data[i],
  //       d = x0 - d0.age > d1.age - x0 ? d1 : d0;
  //       focus.attr("transform", "translate(" + x(d.age) + "," + y(d.value) + ")");
  //       focus.select("text").text(d.value);
  //       mousex = d3.mouse(this);
  //       mousex = mousex[0] + 5;

  //       div.transition()    
  //                   // .duration(200)    
  //                   .style("opacity", .6); 
  //       div.html("age: "+d.age + "<br/>"  + "people: "+d.value)  
  //                   .style("left", (d3.event.pageX)-65 + "px")   
  //                   .style("top", 340+ "px"); 

  //       vertical
  //           .style("left", (d3.event.pageX)+5 + "px")   
  //           .style("opacity",.4)
  //           .style("width", "2.5px")
  //           .style("height", "146px")
  //           .style("top", 408+"px")
  // }

  // function mouseover(){
  //   focus.style("display", null);
  //   div.html("age: "+d.age + "<br/>"  + "people: "+d.value)  
  //                   .style("left", (d3.event.pageX)-70 + "px")   
  //                   .style("top", 340+ "px"); 

  //       vertical
  //           .style("left", (d3.event.pageX) + "px")   
  //           .style("opacity",.4)
  //           .style("width", "2.5px")
  //           .style("height", "146px")
  //           .style("top", 408+"px")

  // }
  


  document.getElementById("go").onclick = function () { 
    var e = document.getElementById("age");
    var text = e.options[e.selectedIndex].text;
    var i = bisectAge(data, text,1),
    d0 = data[i - 1],
    d1 = data[i],
    d2 = text - d0.age > d1.age - text ? d1 : d0;
    var percent = d2.value/totalPopulation*100;
    var NumOfYounger = 0;
    data.forEach(function(d) {
      if(d.age <= d2.age)
        NumOfYounger = NumOfYounger + d.value;
    })
    var NumOfOlder = totalPopulation - NumOfYounger - d2.value;
    var YoungerPercent = NumOfYounger/totalPopulation*100
    
    verticalFixed
        .style("opacity",.4)
        .attr("y1", y(d2.value)+"px")
        .attr("y2", y(d2.value)-30+"px")
        .attr("x1", x(d2.age)+"px")
        .attr("x2", x(d2.age)+"px")
        .style("stroke-width", 1)
        .style("stroke", "black")
        .style("fill", "none");
    verticalCircle
        .attr("cx",x(d2.age)+"px")
        .attr("cy",y(d2.value)+"px" )
        .style("opacity",1)
        .style("stroke-width", 2)
        .style("fill", "gray")
        .style("stroke", "white");
    verticalText
        .style("text-anchor", "middle")
        .attr("x",x(d2.age)+"px")
        .attr("y",y(d2.value)-35+"px")
        .text(YoungerPercent.toFixed(2)+"%")
        .style("font-size","25px")
        .attr("fill", "red");
    

    document.getElementById("result").innerHTML = "There are "+percent.toFixed(2)+"% people is the same age as you in Taiwan, which are "
    +d2.value+" peoples, and "+YoungerPercent.toFixed(2)+"% people are younger than you.";
    console.log(d2);
  };

});