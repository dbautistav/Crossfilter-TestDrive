"use strict";

(function () {
    var dataset, dataUrl = "./data/schools.json";
    var schools, muncode, muncodes;

    function doCrossfilter() {
        schools = crossfilter(dataset);

        console.log("schools", schools);
        console.log("schools.size()", schools.size());
        console.log(" ");


        muncode = schools.dimension(function (d) {
            return parseInt(d.muncode % 10);
        });

        console.log("muncode.filter()", muncode.filter());
        console.log("muncode.filter().top(1)", muncode.filter().top(1), muncode.filter().top(1).length);
        console.log("muncode.filter().bottom(1)", muncode.filter().bottom(1), muncode.filter().bottom(1).length);
        console.log("muncode.filter([5, 7])", muncode.filter([5, 7]));
        console.log("muncode.filter([5, 7]).top(1)",
            muncode.filter([5, 7]).top(1), muncode.filter([5, 7]).top(1).length);
        console.log("muncode.top(10)", muncode.top(10), muncode.top(10).length);
        console.log("muncode.bottom(10)", muncode.bottom(10), muncode.bottom(10).length);
        console.log(" ");


        muncodes = muncode.group(function (m) {
            return parseInt(m % 10);
        });

        console.log("muncodes", muncodes);
        console.log("muncodes.top(1)", muncodes.top(1), muncodes.top(1).length);
        console.log("muncodes.all()", muncodes.all(), muncodes.all().length);
        console.log("muncodes.size()", muncodes.size());
        console.log("muncodes.reduceCount()", muncodes.reduceCount());
        console.log(" ");

        var total = _.reduce(_.pluck(muncodes.all(), 'value'), function (_total, n) {
            return _total + n;
        });
        console.log("total", total);

        $("#container").html("<h1>Total: " + total + "</h1><div id='content'></div>");

        var content = "<ul>";
        _.forEach(muncode.filter([5, 7]).top(25), function (m, i) {
            content += "<li>" + i + " ### " + m.name + " => " + m.muncode + "</li>";
        });
        content += "</ul>";
        $("#content").html(content);

        // This frees up space.
        muncode.dispose();
        muncodes.dispose();
    }


    function fillDataset(data) {
        dataset = _.map(data.features, function (_obj) {
            return _obj.properties;
        });
        console.log("dataset", dataset, dataset.length);
        doCrossfilter();
    }


    function init() {
        $.ajax({
            url: dataUrl,
            success: fillDataset
        });
    }


    init();

})();
