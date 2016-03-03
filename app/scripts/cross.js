"use strict";

import agGrid from "ag-grid";
import d3 from "d3";
import crossfilter from "crossfilter";
import moment from "moment";
import Q from "q";
import $ from "jquery";

import "./../styles/vendor/ag-grid.css";
import "./../styles/vendor/theme-fresh.css";

import * as utils from "./utils";


/**
 * Toolkit: dimensions, group, filters
 * ===================================
 *
 * Example output:
 *
 *   keys 9 ["Bici", "Ciclo_Estacion_Arribo", "Ciclo_Estacion_Retiro",
 *              "Edad_Usuario", "Fecha_Arribo", "Fecha_Retiro", "Genero_Usuario",
 *              "Hora_Arribo", "Hora_Retiro"]
 *
 *   filterExact("0331")
 *   43. F
 *   32. M
 *   18. M
 *   72. M
 *   43. F
 *   34. M
 *   32. M
 *   21. M
 *   30. F
 *   25. M
 *   36. M
 *   30. M
 *   23. M
 *   42. M
 *   29. M
 *   47. M
 *   55. M
 *   33. F
 *
 *   byGenderGroup
 *   M: 14
 *   F: 4
 *
 *   Total # of users: 795614
 *   # of users between 23 yo and 25 yo (both included): 53268
 *
 */
