"use strict";

import crossfilter from "crossfilter";
import Q from "q";
import $ from "jquery";

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
export function doCrossfilter(dataset) {
    const logger = utils.loggerProvider();

    return Q().then(() => {
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

        let observations = crossfilter(dataset);
        //logger(observations, "observations");

        // ~~~~
        $("#container")
            .html(
                "<h2>Items loaded: " + observations.size() + "</h2>" +
                "<p>Check the dev-tools console.</p>"
            );

        let byBike = observations.dimension((o, i) => {
            return o.Bici;
        });


        let byBikeGroup = byBike.group();
        logger(byBikeGroup.size(), "byBikeGroup");

        //// Prints every 'Bici' id and number of occurrences:
        //byBikeGroup.top(Infinity).forEach((o, i) => {
        ////    key: set by dimension definition (observation attribute); value: count of 'key' occurrences
        //    console.log(o.key + ": " + o.value);
        //});

        byBike.filter("0331");      // also: byBike.filterExact("0331");
        console.log('filterExact("0331")    |    (Edad. Genero)');
        byBike.top(Infinity).forEach((o, i) => {
            console.log(o.Edad_Usuario + ". " + o.Genero_Usuario);
        });

        // ~~~~
        let byGender = observations.dimension((o, i) => {
            return o.Genero_Usuario;
        });

        let byGenderGroup = byGender.group();
        logger(byGenderGroup.size(), "byGenderGroup");
        byGenderGroup.top(Infinity).forEach((o, i) => {
            ////    key: set by dimension definition (observation attribute); value: count of 'key' occurrences
            console.log(o.key + ": " + o.value);
        });
        //// console.log("observations.groupAll().reduceCount().value()", observations.groupAll().reduceCount().value());
        let filtered = byGender.top(Infinity).map((o, i) => {
            return o;
        });
        console.log(filtered);


        // Resets previous filters:
        byBike.filter(null);     // also: byBike.filterAll();


        let byAge = observations.dimension((o, i) => {
            return parseInt(o.Edad_Usuario);
        });
        logger(`Total # of users (dimension-top): ${byAge.top(Infinity).length}`);
        logger(`Total # of users (crossfilter-size): ${observations.size()}`);

        let t0 = 23, tf = 25;
        byAge.filter([t0, tf]);
        logger(`# of users between ${t0} yo and ${tf} yo (both included): ${byAge.top(Infinity).length}`);


        //// Prints every 'Bici' id and number of occurrences (affected by previous 'byAge.filter'):
        //byBikeGroup.top(Infinity).forEach((o, i) => {
        ////    key: set by dimension definition (observation attribute); value: count of 'key' occurrences
        //    console.log(o.key + ": " + o.value);
        //});


        // ~~~~
        t0 = 20;
        tf = 21;
        byAge.filter([t0, tf]);

        logger(`# of users between ${t0} yo and ${tf} yo (both included): ${byAge.top(Infinity).length}`);

        // By default, the group's reduce function will count the number of records per group.
        // In addition, the groups will be ordered by count.
        // [...] a grouping intersects the crossfilter's current filters,
        //  except for the associated dimension's filter.
        //  Thus, group methods consider only records that satisfy every filter except this dimension's filter.
        byGenderGroup.top(Infinity).forEach((o, i) => {
            ////    key: set by dimension definition (observation attribute); value: count of 'key' occurrences
            console.log(o.key + ": " + o.value);
        });


        byAge.filter(null);
        let byAgeGroup = byAge.group();
        console.log("byAgeGroup", byAgeGroup.size(), byAge.bottom(1)[0].Edad_Usuario, byAge.top(1)[0].Edad_Usuario);

        //byBikeGroup.top(Infinity).forEach((o, i) => {
        ////    key: set by dimension definition (observation attribute); value: count of 'key' occurrences
        //    console.log(o.key + ": " + o.value);
        //});
        //byAge.top(Infinity).forEach((o, i) => {
        ////    key: set by dimension definition (observation attribute); value: count of 'key' occurrences
        //    console.log(o.key + ": " + o.value);
        //});


        // This frees up space.
        //  (groups and dimensions)
        byGenderGroup.dispose();
        byGender.dispose();
        byBikeGroup.dispose();
        byBike.dispose();
        byAgeGroup.dispose();
        byAge.dispose();

        return true;
    });
}
