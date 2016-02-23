"use strict";

import crossfilter from "crossfilter";
import d3 from "d3";
import _ from "lodash";

import { activate, testdrive } from "./script";

{
    console.log("TestDrive up and running!");
    testdrive();

    _.forEach([0, 2, 4, 6, 8], (item) => {
        console.log(item);
    });

    activate();
}
