"use strict";

import * as utils from "./scripts/utils";
import { setup } from "./scripts/setup";
import { doCrossfilter } from "./scripts/cross";


{
    setup()
        //.then(utils.responseLoggerProvider("main.js (1)"))
        .then(doCrossfilter)
        //.then(utils.responseLoggerProvider("main.js (2)"))
        .catch(utils.errorHandler);
}
