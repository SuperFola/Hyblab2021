var TimeKnots = {
    draw: function (id, events, options) {
        var cfg = {
            width: 600,
            height: 200,
            radius: 25,
            lineWidth: 4,
            color: "#999",
            background: "#FFF",
            dateFormat: "%Y/%m/%d %H:%M:%S",
            horizontalLayout: true,
            showLabels: false,
            labelFormat: "%Y/%m/%d %H:%M:%S",
            addNow: false,
            seriesColor: d3.scale.category20(),
            dateDimension: true
        };


        //default configuration overrid
        if (options != undefined) {
            for (var i in options) {
                cfg[i] = options[i];
            }
        }
        if (cfg.addNow != false) {
            events.push({ date: new Date(), name: cfg.addNowLabel || "Today" });
        }
        var tip = d3.select(id)
            .append('div')
            .style("opacity", 0)
            .style("position", "absolute")
            .style("font-family", "Helvetica Neue")
            .style("font-weight", "300")
            .style("background", "rgba(0,0,0,0.5)")
            .style("color", "white")
            .style("padding", "5px 10px 5px 10px")
            .style("-moz-border-radius", "8px 8px")
            .style("border-radius", "8px 8px");
        var svg = d3.select(id).append('svg').attr("width", cfg.width).attr("height", cfg.height);


        //Calculate times in terms of timestamps
        if (!cfg.dateDimension) {
            var timestamps = events.map(function (d) { return d.value });//new Date(d.date).getTime()});
            var maxValue = d3.max(timestamps);
            var minValue = d3.min(timestamps);
        } else {
            var timestamps = events.map(function (d) { return Date.parse(d.date); });//new Date(d.date).getTime()});
            var maxValue = d3.max(timestamps);
            var minValue = d3.min(timestamps);
        }


        var margin = (d3.max(events.map(function (d) { return d.radius })) || cfg.radius) * 1.5 + cfg.lineWidth;
        var step = (cfg.horizontalLayout) ? ((cfg.width - 2 * margin) / (maxValue - minValue)) : ((cfg.height - 2 * margin) / (maxValue - minValue));
        var series = [];
        if (maxValue == minValue) { step = 0; if (cfg.horizontalLayout) { margin = cfg.width / 2 } else { margin = cfg.height / 2 } }

        linePrevious = {
            x1: null,
            x2: null,
            y1: null,
            y2: null
        }


        //draw the line
        svg.selectAll("line")
            .data(events).enter().append("line")
            .attr("class", "timeline-line")
            
            .attr("x1", function (d) {
                var ret;
                if (cfg.horizontalLayout) {
                    var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                    ret = Math.floor(step * (datum - minValue) + margin)
                }
                else {
                    ret = Math.floor(cfg.width / 2)
                }
                linePrevious.x1 = ret
                return ret
            })
            .attr("x2", function (d) {
                if (linePrevious.x1 != null) {
                    return linePrevious.x1
                }
                if (cfg.horizontalLayout) {
                    var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                    ret = Math.floor(step * (datum - minValue))
                }
                return Math.floor(cfg.width / 2)
            })
            .attr("y1", function (d) {
                var ret;
                if (cfg.horizontalLayout) {
                    ret = Math.floor(cfg.height / 2)
                }
                else {
                    var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                    ret = Math.floor(step * (datum - minValue)) + margin
                }
                linePrevious.y1 = ret
                return ret
            })
            .attr("y2", function (d) {
                if (linePrevious.y1 != null) {
                    return linePrevious.y1
                }
                if (cfg.horizontalLayout) {
                    return Math.floor(cfg.height / 2)
                }
                var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                return Math.floor(step * (datum - minValue))
            })
            .style("stroke", function (d) {
                if (d.color != undefined) {
                    return d.color
                }
                if (d.series != undefined) {
                    if (series.indexOf(d.series) < 0) {
                        series.push(d.series);
                    }
                    return cfg.seriesColor(series.indexOf(d.series));
                }
                return cfg.color
            })
            .style("stroke-width", cfg.lineWidth);



        //draw circles
        const circles = svg.selectAll(null)
            .data(events)
            .enter()
            .append("circle")
            .attr("class", "timeline-event")
            .style("opacity", 0)
            .attr("r", function (d) { if (d.radius != undefined) { return d.radius } return cfg.radius })

            //epaisseur des ronds
            .style("stroke-width", function (d) { if (d.lineWidth != undefined) { return d.lineWidth } return cfg.lineWidth })

            //position ronds
            .attr("cy", function (d) {
                if (cfg.horizontalLayout) {
                    return Math.floor(cfg.height / 2) - 50
                }
                var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                return Math.floor(step * (datum - minValue) + margin)
            })
            .attr("cx", function (d) {
                if (cfg.horizontalLayout) {
                    var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                    var x = Math.floor(step * (datum - minValue) + margin);
                    return x;
                }
                return Math.floor(cfg.width / 2)
            })
            .style("fill", function (d) {
                if (d.color != undefined) {
                    return d.color
                }
                if (d.series != undefined) {
                    if (series.indexOf(d.series) < 0) {
                        series.push(d.series);
                    }
                    console.log(d.series, series, series.indexOf(d.series));
                    return cfg.seriesColor(series.indexOf(d.series));
                }
                return cfg.color
            })
            .on("mouseover", function (d) {
                if (cfg.dateDimension) {
                    var format = d3.time.format(cfg.dateFormat);
                    var datetime = format(new Date(d.date));
                    var dateValue = (datetime != "") ? (d.name + " <small>(" + datetime + ")</small>") : d.name;
                } else {
                    var format = function (d) { return d }; // TODO
                    var datetime = d.value;
                    var dateValue = d.name + " <small>(" + d.value + ")</small>";
                }
                d3.select(this)
                    .style("fill", function (d) { if (d.color != undefined) { return d.color } return cfg.color }).transition()
                    .duration(100).attr("r", function (d) { if (d.radius != undefined) { return Math.floor(d.radius * 1.5) } return Math.floor(cfg.radius * 1.5) });
                tip.html("");
                if (d.img != undefined) {
                    tip.append("img").style("float", "left").style("margin-right", "4px").attr("src", d.img).attr("width", "64px");
                }
                tip.append("div").style("float", "left").html(dateValue);
                tip.transition()
                    .duration(100)
                    .style("opacity", .9);

            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("fill", function (d) {
                        if (d.color != undefined) {
                            return d.color
                        }
                        if (d.series != undefined) {
                            if (series.indexOf(d.series) < 0) {
                                series.push(d.series);
                            }
                            console.log(d.series, series, series.indexOf(d.series));
                            return cfg.seriesColor(series.indexOf(d.series));
                        }
                        return cfg.color
                    }).transition()
                    .duration(100).attr("r", function (d) { if (d.radius != undefined) { return d.radius } return cfg.radius });
                tip.transition()
                    .duration(100)
                    .style("opacity", 0)
            })
            .transition()
            .delay(function (_, i) {
                return i * 1000;
            })
            .style("opacity", 1);



        const segments = svg.selectAll(null)
        .data(events)
        .enter()
        .append("line")
        .style("opacity", 0)
        .attr("x1", function (d) {
            if (cfg.horizontalLayout) {
                var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                var x = Math.floor(step * (datum - minValue) + margin);
                return x;
            }
            return Math.floor(cfg.width / 2)
        })
        .attr("x2", function (d) {
            if (cfg.horizontalLayout) {
                var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                var x = Math.floor(step * (datum - minValue) + margin);
                return x;
            }
            return Math.floor(cfg.width / 2)    
        })
        .attr("y1", function (d) {
            if (cfg.horizontalLayout) {
                return Math.floor(cfg.height / 2) + 10
            }
            var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
            return Math.floor(step * (datum - minValue) + margin)
        })
        .attr("y2", function (d) {
            if (cfg.horizontalLayout) {
                return Math.floor(cfg.height / 2) - 10
            }
            var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
            return Math.floor(step * (datum - minValue) + margin)
        })
        .style("stroke", function (d) {
            if (d.color != undefined) {
                return d.color
            }
            if (d.series != undefined) {
                if (series.indexOf(d.series) < 0) {
                    series.push(d.series);
                }
                return cfg.seriesColor(series.indexOf(d.series));
            }
            return cfg.color
        })
        .style("stroke-width", cfg.lineWidth / 2)
        .transition()
        .delay(function (_, i) {
            return i * 1000;
        })
        .style("opacity", 1);






        //chiffres en dessous
        const labels = svg.selectAll(null)
            .data(events)
            .enter()
            .append("text")
            .text(function (d) { return d.value })
            .attr("y", function (d) {
                if (cfg.horizontalLayout) {
                    return Math.floor(cfg.height / 2) + 50
                }
                var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                return Math.floor(step * (datum - minValue) + margin)
            })
            //-5 pour centrer le texte
            .attr("x", function (d) {
                if (cfg.horizontalLayout) {
                    var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                    var x = Math.floor(step * (datum - minValue) + margin);
                    return x-5;
                }
                return Math.floor(cfg.width / 2) -5
            })
            .style("opacity", 0)

            .transition()
            .delay(function (_, i) {
                return i * 1000;
            })
            .style("opacity", 1);





        //tooltip box au dessus des cercles
        svg.on("mousemove", function () {
            tipPixels = parseInt(tip.style("height").replace("px", ""));
            return tip.style("top", (d3.event.pageY - tipPixels - margin) + "px").style("left", (d3.event.pageX + 20) + "px");
        })
            .on("mouseout", function () { return tip.style("opacity", 0).style("top", "0px").style("left", "0px"); });
    }
}