export function explore(dataset) {
    const formatNumber = d3.format(",d")
        , logger = utils.loggerProvider()
        ;

    let grid = null,
        gridOptions = null;


    //// [795614]:
    ////  {
    ////    Bici: "3415",
    ////    Ciclo_Estacion_Arribo: "132",
    ////    Ciclo_Estacion_Retiro: "129",
    ////    Edad_Usuario: "29",
    ////    Fecha_Arribo: "2015-11-01",
    ////    Fecha_Retiro: "2015-11-01",
    ////    Genero_Usuario: "M",
    ////    Hora_Arribo: "00:04:24",
    ////    Hora_Retiro: "00:00:01.623000"
    ////  }

    return Q().then(() => {
        /**
         * Dynamic dimensions (crossfilter):
         *  > Age
         *  > Gender
         *  > Use time (°°°°)
         *
         * Fixed "dimensions":
         *  > Bike
         *  > Stations (°°)
         * */
        let observations = crossfilter(dataset)
            , all = observations.groupAll()
            , byAge = observations.dimension(dimensionByPropProvider("Edad_Usuario"))
            , byAgeGroup = byAge.group()
            , byGender = observations.dimension(dimensionByGender)
            , byGenderGroup = byGender.group()
            , byUseTime = observations.dimension(dimensionByUseTime)
            , byUseTimeGroup = byUseTime.group()
            , crossfilterSize = observations.size()
            //  TODO - improve this:
            , dummy = observations.dimension(dimensionByPropProvider("Genero_Usuario"))
            ;

        activate();

        let charts = [

            barChart()
                .dimension(byGender)
                .group(byGenderGroup)
                .x(
                    d3.scale.linear()
                        .domain([0, 12])
                        .rangeRound([0, 10 * 12])
                ),

            barChart()
                .dimension(byAge)
                .group(byAgeGroup)
                .x(
                    d3.scale.linear()
                        .domain([10, 90])
                        .rangeRound([10, 10 * 90])
                ),

            barChart()
                .dimension(byUseTime)
                .group(byUseTimeGroup)
                .x(
                    d3.scale.linear()
                        .domain([0, 100])
                        .rangeRound([0, 10 * 100])
                )

        ];

        let chart = d3.selectAll(".chart")
            .data(charts)
            .each((chart) => {
                chart
                    .on("brush", renderAll)
                    .on("brushend", renderAll);
            });

        let list = d3.selectAll("#results")
            .data([resultList]);

        renderAll();

        return true;


        function activate() {
            $("#jumbo")
                .html(
                    `<h2 id="zeitgeist">
                        Showing <span id="active">-</span> of <span id="total">-</span> results
                    </h2>
                    <p><em>Use charts as filters.</em></p>`);

            d3.select("#total")
                .text(formatNumber(crossfilterSize));
        }

        function barChart() {
            if (!barChart.id) {
                barChart.id = 0;
            }

            let margin = { top: 10, right: 10, bottom: 20, left: 10 },
                x,
                y = d3.scale.linear().range([100, 0]),
                id = barChart.id++,
                axis = d3.svg.axis().orient("bottom"),
                brush = d3.svg.brush(),
                brushDirty,
                dimension,
                group,
                round;

            function chart(div) {
                var width = x.range()[1],
                    height = y.range()[0];

                y.domain([0, group.top(1)[0].value]);

                div.each(function () {
                    var div = d3.select(this),
                        g = div.select("g");

                    // Create the skeletal chart.
                    if (g.empty()) {
                        div.select(".title").append("a")
                            .attr("href", "javascript:reset(" + id + ")")
                            .attr("class", "reset")
                            .text(" : reset")
                            .style("display", "none");

                        g = div.append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                        g.append("clipPath")
                            .attr("id", "clip-" + id)
                            .append("rect")
                            .attr("width", width)
                            .attr("height", height);

                        g.selectAll(".bar")
                            .data(["background", "foreground"])
                            .enter().append("path")
                            .attr("class", (d) => {
                                return d + " bar";
                            })
                            .datum(group.all());

                        g.selectAll(".foreground.bar")
                            .attr("clip-path", "url(#clip-" + id + ")");

                        g.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(axis);

                        // Initialize the brush component with pretty resize handles.
                        let gBrush = g.append("g").attr("class", "brush").call(brush);
                        gBrush.selectAll("rect").attr("height", height);
                        gBrush.selectAll(".resize").append("path").attr("d", resizePath);
                    }

                    // Only redraw the brush if set externally.
                    if (brushDirty) {
                        brushDirty = false;
                        g.selectAll(".brush").call(brush);
                        div.select(".title a").style("display", brush.empty() ? "none" : null);
                        if (brush.empty()) {
                            g.selectAll("#clip-" + id + " rect")
                                .attr("x", 0)
                                .attr("width", width);

                        } else {
                            let extent = brush.extent();
                            g.selectAll("#clip-" + id + " rect")
                                .attr("x", x(extent[0]))
                                .attr("width", x(extent[1]) - x(extent[0]));
                        }
                    }

                    g.selectAll(".bar").attr("d", barPath);
                });

                function barPath(groups) {
                    let path = [],
                        i = -1,
                        n = groups.length,
                        d;

                    while (++i < n) {
                        d = groups[i];
                        path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
                    }

                    return path.join("");
                }

                function resizePath(d) {
                    let e = +(d == "e"),
                        x = e ? 1 : -1,
                        y = height / 3;
                    return "M" + (.5 * x) + "," + y
                        + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                        + "V" + (2 * y - 6)
                        + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                        + "Z"
                        + "M" + (2.5 * x) + "," + (y + 8)
                        + "V" + (2 * y - 8)
                        + "M" + (4.5 * x) + "," + (y + 8)
                        + "V" + (2 * y - 8);
                }
            }

            brush.on("brushstart.chart", function () {
                var div = d3.select(this.parentNode.parentNode.parentNode);
                div.select(".title a").style("display", null);
            });

            brush.on("brush.chart", function () {
                let g = d3.select(this.parentNode),
                    extent = brush.extent();
                if (round) g.select(".brush")
                    .call(brush.extent(extent = extent.map(round)))
                    .selectAll(".resize")
                    .style("display", null);
                g.select("#clip-" + id + " rect")
                    .attr("x", x(extent[0]))
                    .attr("width", x(extent[1]) - x(extent[0]));
                dimension.filterRange(extent);
            });

            brush.on("brushend.chart", function () {
                if (brush.empty()) {
                    let div = d3.select(this.parentNode.parentNode.parentNode);
                    div.select(".title a").style("display", "none");
                    div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                    dimension.filterAll();
                }
            });

            chart.margin = function (_) {
                if (!arguments.length) return margin;
                margin = _;
                return chart;
            };

            chart.x = function (_) {
                if (!arguments.length) return x;
                x = _;
                axis.scale(x);
                brush.x(x);
                return chart;
            };

            chart.y = function (_) {
                if (!arguments.length) return y;
                y = _;
                return chart;
            };

            chart.dimension = function (_) {
                if (!arguments.length) return dimension;
                dimension = _;
                return chart;
            };

            chart.filter = function (_) {
                if (_) {
                    brush.extent(_);
                    dimension.filterRange(_);

                } else {
                    brush.clear();
                    dimension.filterAll();
                }
                brushDirty = true;
                return chart;
            };

            chart.group = function (_) {
                if (!arguments.length) return group;
                group = _;
                return chart;
            };

            chart.round = function (_) {
                if (!arguments.length) return round;
                round = _;
                return chart;
            };

            return d3.rebind(chart, brush, "on");
        }

        function render(method) { d3.select(this).call(method); }

        function renderAll() {
            chart.each(render);
            list.each(render);
            d3.select("#active").text(formatNumber(all.value()));
        }

        function resultList() {
            const numberOfItemsToShow = 300;    //Infinity;

            if (gridOptions === null && grid === null) {
                gridOptions = {
                    columnDefs: [
                        { headerName: "Genero_Usuario", field: "Genero_Usuario" },
                        { headerName: "Edad_Usuario", field: "Edad_Usuario" },
                        { headerName: "Bici", field: "Bici" },
                        { headerName: "Ciclo_Estacion_Retiro", field: "Ciclo_Estacion_Retiro" },
                        { headerName: "Ciclo_Estacion_Arribo", field: "Ciclo_Estacion_Arribo" }
                    ],
                    rowData: dummy.top(numberOfItemsToShow)
                };

                grid = new agGrid.Grid(document.querySelector("#results"), gridOptions);

            } else {
                gridOptions.api.setRowData(dummy.top(numberOfItemsToShow));
            }
        }

    });
}

function dimensionByGender(o) {
    //dimensionByPropProvider("Genero_Usuario")
    switch (o["Genero_Usuario"]) {
        case "F":
            return 2;
            break;
        case "M":
            return 1;
            break;
        default:
            return 0;
    }
}

function dimensionByPropProvider(prop, fn = identity) {
    return (o) => { return fn(o[prop]); };
}

function dimensionByUseTime(o) {
    return moment(`${o.Fecha_Arribo}/${o.Hora_Arribo}`, "YYYY-MM-DD/HH:mm:ss")
        .diff(
            moment(`${o.Fecha_Retiro}/${o.Hora_Retiro}`, "YYYY-MM-DD/HH:mm:ss")
            , "minutes"
            //, true
        );
}

function identity(_) { return _; }
