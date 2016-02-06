"use strict";

(function () {
    //var dataUrl = "./data/11.json";
    var dataUrl = "https://raw.githubusercontent.com/dbautistav/datahub/gh-pages/ecobici/2015/11.json";

    var dataset, events;

    function doCrossfilter() {
        ////  [795614]:
        ////var zero = {
        ////    Bici: "3415",
        ////    Ciclo_Estacion_Arribo: "132",
        ////    Ciclo_Estacion_Retiro: "129",
        ////    Edad_Usuario: "29",
        ////    Fecha_Arribo: "2015-11-01",
        ////    Fecha_Retiro: "2015-11-01",
        ////    Genero_Usuario: "M",
        ////    Hora_Arribo: "00:04:24",
        ////    Hora_Retiro: "00:00:01.623000"
        ////};

        events = crossfilter(dataset);

        $("#container").html("<h2>Items loaded: " + events.size() + "</h2>");

        events.dispose();

    }


    function fillDataset(response) {
        console.log("response", response, response.length);
        dataset = response;
        doCrossfilter();

    }


    function init() {
        d3.csv(dataUrl, fillDataset);

    }


    init();

})();
