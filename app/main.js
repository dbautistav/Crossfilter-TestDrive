"use strict";

import * as utils from "./scripts/utils";
import { setup } from "./scripts/setup";


{
    const responseLogger = utils.responseLoggerProvider("main.js");
    setup()
        .then(responseLogger)
        .catch(utils.errorHandler);
}
