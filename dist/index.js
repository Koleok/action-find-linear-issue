/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 729:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Gets an issue using the provided team and issueNumber
 * @param linearClient LinearClient instance
 * @param team Linear team object
 * @param issueNumber Issue number to search for the "123" in "ENG-123"
 * @returns The issue if it exists
 */
const getIssueByTeamAndNumber = async (linearClient, team, issueNumber) => {
    const issues = await linearClient.issues({
        filter: {
            team: {
                id: {
                    eq: team.id,
                },
            },
            number: {
                eq: issueNumber,
            },
        },
    });
    if (issues.nodes.length === 0) {
        console.log(`Failed to find issue ${team.key}-${issueNumber}`);
        return null;
    }
    return issues.nodes[0];
};
exports["default"] = getIssueByTeamAndNumber;


/***/ }),

/***/ 9236:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const getTeams = async (linearClient) => {
    const teams = await linearClient.teams();
    return teams.nodes;
};
exports["default"] = getTeams;


/***/ }),

/***/ 3109:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __nccwpck_require__(2186);
const sdk_1 = __nccwpck_require__(8851);
const github_1 = __nccwpck_require__(5438);
const getTeams_1 = __importDefault(__nccwpck_require__(9236));
const getIssueByTeamAndNumber_1 = __importDefault(__nccwpck_require__(729));
const main = async () => {
    try {
        const prTitle = github_1.context?.payload?.pull_request?.title;
        (0, core_1.debug)(`PR Title: ${prTitle}`);
        if (!prTitle) {
            (0, core_1.setFailed)(`Could not load PR title`);
            return;
        }
        const prBranch = github_1.context.payload.pull_request?.head.ref;
        (0, core_1.debug)(`PR Branch: ${prBranch}`);
        if (!prBranch) {
            (0, core_1.setFailed)(`Could not load PR branch`);
            return;
        }
        const prBody = github_1.context?.payload?.pull_request?.body;
        (0, core_1.debug)(`PR Body: ${prBody}`);
        if (prBranch === undefined) {
            (0, core_1.setFailed)(`Could not load PR body`);
            return;
        }
        const apiKey = (0, core_1.getInput)("linear-api-key", { required: true });
        const linearClient = new sdk_1.LinearClient({ apiKey });
        const teams = await (0, getTeams_1.default)(linearClient);
        if (teams.length === 0) {
            (0, core_1.setFailed)(`No teams found in Linear workspace`);
            return;
        }
        for (const team of teams) {
            const regex = new RegExp(`${team.key}-(?<issueNumber>\d+)`, "gim");
            (0, core_1.debug)(`Checking PR for indentifier ${team.key}-XYZ`);
            const check = regex.exec(prBranch + " " + prTitle + " " + prBody);
            // TODO: Iterate over multiple matches and not just first match
            const issueNumber = check?.groups?.issueNumber;
            if (issueNumber) {
                (0, core_1.debug)(`Found issue number: ${issueNumber}`);
                const issue = await (0, getIssueByTeamAndNumber_1.default)(linearClient, team, Number(issueNumber));
                if (issue) {
                    (0, core_1.setOutput)("linear-team-id", team.id);
                    (0, core_1.setOutput)("linear-team-key", team.key);
                    (0, core_1.setOutput)("linear-issue-id", issue.id);
                    (0, core_1.setOutput)("linear-issue-number", issue.number);
                    (0, core_1.setOutput)("linear-issue-identifier", issue.identifier);
                    (0, core_1.setOutput)("linear-issue-url", issue.url);
                    (0, core_1.setOutput)("linear-issue-title", issue.title);
                    (0, core_1.setOutput)("linear-issue-description", issue.description);
                    return;
                }
            }
        }
        (0, core_1.setFailed)(`Failed to find Linear issue identifier in PR branch, title or body.`);
        return;
    }
    catch (error) {
        (0, core_1.setFailed)(`${error?.message ?? error}`);
    }
};
main();


/***/ }),

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(5278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(7351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(5278);
const os = __importStar(__nccwpck_require__(2037));
const path = __importStar(__nccwpck_require__(1017));
const oidc_utils_1 = __nccwpck_require__(8041);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    return inputs;
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
function getIDToken(aud) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
    });
}
exports.getIDToken = getIDToken;
/**
 * Summary exports
 */
var summary_1 = __nccwpck_require__(1327);
Object.defineProperty(exports, "summary", ({ enumerable: true, get: function () { return summary_1.summary; } }));
/**
 * @deprecated use core.summary
 */
var summary_2 = __nccwpck_require__(1327);
Object.defineProperty(exports, "markdownSummary", ({ enumerable: true, get: function () { return summary_2.markdownSummary; } }));
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issueCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(7147));
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(5278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 8041:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OidcClient = void 0;
const http_client_1 = __nccwpck_require__(9925);
const auth_1 = __nccwpck_require__(3702);
const core_1 = __nccwpck_require__(2186);
class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
            allowRetries: allowRetry,
            maxRetries: maxRetry
        };
        return new http_client_1.HttpClient('actions/oidc-client', [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
        const token = process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
        if (!token) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable');
        }
        return token;
    }
    static getIDTokenUrl() {
        const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL'];
        if (!runtimeUrl) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable');
        }
        return runtimeUrl;
    }
    static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const httpclient = OidcClient.createHttpClient();
            const res = yield httpclient
                .getJson(id_token_url)
                .catch(error => {
                throw new Error(`Failed to get ID Token. \n 
        Error Code : ${error.statusCode}\n 
        Error Message: ${error.result.message}`);
            });
            const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
            if (!id_token) {
                throw new Error('Response json body do not have ID Token field');
            }
            return id_token;
        });
    }
    static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // New ID Token is requested from action service
                let id_token_url = OidcClient.getIDTokenUrl();
                if (audience) {
                    const encodedAudience = encodeURIComponent(audience);
                    id_token_url = `${id_token_url}&audience=${encodedAudience}`;
                }
                core_1.debug(`ID token url is ${id_token_url}`);
                const id_token = yield OidcClient.getCall(id_token_url);
                core_1.setSecret(id_token);
                return id_token;
            }
            catch (error) {
                throw new Error(`Error message: ${error.message}`);
            }
        });
    }
}
exports.OidcClient = OidcClient;
//# sourceMappingURL=oidc-utils.js.map

/***/ }),

/***/ 1327:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
const os_1 = __nccwpck_require__(2037);
const fs_1 = __nccwpck_require__(7147);
const { access, appendFile, writeFile } = fs_1.promises;
exports.SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';
exports.SUMMARY_DOCS_URL = 'https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary';
class Summary {
    constructor() {
        this._buffer = '';
    }
    /**
     * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
     * Also checks r/w permissions.
     *
     * @returns step summary file path
     */
    filePath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._filePath) {
                return this._filePath;
            }
            const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
            if (!pathFromEnv) {
                throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
            }
            try {
                yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
            }
            catch (_a) {
                throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
            }
            this._filePath = pathFromEnv;
            return this._filePath;
        });
    }
    /**
     * Wraps content in an HTML tag, adding any HTML attributes
     *
     * @param {string} tag HTML tag to wrap
     * @param {string | null} content content within the tag
     * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
     *
     * @returns {string} content wrapped in HTML element
     */
    wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join('');
        if (!content) {
            return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
    }
    /**
     * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
     *
     * @param {SummaryWriteOptions} [options] (optional) options for write operation
     *
     * @returns {Promise<Summary>} summary instance
     */
    write(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
            const filePath = yield this.filePath();
            const writeFunc = overwrite ? writeFile : appendFile;
            yield writeFunc(filePath, this._buffer, { encoding: 'utf8' });
            return this.emptyBuffer();
        });
    }
    /**
     * Clears the summary buffer and wipes the summary file
     *
     * @returns {Summary} summary instance
     */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emptyBuffer().write({ overwrite: true });
        });
    }
    /**
     * Returns the current summary buffer as a string
     *
     * @returns {string} string of summary buffer
     */
    stringify() {
        return this._buffer;
    }
    /**
     * If the summary buffer is empty
     *
     * @returns {boolen} true if the buffer is empty
     */
    isEmptyBuffer() {
        return this._buffer.length === 0;
    }
    /**
     * Resets the summary buffer without writing to summary file
     *
     * @returns {Summary} summary instance
     */
    emptyBuffer() {
        this._buffer = '';
        return this;
    }
    /**
     * Adds raw text to the summary buffer
     *
     * @param {string} text content to add
     * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
     *
     * @returns {Summary} summary instance
     */
    addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
    }
    /**
     * Adds the operating system-specific end-of-line marker to the buffer
     *
     * @returns {Summary} summary instance
     */
    addEOL() {
        return this.addRaw(os_1.EOL);
    }
    /**
     * Adds an HTML codeblock to the summary buffer
     *
     * @param {string} code content to render within fenced code block
     * @param {string} lang (optional) language to syntax highlight code
     *
     * @returns {Summary} summary instance
     */
    addCodeBlock(code, lang) {
        const attrs = Object.assign({}, (lang && { lang }));
        const element = this.wrap('pre', this.wrap('code', code), attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML list to the summary buffer
     *
     * @param {string[]} items list of items to render
     * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
     *
     * @returns {Summary} summary instance
     */
    addList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        const listItems = items.map(item => this.wrap('li', item)).join('');
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML table to the summary buffer
     *
     * @param {SummaryTableCell[]} rows table rows
     *
     * @returns {Summary} summary instance
     */
    addTable(rows) {
        const tableBody = rows
            .map(row => {
            const cells = row
                .map(cell => {
                if (typeof cell === 'string') {
                    return this.wrap('td', cell);
                }
                const { header, data, colspan, rowspan } = cell;
                const tag = header ? 'th' : 'td';
                const attrs = Object.assign(Object.assign({}, (colspan && { colspan })), (rowspan && { rowspan }));
                return this.wrap(tag, data, attrs);
            })
                .join('');
            return this.wrap('tr', cells);
        })
            .join('');
        const element = this.wrap('table', tableBody);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds a collapsable HTML details element to the summary buffer
     *
     * @param {string} label text for the closed state
     * @param {string} content collapsable content
     *
     * @returns {Summary} summary instance
     */
    addDetails(label, content) {
        const element = this.wrap('details', this.wrap('summary', label) + content);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML image tag to the summary buffer
     *
     * @param {string} src path to the image you to embed
     * @param {string} alt text description of the image
     * @param {SummaryImageOptions} options (optional) addition image attributes
     *
     * @returns {Summary} summary instance
     */
    addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, (width && { width })), (height && { height }));
        const element = this.wrap('img', null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML section heading element
     *
     * @param {string} text heading text
     * @param {number | string} [level=1] (optional) the heading level, default: 1
     *
     * @returns {Summary} summary instance
     */
    addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
            ? tag
            : 'h1';
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML thematic break (<hr>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addSeparator() {
        const element = this.wrap('hr', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML line break (<br>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addBreak() {
        const element = this.wrap('br', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML blockquote to the summary buffer
     *
     * @param {string} text quote text
     * @param {string} cite (optional) citation url
     *
     * @returns {Summary} summary instance
     */
    addQuote(text, cite) {
        const attrs = Object.assign({}, (cite && { cite }));
        const element = this.wrap('blockquote', text, attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML anchor tag to the summary buffer
     *
     * @param {string} text link text/content
     * @param {string} href hyperlink
     *
     * @returns {Summary} summary instance
     */
    addLink(text, href) {
        const element = this.wrap('a', text, { href });
        return this.addRaw(element).addEOL();
    }
}
const _summary = new Summary();
/**
 * @deprecated use `core.summary`
 */
exports.markdownSummary = _summary;
exports.summary = _summary;
//# sourceMappingURL=summary.js.map

/***/ }),

/***/ 5278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
        return {};
    }
    return {
        title: annotationProperties.title,
        file: annotationProperties.file,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
    };
}
exports.toCommandProperties = toCommandProperties;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 4087:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Context = void 0;
const fs_1 = __nccwpck_require__(7147);
const os_1 = __nccwpck_require__(2037);
class Context {
    /**
     * Hydrate the context from the environment
     */
    constructor() {
        var _a, _b, _c;
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
            if (fs_1.existsSync(process.env.GITHUB_EVENT_PATH)) {
                this.payload = JSON.parse(fs_1.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' }));
            }
            else {
                const path = process.env.GITHUB_EVENT_PATH;
                process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${os_1.EOL}`);
            }
        }
        this.eventName = process.env.GITHUB_EVENT_NAME;
        this.sha = process.env.GITHUB_SHA;
        this.ref = process.env.GITHUB_REF;
        this.workflow = process.env.GITHUB_WORKFLOW;
        this.action = process.env.GITHUB_ACTION;
        this.actor = process.env.GITHUB_ACTOR;
        this.job = process.env.GITHUB_JOB;
        this.runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);
        this.runId = parseInt(process.env.GITHUB_RUN_ID, 10);
        this.apiUrl = (_a = process.env.GITHUB_API_URL) !== null && _a !== void 0 ? _a : `https://api.github.com`;
        this.serverUrl = (_b = process.env.GITHUB_SERVER_URL) !== null && _b !== void 0 ? _b : `https://github.com`;
        this.graphqlUrl = (_c = process.env.GITHUB_GRAPHQL_URL) !== null && _c !== void 0 ? _c : `https://api.github.com/graphql`;
    }
    get issue() {
        const payload = this.payload;
        return Object.assign(Object.assign({}, this.repo), { number: (payload.issue || payload.pull_request || payload).number });
    }
    get repo() {
        if (process.env.GITHUB_REPOSITORY) {
            const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
            return { owner, repo };
        }
        if (this.payload.repository) {
            return {
                owner: this.payload.repository.owner.login,
                repo: this.payload.repository.name
            };
        }
        throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
    }
}
exports.Context = Context;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ 5438:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOctokit = exports.context = void 0;
const Context = __importStar(__nccwpck_require__(4087));
const utils_1 = __nccwpck_require__(3030);
exports.context = new Context.Context();
/**
 * Returns a hydrated octokit ready to use for GitHub Actions
 *
 * @param     token    the repo PAT or GITHUB_TOKEN
 * @param     options  other options to set
 */
function getOctokit(token, options) {
    return new utils_1.GitHub(utils_1.getOctokitOptions(token, options));
}
exports.getOctokit = getOctokit;
//# sourceMappingURL=github.js.map

/***/ }),

/***/ 7914:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getApiBaseUrl = exports.getProxyAgent = exports.getAuthString = void 0;
const httpClient = __importStar(__nccwpck_require__(9925));
function getAuthString(token, options) {
    if (!token && !options.auth) {
        throw new Error('Parameter token or opts.auth is required');
    }
    else if (token && options.auth) {
        throw new Error('Parameters token and opts.auth may not both be specified');
    }
    return typeof options.auth === 'string' ? options.auth : `token ${token}`;
}
exports.getAuthString = getAuthString;
function getProxyAgent(destinationUrl) {
    const hc = new httpClient.HttpClient();
    return hc.getAgent(destinationUrl);
}
exports.getProxyAgent = getProxyAgent;
function getApiBaseUrl() {
    return process.env['GITHUB_API_URL'] || 'https://api.github.com';
}
exports.getApiBaseUrl = getApiBaseUrl;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 3030:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOctokitOptions = exports.GitHub = exports.context = void 0;
const Context = __importStar(__nccwpck_require__(4087));
const Utils = __importStar(__nccwpck_require__(7914));
// octokit + plugins
const core_1 = __nccwpck_require__(6762);
const plugin_rest_endpoint_methods_1 = __nccwpck_require__(3044);
const plugin_paginate_rest_1 = __nccwpck_require__(4193);
exports.context = new Context.Context();
const baseUrl = Utils.getApiBaseUrl();
const defaults = {
    baseUrl,
    request: {
        agent: Utils.getProxyAgent(baseUrl)
    }
};
exports.GitHub = core_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods, plugin_paginate_rest_1.paginateRest).defaults(defaults);
/**
 * Convience function to correctly format Octokit Options to pass into the constructor.
 *
 * @param     token    the repo PAT or GITHUB_TOKEN
 * @param     options  other options to set
 */
function getOctokitOptions(token, options) {
    const opts = Object.assign({}, options || {}); // Shallow clone - don't mutate the object provided by the caller
    // Auth
    const auth = Utils.getAuthString(token, opts);
    if (auth) {
        opts.auth = auth;
    }
    return opts;
}
exports.getOctokitOptions = getOctokitOptions;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 3702:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class BasicCredentialHandler {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    prepareRequest(options) {
        options.headers['Authorization'] =
            'Basic ' +
                Buffer.from(this.username + ':' + this.password).toString('base64');
    }
    // This handler cannot handle 401
    canHandleAuthentication(response) {
        return false;
    }
    handleAuthentication(httpClient, requestInfo, objs) {
        return null;
    }
}
exports.BasicCredentialHandler = BasicCredentialHandler;
class BearerCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        options.headers['Authorization'] = 'Bearer ' + this.token;
    }
    // This handler cannot handle 401
    canHandleAuthentication(response) {
        return false;
    }
    handleAuthentication(httpClient, requestInfo, objs) {
        return null;
    }
}
exports.BearerCredentialHandler = BearerCredentialHandler;
class PersonalAccessTokenCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        options.headers['Authorization'] =
            'Basic ' + Buffer.from('PAT:' + this.token).toString('base64');
    }
    // This handler cannot handle 401
    canHandleAuthentication(response) {
        return false;
    }
    handleAuthentication(httpClient, requestInfo, objs) {
        return null;
    }
}
exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;


/***/ }),

/***/ 9925:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const http = __nccwpck_require__(3685);
const https = __nccwpck_require__(5687);
const pm = __nccwpck_require__(6443);
let tunnel;
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    let proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}
exports.HttpClientError = HttpClientError;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return new Promise(async (resolve, reject) => {
            let output = Buffer.alloc(0);
            this.message.on('data', (chunk) => {
                output = Buffer.concat([output, chunk]);
            });
            this.message.on('end', () => {
                resolve(output.toString());
            });
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    let parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
    }
    get(requestUrl, additionalHeaders) {
        return this.request('GET', requestUrl, null, additionalHeaders || {});
    }
    del(requestUrl, additionalHeaders) {
        return this.request('DELETE', requestUrl, null, additionalHeaders || {});
    }
    post(requestUrl, data, additionalHeaders) {
        return this.request('POST', requestUrl, data, additionalHeaders || {});
    }
    patch(requestUrl, data, additionalHeaders) {
        return this.request('PATCH', requestUrl, data, additionalHeaders || {});
    }
    put(requestUrl, data, additionalHeaders) {
        return this.request('PUT', requestUrl, data, additionalHeaders || {});
    }
    head(requestUrl, additionalHeaders) {
        return this.request('HEAD', requestUrl, null, additionalHeaders || {});
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return this.request(verb, requestUrl, stream, additionalHeaders);
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    async getJson(requestUrl, additionalHeaders = {}) {
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        let res = await this.get(requestUrl, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async postJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.post(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async putJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.put(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async patchJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.patch(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    async request(verb, requestUrl, data, headers) {
        if (this._disposed) {
            throw new Error('Client has already been disposed.');
        }
        let parsedUrl = new URL(requestUrl);
        let info = this._prepareRequest(verb, parsedUrl, headers);
        // Only perform retries on reads since writes may not be idempotent.
        let maxTries = this._allowRetries && RetryableHttpVerbs.indexOf(verb) != -1
            ? this._maxRetries + 1
            : 1;
        let numTries = 0;
        let response;
        while (numTries < maxTries) {
            response = await this.requestRaw(info, data);
            // Check if it's an authentication challenge
            if (response &&
                response.message &&
                response.message.statusCode === HttpCodes.Unauthorized) {
                let authenticationHandler;
                for (let i = 0; i < this.handlers.length; i++) {
                    if (this.handlers[i].canHandleAuthentication(response)) {
                        authenticationHandler = this.handlers[i];
                        break;
                    }
                }
                if (authenticationHandler) {
                    return authenticationHandler.handleAuthentication(this, info, data);
                }
                else {
                    // We have received an unauthorized response but have no handlers to handle it.
                    // Let the response return to the caller.
                    return response;
                }
            }
            let redirectsRemaining = this._maxRedirects;
            while (HttpRedirectCodes.indexOf(response.message.statusCode) != -1 &&
                this._allowRedirects &&
                redirectsRemaining > 0) {
                const redirectUrl = response.message.headers['location'];
                if (!redirectUrl) {
                    // if there's no location to redirect to, we won't
                    break;
                }
                let parsedRedirectUrl = new URL(redirectUrl);
                if (parsedUrl.protocol == 'https:' &&
                    parsedUrl.protocol != parsedRedirectUrl.protocol &&
                    !this._allowRedirectDowngrade) {
                    throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                }
                // we need to finish reading the response before reassigning response
                // which will leak the open socket.
                await response.readBody();
                // strip authorization header if redirected to a different hostname
                if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                    for (let header in headers) {
                        // header names are case insensitive
                        if (header.toLowerCase() === 'authorization') {
                            delete headers[header];
                        }
                    }
                }
                // let's make the request with the new redirectUrl
                info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                response = await this.requestRaw(info, data);
                redirectsRemaining--;
            }
            if (HttpResponseRetryCodes.indexOf(response.message.statusCode) == -1) {
                // If not a retry code, return immediately instead of retrying
                return response;
            }
            numTries += 1;
            if (numTries < maxTries) {
                await response.readBody();
                await this._performExponentialBackoff(numTries);
            }
        }
        return response;
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return new Promise((resolve, reject) => {
            let callbackForResult = function (err, res) {
                if (err) {
                    reject(err);
                }
                resolve(res);
            };
            this.requestRawWithCallback(info, data, callbackForResult);
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        let socket;
        if (typeof data === 'string') {
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        let handleResult = (err, res) => {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        };
        let req = info.httpModule.request(info.options, (msg) => {
            let res = new HttpClientResponse(msg);
            handleResult(null, res);
        });
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error('Request timeout: ' + info.options.path), null);
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err, null);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        let parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            this.handlers.forEach(handler => {
                handler.prepareRequest(info.options);
            });
        }
        return info;
    }
    _mergeHeaders(headers) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        let proxyUrl = pm.getProxyUrl(parsedUrl);
        let useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (!!agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (!!this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (useProxy) {
            // If using proxy, need tunnel
            if (!tunnel) {
                tunnel = __nccwpck_require__(4294);
            }
            const agentOptions = {
                maxSockets: maxSockets,
                keepAlive: this._keepAlive,
                proxy: {
                    ...((proxyUrl.username || proxyUrl.password) && {
                        proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
                    }),
                    host: proxyUrl.hostname,
                    port: proxyUrl.port
                }
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets: maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
        const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }
    static dateTimeDeserializer(key, value) {
        if (typeof value === 'string') {
            let a = new Date(value);
            if (!isNaN(a.valueOf())) {
                return a;
            }
        }
        return value;
    }
    async _processResponse(res, options) {
        return new Promise(async (resolve, reject) => {
            const statusCode = res.message.statusCode;
            const response = {
                statusCode: statusCode,
                result: null,
                headers: {}
            };
            // not found leads to null obj returned
            if (statusCode == HttpCodes.NotFound) {
                resolve(response);
            }
            let obj;
            let contents;
            // get the result from the body
            try {
                contents = await res.readBody();
                if (contents && contents.length > 0) {
                    if (options && options.deserializeDates) {
                        obj = JSON.parse(contents, HttpClient.dateTimeDeserializer);
                    }
                    else {
                        obj = JSON.parse(contents);
                    }
                    response.result = obj;
                }
                response.headers = res.message.headers;
            }
            catch (err) {
                // Invalid resource (contents not json);  leaving result obj null
            }
            // note that 3xx redirects are handled by the http layer.
            if (statusCode > 299) {
                let msg;
                // if exception/error in body, attempt to get better error
                if (obj && obj.message) {
                    msg = obj.message;
                }
                else if (contents && contents.length > 0) {
                    // it may be the case that the exception is in the body message as string
                    msg = contents;
                }
                else {
                    msg = 'Failed request: (' + statusCode + ')';
                }
                let err = new HttpClientError(msg, statusCode);
                err.result = response.result;
                reject(err);
            }
            else {
                resolve(response);
            }
        });
    }
}
exports.HttpClient = HttpClient;


/***/ }),

/***/ 6443:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function getProxyUrl(reqUrl) {
    let usingSsl = reqUrl.protocol === 'https:';
    let proxyUrl;
    if (checkBypass(reqUrl)) {
        return proxyUrl;
    }
    let proxyVar;
    if (usingSsl) {
        proxyVar = process.env['https_proxy'] || process.env['HTTPS_PROXY'];
    }
    else {
        proxyVar = process.env['http_proxy'] || process.env['HTTP_PROXY'];
    }
    if (proxyVar) {
        proxyUrl = new URL(proxyVar);
    }
    return proxyUrl;
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    let noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    let upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (let upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;


/***/ }),

/***/ 8851:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:!0}));var e=__nccwpck_require__(2781),i=__nccwpck_require__(3685),n=__nccwpck_require__(5687),a=__nccwpck_require__(9796);function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var d,l=t(e),r=t(i),o=t(n),s=t(a);
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function m(e,i){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&i.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var t=0;for(a=Object.getOwnPropertySymbols(e);t<a.length;t++)i.indexOf(a[t])<0&&Object.prototype.propertyIsEnumerable.call(e,a[t])&&(n[a[t]]=e[a[t]])}return n}function u(e,i,n,a){return new(n||(n=Promise))((function(t,d){function l(e){try{o(a.next(e))}catch(e){d(e)}}function r(e){try{o(a.throw(e))}catch(e){d(e)}}function o(e){var i;e.done?t(e.value):(i=e.value,i instanceof n?i:new n((function(e){e(i)}))).then(l,r)}o((a=a.apply(e,i||[])).next())}))}function k(e){return null!=e}exports.LinearErrorType=void 0,(d=exports.LinearErrorType||(exports.LinearErrorType={})).FeatureNotAccessible="FeatureNotAccessible",d.InvalidInput="InvalidInput",d.Ratelimited="Ratelimited",d.NetworkError="NetworkError",d.AuthenticationError="AuthenticationError",d.Forbidden="Forbidden",d.BootstrapError="BootstrapError",d.Unknown="Unknown",d.InternalError="InternalError",d.Other="Other",d.UserError="UserError",d.GraphqlError="GraphqlError",d.LockTimeout="LockTimeout";const c={[exports.LinearErrorType.FeatureNotAccessible]:"feature not accessible",[exports.LinearErrorType.InvalidInput]:"invalid input",[exports.LinearErrorType.Ratelimited]:"ratelimited",[exports.LinearErrorType.NetworkError]:"network error",[exports.LinearErrorType.AuthenticationError]:"authentication error",[exports.LinearErrorType.Forbidden]:"forbidden",[exports.LinearErrorType.BootstrapError]:"bootstrap error",[exports.LinearErrorType.Unknown]:"unknown",[exports.LinearErrorType.InternalError]:"internal error",[exports.LinearErrorType.Other]:"other",[exports.LinearErrorType.UserError]:"user error",[exports.LinearErrorType.GraphqlError]:"graphql error",[exports.LinearErrorType.LockTimeout]:"lock timeout"};function v(e){var i,n,a;return null!==(n=c,a=e,i=Object.keys(n).find((e=>n[e]===a)))&&void 0!==i?i:exports.LinearErrorType.Unknown}class N{constructor(e){var i,n,a,t,d,l,r;this.type=v(null===(i=null==e?void 0:e.extensions)||void 0===i?void 0:i.type),this.userError=null===(n=null==e?void 0:e.extensions)||void 0===n?void 0:n.userError,this.path=null==e?void 0:e.path,this.message=null!==(r=null!==(d=null!==(t=null===(a=null==e?void 0:e.extensions)||void 0===a?void 0:a.userPresentableMessage)&&void 0!==t?t:null==e?void 0:e.message)&&void 0!==d?d:null===(l=null==e?void 0:e.extensions)||void 0===l?void 0:l.type)&&void 0!==r?r:"Unknown error from LinearClient"}}class p extends Error{constructor(e,i,n){var a,t,d,l,r,o,s,m,u,c;super(null!==(r=Array.from(new Set([(c=null===(t=null===(a=null==e?void 0:e.message)||void 0===a?void 0:a.split(": {"))||void 0===t?void 0:t[0],c?`${c.charAt(0).toUpperCase()}${c.slice(1)}`:void 0),null===(d=null==e?void 0:e.response)||void 0===d?void 0:d.error,null===(l=null==i?void 0:i[0])||void 0===l?void 0:l.message].filter(k))).filter(k).join(" - "))&&void 0!==r?r:"Unknown error from LinearClient"),this.type=n,this.errors=i,this.query=null===(o=null==e?void 0:e.request)||void 0===o?void 0:o.query,this.variables=null===(s=null==e?void 0:e.request)||void 0===s?void 0:s.variables,this.status=null===(m=null==e?void 0:e.response)||void 0===m?void 0:m.status,this.data=null===(u=null==e?void 0:e.response)||void 0===u?void 0:u.data,this.raw=e}}class f extends p{constructor(e,i){super(e,i,exports.LinearErrorType.FeatureNotAccessible)}}class h extends p{constructor(e,i){super(e,i,exports.LinearErrorType.InvalidInput)}}class b extends p{constructor(e,i){super(e,i,exports.LinearErrorType.Ratelimited)}}class y extends p{constructor(e,i){super(e,i,exports.LinearErrorType.NetworkError)}}class S extends p{constructor(e,i){super(e,i,exports.LinearErrorType.AuthenticationError)}}class g extends p{constructor(e,i){super(e,i,exports.LinearErrorType.Forbidden)}}class D extends p{constructor(e,i){super(e,i,exports.LinearErrorType.BootstrapError)}}class V extends p{constructor(e,i){super(e,i,exports.LinearErrorType.Unknown)}}class F extends p{constructor(e,i){super(e,i,exports.LinearErrorType.InternalError)}}class A extends p{constructor(e,i){super(e,i,exports.LinearErrorType.Other)}}class T extends p{constructor(e,i){super(e,i,exports.LinearErrorType.UserError)}}class _ extends p{constructor(e,i){super(e,i,exports.LinearErrorType.GraphqlError)}}class I extends p{constructor(e,i){super(e,i,exports.LinearErrorType.LockTimeout)}}const w={[exports.LinearErrorType.FeatureNotAccessible]:f,[exports.LinearErrorType.InvalidInput]:h,[exports.LinearErrorType.Ratelimited]:b,[exports.LinearErrorType.NetworkError]:y,[exports.LinearErrorType.AuthenticationError]:S,[exports.LinearErrorType.Forbidden]:g,[exports.LinearErrorType.BootstrapError]:D,[exports.LinearErrorType.Unknown]:V,[exports.LinearErrorType.InternalError]:F,[exports.LinearErrorType.Other]:A,[exports.LinearErrorType.UserError]:T,[exports.LinearErrorType.GraphqlError]:_,[exports.LinearErrorType.LockTimeout]:I};function q(e){var i,n,a,t,d,l;if(e instanceof p)return e;const r=(null!==(n=null===(i=null==e?void 0:e.response)||void 0===i?void 0:i.errors)&&void 0!==n?n:[]).map((e=>new N(e))),o=null===(a=null==e?void 0:e.response)||void 0===a?void 0:a.status,s=null!==(d=null===(t=r[0])||void 0===t?void 0:t.type)&&void 0!==d?d:403===o?exports.LinearErrorType.Forbidden:429===o?exports.LinearErrorType.Ratelimited:`${o}`.startsWith("4")?exports.LinearErrorType.AuthenticationError:500===o?exports.LinearErrorType.InternalError:`${o}`.startsWith("5")?exports.LinearErrorType.NetworkError:exports.LinearErrorType.Unknown;return new(null!==(l=w[s])&&void 0!==l?l:p)(e,r)}var x="function"==typeof Symbol&&"function"==typeof Symbol.for?Symbol.for("nodejs.util.inspect.custom"):void 0;function C(e){return(C="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function O(e){return P(e,[])}function P(e,i){switch(C(e)){case"string":return JSON.stringify(e);case"function":return e.name?"[function ".concat(e.name,"]"):"[function]";case"object":return null===e?"null":function(e,i){if(-1!==i.indexOf(e))return"[Circular]";var n=[].concat(i,[e]),a=function(e){var i=e[String(x)];if("function"==typeof i)return i;if("function"==typeof e.inspect)return e.inspect}(e);if(void 0!==a){var t=a.call(e);if(t!==e)return"string"==typeof t?t:P(t,n)}else if(Array.isArray(e))return function(e,i){if(0===e.length)return"[]";if(i.length>2)return"[Array]";for(var n=Math.min(10,e.length),a=e.length-n,t=[],d=0;d<n;++d)t.push(P(e[d],i));1===a?t.push("... 1 more item"):a>1&&t.push("... ".concat(a," more items"));return"["+t.join(", ")+"]"}(e,n);return function(e,i){var n=Object.keys(e);if(0===n.length)return"{}";if(i.length>2)return"["+function(e){var i=Object.prototype.toString.call(e).replace(/^\[object /,"").replace(/]$/,"");if("Object"===i&&"function"==typeof e.constructor){var n=e.constructor.name;if("string"==typeof n&&""!==n)return n}return i}(e)+"]";return"{ "+n.map((function(n){return n+": "+P(e[n],i)})).join(", ")+" }"}(e,n)}(e,i);default:return String(e)}}function j(e){var i=e.prototype.toJSON;"function"==typeof i||function(e,i){if(!Boolean(e))throw new Error(null!=i?i:"Unexpected invariant triggered.")}(0),e.prototype.inspect=i,x&&(e.prototype[x]=i)}function U(e){return null!=e&&"string"==typeof e.kind}j(function(){function e(e,i,n){this.start=e.start,this.end=i.end,this.startToken=e,this.endToken=i,this.source=n}return e.prototype.toJSON=function(){return{start:this.start,end:this.end}},e}()),j(function(){function e(e,i,n,a,t,d,l){this.kind=e,this.start=i,this.end=n,this.line=a,this.column=t,this.value=l,this.prev=d,this.next=null}return e.prototype.toJSON=function(){return{kind:this.kind,value:this.value,line:this.line,column:this.column}},e}());var B={Name:[],Document:["definitions"],OperationDefinition:["name","variableDefinitions","directives","selectionSet"],VariableDefinition:["variable","type","defaultValue","directives"],Variable:["name"],SelectionSet:["selections"],Field:["alias","name","arguments","directives","selectionSet"],Argument:["name","value"],FragmentSpread:["name","directives"],InlineFragment:["typeCondition","directives","selectionSet"],FragmentDefinition:["name","variableDefinitions","typeCondition","directives","selectionSet"],IntValue:[],FloatValue:[],StringValue:[],BooleanValue:[],NullValue:[],EnumValue:[],ListValue:["values"],ObjectValue:["fields"],ObjectField:["name","value"],Directive:["name","arguments"],NamedType:["name"],ListType:["type"],NonNullType:["type"],SchemaDefinition:["description","directives","operationTypes"],OperationTypeDefinition:["type"],ScalarTypeDefinition:["description","name","directives"],ObjectTypeDefinition:["description","name","interfaces","directives","fields"],FieldDefinition:["description","name","arguments","type","directives"],InputValueDefinition:["description","name","type","defaultValue","directives"],InterfaceTypeDefinition:["description","name","interfaces","directives","fields"],UnionTypeDefinition:["description","name","directives","types"],EnumTypeDefinition:["description","name","directives","values"],EnumValueDefinition:["description","name","directives"],InputObjectTypeDefinition:["description","name","directives","fields"],DirectiveDefinition:["description","name","arguments","locations"],SchemaExtension:["directives","operationTypes"],ScalarTypeExtension:["name","directives"],ObjectTypeExtension:["name","interfaces","directives","fields"],InterfaceTypeExtension:["name","interfaces","directives","fields"],UnionTypeExtension:["name","directives","types"],EnumTypeExtension:["name","directives","values"],InputObjectTypeExtension:["name","directives","fields"]},E=Object.freeze({});function z(e,i,n){var a=e[i];if(a){if(!n&&"function"==typeof a)return a;var t=n?a.leave:a.enter;if("function"==typeof t)return t}else{var d=n?e.leave:e.enter;if(d){if("function"==typeof d)return d;var l=d[i];if("function"==typeof l)return l}}}function L(e){return function(e,i){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:B,a=void 0,t=Array.isArray(e),d=[e],l=-1,r=[],o=void 0,s=void 0,m=void 0,u=[],k=[],c=e;do{var v=++l===d.length,N=v&&0!==r.length;if(v){if(s=0===k.length?void 0:u[u.length-1],o=m,m=k.pop(),N){if(t)o=o.slice();else{for(var p={},f=0,h=Object.keys(o);f<h.length;f++){var b=h[f];p[b]=o[b]}o=p}for(var y=0,S=0;S<r.length;S++){var g=r[S][0],D=r[S][1];t&&(g-=y),t&&null===D?(o.splice(g,1),y++):o[g]=D}}l=a.index,d=a.keys,r=a.edits,t=a.inArray,a=a.prev}else{if(s=m?t?l:d[l]:void 0,null==(o=m?m[s]:c))continue;m&&u.push(s)}var V,F=void 0;if(!Array.isArray(o)){if(!U(o))throw new Error("Invalid AST Node: ".concat(O(o),"."));var A=z(i,o.kind,v);if(A){if((F=A.call(i,o,s,m,u,k))===E)break;if(!1===F){if(!v){u.pop();continue}}else if(void 0!==F&&(r.push([s,F]),!v)){if(!U(F)){u.pop();continue}o=F}}}void 0===F&&N&&r.push([s,o]),v?u.pop():(a={inArray:t,index:l,keys:d,edits:r,prev:a},d=(t=Array.isArray(o))?o:null!==(V=n[o.kind])&&void 0!==V?V:[],l=-1,r=[],m&&k.push(m),m=o)}while(void 0!==a);return 0!==r.length&&(c=r[r.length-1][1]),c}(e,{leave:M})}var M={Name:function(e){return e.value},Variable:function(e){return"$"+e.name},Document:function(e){return Q(e.definitions,"\n\n")+"\n"},OperationDefinition:function(e){var i=e.operation,n=e.name,a=H("(",Q(e.variableDefinitions,", "),")"),t=Q(e.directives," "),d=e.selectionSet;return n||t||a||"query"!==i?Q([i,Q([n,a]),t,d]," "):d},VariableDefinition:function(e){var i=e.variable,n=e.type,a=e.defaultValue,t=e.directives;return i+": "+n+H(" = ",a)+H(" ",Q(t," "))},SelectionSet:function(e){return W(e.selections)},Field:function(e){var i=e.alias,n=e.name,a=e.arguments,t=e.directives,d=e.selectionSet,l=H("",i,": ")+n,r=l+H("(",Q(a,", "),")");return r.length>80&&(r=l+H("(\n",G(Q(a,"\n")),"\n)")),Q([r,Q(t," "),d]," ")},Argument:function(e){return e.name+": "+e.value},FragmentSpread:function(e){return"..."+e.name+H(" ",Q(e.directives," "))},InlineFragment:function(e){var i=e.typeCondition,n=e.directives,a=e.selectionSet;return Q(["...",H("on ",i),Q(n," "),a]," ")},FragmentDefinition:function(e){var i=e.name,n=e.typeCondition,a=e.variableDefinitions,t=e.directives,d=e.selectionSet;return"fragment ".concat(i).concat(H("(",Q(a,", "),")")," ")+"on ".concat(n," ").concat(H("",Q(t," ")," "))+d},IntValue:function(e){return e.value},FloatValue:function(e){return e.value},StringValue:function(e,i){var n=e.value;return e.block?function(e){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],a=-1===e.indexOf("\n"),t=" "===e[0]||"\t"===e[0],d='"'===e[e.length-1],l="\\"===e[e.length-1],r=!a||d||l||n,o="";return!r||a&&t||(o+="\n"+i),o+=i?e.replace(/\n/g,"\n"+i):e,r&&(o+="\n"),'"""'+o.replace(/"""/g,'\\"""')+'"""'}(n,"description"===i?"":"  "):JSON.stringify(n)},BooleanValue:function(e){return e.value?"true":"false"},NullValue:function(){return"null"},EnumValue:function(e){return e.value},ListValue:function(e){return"["+Q(e.values,", ")+"]"},ObjectValue:function(e){return"{"+Q(e.fields,", ")+"}"},ObjectField:function(e){return e.name+": "+e.value},Directive:function(e){return"@"+e.name+H("(",Q(e.arguments,", "),")")},NamedType:function(e){return e.name},ListType:function(e){return"["+e.type+"]"},NonNullType:function(e){return e.type+"!"},SchemaDefinition:R((function(e){var i=e.directives,n=e.operationTypes;return Q(["schema",Q(i," "),W(n)]," ")})),OperationTypeDefinition:function(e){return e.operation+": "+e.type},ScalarTypeDefinition:R((function(e){return Q(["scalar",e.name,Q(e.directives," ")]," ")})),ObjectTypeDefinition:R((function(e){var i=e.name,n=e.interfaces,a=e.directives,t=e.fields;return Q(["type",i,H("implements ",Q(n," & ")),Q(a," "),W(t)]," ")})),FieldDefinition:R((function(e){var i=e.name,n=e.arguments,a=e.type,t=e.directives;return i+($(n)?H("(\n",G(Q(n,"\n")),"\n)"):H("(",Q(n,", "),")"))+": "+a+H(" ",Q(t," "))})),InputValueDefinition:R((function(e){var i=e.name,n=e.type,a=e.defaultValue,t=e.directives;return Q([i+": "+n,H("= ",a),Q(t," ")]," ")})),InterfaceTypeDefinition:R((function(e){var i=e.name,n=e.interfaces,a=e.directives,t=e.fields;return Q(["interface",i,H("implements ",Q(n," & ")),Q(a," "),W(t)]," ")})),UnionTypeDefinition:R((function(e){var i=e.name,n=e.directives,a=e.types;return Q(["union",i,Q(n," "),a&&0!==a.length?"= "+Q(a," | "):""]," ")})),EnumTypeDefinition:R((function(e){var i=e.name,n=e.directives,a=e.values;return Q(["enum",i,Q(n," "),W(a)]," ")})),EnumValueDefinition:R((function(e){return Q([e.name,Q(e.directives," ")]," ")})),InputObjectTypeDefinition:R((function(e){var i=e.name,n=e.directives,a=e.fields;return Q(["input",i,Q(n," "),W(a)]," ")})),DirectiveDefinition:R((function(e){var i=e.name,n=e.arguments,a=e.repeatable,t=e.locations;return"directive @"+i+($(n)?H("(\n",G(Q(n,"\n")),"\n)"):H("(",Q(n,", "),")"))+(a?" repeatable":"")+" on "+Q(t," | ")})),SchemaExtension:function(e){var i=e.directives,n=e.operationTypes;return Q(["extend schema",Q(i," "),W(n)]," ")},ScalarTypeExtension:function(e){return Q(["extend scalar",e.name,Q(e.directives," ")]," ")},ObjectTypeExtension:function(e){var i=e.name,n=e.interfaces,a=e.directives,t=e.fields;return Q(["extend type",i,H("implements ",Q(n," & ")),Q(a," "),W(t)]," ")},InterfaceTypeExtension:function(e){var i=e.name,n=e.interfaces,a=e.directives,t=e.fields;return Q(["extend interface",i,H("implements ",Q(n," & ")),Q(a," "),W(t)]," ")},UnionTypeExtension:function(e){var i=e.name,n=e.directives,a=e.types;return Q(["extend union",i,Q(n," "),a&&0!==a.length?"= "+Q(a," | "):""]," ")},EnumTypeExtension:function(e){var i=e.name,n=e.directives,a=e.values;return Q(["extend enum",i,Q(n," "),W(a)]," ")},InputObjectTypeExtension:function(e){var i=e.name,n=e.directives,a=e.fields;return Q(["extend input",i,Q(n," "),W(a)]," ")}};function R(e){return function(i){return Q([i.description,e(i)],"\n")}}function Q(e){var i,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";return null!==(i=null==e?void 0:e.filter((function(e){return e})).join(n))&&void 0!==i?i:""}function W(e){return H("{\n",G(Q(e,"\n")),"\n}")}function H(e,i){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"";return null!=i&&""!==i?e+i+n:""}function G(e){return H("  ",e.replace(/\n/g,"\n  "))}function J(e){return-1!==e.indexOf("\n")}function $(e){return null!=e&&e.some(J)}var K="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function Z(e){if(e.__esModule)return e;var i=Object.defineProperty({},"__esModule",{value:!0});return Object.keys(e).forEach((function(n){var a=Object.getOwnPropertyDescriptor(e,n);Object.defineProperty(i,n,a.get?a:{enumerable:!0,get:function(){return e[n]}})})),i}function Y(e){var i={exports:{}};return e(i,i.exports),i.exports}var X=Object.freeze({__proto__:null,default:function(e,i){return i=i||{},new Promise((function(n,a){var t=new XMLHttpRequest,d=[],l=[],r={},o=function(){return{ok:2==(t.status/100|0),statusText:t.statusText,status:t.status,url:t.responseURL,text:function(){return Promise.resolve(t.responseText)},json:function(){return Promise.resolve(t.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([t.response]))},clone:o,headers:{keys:function(){return d},entries:function(){return l},get:function(e){return r[e.toLowerCase()]},has:function(e){return e.toLowerCase()in r}}}};for(var s in t.open(i.method||"get",e,!0),t.onload=function(){t.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,(function(e,i,n){d.push(i=i.toLowerCase()),l.push([i,n]),r[i]=r[i]?r[i]+","+n:n})),n(o())},t.onerror=a,t.withCredentials="include"==i.credentials,i.headers)t.setRequestHeader(s,i.headers[s]);t.send(i.body||null)}))}}),ee=Y((function(e,i){!function(n){var a=i&&!i.nodeType&&i,t=e&&!e.nodeType&&e,d="object"==typeof K&&K;d.global!==d&&d.window!==d&&d.self!==d||(n=d);var l,r,o=2147483647,s=36,m=/^xn--/,u=/[^\x20-\x7E]/,k=/[\x2E\u3002\uFF0E\uFF61]/g,c={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},v=Math.floor,N=String.fromCharCode;function p(e){throw RangeError(c[e])}function f(e,i){for(var n=e.length,a=[];n--;)a[n]=i(e[n]);return a}function h(e,i){var n=e.split("@"),a="";return n.length>1&&(a=n[0]+"@",e=n[1]),a+f((e=e.replace(k,".")).split("."),i).join(".")}function b(e){for(var i,n,a=[],t=0,d=e.length;t<d;)(i=e.charCodeAt(t++))>=55296&&i<=56319&&t<d?56320==(64512&(n=e.charCodeAt(t++)))?a.push(((1023&i)<<10)+(1023&n)+65536):(a.push(i),t--):a.push(i);return a}function y(e){return f(e,(function(e){var i="";return e>65535&&(i+=N((e-=65536)>>>10&1023|55296),e=56320|1023&e),i+=N(e)})).join("")}function S(e,i){return e+22+75*(e<26)-((0!=i)<<5)}function g(e,i,n){var a=0;for(e=n?v(e/700):e>>1,e+=v(e/i);e>455;a+=s)e=v(e/35);return v(a+36*e/(e+38))}function D(e){var i,n,a,t,d,l,r,m,u,k,c,N=[],f=e.length,h=0,b=128,S=72;for((n=e.lastIndexOf("-"))<0&&(n=0),a=0;a<n;++a)e.charCodeAt(a)>=128&&p("not-basic"),N.push(e.charCodeAt(a));for(t=n>0?n+1:0;t<f;){for(d=h,l=1,r=s;t>=f&&p("invalid-input"),((m=(c=e.charCodeAt(t++))-48<10?c-22:c-65<26?c-65:c-97<26?c-97:s)>=s||m>v((o-h)/l))&&p("overflow"),h+=m*l,!(m<(u=r<=S?1:r>=S+26?26:r-S));r+=s)l>v(o/(k=s-u))&&p("overflow"),l*=k;S=g(h-d,i=N.length+1,0==d),v(h/i)>o-b&&p("overflow"),b+=v(h/i),h%=i,N.splice(h++,0,b)}return y(N)}function V(e){var i,n,a,t,d,l,r,m,u,k,c,f,h,y,D,V=[];for(f=(e=b(e)).length,i=128,n=0,d=72,l=0;l<f;++l)(c=e[l])<128&&V.push(N(c));for(a=t=V.length,t&&V.push("-");a<f;){for(r=o,l=0;l<f;++l)(c=e[l])>=i&&c<r&&(r=c);for(r-i>v((o-n)/(h=a+1))&&p("overflow"),n+=(r-i)*h,i=r,l=0;l<f;++l)if((c=e[l])<i&&++n>o&&p("overflow"),c==i){for(m=n,u=s;!(m<(k=u<=d?1:u>=d+26?26:u-d));u+=s)D=m-k,y=s-k,V.push(N(S(k+D%y,0))),m=v(D/y);V.push(N(S(m,0))),d=g(n,h,a==t),n=0,++a}++n,++i}return V.join("")}if(l={version:"1.3.2",ucs2:{decode:b,encode:y},decode:D,encode:V,toASCII:function(e){return h(e,(function(e){return u.test(e)?"xn--"+V(e):e}))},toUnicode:function(e){return h(e,(function(e){return m.test(e)?D(e.slice(4).toLowerCase()):e}))}},a&&t)if(e.exports==a)t.exports=l;else for(r in l)l.hasOwnProperty(r)&&(a[r]=l[r]);else n.punycode=l}(K)})),ie=function(e){return"string"==typeof e},ne=function(e){return"object"==typeof e&&null!==e},ae=function(e){return null===e},te=function(e){return null==e};
/*! https://mths.be/punycode v1.3.2 by @mathias */function de(e,i){return Object.prototype.hasOwnProperty.call(e,i)}var le=function(e,i,n,a){i=i||"&",n=n||"=";var t={};if("string"!=typeof e||0===e.length)return t;var d=/\+/g;e=e.split(i);var l=1e3;a&&"number"==typeof a.maxKeys&&(l=a.maxKeys);var r=e.length;l>0&&r>l&&(r=l);for(var o=0;o<r;++o){var s,m,u,k,c=e[o].replace(d,"%20"),v=c.indexOf(n);v>=0?(s=c.substr(0,v),m=c.substr(v+1)):(s=c,m=""),u=decodeURIComponent(s),k=decodeURIComponent(m),de(t,u)?Array.isArray(t[u])?t[u].push(k):t[u]=[t[u],k]:t[u]=k}return t},re=function(e){switch(typeof e){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return""}},oe=function(e,i,n,a){return i=i||"&",n=n||"=",null===e&&(e=void 0),"object"==typeof e?Object.keys(e).map((function(a){var t=encodeURIComponent(re(a))+n;return Array.isArray(e[a])?e[a].map((function(e){return t+encodeURIComponent(re(e))})).join(i):t+encodeURIComponent(re(e[a]))})).join(i):a?encodeURIComponent(re(a))+n+encodeURIComponent(re(e)):""},se=Y((function(e,i){i.decode=i.parse=le,i.encode=i.stringify=oe})),me=_e,ue=function(e,i){return _e(e,!1,!0).resolve(i)},ke=function(e,i){return e?_e(e,!1,!0).resolveObject(i):i},ce=function(e){ie(e)&&(e=_e(e));return e instanceof Ne?e.format():Ne.prototype.format.call(e)},ve=Ne;function Ne(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}var pe=/^([a-z0-9.+-]+:)/i,fe=/:[0-9]*$/,he=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,be=["{","}","|","\\","^","`"].concat(["<",">",'"',"`"," ","\r","\n","\t"]),ye=["'"].concat(be),Se=["%","/","?",";","#"].concat(ye),ge=["/","?","#"],De=/^[+a-z0-9A-Z_-]{0,63}$/,Ve=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,Fe={javascript:!0,"javascript:":!0},Ae={javascript:!0,"javascript:":!0},Te={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0};function _e(e,i,n){if(e&&ne(e)&&e instanceof Ne)return e;var a=new Ne;return a.parse(e,i,n),a}Ne.prototype.parse=function(e,i,n){if(!ie(e))throw new TypeError("Parameter 'url' must be a string, not "+typeof e);var a=e.indexOf("?"),t=-1!==a&&a<e.indexOf("#")?"?":"#",d=e.split(t);d[0]=d[0].replace(/\\/g,"/");var l=e=d.join(t);if(l=l.trim(),!n&&1===e.split("#").length){var r=he.exec(l);if(r)return this.path=l,this.href=l,this.pathname=r[1],r[2]?(this.search=r[2],this.query=i?se.parse(this.search.substr(1)):this.search.substr(1)):i&&(this.search="",this.query={}),this}var o=pe.exec(l);if(o){var s=(o=o[0]).toLowerCase();this.protocol=s,l=l.substr(o.length)}if(n||o||l.match(/^\/\/[^@\/]+@[^@\/]+/)){var m="//"===l.substr(0,2);!m||o&&Ae[o]||(l=l.substr(2),this.slashes=!0)}if(!Ae[o]&&(m||o&&!Te[o])){for(var u,k,c=-1,v=0;v<ge.length;v++){-1!==(N=l.indexOf(ge[v]))&&(-1===c||N<c)&&(c=N)}-1!==(k=-1===c?l.lastIndexOf("@"):l.lastIndexOf("@",c))&&(u=l.slice(0,k),l=l.slice(k+1),this.auth=decodeURIComponent(u)),c=-1;for(v=0;v<Se.length;v++){var N;-1!==(N=l.indexOf(Se[v]))&&(-1===c||N<c)&&(c=N)}-1===c&&(c=l.length),this.host=l.slice(0,c),l=l.slice(c),this.parseHost(),this.hostname=this.hostname||"";var p="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!p)for(var f=this.hostname.split(/\./),h=(v=0,f.length);v<h;v++){var b=f[v];if(b&&!b.match(De)){for(var y="",S=0,g=b.length;S<g;S++)b.charCodeAt(S)>127?y+="x":y+=b[S];if(!y.match(De)){var D=f.slice(0,v),V=f.slice(v+1),F=b.match(Ve);F&&(D.push(F[1]),V.unshift(F[2])),V.length&&(l="/"+V.join(".")+l),this.hostname=D.join(".");break}}}this.hostname.length>255?this.hostname="":this.hostname=this.hostname.toLowerCase(),p||(this.hostname=ee.toASCII(this.hostname));var A=this.port?":"+this.port:"",T=this.hostname||"";this.host=T+A,this.href+=this.host,p&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==l[0]&&(l="/"+l))}if(!Fe[s])for(v=0,h=ye.length;v<h;v++){var _=ye[v];if(-1!==l.indexOf(_)){var I=encodeURIComponent(_);I===_&&(I=escape(_)),l=l.split(_).join(I)}}var w=l.indexOf("#");-1!==w&&(this.hash=l.substr(w),l=l.slice(0,w));var q=l.indexOf("?");if(-1!==q?(this.search=l.substr(q),this.query=l.substr(q+1),i&&(this.query=se.parse(this.query)),l=l.slice(0,q)):i&&(this.search="",this.query={}),l&&(this.pathname=l),Te[s]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){A=this.pathname||"";var x=this.search||"";this.path=A+x}return this.href=this.format(),this},Ne.prototype.format=function(){var e=this.auth||"";e&&(e=(e=encodeURIComponent(e)).replace(/%3A/i,":"),e+="@");var i=this.protocol||"",n=this.pathname||"",a=this.hash||"",t=!1,d="";this.host?t=e+this.host:this.hostname&&(t=e+(-1===this.hostname.indexOf(":")?this.hostname:"["+this.hostname+"]"),this.port&&(t+=":"+this.port)),this.query&&ne(this.query)&&Object.keys(this.query).length&&(d=se.stringify(this.query));var l=this.search||d&&"?"+d||"";return i&&":"!==i.substr(-1)&&(i+=":"),this.slashes||(!i||Te[i])&&!1!==t?(t="//"+(t||""),n&&"/"!==n.charAt(0)&&(n="/"+n)):t||(t=""),a&&"#"!==a.charAt(0)&&(a="#"+a),l&&"?"!==l.charAt(0)&&(l="?"+l),i+t+(n=n.replace(/[?#]/g,(function(e){return encodeURIComponent(e)})))+(l=l.replace("#","%23"))+a},Ne.prototype.resolve=function(e){return this.resolveObject(_e(e,!1,!0)).format()},Ne.prototype.resolveObject=function(e){if(ie(e)){var i=new Ne;i.parse(e,!1,!0),e=i}for(var n=new Ne,a=Object.keys(this),t=0;t<a.length;t++){var d=a[t];n[d]=this[d]}if(n.hash=e.hash,""===e.href)return n.href=n.format(),n;if(e.slashes&&!e.protocol){for(var l=Object.keys(e),r=0;r<l.length;r++){var o=l[r];"protocol"!==o&&(n[o]=e[o])}return Te[n.protocol]&&n.hostname&&!n.pathname&&(n.path=n.pathname="/"),n.href=n.format(),n}if(e.protocol&&e.protocol!==n.protocol){if(!Te[e.protocol]){for(var s=Object.keys(e),m=0;m<s.length;m++){var u=s[m];n[u]=e[u]}return n.href=n.format(),n}if(n.protocol=e.protocol,e.host||Ae[e.protocol])n.pathname=e.pathname;else{for(var k=(e.pathname||"").split("/");k.length&&!(e.host=k.shift()););e.host||(e.host=""),e.hostname||(e.hostname=""),""!==k[0]&&k.unshift(""),k.length<2&&k.unshift(""),n.pathname=k.join("/")}if(n.search=e.search,n.query=e.query,n.host=e.host||"",n.auth=e.auth,n.hostname=e.hostname||e.host,n.port=e.port,n.pathname||n.search){var c=n.pathname||"",v=n.search||"";n.path=c+v}return n.slashes=n.slashes||e.slashes,n.href=n.format(),n}var N=n.pathname&&"/"===n.pathname.charAt(0),p=e.host||e.pathname&&"/"===e.pathname.charAt(0),f=p||N||n.host&&e.pathname,h=f,b=n.pathname&&n.pathname.split("/")||[],y=(k=e.pathname&&e.pathname.split("/")||[],n.protocol&&!Te[n.protocol]);if(y&&(n.hostname="",n.port=null,n.host&&(""===b[0]?b[0]=n.host:b.unshift(n.host)),n.host="",e.protocol&&(e.hostname=null,e.port=null,e.host&&(""===k[0]?k[0]=e.host:k.unshift(e.host)),e.host=null),f=f&&(""===k[0]||""===b[0])),p)n.host=e.host||""===e.host?e.host:n.host,n.hostname=e.hostname||""===e.hostname?e.hostname:n.hostname,n.search=e.search,n.query=e.query,b=k;else if(k.length)b||(b=[]),b.pop(),b=b.concat(k),n.search=e.search,n.query=e.query;else if(!te(e.search)){if(y)n.hostname=n.host=b.shift(),(F=!!(n.host&&n.host.indexOf("@")>0)&&n.host.split("@"))&&(n.auth=F.shift(),n.host=n.hostname=F.shift());return n.search=e.search,n.query=e.query,ae(n.pathname)&&ae(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.href=n.format(),n}if(!b.length)return n.pathname=null,n.search?n.path="/"+n.search:n.path=null,n.href=n.format(),n;for(var S=b.slice(-1)[0],g=(n.host||e.host||b.length>1)&&("."===S||".."===S)||""===S,D=0,V=b.length;V>=0;V--)"."===(S=b[V])?b.splice(V,1):".."===S?(b.splice(V,1),D++):D&&(b.splice(V,1),D--);if(!f&&!h)for(;D--;D)b.unshift("..");!f||""===b[0]||b[0]&&"/"===b[0].charAt(0)||b.unshift(""),g&&"/"!==b.join("/").substr(-1)&&b.push("");var F,A=""===b[0]||b[0]&&"/"===b[0].charAt(0);y&&(n.hostname=n.host=A?"":b.length?b.shift():"",(F=!!(n.host&&n.host.indexOf("@")>0)&&n.host.split("@"))&&(n.auth=F.shift(),n.host=n.hostname=F.shift()));return(f=f||n.host&&b.length)&&!A&&b.unshift(""),b.length?n.pathname=b.join("/"):(n.pathname=null,n.path=null),ae(n.pathname)&&ae(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.auth=e.auth||n.auth,n.slashes=n.slashes||e.slashes,n.href=n.format(),n},Ne.prototype.parseHost=function(){var e=this.host,i=fe.exec(e);i&&(":"!==(i=i[0])&&(this.port=i.substr(1)),e=e.substr(0,e.length-i.length)),e&&(this.hostname=e)};var Ie={parse:me,resolve:ue,resolveObject:ke,format:ce,Url:ve};const we=l.default.Readable,qe=Symbol("buffer"),xe=Symbol("type");class Ce{constructor(){this[xe]="";const e=arguments[0],i=arguments[1],n=[];let a=0;if(e){const i=e,t=Number(i.length);for(let e=0;e<t;e++){const t=i[e];let d;d=t instanceof Buffer?t:ArrayBuffer.isView(t)?Buffer.from(t.buffer,t.byteOffset,t.byteLength):t instanceof ArrayBuffer?Buffer.from(t):t instanceof Ce?t[qe]:Buffer.from("string"==typeof t?t:String(t)),a+=d.length,n.push(d)}}this[qe]=Buffer.concat(n);let t=i&&void 0!==i.type&&String(i.type).toLowerCase();t&&!/[^\u0020-\u007E]/.test(t)&&(this[xe]=t)}get size(){return this[qe].length}get type(){return this[xe]}text(){return Promise.resolve(this[qe].toString())}arrayBuffer(){const e=this[qe],i=e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength);return Promise.resolve(i)}stream(){const e=new we;return e._read=function(){},e.push(this[qe]),e.push(null),e}toString(){return"[object Blob]"}slice(){const e=this.size,i=arguments[0],n=arguments[1];let a,t;a=void 0===i?0:i<0?Math.max(e+i,0):Math.min(i,e),t=void 0===n?e:n<0?Math.max(e+n,0):Math.min(n,e);const d=Math.max(t-a,0),l=this[qe].slice(a,a+d),r=new Ce([],{type:arguments[2]});return r[qe]=l,r}}function Oe(e,i,n){Error.call(this,e),this.message=e,this.type=i,n&&(this.code=this.errno=n.code),Error.captureStackTrace(this,this.constructor)}let Pe;Object.defineProperties(Ce.prototype,{size:{enumerable:!0},type:{enumerable:!0},slice:{enumerable:!0}}),Object.defineProperty(Ce.prototype,Symbol.toStringTag,{value:"Blob",writable:!1,enumerable:!1,configurable:!0}),Oe.prototype=Object.create(Error.prototype),Oe.prototype.constructor=Oe,Oe.prototype.name="FetchError";try{Pe=(__nccwpck_require__(2877).convert)}catch(e){}const je=Symbol("Body internals"),Ue=l.default.PassThrough;function Be(e){var i=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=n.size;let t=void 0===a?0:a;var d=n.timeout;let r=void 0===d?0:d;null==e?e=null:ze(e)?e=Buffer.from(e.toString()):Le(e)||Buffer.isBuffer(e)||("[object ArrayBuffer]"===Object.prototype.toString.call(e)?e=Buffer.from(e):ArrayBuffer.isView(e)?e=Buffer.from(e.buffer,e.byteOffset,e.byteLength):e instanceof l.default||(e=Buffer.from(String(e)))),this[je]={body:e,disturbed:!1,error:null},this.size=t,this.timeout=r,e instanceof l.default&&e.on("error",(function(e){const n="AbortError"===e.name?e:new Oe(`Invalid response body while trying to fetch ${i.url}: ${e.message}`,"system",e);i[je].error=n}))}function Ee(){var e=this;if(this[je].disturbed)return Be.Promise.reject(new TypeError(`body used already for: ${this.url}`));if(this[je].disturbed=!0,this[je].error)return Be.Promise.reject(this[je].error);let i=this.body;if(null===i)return Be.Promise.resolve(Buffer.alloc(0));if(Le(i)&&(i=i.stream()),Buffer.isBuffer(i))return Be.Promise.resolve(i);if(!(i instanceof l.default))return Be.Promise.resolve(Buffer.alloc(0));let n=[],a=0,t=!1;return new Be.Promise((function(d,l){let r;e.timeout&&(r=setTimeout((function(){t=!0,l(new Oe(`Response timeout while trying to fetch ${e.url} (over ${e.timeout}ms)`,"body-timeout"))}),e.timeout)),i.on("error",(function(i){"AbortError"===i.name?(t=!0,l(i)):l(new Oe(`Invalid response body while trying to fetch ${e.url}: ${i.message}`,"system",i))})),i.on("data",(function(i){if(!t&&null!==i){if(e.size&&a+i.length>e.size)return t=!0,void l(new Oe(`content size at ${e.url} over limit: ${e.size}`,"max-size"));a+=i.length,n.push(i)}})),i.on("end",(function(){if(!t){clearTimeout(r);try{d(Buffer.concat(n,a))}catch(i){l(new Oe(`Could not create Buffer from response body for ${e.url}: ${i.message}`,"system",i))}}}))}))}function ze(e){return"object"==typeof e&&"function"==typeof e.append&&"function"==typeof e.delete&&"function"==typeof e.get&&"function"==typeof e.getAll&&"function"==typeof e.has&&"function"==typeof e.set&&("URLSearchParams"===e.constructor.name||"[object URLSearchParams]"===Object.prototype.toString.call(e)||"function"==typeof e.sort)}function Le(e){return"object"==typeof e&&"function"==typeof e.arrayBuffer&&"string"==typeof e.type&&"function"==typeof e.stream&&"function"==typeof e.constructor&&"string"==typeof e.constructor.name&&/^(Blob|File)$/.test(e.constructor.name)&&/^(Blob|File)$/.test(e[Symbol.toStringTag])}function Me(e){let i,n,a=e.body;if(e.bodyUsed)throw new Error("cannot clone body after it is used");return a instanceof l.default&&"function"!=typeof a.getBoundary&&(i=new Ue,n=new Ue,a.pipe(i),a.pipe(n),e[je].body=i,a=n),a}function Re(e){return null===e?null:"string"==typeof e?"text/plain;charset=UTF-8":ze(e)?"application/x-www-form-urlencoded;charset=UTF-8":Le(e)?e.type||null:Buffer.isBuffer(e)||"[object ArrayBuffer]"===Object.prototype.toString.call(e)||ArrayBuffer.isView(e)?null:"function"==typeof e.getBoundary?`multipart/form-data;boundary=${e.getBoundary()}`:e instanceof l.default?null:"text/plain;charset=UTF-8"}function Qe(e){const i=e.body;return null===i?0:Le(i)?i.size:Buffer.isBuffer(i)?i.length:i&&"function"==typeof i.getLengthSync&&(i._lengthRetrievers&&0==i._lengthRetrievers.length||i.hasKnownLength&&i.hasKnownLength())?i.getLengthSync():null}Be.prototype={get body(){return this[je].body},get bodyUsed(){return this[je].disturbed},arrayBuffer(){return Ee.call(this).then((function(e){return e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength)}))},blob(){let e=this.headers&&this.headers.get("content-type")||"";return Ee.call(this).then((function(i){return Object.assign(new Ce([],{type:e.toLowerCase()}),{[qe]:i})}))},json(){var e=this;return Ee.call(this).then((function(i){try{return JSON.parse(i.toString())}catch(i){return Be.Promise.reject(new Oe(`invalid json response body at ${e.url} reason: ${i.message}`,"invalid-json"))}}))},text(){return Ee.call(this).then((function(e){return e.toString()}))},buffer(){return Ee.call(this)},textConverted(){var e=this;return Ee.call(this).then((function(i){return function(e,i){if("function"!=typeof Pe)throw new Error("The package `encoding` must be installed to use the textConverted() function");const n=i.get("content-type");let a,t,d="utf-8";n&&(a=/charset=([^;]*)/i.exec(n));t=e.slice(0,1024).toString(),!a&&t&&(a=/<meta.+?charset=(['"])(.+?)\1/i.exec(t));!a&&t&&(a=/<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(t),a||(a=/<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(t),a&&a.pop()),a&&(a=/charset=(.*)/i.exec(a.pop())));!a&&t&&(a=/<\?xml.+?encoding=(['"])(.+?)\1/i.exec(t));a&&(d=a.pop(),"gb2312"!==d&&"gbk"!==d||(d="gb18030"));return Pe(e,"UTF-8",d).toString()}(i,e.headers)}))}},Object.defineProperties(Be.prototype,{body:{enumerable:!0},bodyUsed:{enumerable:!0},arrayBuffer:{enumerable:!0},blob:{enumerable:!0},json:{enumerable:!0},text:{enumerable:!0}}),Be.mixIn=function(e){for(const i of Object.getOwnPropertyNames(Be.prototype))if(!(i in e)){const n=Object.getOwnPropertyDescriptor(Be.prototype,i);Object.defineProperty(e,i,n)}},Be.Promise=global.Promise;const We=/[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/,He=/[^\t\x20-\x7e\x80-\xff]/;function Ge(e){if(e=`${e}`,We.test(e)||""===e)throw new TypeError(`${e} is not a legal HTTP header name`)}function Je(e){if(e=`${e}`,He.test(e))throw new TypeError(`${e} is not a legal HTTP header value`)}function $e(e,i){i=i.toLowerCase();for(const n in e)if(n.toLowerCase()===i)return n}const Ke=Symbol("map");class Ze{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0;if(this[Ke]=Object.create(null),e instanceof Ze){const i=e.raw(),n=Object.keys(i);for(const e of n)for(const n of i[e])this.append(e,n)}else if(null==e);else{if("object"!=typeof e)throw new TypeError("Provided initializer must be an object");{const i=e[Symbol.iterator];if(null!=i){if("function"!=typeof i)throw new TypeError("Header pairs must be iterable");const n=[];for(const i of e){if("object"!=typeof i||"function"!=typeof i[Symbol.iterator])throw new TypeError("Each header pair must be iterable");n.push(Array.from(i))}for(const e of n){if(2!==e.length)throw new TypeError("Each header pair must be a name/value tuple");this.append(e[0],e[1])}}else for(const i of Object.keys(e)){const n=e[i];this.append(i,n)}}}}get(e){Ge(e=`${e}`);const i=$e(this[Ke],e);return void 0===i?null:this[Ke][i].join(", ")}forEach(e){let i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,n=Ye(this),a=0;for(;a<n.length;){var t=n[a];const d=t[0],l=t[1];e.call(i,l,d,this),n=Ye(this),a++}}set(e,i){i=`${i}`,Ge(e=`${e}`),Je(i);const n=$e(this[Ke],e);this[Ke][void 0!==n?n:e]=[i]}append(e,i){i=`${i}`,Ge(e=`${e}`),Je(i);const n=$e(this[Ke],e);void 0!==n?this[Ke][n].push(i):this[Ke][e]=[i]}has(e){return Ge(e=`${e}`),void 0!==$e(this[Ke],e)}delete(e){Ge(e=`${e}`);const i=$e(this[Ke],e);void 0!==i&&delete this[Ke][i]}raw(){return this[Ke]}keys(){return ei(this,"key")}values(){return ei(this,"value")}[Symbol.iterator](){return ei(this,"key+value")}}function Ye(e){let i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"key+value";const n=Object.keys(e[Ke]).sort();return n.map("key"===i?function(e){return e.toLowerCase()}:"value"===i?function(i){return e[Ke][i].join(", ")}:function(i){return[i.toLowerCase(),e[Ke][i].join(", ")]})}Ze.prototype.entries=Ze.prototype[Symbol.iterator],Object.defineProperty(Ze.prototype,Symbol.toStringTag,{value:"Headers",writable:!1,enumerable:!1,configurable:!0}),Object.defineProperties(Ze.prototype,{get:{enumerable:!0},forEach:{enumerable:!0},set:{enumerable:!0},append:{enumerable:!0},has:{enumerable:!0},delete:{enumerable:!0},keys:{enumerable:!0},values:{enumerable:!0},entries:{enumerable:!0}});const Xe=Symbol("internal");function ei(e,i){const n=Object.create(ii);return n[Xe]={target:e,kind:i,index:0},n}const ii=Object.setPrototypeOf({next(){if(!this||Object.getPrototypeOf(this)!==ii)throw new TypeError("Value of `this` is not a HeadersIterator");var e=this[Xe];const i=e.target,n=e.kind,a=e.index,t=Ye(i,n);return a>=t.length?{value:void 0,done:!0}:(this[Xe].index=a+1,{value:t[a],done:!1})}},Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));function ni(e){const i=Object.assign({__proto__:null},e[Ke]),n=$e(e[Ke],"Host");return void 0!==n&&(i[n]=i[n][0]),i}Object.defineProperty(ii,Symbol.toStringTag,{value:"HeadersIterator",writable:!1,enumerable:!1,configurable:!0});const ai=Symbol("Response internals"),ti=r.default.STATUS_CODES;class di{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};Be.call(this,e,i);const n=i.status||200,a=new Ze(i.headers);if(null!=e&&!a.has("Content-Type")){const i=Re(e);i&&a.append("Content-Type",i)}this[ai]={url:i.url,status:n,statusText:i.statusText||ti[n],headers:a,counter:i.counter}}get url(){return this[ai].url||""}get status(){return this[ai].status}get ok(){return this[ai].status>=200&&this[ai].status<300}get redirected(){return this[ai].counter>0}get statusText(){return this[ai].statusText}get headers(){return this[ai].headers}clone(){return new di(Me(this),{url:this.url,status:this.status,statusText:this.statusText,headers:this.headers,ok:this.ok,redirected:this.redirected})}}Be.mixIn(di.prototype),Object.defineProperties(di.prototype,{url:{enumerable:!0},status:{enumerable:!0},ok:{enumerable:!0},redirected:{enumerable:!0},statusText:{enumerable:!0},headers:{enumerable:!0},clone:{enumerable:!0}}),Object.defineProperty(di.prototype,Symbol.toStringTag,{value:"Response",writable:!1,enumerable:!1,configurable:!0});const li=Symbol("Request internals"),ri=Ie.parse,oi=Ie.format,si="destroy"in l.default.Readable.prototype;function mi(e){return"object"==typeof e&&"object"==typeof e[li]}class ui{constructor(e){let i,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};mi(e)?i=ri(e.url):(i=e&&e.href?ri(e.href):ri(`${e}`),e={});let a=n.method||e.method||"GET";if(a=a.toUpperCase(),(null!=n.body||mi(e)&&null!==e.body)&&("GET"===a||"HEAD"===a))throw new TypeError("Request with GET/HEAD method cannot have body");let t=null!=n.body?n.body:mi(e)&&null!==e.body?Me(e):null;Be.call(this,t,{timeout:n.timeout||e.timeout||0,size:n.size||e.size||0});const d=new Ze(n.headers||e.headers||{});if(null!=t&&!d.has("Content-Type")){const e=Re(t);e&&d.append("Content-Type",e)}let l=mi(e)?e.signal:null;if("signal"in n&&(l=n.signal),null!=l&&!function(e){const i=e&&"object"==typeof e&&Object.getPrototypeOf(e);return!(!i||"AbortSignal"!==i.constructor.name)}(l))throw new TypeError("Expected signal to be an instanceof AbortSignal");this[li]={method:a,redirect:n.redirect||e.redirect||"follow",headers:d,parsedURL:i,signal:l},this.follow=void 0!==n.follow?n.follow:void 0!==e.follow?e.follow:20,this.compress=void 0!==n.compress?n.compress:void 0===e.compress||e.compress,this.counter=n.counter||e.counter||0,this.agent=n.agent||e.agent}get method(){return this[li].method}get url(){return oi(this[li].parsedURL)}get headers(){return this[li].headers}get redirect(){return this[li].redirect}get signal(){return this[li].signal}clone(){return new ui(this)}}function ki(e){Error.call(this,e),this.type="aborted",this.message=e,Error.captureStackTrace(this,this.constructor)}Be.mixIn(ui.prototype),Object.defineProperty(ui.prototype,Symbol.toStringTag,{value:"Request",writable:!1,enumerable:!1,configurable:!0}),Object.defineProperties(ui.prototype,{method:{enumerable:!0},url:{enumerable:!0},headers:{enumerable:!0},redirect:{enumerable:!0},clone:{enumerable:!0},signal:{enumerable:!0}}),ki.prototype=Object.create(Error.prototype),ki.prototype.constructor=ki,ki.prototype.name="AbortError";const ci=l.default.PassThrough,vi=Ie.resolve;function Ni(e,i){if(!Ni.Promise)throw new Error("native promise missing, set fetch.Promise to your favorite alternative");return Be.Promise=Ni.Promise,new Ni.Promise((function(n,a){const t=new ui(e,i),d=function(e){const i=e[li].parsedURL,n=new Ze(e[li].headers);if(n.has("Accept")||n.set("Accept","*/*"),!i.protocol||!i.hostname)throw new TypeError("Only absolute URLs are supported");if(!/^https?:$/.test(i.protocol))throw new TypeError("Only HTTP(S) protocols are supported");if(e.signal&&e.body instanceof l.default.Readable&&!si)throw new Error("Cancellation of streamed requests with AbortSignal is not supported in node < 8");let a=null;if(null==e.body&&/^(POST|PUT)$/i.test(e.method)&&(a="0"),null!=e.body){const i=Qe(e);"number"==typeof i&&(a=String(i))}a&&n.set("Content-Length",a),n.has("User-Agent")||n.set("User-Agent","node-fetch/1.0 (+https://github.com/bitinn/node-fetch)"),e.compress&&!n.has("Accept-Encoding")&&n.set("Accept-Encoding","gzip,deflate");let t=e.agent;return"function"==typeof t&&(t=t(i)),n.has("Connection")||t||n.set("Connection","close"),Object.assign({},i,{method:e.method,headers:ni(n),agent:t})}(t),m=("https:"===d.protocol?o.default:r.default).request,u=t.signal;let k=null;const c=function(){let e=new ki("The user aborted a request.");a(e),t.body&&t.body instanceof l.default.Readable&&t.body.destroy(e),k&&k.body&&k.body.emit("error",e)};if(u&&u.aborted)return void c();const v=function(){c(),f()},N=m(d);let p;function f(){N.abort(),u&&u.removeEventListener("abort",v),clearTimeout(p)}u&&u.addEventListener("abort",v),t.timeout&&N.once("socket",(function(e){p=setTimeout((function(){a(new Oe(`network timeout at: ${t.url}`,"request-timeout")),f()}),t.timeout)})),N.on("error",(function(e){a(new Oe(`request to ${t.url} failed, reason: ${e.message}`,"system",e)),f()})),N.on("response",(function(e){clearTimeout(p);const i=function(e){const i=new Ze;for(const n of Object.keys(e))if(!We.test(n))if(Array.isArray(e[n]))for(const a of e[n])He.test(a)||(void 0===i[Ke][n]?i[Ke][n]=[a]:i[Ke][n].push(a));else He.test(e[n])||(i[Ke][n]=[e[n]]);return i}(e.headers);if(Ni.isRedirect(e.statusCode)){const d=i.get("Location"),l=null===d?null:vi(t.url,d);switch(t.redirect){case"error":return a(new Oe(`uri requested responds with a redirect, redirect mode is set to error: ${t.url}`,"no-redirect")),void f();case"manual":if(null!==l)try{i.set("Location",l)}catch(e){a(e)}break;case"follow":if(null===l)break;if(t.counter>=t.follow)return a(new Oe(`maximum redirect reached at: ${t.url}`,"max-redirect")),void f();const d={headers:new Ze(t.headers),follow:t.follow,counter:t.counter+1,agent:t.agent,compress:t.compress,method:t.method,body:t.body,signal:t.signal,timeout:t.timeout,size:t.size};return 303!==e.statusCode&&t.body&&null===Qe(t)?(a(new Oe("Cannot follow redirect with body being a readable stream","unsupported-redirect")),void f()):(303!==e.statusCode&&(301!==e.statusCode&&302!==e.statusCode||"POST"!==t.method)||(d.method="GET",d.body=void 0,d.headers.delete("content-length")),n(Ni(new ui(l,d))),void f())}}e.once("end",(function(){u&&u.removeEventListener("abort",v)}));let d=e.pipe(new ci);const l={url:t.url,status:e.statusCode,statusText:e.statusMessage,headers:i,size:t.size,timeout:t.timeout,counter:t.counter},r=i.get("Content-Encoding");if(!t.compress||"HEAD"===t.method||null===r||204===e.statusCode||304===e.statusCode)return k=new di(d,l),void n(k);const o={flush:s.default.Z_SYNC_FLUSH,finishFlush:s.default.Z_SYNC_FLUSH};if("gzip"==r||"x-gzip"==r)return d=d.pipe(s.default.createGunzip(o)),k=new di(d,l),void n(k);if("deflate"!=r&&"x-deflate"!=r){if("br"==r&&"function"==typeof s.default.createBrotliDecompress)return d=d.pipe(s.default.createBrotliDecompress()),k=new di(d,l),void n(k);k=new di(d,l),n(k)}else{e.pipe(new ci).once("data",(function(e){d=8==(15&e[0])?d.pipe(s.default.createInflate()):d.pipe(s.default.createInflateRaw()),k=new di(d,l),n(k)}))}})),function(e,i){const n=i.body;null===n?e.end():Le(n)?n.stream().pipe(e):Buffer.isBuffer(n)?(e.write(n),e.end()):n.pipe(e)}(N,t)}))}Ni.isRedirect=function(e){return 301===e||302===e||303===e||307===e||308===e},Ni.Promise=global.Promise;var pi=Object.freeze({__proto__:null,default:Ni,Headers:Ze,Request:ui,Response:di,FetchError:Oe}),fi=Z(X),hi=Z(pi);function bi(e){return e&&e.default||e}var yi,Si,gi,Di,Vi,Fi,Ai,Ti=K.fetch=K.fetch||("undefined"==typeof process?bi(fi):function(e,i){return bi(hi)(String(e).replace(/^\/\//g,"https://"),i)});class _i extends Error{constructor(e,i){super(`${_i.extractMessage(e)}: ${JSON.stringify({response:e,request:i})}`),Object.setPrototypeOf(this,_i.prototype),this.response=e,this.request=i,"function"==typeof Error.captureStackTrace&&Error.captureStackTrace(this,_i)}static extractMessage(e){var i,n,a;try{return null!==(a=null===(n=null===(i=e.errors)||void 0===i?void 0:i[0])||void 0===n?void 0:n.message)&&void 0!==a?a:`GraphQL Error (Code: ${e.status})`}catch(i){return`GraphQL Error (Code: ${e.status})`}}}class Ii{constructor(e,i){this.url=e,this.options=i||{}}rawRequest(e,i,n){return u(this,void 0,void 0,(function*(){const a=this.options,{headers:t}=a,d=m(a,["headers"]),l=JSON.stringify({query:e,variables:i}),r=yield Ti(this.url,Object.assign({method:"POST",headers:Object.assign(Object.assign(Object.assign({},"string"==typeof l?{"Content-Type":"application/json"}:{}),qi(t)),qi(n)),body:l},d)),o=yield wi(r);if("string"!=typeof o&&r.ok&&!o.errors&&o.data)return Object.assign(Object.assign({},o),{headers:r.headers,status:r.status});throw q(new _i(Object.assign(Object.assign({},"string"==typeof o?{error:o}:o),{status:r.status,headers:r.headers}),{query:e,variables:i}))}))}request(e,i,n){return u(this,void 0,void 0,(function*(){const a=this.options,{headers:t}=a,d=m(a,["headers"]),l="string"==typeof e?e:L(e),r=JSON.stringify({query:l,variables:i}),o=yield Ti(this.url,Object.assign({method:"POST",headers:Object.assign(Object.assign(Object.assign({},"string"==typeof r?{"Content-Type":"application/json"}:{}),qi(t)),qi(n)),body:r},d)),s=yield wi(o);if("string"!=typeof s&&o.ok&&!s.errors&&s.data)return s.data;throw new _i(Object.assign(Object.assign({},"string"==typeof s?{error:s}:s),{status:o.status,headers:o.headers}),{query:l,variables:i})}))}setHeaders(e){return this.options.headers=e,this}setHeader(e,i){const{headers:n}=this.options;return n?n[e]=i:this.options.headers={[e]:i},this}}function wi(e){const i=e.headers.get("Content-Type");return i&&i.startsWith("application/json")?e.json():e.text()}function qi(e){let i={};return e&&("undefined"!=typeof Headers&&e instanceof Headers?i=function(e){const i={};return e.forEach(((e,n)=>{i[n]=e})),i}(e):Array.isArray(e)?e.forEach((([e,n])=>{i[e]=n})):i=e),i}!function(e){e.Blocks="blocks",e.Duplicate="duplicate",e.Related="related"}(yi||(yi={})),function(e){e.CreatedAt="createdAt",e.UpdatedAt="updatedAt"}(Si||(Si={})),function(e){e.ExcludeTrash="excludeTrash",e.IncludeTrash="includeTrash",e.TrashOnly="trashOnly"}(gi||(gi={})),function(e){e.AnalyticsWelcomeDismissed="analyticsWelcomeDismissed",e.CanPlaySnake="canPlaySnake",e.CanPlayTetris="canPlayTetris",e.CompletedOnboarding="completedOnboarding",e.CycleWelcomeDismissed="cycleWelcomeDismissed",e.DesktopDownloadToastDismissed="desktopDownloadToastDismissed",e.DesktopInstalled="desktopInstalled",e.DueDateShortcutMigration="dueDateShortcutMigration",e.EmptyActiveIssuesDismissed="emptyActiveIssuesDismissed",e.EmptyBacklogDismissed="emptyBacklogDismissed",e.EmptyCustomViewsDismissed="emptyCustomViewsDismissed",e.EmptyMyIssuesDismissed="emptyMyIssuesDismissed",e.FigmaPromptDismissed="figmaPromptDismissed",e.ImportBannerDismissed="importBannerDismissed",e.IssueMovePromptCompleted="issueMovePromptCompleted",e.ListSelectionTip="listSelectionTip",e.MigrateThemePreference="migrateThemePreference",e.ProjectWelcomeDismissed="projectWelcomeDismissed",e.SlackCommentReactionTipShown="slackCommentReactionTipShown",e.TriageWelcomeDismissed="triageWelcomeDismissed"}(Di||(Di={})),function(e){e.Clear="clear",e.Decr="decr",e.Incr="incr",e.Lock="lock"}(Vi||(Vi={})),function(e){e.Organization="organization",e.User="user"}(Fi||(Fi={})),function(e){e.ActiveIssues="activeIssues",e.AllIssues="allIssues",e.Backlog="backlog",e.Board="board",e.CompletedCycle="completedCycle",e.CustomView="customView",e.Cycle="cycle",e.Inbox="inbox",e.Label="label",e.MyIssues="myIssues",e.Project="project",e.Projects="projects",e.Roadmap="roadmap",e.Triage="triage",e.UserProfile="userProfile"}(Ai||(Ai={}));const xi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Template"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Template"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"templateData"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"type"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},Ci={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"User"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"User"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"statusUntilAt"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"avatarUrl"}},{kind:"Field",name:{kind:"Name",value:"createdIssueCount"}},{kind:"Field",name:{kind:"Name",value:"disableReason"}},{kind:"Field",name:{kind:"Name",value:"statusEmoji"}},{kind:"Field",name:{kind:"Name",value:"statusLabel"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"lastSeen"}},{kind:"Field",name:{kind:"Name",value:"timezone"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"displayName"}},{kind:"Field",name:{kind:"Name",value:"email"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"inviteHash"}},{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"active"}},{kind:"Field",name:{kind:"Name",value:"admin"}},{kind:"Field",name:{kind:"Name",value:"isMe"}}]}}]},Oi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserAccount"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserAccount"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"service"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"email"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"users"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"User"}}]}}]}},...Ci.definitions]},Pi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"GithubRepo"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"GithubRepo"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"name"}}]}}]},ji={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"GithubOrg"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"GithubOrg"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"repositories"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"GithubRepo"}}]}},{kind:"Field",name:{kind:"Name",value:"login"}},{kind:"Field",name:{kind:"Name",value:"name"}}]}},...Pi.definitions]},Ui={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"GithubOAuthTokenPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"GithubOAuthTokenPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizations"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"GithubOrg"}}]}},{kind:"Field",name:{kind:"Name",value:"token"}}]}},...ji.definitions]},Bi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"AuthorizedApplication"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"AuthorizedApplication"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"imageUrl"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"developer"}},{kind:"Field",name:{kind:"Name",value:"appId"}},{kind:"Field",name:{kind:"Name",value:"clientId"}},{kind:"Field",name:{kind:"Name",value:"scope"}},{kind:"Field",name:{kind:"Name",value:"developerUrl"}},{kind:"Field",name:{kind:"Name",value:"webhooksEnabled"}}]}}]},Ei={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserAuthorizedApplication"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserAuthorizedApplication"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"imageUrl"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"developer"}},{kind:"Field",name:{kind:"Name",value:"clientId"}},{kind:"Field",name:{kind:"Name",value:"developerUrl"}},{kind:"Field",name:{kind:"Name",value:"webhooksEnabled"}},{kind:"Field",name:{kind:"Name",value:"createdByLinear"}},{kind:"Field",name:{kind:"Name",value:"isAuthorized"}}]}}]},zi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"GoogleSheetsSettings"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"GoogleSheetsSettings"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"sheetId"}},{kind:"Field",name:{kind:"Name",value:"spreadsheetId"}},{kind:"Field",name:{kind:"Name",value:"spreadsheetUrl"}},{kind:"Field",name:{kind:"Name",value:"updatedIssuesAt"}}]}}]},Li={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IntercomSettings"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IntercomSettings"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"sendNoteOnStatusChange"}},{kind:"Field",name:{kind:"Name",value:"sendNoteOnComment"}}]}}]},Mi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"JiraProjectData"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"JiraProjectData"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"key"}},{kind:"Field",name:{kind:"Name",value:"name"}}]}}]},Ri={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"JiraLinearMapping"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"JiraLinearMapping"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"jiraProjectId"}},{kind:"Field",name:{kind:"Name",value:"linearTeamId"}}]}}]},Qi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"JiraSettings"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"JiraSettings"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projects"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"JiraProjectData"}}]}},{kind:"Field",name:{kind:"Name",value:"projectMapping"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"JiraLinearMapping"}}]}}]}},...Mi.definitions,...Ri.definitions]},Wi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SentrySettings"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SentrySettings"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationSlug"}}]}}]},Hi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SlackPostSettings"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SlackPostSettings"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"channel"}},{kind:"Field",name:{kind:"Name",value:"channelId"}},{kind:"Field",name:{kind:"Name",value:"configurationUrl"}}]}}]},Gi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ZendeskSettings"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ZendeskSettings"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"botUserId"}},{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"subdomain"}}]}}]},Ji={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IntegrationSettings"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IntegrationSettings"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"googleSheets"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"GoogleSheetsSettings"}}]}},{kind:"Field",name:{kind:"Name",value:"intercom"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntercomSettings"}}]}},{kind:"Field",name:{kind:"Name",value:"jira"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"JiraSettings"}}]}},{kind:"Field",name:{kind:"Name",value:"sentry"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"SentrySettings"}}]}},{kind:"Field",name:{kind:"Name",value:"slackPost"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"SlackPostSettings"}}]}},{kind:"Field",name:{kind:"Name",value:"slackProjectPost"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"SlackPostSettings"}}]}},{kind:"Field",name:{kind:"Name",value:"zendesk"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ZendeskSettings"}}]}}]}},...zi.definitions,...Li.definitions,...Qi.definitions,...Wi.definitions,...Hi.definitions,...Gi.definitions]},$i={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserSettings"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserSettings"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"unsubscribedFrom"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"notificationPreferences"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"user"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},Ki={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Subscription"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Subscription"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"canceledAt"}},{kind:"Field",name:{kind:"Name",value:"nextBillingAt"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"seats"}},{kind:"Field",name:{kind:"Name",value:"pendingChangeType"}},{kind:"Field",name:{kind:"Name",value:"type"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},Zi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ApiKey"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ApiKey"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"label"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},Yi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"PageInfo"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"PageInfo"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"startCursor"}},{kind:"Field",name:{kind:"Name",value:"endCursor"}},{kind:"Field",name:{kind:"Name",value:"hasPreviousPage"}},{kind:"Field",name:{kind:"Name",value:"hasNextPage"}}]}}]},Xi={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ApiKeyConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ApiKeyConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ApiKey"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Zi.definitions,...Yi.definitions]},en={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ApiKeyPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ApiKeyPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"apiKey"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ApiKey"}}]}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...Zi.definitions]},nn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ArchivePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ArchivePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},an={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Attachment"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Attachment"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"sourceType"}},{kind:"Field",name:{kind:"Name",value:"subtitle"}},{kind:"Field",name:{kind:"Name",value:"title"}},{kind:"Field",name:{kind:"Name",value:"metadata"}},{kind:"Field",name:{kind:"Name",value:"groupBySource"}},{kind:"Field",name:{kind:"Name",value:"source"}},{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"issue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},tn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"AttachmentConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"AttachmentConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Attachment"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...an.definitions,...Yi.definitions]},dn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"AttachmentPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"AttachmentPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"attachment"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},ln={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"AuditEntry"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"AuditEntry"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"metadata"}},{kind:"Field",name:{kind:"Name",value:"countryCode"}},{kind:"Field",name:{kind:"Name",value:"ip"}},{kind:"Field",name:{kind:"Name",value:"actorId"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"actor"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"type"}}]}}]},rn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"AuditEntryConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"AuditEntryConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AuditEntry"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...ln.definitions,...Yi.definitions]},on={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"AuditEntryType"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"AuditEntryType"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"type"}}]}}]},sn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Organization"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Organization"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"allowedAuthServices"}},{kind:"Field",name:{kind:"Name",value:"gitBranchFormat"}},{kind:"Field",name:{kind:"Name",value:"userCount"}},{kind:"Field",name:{kind:"Name",value:"createdIssueCount"}},{kind:"Field",name:{kind:"Name",value:"periodUploadVolume"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"logoUrl"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"urlKey"}},{kind:"Field",name:{kind:"Name",value:"deletionRequestedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"samlEnabled"}},{kind:"Field",name:{kind:"Name",value:"gitLinkbackMessagesEnabled"}},{kind:"Field",name:{kind:"Name",value:"gitPublicLinkbackMessagesEnabled"}},{kind:"Field",name:{kind:"Name",value:"roadmapEnabled"}}]}}]},mn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"AuthResolverResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"AuthResolverResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"email"}},{kind:"Field",name:{kind:"Name",value:"lastUsedOrganizationId"}},{kind:"Field",name:{kind:"Name",value:"token"}},{kind:"Field",name:{kind:"Name",value:"availableOrganizations"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Organization"}}]}},{kind:"Field",name:{kind:"Name",value:"allowDomainAccess"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"users"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"User"}}]}}]}},...sn.definitions,...Ci.definitions]},un={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Invoice"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Invoice"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"created"}},{kind:"Field",name:{kind:"Name",value:"dueDate"}},{kind:"Field",name:{kind:"Name",value:"total"}},{kind:"Field",name:{kind:"Name",value:"status"}}]}}]},kn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Card"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Card"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"brand"}},{kind:"Field",name:{kind:"Name",value:"last4"}}]}}]},cn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"BillingDetailsPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"BillingDetailsPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"invoices"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Invoice"}}]}},{kind:"Field",name:{kind:"Name",value:"email"}},{kind:"Field",name:{kind:"Name",value:"paymentMethod"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Card"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...un.definitions,...kn.definitions]},vn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"BillingEmailPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"BillingEmailPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"email"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Nn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"StepsResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"StepsResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"version"}},{kind:"Field",name:{kind:"Name",value:"clientIds"}},{kind:"Field",name:{kind:"Name",value:"steps"}}]}}]},pn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CollaborationDocumentUpdatePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CollaborationDocumentUpdatePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"steps"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"StepsResponse"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...Nn.definitions]},fn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Comment"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Comment"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"body"}},{kind:"Field",name:{kind:"Name",value:"issue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"editedAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"user"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},hn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CommentConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CommentConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Comment"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...fn.definitions,...Yi.definitions]},bn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CommentPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CommentPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"comment"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},yn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ContactPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ContactPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Sn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CreateCsvExportReportPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CreateCsvExportReportPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},gn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CreateOrJoinOrganizationResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CreateOrJoinOrganizationResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"user"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},Dn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CustomView"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CustomView"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"color"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"filters"}},{kind:"Field",name:{kind:"Name",value:"icon"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"shared"}},{kind:"Field",name:{kind:"Name",value:"filterData"}}]}}]},Vn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CustomViewConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CustomViewConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CustomView"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Dn.definitions,...Yi.definitions]},Fn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CustomViewPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CustomViewPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"customView"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},An={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Cycle"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Cycle"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"completedAt"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"endsAt"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"completedScopeHistory"}},{kind:"Field",name:{kind:"Name",value:"completedIssueCountHistory"}},{kind:"Field",name:{kind:"Name",value:"number"}},{kind:"Field",name:{kind:"Name",value:"progress"}},{kind:"Field",name:{kind:"Name",value:"startsAt"}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"autoArchivedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"scopeHistory"}},{kind:"Field",name:{kind:"Name",value:"issueCountHistory"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},Tn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CycleConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CycleConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Cycle"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...An.definitions,...Yi.definitions]},_n={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CyclePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CyclePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycle"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},In={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"DebugPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"DebugPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},wn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Document"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Document"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"color"}},{kind:"Field",name:{kind:"Name",value:"contentData"}},{kind:"Field",name:{kind:"Name",value:"content"}},{kind:"Field",name:{kind:"Name",value:"title"}},{kind:"Field",name:{kind:"Name",value:"slugId"}},{kind:"Field",name:{kind:"Name",value:"icon"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"project"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedBy"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},qn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"DocumentConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"DocumentConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Document"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...wn.definitions,...Yi.definitions]},xn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"DocumentPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"DocumentPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"document"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Cn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"DocumentVersion"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"DocumentVersion"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"content"}},{kind:"Field",name:{kind:"Name",value:"title"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"project"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"revision"}}]}}]},On={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"DocumentVersionConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"DocumentVersionConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"DocumentVersion"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Cn.definitions,...Yi.definitions]},Pn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"EmailSubscribePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"EmailSubscribePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},jn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"EmailUnsubscribePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"EmailUnsubscribePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Un={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"EmailUserAccountAuthChallengeResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"EmailUserAccountAuthChallengeResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"authType"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Bn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Emoji"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Emoji"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"source"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},En={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"EmojiConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"EmojiConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Emoji"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Bn.definitions,...Yi.definitions]},zn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"EmojiPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"EmojiPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emoji"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Ln={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"EventPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"EventPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Mn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Favorite"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Favorite"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"customView"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"cycle"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"document"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"issue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"label"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"project"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"projectTeam"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"folderName"}},{kind:"Field",name:{kind:"Name",value:"sortOrder"}},{kind:"Field",name:{kind:"Name",value:"user"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"parent"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"type"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},Rn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"FavoriteConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"FavoriteConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Favorite"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Mn.definitions,...Yi.definitions]},Qn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"FavoritePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"FavoritePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"favorite"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Wn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"FeedbackPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"FeedbackPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Hn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"FigmaEmbed"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"FigmaEmbed"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastModified"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"nodeName"}}]}}]},Gn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"FigmaEmbedPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"FigmaEmbedPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"figmaEmbed"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"FigmaEmbed"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...Hn.definitions]},Jn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"FrontAttachmentPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"FrontAttachmentPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},$n={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"GitHubCommitIntegrationPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"GitHubCommitIntegrationPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"integration"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"webhookSecret"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Kn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ImageUploadFromUrlPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ImageUploadFromUrlPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Zn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Integration"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Integration"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"service"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},Yn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IntegrationConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IntegrationConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Integration"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Zn.definitions,...Yi.definitions]},Xn={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IntegrationPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IntegrationPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"integration"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},ea={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"CommitPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"CommitPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"added"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"message"}},{kind:"Field",name:{kind:"Name",value:"modified"}},{kind:"Field",name:{kind:"Name",value:"removed"}},{kind:"Field",name:{kind:"Name",value:"timestamp"}},{kind:"Field",name:{kind:"Name",value:"url"}}]}}]},ia={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"PullRequestPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"PullRequestPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"branch"}},{kind:"Field",name:{kind:"Name",value:"closedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"draft"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"mergedAt"}},{kind:"Field",name:{kind:"Name",value:"number"}},{kind:"Field",name:{kind:"Name",value:"repoLogin"}},{kind:"Field",name:{kind:"Name",value:"repoName"}},{kind:"Field",name:{kind:"Name",value:"status"}},{kind:"Field",name:{kind:"Name",value:"title"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"userId"}},{kind:"Field",name:{kind:"Name",value:"userLogin"}}]}}]},na={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SentryIssuePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SentryIssuePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueId"}},{kind:"Field",name:{kind:"Name",value:"actorId"}},{kind:"Field",name:{kind:"Name",value:"projectId"}},{kind:"Field",name:{kind:"Name",value:"firstSeen"}},{kind:"Field",name:{kind:"Name",value:"webUrl"}},{kind:"Field",name:{kind:"Name",value:"actorName"}},{kind:"Field",name:{kind:"Name",value:"firstVersion"}},{kind:"Field",name:{kind:"Name",value:"shortId"}},{kind:"Field",name:{kind:"Name",value:"projectSlug"}},{kind:"Field",name:{kind:"Name",value:"issueTitle"}},{kind:"Field",name:{kind:"Name",value:"actorType"}}]}}]},aa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IntegrationResourceData"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IntegrationResourceData"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"githubCommit"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CommitPayload"}}]}},{kind:"Field",name:{kind:"Name",value:"githubPullRequest"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PullRequestPayload"}}]}},{kind:"Field",name:{kind:"Name",value:"gitlabMergeRequest"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PullRequestPayload"}}]}},{kind:"Field",name:{kind:"Name",value:"sentryIssue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"SentryIssuePayload"}}]}}]}},...ea.definitions,...ia.definitions,...na.definitions]},ta={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IntegrationResource"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IntegrationResource"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"data"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationResourceData"}}]}},{kind:"Field",name:{kind:"Name",value:"pullRequest"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PullRequestPayload"}}]}},{kind:"Field",name:{kind:"Name",value:"resourceId"}},{kind:"Field",name:{kind:"Name",value:"integration"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"resourceType"}},{kind:"Field",name:{kind:"Name",value:"issue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}},...aa.definitions,...ia.definitions]},da={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IntegrationResourceConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IntegrationResourceConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationResource"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...ta.definitions,...Yi.definitions]},la={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Issue"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Issue"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"trashed"}},{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"identifier"}},{kind:"Field",name:{kind:"Name",value:"priorityLabel"}},{kind:"Field",name:{kind:"Name",value:"previousIdentifiers"}},{kind:"Field",name:{kind:"Name",value:"customerTicketCount"}},{kind:"Field",name:{kind:"Name",value:"branchName"}},{kind:"Field",name:{kind:"Name",value:"cycle"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"dueDate"}},{kind:"Field",name:{kind:"Name",value:"estimate"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"title"}},{kind:"Field",name:{kind:"Name",value:"number"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"boardOrder"}},{kind:"Field",name:{kind:"Name",value:"sortOrder"}},{kind:"Field",name:{kind:"Name",value:"subIssueSortOrder"}},{kind:"Field",name:{kind:"Name",value:"parent"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"priority"}},{kind:"Field",name:{kind:"Name",value:"project"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"autoArchivedAt"}},{kind:"Field",name:{kind:"Name",value:"autoClosedAt"}},{kind:"Field",name:{kind:"Name",value:"canceledAt"}},{kind:"Field",name:{kind:"Name",value:"completedAt"}},{kind:"Field",name:{kind:"Name",value:"startedAt"}},{kind:"Field",name:{kind:"Name",value:"snoozedUntilAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"assignee"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"snoozedBy"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"state"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},ra={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueBatchPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueBatchPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"issues"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Issue"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...la.definitions]},oa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Issue"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...la.definitions,...Yi.definitions]},sa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueDescriptionHistory"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueDescriptionHistory"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"actorId"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"descriptionData"}},{kind:"Field",name:{kind:"Name",value:"type"}}]}}]},ma={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueDescriptionHistoryPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueDescriptionHistoryPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"history"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueDescriptionHistory"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...sa.definitions]},ua={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueRelationHistoryPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueRelationHistoryPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"identifier"}},{kind:"Field",name:{kind:"Name",value:"type"}}]}}]},ka={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueImport"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueImport"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"mapping"}},{kind:"Field",name:{kind:"Name",value:"creatorId"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"service"}},{kind:"Field",name:{kind:"Name",value:"status"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"error"}}]}}]},ca={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueHistory"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueHistory"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"relationChanges"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelationHistoryPayload"}}]}},{kind:"Field",name:{kind:"Name",value:"addedLabelIds"}},{kind:"Field",name:{kind:"Name",value:"removedLabelIds"}},{kind:"Field",name:{kind:"Name",value:"source"}},{kind:"Field",name:{kind:"Name",value:"issueImport"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImport"}}]}},{kind:"Field",name:{kind:"Name",value:"issue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"toCycle"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"toParent"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"toProject"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"toState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"fromCycle"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"fromParent"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"fromProject"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"fromState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"fromTeam"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"toTeam"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"fromAssignee"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"toAssignee"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"actor"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"fromDueDate"}},{kind:"Field",name:{kind:"Name",value:"toDueDate"}},{kind:"Field",name:{kind:"Name",value:"fromEstimate"}},{kind:"Field",name:{kind:"Name",value:"toEstimate"}},{kind:"Field",name:{kind:"Name",value:"fromPriority"}},{kind:"Field",name:{kind:"Name",value:"toPriority"}},{kind:"Field",name:{kind:"Name",value:"fromTitle"}},{kind:"Field",name:{kind:"Name",value:"toTitle"}},{kind:"Field",name:{kind:"Name",value:"archived"}},{kind:"Field",name:{kind:"Name",value:"trashed"}},{kind:"Field",name:{kind:"Name",value:"updatedDescription"}},{kind:"Field",name:{kind:"Name",value:"autoArchived"}},{kind:"Field",name:{kind:"Name",value:"autoClosed"}}]}},...ua.definitions,...ka.definitions]},va={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueHistoryConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueHistoryConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueHistory"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...ca.definitions,...Yi.definitions]},Na={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueImportDeletePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueImportDeletePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"issueImport"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImport"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...ka.definitions]},pa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueImportPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueImportPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"issueImport"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImport"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...ka.definitions]},fa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueLabel"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueLabel"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"color"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},ha={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueLabelConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueLabelConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueLabel"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...fa.definitions,...Yi.definitions]},ba={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueLabelPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueLabelPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"issueLabel"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},ya={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssuePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssuePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"issue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Sa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssuePriorityValue"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssuePriorityValue"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"label"}},{kind:"Field",name:{kind:"Name",value:"priority"}}]}}]},ga={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueRelation"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueRelation"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"relatedIssue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"type"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},Da={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueRelationConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueRelationConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelation"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...ga.definitions,...Yi.definitions]},Va={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"IssueRelationPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"IssueRelationPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"issueRelation"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Fa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Milestone"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Milestone"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"sortOrder"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},Aa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"MilestoneConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"MilestoneConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Milestone"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Fa.definitions,...Yi.definitions]},Ta={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"MilestonePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"MilestonePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"milestone"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},_a={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Notification"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Notification"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"reactionEmoji"}},{kind:"Field",name:{kind:"Name",value:"type"}},{kind:"Field",name:{kind:"Name",value:"comment"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"issue"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"user"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"emailedAt"}},{kind:"Field",name:{kind:"Name",value:"readAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"snoozedUntilAt"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},Ia={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"NotificationConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"NotificationConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Notification"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},..._a.definitions,...Yi.definitions]},wa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"NotificationPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"NotificationPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"notification"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},qa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"NotificationSubscription"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"NotificationSubscription"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"project"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"type"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"user"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},xa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"NotificationSubscriptionConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"NotificationSubscriptionConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"NotificationSubscription"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...qa.definitions,...Yi.definitions]},Ca={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"NotificationSubscriptionPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"NotificationSubscriptionPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"notificationSubscription"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Oa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OauthClient"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OauthClient"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"imageUrl"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"redirectUris"}},{kind:"Field",name:{kind:"Name",value:"developer"}},{kind:"Field",name:{kind:"Name",value:"clientId"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"clientSecret"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"webhookResourceTypes"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"developerUrl"}},{kind:"Field",name:{kind:"Name",value:"webhookUrl"}},{kind:"Field",name:{kind:"Name",value:"publicEnabled"}}]}}]},Pa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OauthClientPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OauthClientPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"oauthClient"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OauthClient"}}]}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...Oa.definitions]},ja={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OauthTokenRevokePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OauthTokenRevokePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Ua={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationCancelDeletePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationCancelDeletePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Ba={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationDeletePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationDeletePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Ea={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationDomain"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationDomain"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"verificationEmail"}},{kind:"Field",name:{kind:"Name",value:"verified"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},za={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationDomainPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationDomainPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"organizationDomain"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationDomain"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...Ea.definitions]},La={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationExistsPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationExistsPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}},{kind:"Field",name:{kind:"Name",value:"exists"}}]}}]},Ma={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationInvite"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationInvite"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"external"}},{kind:"Field",name:{kind:"Name",value:"email"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"acceptedAt"}},{kind:"Field",name:{kind:"Name",value:"expiresAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"inviter"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"invitee"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},Ra={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationInviteConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationInviteConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationInvite"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Ma.definitions,...Yi.definitions]},Qa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationInviteDetailsPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationInviteDetailsPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationId"}},{kind:"Field",name:{kind:"Name",value:"organizationName"}},{kind:"Field",name:{kind:"Name",value:"email"}},{kind:"Field",name:{kind:"Name",value:"inviter"}},{kind:"Field",name:{kind:"Name",value:"organizationLogoUrl"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"accepted"}},{kind:"Field",name:{kind:"Name",value:"expired"}}]}}]},Wa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationInvitePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationInvitePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"organizationInvite"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Ha={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Ga={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Project"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Project"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"targetDate"}},{kind:"Field",name:{kind:"Name",value:"icon"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"milestone"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"completedScopeHistory"}},{kind:"Field",name:{kind:"Name",value:"completedIssueCountHistory"}},{kind:"Field",name:{kind:"Name",value:"progress"}},{kind:"Field",name:{kind:"Name",value:"lead"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"color"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"slugId"}},{kind:"Field",name:{kind:"Name",value:"sortOrder"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"autoArchivedAt"}},{kind:"Field",name:{kind:"Name",value:"canceledAt"}},{kind:"Field",name:{kind:"Name",value:"completedAt"}},{kind:"Field",name:{kind:"Name",value:"startedAt"}},{kind:"Field",name:{kind:"Name",value:"scopeHistory"}},{kind:"Field",name:{kind:"Name",value:"issueCountHistory"}},{kind:"Field",name:{kind:"Name",value:"state"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"slackIssueComments"}},{kind:"Field",name:{kind:"Name",value:"slackNewIssue"}},{kind:"Field",name:{kind:"Name",value:"slackIssueStatuses"}}]}}]},Ja={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ProjectConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ProjectConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Project"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Ga.definitions,...Yi.definitions]},$a={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ProjectLink"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ProjectLink"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"label"}},{kind:"Field",name:{kind:"Name",value:"project"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},Ka={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ProjectLinkConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ProjectLinkConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectLink"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...$a.definitions,...Yi.definitions]},Za={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ProjectLinkPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ProjectLinkPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"projectLink"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Ya={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ProjectPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ProjectPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"project"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Xa={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"PushSubscription"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"PushSubscription"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},et={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"PushSubscriptionConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"PushSubscriptionConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PushSubscription"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Xa.definitions,...Yi.definitions]},it={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"PushSubscriptionPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"PushSubscriptionPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},nt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"PushSubscriptionTestPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"PushSubscriptionTestPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},at={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Reaction"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Reaction"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emoji"}},{kind:"Field",name:{kind:"Name",value:"comment"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"user"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}}]}}]},tt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ReactionConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ReactionConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Reaction"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...at.definitions,...Yi.definitions]},dt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ReactionPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ReactionPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"reaction"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},lt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"RotateSecretPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"RotateSecretPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},rt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SsoUrlFromEmailResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SsoUrlFromEmailResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"samlSsoUrl"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},ot={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Team"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Team"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycleIssueAutoAssignCompleted"}},{kind:"Field",name:{kind:"Name",value:"cycleIssueAutoAssignStarted"}},{kind:"Field",name:{kind:"Name",value:"cycleCalenderUrl"}},{kind:"Field",name:{kind:"Name",value:"upcomingCycleCount"}},{kind:"Field",name:{kind:"Name",value:"cycleLockToActive"}},{kind:"Field",name:{kind:"Name",value:"autoArchivePeriod"}},{kind:"Field",name:{kind:"Name",value:"autoClosePeriod"}},{kind:"Field",name:{kind:"Name",value:"activeCycle"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"autoCloseStateId"}},{kind:"Field",name:{kind:"Name",value:"cycleCooldownTime"}},{kind:"Field",name:{kind:"Name",value:"cycleStartDay"}},{kind:"Field",name:{kind:"Name",value:"defaultTemplateForMembers"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"defaultTemplateForNonMembers"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"defaultIssueState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"cycleDuration"}},{kind:"Field",name:{kind:"Name",value:"icon"}},{kind:"Field",name:{kind:"Name",value:"defaultTemplateForMembersId"}},{kind:"Field",name:{kind:"Name",value:"defaultTemplateForNonMembersId"}},{kind:"Field",name:{kind:"Name",value:"issueEstimationType"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"color"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"key"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"timezone"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"mergeWorkflowState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"draftWorkflowState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"startWorkflowState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"reviewWorkflowState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"markedAsDuplicateWorkflowState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"triageIssueState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"inviteHash"}},{kind:"Field",name:{kind:"Name",value:"defaultIssueEstimate"}},{kind:"Field",name:{kind:"Name",value:"issueOrderingNoPriorityFirst"}},{kind:"Field",name:{kind:"Name",value:"private"}},{kind:"Field",name:{kind:"Name",value:"cyclesEnabled"}},{kind:"Field",name:{kind:"Name",value:"issueEstimationExtended"}},{kind:"Field",name:{kind:"Name",value:"issueEstimationAllowZero"}},{kind:"Field",name:{kind:"Name",value:"groupIssueHistory"}},{kind:"Field",name:{kind:"Name",value:"slackIssueComments"}},{kind:"Field",name:{kind:"Name",value:"slackNewIssue"}},{kind:"Field",name:{kind:"Name",value:"slackIssueStatuses"}},{kind:"Field",name:{kind:"Name",value:"triageEnabled"}}]}}]},st={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"TeamConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"TeamConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Team"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...ot.definitions,...Yi.definitions]},mt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"TeamMembership"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"TeamMembership"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"user"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"owner"}}]}}]},ut={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"TeamMembershipConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"TeamMembershipConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamMembership"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...mt.definitions,...Yi.definitions]},kt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"TeamMembershipPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"TeamMembershipPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"teamMembership"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},ct={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"TeamPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"TeamPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},vt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"TemplateConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"TemplateConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Yi.definitions]},Nt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"TemplatePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"TemplatePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"template"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},pt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UploadFileHeader"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UploadFileHeader"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"key"}},{kind:"Field",name:{kind:"Name",value:"value"}}]}}]},ft={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UploadFile"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UploadFile"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"assetUrl"}},{kind:"Field",name:{kind:"Name",value:"contentType"}},{kind:"Field",name:{kind:"Name",value:"filename"}},{kind:"Field",name:{kind:"Name",value:"uploadUrl"}},{kind:"Field",name:{kind:"Name",value:"size"}},{kind:"Field",name:{kind:"Name",value:"headers"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UploadFileHeader"}}]}},{kind:"Field",name:{kind:"Name",value:"metaData"}}]}},...pt.definitions]},ht={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UploadPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UploadPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"uploadFile"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UploadFile"}}]}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...ft.definitions]},bt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserAdminPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserAdminPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},yt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"User"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...Ci.definitions,...Yi.definitions]},St={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"user"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},gt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserSettingsFlagPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserSettingsFlagPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"flag"}},{kind:"Field",name:{kind:"Name",value:"value"}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Dt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserSettingsFlagsResetPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserSettingsFlagsResetPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Vt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserSettingsPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserSettingsPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Ft={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"UserSubscribeToNewsletterPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"UserSubscribeToNewsletterPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},At={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ViewPreferences"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ViewPreferences"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"type"}},{kind:"Field",name:{kind:"Name",value:"viewType"}}]}}]},Tt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ViewPreferencesPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ViewPreferencesPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"viewPreferences"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ViewPreferences"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}},...At.definitions]},_t={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Webhook"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Webhook"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"secret"}},{kind:"Field",name:{kind:"Name",value:"teamIds"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"resourceTypes"}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}},{kind:"Field",name:{kind:"Name",value:"creator"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"url"}},{kind:"Field",name:{kind:"Name",value:"label"}},{kind:"Field",name:{kind:"Name",value:"allPublicTeams"}},{kind:"Field",name:{kind:"Name",value:"enabled"}}]}}]},It={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"WebhookConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"WebhookConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Webhook"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},..._t.definitions,...Yi.definitions]},wt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"WebhookPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"WebhookPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"webhook"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},qt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"WorkflowState"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"WorkflowState"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"position"}},{kind:"Field",name:{kind:"Name",value:"color"}},{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"team"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"type"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},xt={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"WorkflowStateConnection"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"WorkflowStateConnection"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"nodes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WorkflowState"}}]}},{kind:"Field",name:{kind:"Name",value:"pageInfo"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PageInfo"}}]}}]}},...qt.definitions,...Yi.definitions]},Ct={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"WorkflowStatePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"WorkflowStatePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"workflowState"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"}}]}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},Ot={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"administrableTeams"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"TeamFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"administrableTeams"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamConnection"}}]}}]}},...st.definitions]},Pt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"applicationWithAuthorization"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"clientId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"scope"}},type:{kind:"NonNullType",type:{kind:"ListType",type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"applicationWithAuthorization"},arguments:[{kind:"Argument",name:{kind:"Name",value:"clientId"},value:{kind:"Variable",name:{kind:"Name",value:"clientId"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}},{kind:"Argument",name:{kind:"Name",value:"scope"},value:{kind:"Variable",name:{kind:"Name",value:"scope"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserAuthorizedApplication"}}]}}]}},...Ei.definitions]},jt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachment"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachment"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Attachment"}}]}}]}},...an.definitions]},Ut={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentIssue"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Issue"}}]}}]}},...la.definitions]},Bt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentIssue_attachments"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"AttachmentFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachments"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentConnection"}}]}}]}}]}},...tn.definitions]},Et={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentIssue_children"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"children"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},zt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentIssue_comments"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"CommentFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"comments"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CommentConnection"}}]}}]}}]}},...hn.definitions]},Lt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentIssue_history"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"history"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueHistoryConnection"}}]}}]}}]}},...va.definitions]},Mt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentIssue_inverseRelations"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"inverseRelations"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelationConnection"}}]}}]}}]}},...Da.definitions]},Rt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentIssue_labels"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueLabelFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"labels"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueLabelConnection"}}]}}]}}]}},...ha.definitions]},Qt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentIssue_relations"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"relations"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelationConnection"}}]}}]}}]}},...Da.definitions]},Wt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentIssue_subscribers"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"UserFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"subscribers"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"includeDisabled"},value:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserConnection"}}]}}]}}]}},...yt.definitions]},Ht={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachments"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"AttachmentFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachments"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentConnection"}}]}}]}},...tn.definitions]},Gt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"attachmentsForURL"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"url"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentsForURL"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}},{kind:"Argument",name:{kind:"Name",value:"url"},value:{kind:"Variable",name:{kind:"Name",value:"url"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentConnection"}}]}}]}},...tn.definitions]},Jt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"auditEntries"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"AuditEntryFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"auditEntries"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AuditEntryConnection"}}]}}]}},...rn.definitions]},$t={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"auditEntryTypes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"auditEntryTypes"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AuditEntryType"}}]}}]}},...on.definitions]},Kt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"authorizedApplications"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"authorizedApplications"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AuthorizedApplication"}}]}}]}},...Bi.definitions]},Zt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"availableUsers"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"availableUsers"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AuthResolverResponse"}}]}}]}},...mn.definitions]},Yt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"billingDetails"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"billingDetails"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"BillingDetailsPayload"}}]}}]}},...cn.definitions]},Xt={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"billingDetails_paymentMethod"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"billingDetails"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"paymentMethod"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Card"}}]}}]}}]}},...kn.definitions]},ed={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"collaborativeDocumentJoin"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"clientId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"issueId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"version"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"collaborativeDocumentJoin"},arguments:[{kind:"Argument",name:{kind:"Name",value:"clientId"},value:{kind:"Variable",name:{kind:"Name",value:"clientId"}}},{kind:"Argument",name:{kind:"Name",value:"issueId"},value:{kind:"Variable",name:{kind:"Name",value:"issueId"}}},{kind:"Argument",name:{kind:"Name",value:"version"},value:{kind:"Variable",name:{kind:"Name",value:"version"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CollaborationDocumentUpdatePayload"}}]}}]}},...pn.definitions]},id={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"collaborativeDocumentJoin_steps"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"clientId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"issueId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"version"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"collaborativeDocumentJoin"},arguments:[{kind:"Argument",name:{kind:"Name",value:"clientId"},value:{kind:"Variable",name:{kind:"Name",value:"clientId"}}},{kind:"Argument",name:{kind:"Name",value:"issueId"},value:{kind:"Variable",name:{kind:"Name",value:"issueId"}}},{kind:"Argument",name:{kind:"Name",value:"version"},value:{kind:"Variable",name:{kind:"Name",value:"version"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"steps"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"StepsResponse"}}]}}]}}]}},...Nn.definitions]},nd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"comment"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"comment"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Comment"}}]}}]}},...fn.definitions]},ad={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"comments"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"CommentFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"comments"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CommentConnection"}}]}}]}},...hn.definitions]},td={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"customView"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"customView"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CustomView"}}]}}]}},...Dn.definitions]},dd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"customViews"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"customViews"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CustomViewConnection"}}]}}]}},...Vn.definitions]},ld={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"cycle"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycle"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Cycle"}}]}}]}},...An.definitions]},rd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"cycle_issues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycle"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},od={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"cycle_uncompletedIssuesUponClose"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycle"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"uncompletedIssuesUponClose"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},sd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"cycles"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"CycleFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycles"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CycleConnection"}}]}}]}},...Tn.definitions]},md={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"document"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"document"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Document"}}]}}]}},...wn.definitions]},ud={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"documents"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"documents"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"DocumentConnection"}}]}}]}},...qn.definitions]},kd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"emoji"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emoji"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Emoji"}}]}}]}},...Bn.definitions]},cd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"emojis"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emojis"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"EmojiConnection"}}]}}]}},...En.definitions]},vd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"favorite"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"favorite"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Favorite"}}]}}]}},...Mn.definitions]},Nd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"favorite_children"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"favorite"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"children"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"FavoriteConnection"}}]}}]}}]}},...Rn.definitions]},pd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"favorites"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"favorites"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"FavoriteConnection"}}]}}]}},...Rn.definitions]},fd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"figmaEmbedInfo"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"fileId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"nodeId"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"figmaEmbedInfo"},arguments:[{kind:"Argument",name:{kind:"Name",value:"fileId"},value:{kind:"Variable",name:{kind:"Name",value:"fileId"}}},{kind:"Argument",name:{kind:"Name",value:"nodeId"},value:{kind:"Variable",name:{kind:"Name",value:"nodeId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"FigmaEmbedPayload"}}]}}]}},...Gn.definitions]},hd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"figmaEmbedInfo_figmaEmbed"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"fileId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"nodeId"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"figmaEmbedInfo"},arguments:[{kind:"Argument",name:{kind:"Name",value:"fileId"},value:{kind:"Variable",name:{kind:"Name",value:"fileId"}}},{kind:"Argument",name:{kind:"Name",value:"nodeId"},value:{kind:"Variable",name:{kind:"Name",value:"nodeId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"figmaEmbed"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"FigmaEmbed"}}]}}]}}]}},...Hn.definitions]},bd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"integration"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integration"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Integration"}}]}}]}},...Zn.definitions]},yd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"integrations"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrations"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationConnection"}}]}}]}},...Yn.definitions]},Sd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issue"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Issue"}}]}}]}},...la.definitions]},gd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issue_attachments"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"AttachmentFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachments"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentConnection"}}]}}]}}]}},...tn.definitions]},Dd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issue_children"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"children"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},Vd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issue_comments"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"CommentFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"comments"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CommentConnection"}}]}}]}}]}},...hn.definitions]},Fd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issue_history"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"history"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueHistoryConnection"}}]}}]}}]}},...va.definitions]},Ad={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issue_inverseRelations"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"inverseRelations"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelationConnection"}}]}}]}}]}},...Da.definitions]},Td={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issue_labels"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueLabelFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"labels"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueLabelConnection"}}]}}]}}]}},...ha.definitions]},_d={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issue_relations"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"relations"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelationConnection"}}]}}]}}]}},...Da.definitions]},Id={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issue_subscribers"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"UserFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"subscribers"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"includeDisabled"},value:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserConnection"}}]}}]}}]}},...yt.definitions]},wd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issueImportFinishGithubOAuth"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueImportFinishGithubOAuth"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"GithubOAuthTokenPayload"}}]}}]}},...Ui.definitions]},qd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issueLabel"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueLabel"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueLabel"}}]}}]}},...fa.definitions]},xd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issueLabel_issues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueLabel"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},Cd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issueLabels"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueLabelFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueLabels"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueLabelConnection"}}]}}]}},...ha.definitions]},Od={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issuePriorityValues"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issuePriorityValues"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssuePriorityValue"}}]}}]}},...Sa.definitions]},Pd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issueRelation"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueRelation"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelation"}}]}}]}},...ga.definitions]},jd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issueRelations"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueRelations"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelationConnection"}}]}}]}},...Da.definitions]},Ud={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issueSearch"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"query"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueSearch"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}},{kind:"Argument",name:{kind:"Name",value:"query"},value:{kind:"Variable",name:{kind:"Name",value:"query"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}},...oa.definitions]},Bd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"issues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}},...oa.definitions]},Ed={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"milestone"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"milestone"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Milestone"}}]}}]}},...Fa.definitions]},zd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"milestone_projects"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"ProjectFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"milestone"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projects"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectConnection"}}]}}]}}]}},...Ja.definitions]},Ld={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"milestones"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"MilestoneFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"milestones"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"MilestoneConnection"}}]}}]}},...Aa.definitions]},Md={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"notification"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notification"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Notification"}}]}}]}},..._a.definitions]},Rd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"notificationSubscription"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notificationSubscription"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"NotificationSubscription"}}]}}]}},...qa.definitions]},Qd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"notificationSubscriptions"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notificationSubscriptions"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"NotificationSubscriptionConnection"}}]}}]}},...xa.definitions]},Wd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"notifications"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notifications"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"NotificationConnection"}}]}}]}},...Ia.definitions]},Hd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organization"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organization"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Organization"}}]}}]}},...sn.definitions]},Gd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organization_integrations"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organization"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrations"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationConnection"}}]}}]}}]}},...Yn.definitions]},Jd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organization_labels"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueLabelFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organization"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"labels"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueLabelConnection"}}]}}]}}]}},...ha.definitions]},$d={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organization_milestones"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"MilestoneFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organization"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"milestones"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"MilestoneConnection"}}]}}]}}]}},...Aa.definitions]},Kd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organization_teams"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"TeamFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organization"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teams"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamConnection"}}]}}]}}]}},...st.definitions]},Zd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organization_templates"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organization"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"templates"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TemplateConnection"}}]}}]}}]}},...vt.definitions]},Yd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organization_users"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organization"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"users"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"includeDisabled"},value:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserConnection"}}]}}]}}]}},...yt.definitions]},Xd={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organizationExists"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"urlKey"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationExists"},arguments:[{kind:"Argument",name:{kind:"Name",value:"urlKey"},value:{kind:"Variable",name:{kind:"Name",value:"urlKey"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationExistsPayload"}}]}}]}},...La.definitions]},el={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organizationInvite"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationInvite"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationInvite"}}]}}]}},...Ma.definitions]},il={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organizationInviteDetails"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationInviteDetails"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationInviteDetailsPayload"}}]}}]}},...Qa.definitions]},nl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"organizationInvites"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationInvites"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationInviteConnection"}}]}}]}},...Ra.definitions]},al={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"project"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"project"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Project"}}]}}]}},...Ga.definitions]},tl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"project_documents"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"project"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"documents"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"DocumentConnection"}}]}}]}}]}},...qn.definitions]},dl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"project_issues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"project"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},ll={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"project_links"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"project"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"links"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectLinkConnection"}}]}}]}}]}},...Ka.definitions]},rl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"project_members"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"UserFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"project"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"members"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"includeDisabled"},value:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserConnection"}}]}}]}}]}},...yt.definitions]},ol={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"project_teams"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"TeamFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"project"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teams"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamConnection"}}]}}]}}]}},...st.definitions]},sl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"projectLink"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projectLink"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectLink"}}]}}]}},...$a.definitions]},ml={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"projectLinks"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projectLinks"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectLinkConnection"}}]}}]}},...Ka.definitions]},ul={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"projects"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"ProjectFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projects"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectConnection"}}]}}]}},...Ja.definitions]},kl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"pushSubscriptionTest"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"pushSubscriptionTest"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PushSubscriptionTestPayload"}}]}}]}},...nt.definitions]},cl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"reaction"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"reaction"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Reaction"}}]}}]}},...at.definitions]},vl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"reactions"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"reactions"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ReactionConnection"}}]}}]}},...tt.definitions]},Nl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"ssoUrlFromEmail"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"email"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"isDesktop"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"ssoUrlFromEmail"},arguments:[{kind:"Argument",name:{kind:"Name",value:"email"},value:{kind:"Variable",name:{kind:"Name",value:"email"}}},{kind:"Argument",name:{kind:"Name",value:"isDesktop"},value:{kind:"Variable",name:{kind:"Name",value:"isDesktop"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"SsoUrlFromEmailResponse"}}]}}]}},...rt.definitions]},pl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"subscription"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"subscription"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Subscription"}}]}}]}},...Ki.definitions]},fl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Team"}}]}}]}},...ot.definitions]},hl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team_cycles"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"CycleFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycles"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CycleConnection"}}]}}]}}]}},...Tn.definitions]},bl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team_issues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},yl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team_labels"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueLabelFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"labels"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueLabelConnection"}}]}}]}}]}},...ha.definitions]},Sl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team_members"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"UserFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"members"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"includeDisabled"},value:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserConnection"}}]}}]}}]}},...yt.definitions]},gl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team_memberships"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"memberships"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamMembershipConnection"}}]}}]}}]}},...ut.definitions]},Dl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team_projects"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"ProjectFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projects"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectConnection"}}]}}]}}]}},...Ja.definitions]},Vl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team_states"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"WorkflowStateFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"states"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WorkflowStateConnection"}}]}}]}}]}},...xt.definitions]},Fl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team_templates"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"templates"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TemplateConnection"}}]}}]}}]}},...vt.definitions]},Al={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"team_webhooks"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"team"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"webhooks"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WebhookConnection"}}]}}]}}]}},...It.definitions]},Tl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"teamMembership"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamMembership"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamMembership"}}]}}]}},...mt.definitions]},_l={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"teamMemberships"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamMemberships"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamMembershipConnection"}}]}}]}},...ut.definitions]},Il={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"teams"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"TeamFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teams"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamConnection"}}]}}]}},...st.definitions]},wl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"template"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"template"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Template"}}]}}]}},...xi.definitions]},ql={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"templates"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"templates"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Template"}}]}}]}},...xi.definitions]},xl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"user"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"user"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"User"}}]}}]}},...Ci.definitions]},Cl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"user_assignedIssues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"user"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"assignedIssues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},Ol={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"user_createdIssues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"user"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"createdIssues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},Pl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"user_teamMemberships"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"user"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamMemberships"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamMembershipConnection"}}]}}]}}]}},...ut.definitions]},jl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"user_teams"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"TeamFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"user"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teams"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamConnection"}}]}}]}}]}},...st.definitions]},Ul={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"userSettings"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userSettings"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserSettings"}}]}}]}},...$i.definitions]},Bl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"users"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"UserFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"users"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"includeDisabled"},value:{kind:"Variable",name:{kind:"Name",value:"includeDisabled"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserConnection"}}]}}]}},...yt.definitions]},El={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"viewer"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"viewer"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"User"}}]}}]}},...Ci.definitions]},zl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"viewer_assignedIssues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"viewer"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"assignedIssues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},Ll={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"viewer_createdIssues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"viewer"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"createdIssues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},Ml={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"viewer_teamMemberships"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"viewer"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamMemberships"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamMembershipConnection"}}]}}]}}]}},...ut.definitions]},Rl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"viewer_teams"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"TeamFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"viewer"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teams"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamConnection"}}]}}]}}]}},...st.definitions]},Ql={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"webhook"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"webhook"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"Webhook"}}]}}]}},..._t.definitions]},Wl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"webhooks"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"webhooks"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WebhookConnection"}}]}}]}},...It.definitions]},Hl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"workflowState"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"workflowState"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WorkflowState"}}]}}]}},...qt.definitions]},Gl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"workflowState_issues"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"IssueFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"workflowState"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issues"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueConnection"}}]}}]}}]}},...oa.definitions]},Jl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"workflowStates"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"after"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"before"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filter"}},type:{kind:"NamedType",name:{kind:"Name",value:"WorkflowStateFilter"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"first"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"last"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"PaginationOrderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"workflowStates"},arguments:[{kind:"Argument",name:{kind:"Name",value:"after"},value:{kind:"Variable",name:{kind:"Name",value:"after"}}},{kind:"Argument",name:{kind:"Name",value:"before"},value:{kind:"Variable",name:{kind:"Name",value:"before"}}},{kind:"Argument",name:{kind:"Name",value:"filter"},value:{kind:"Variable",name:{kind:"Name",value:"filter"}}},{kind:"Argument",name:{kind:"Name",value:"first"},value:{kind:"Variable",name:{kind:"Name",value:"first"}}},{kind:"Argument",name:{kind:"Name",value:"includeArchived"},value:{kind:"Variable",name:{kind:"Name",value:"includeArchived"}}},{kind:"Argument",name:{kind:"Name",value:"last"},value:{kind:"Variable",name:{kind:"Name",value:"last"}}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WorkflowStateConnection"}}]}}]}},...xt.definitions]},$l={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"attachmentArchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentArchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Kl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"attachmentCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AttachmentCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentPayload"}}]}}]}},...dn.definitions]},Zl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"attachmentDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Yl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"attachmentLinkFront"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"conversationId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"issueId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentLinkFront"},arguments:[{kind:"Argument",name:{kind:"Name",value:"conversationId"},value:{kind:"Variable",name:{kind:"Name",value:"conversationId"}}},{kind:"Argument",name:{kind:"Name",value:"issueId"},value:{kind:"Variable",name:{kind:"Name",value:"issueId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"FrontAttachmentPayload"}}]}}]}},...Jn.definitions]},Xl={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"attachmentLinkIntercom"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"conversationId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"issueId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentLinkIntercom"},arguments:[{kind:"Argument",name:{kind:"Name",value:"conversationId"},value:{kind:"Variable",name:{kind:"Name",value:"conversationId"}}},{kind:"Argument",name:{kind:"Name",value:"issueId"},value:{kind:"Variable",name:{kind:"Name",value:"issueId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentPayload"}}]}}]}},...dn.definitions]},er={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"attachmentLinkJiraIssue"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"issueId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"jiraIssueId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentLinkJiraIssue"},arguments:[{kind:"Argument",name:{kind:"Name",value:"issueId"},value:{kind:"Variable",name:{kind:"Name",value:"issueId"}}},{kind:"Argument",name:{kind:"Name",value:"jiraIssueId"},value:{kind:"Variable",name:{kind:"Name",value:"jiraIssueId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentPayload"}}]}}]}},...dn.definitions]},ir={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"attachmentLinkURL"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"issueId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"title"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"url"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentLinkURL"},arguments:[{kind:"Argument",name:{kind:"Name",value:"issueId"},value:{kind:"Variable",name:{kind:"Name",value:"issueId"}}},{kind:"Argument",name:{kind:"Name",value:"title"},value:{kind:"Variable",name:{kind:"Name",value:"title"}}},{kind:"Argument",name:{kind:"Name",value:"url"},value:{kind:"Variable",name:{kind:"Name",value:"url"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentPayload"}}]}}]}},...dn.definitions]},nr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"attachmentLinkZendesk"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"issueId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"ticketId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentLinkZendesk"},arguments:[{kind:"Argument",name:{kind:"Name",value:"issueId"},value:{kind:"Variable",name:{kind:"Name",value:"issueId"}}},{kind:"Argument",name:{kind:"Name",value:"ticketId"},value:{kind:"Variable",name:{kind:"Name",value:"ticketId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentPayload"}}]}}]}},...dn.definitions]},ar={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"attachmentUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"AttachmentUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"attachmentUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AttachmentPayload"}}]}}]}},...dn.definitions]},tr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"billingEmailUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"BillingEmailUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"billingEmailUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"BillingEmailPayload"}}]}}]}},...vn.definitions]},dr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"collaborativeDocumentUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CollaborationDocumentUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"collaborativeDocumentUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CollaborationDocumentUpdatePayload"}}]}}]}},...pn.definitions]},lr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"commentCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CommentCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"commentCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CommentPayload"}}]}}]}},...bn.definitions]},rr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"commentDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"commentDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},or={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"commentUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CommentUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"commentUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CommentPayload"}}]}}]}},...bn.definitions]},sr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"contactCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ContactCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"contactCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ContactPayload"}}]}}]}},...yn.definitions]},mr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"createCsvExportReport"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includePrivateTeamIds"}},type:{kind:"ListType",type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"createCsvExportReport"},arguments:[{kind:"Argument",name:{kind:"Name",value:"includePrivateTeamIds"},value:{kind:"Variable",name:{kind:"Name",value:"includePrivateTeamIds"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CreateCsvExportReportPayload"}}]}}]}},...Sn.definitions]},ur={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"createOrganizationFromOnboarding"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CreateOrganizationInput"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"survey"}},type:{kind:"NamedType",name:{kind:"Name",value:"OnboardingCustomerSurvey"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"createOrganizationFromOnboarding"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}},{kind:"Argument",name:{kind:"Name",value:"survey"},value:{kind:"Variable",name:{kind:"Name",value:"survey"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CreateOrJoinOrganizationResponse"}}]}}]}},...gn.definitions]},kr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"customViewCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CustomViewCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"customViewCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CustomViewPayload"}}]}}]}},...Fn.definitions]},cr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"customViewDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"customViewDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},vr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"customViewUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CustomViewUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"customViewUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CustomViewPayload"}}]}}]}},...Fn.definitions]},Nr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"cycleArchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycleArchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},pr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"cycleCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CycleCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycleCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CyclePayload"}}]}}]}},..._n.definitions]},fr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"cycleUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"CycleUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"cycleUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CyclePayload"}}]}}]}},..._n.definitions]},hr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"debugFailWithInternalError"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"debugFailWithInternalError"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"DebugPayload"}}]}}]}},...In.definitions]},br={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"documentCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"DocumentCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"documentCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"DocumentPayload"}}]}}]}},...xn.definitions]},yr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"documentDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"documentDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Sr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"documentUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"DocumentUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"documentUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"DocumentPayload"}}]}}]}},...xn.definitions]},gr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"emailSubscribe"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"EmailSubscribeInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emailSubscribe"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"EmailSubscribePayload"}}]}}]}},...Pn.definitions]},Dr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"emailTokenUserAccountAuth"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"TokenUserAccountAuthInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emailTokenUserAccountAuth"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AuthResolverResponse"}}]}}]}},...mn.definitions]},Vr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"emailUnsubscribe"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"EmailUnsubscribeInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emailUnsubscribe"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"EmailUnsubscribePayload"}}]}}]}},...jn.definitions]},Fr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"emailUserAccountAuthChallenge"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"EmailUserAccountAuthChallengeInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emailUserAccountAuthChallenge"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"EmailUserAccountAuthChallengeResponse"}}]}}]}},...Un.definitions]},Ar={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"emojiCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"EmojiCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emojiCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"EmojiPayload"}}]}}]}},...zn.definitions]},Tr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"emojiDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"emojiDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},_r={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"eventCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"EventCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"eventCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"EventPayload"}}]}}]}},...Ln.definitions]},Ir={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"favoriteCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"FavoriteCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"favoriteCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"FavoritePayload"}}]}}]}},...Qn.definitions]},wr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"favoriteDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"favoriteDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},qr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"favoriteUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"FavoriteUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"favoriteUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"FavoritePayload"}}]}}]}},...Qn.definitions]},xr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"feedbackCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"FeedbackCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"feedbackCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"FeedbackPayload"}}]}}]}},...Wn.definitions]},Cr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"fileUpload"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"contentType"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"filename"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"metaData"}},type:{kind:"NamedType",name:{kind:"Name",value:"JSON"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"size"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"Int"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"fileUpload"},arguments:[{kind:"Argument",name:{kind:"Name",value:"contentType"},value:{kind:"Variable",name:{kind:"Name",value:"contentType"}}},{kind:"Argument",name:{kind:"Name",value:"filename"},value:{kind:"Variable",name:{kind:"Name",value:"filename"}}},{kind:"Argument",name:{kind:"Name",value:"metaData"},value:{kind:"Variable",name:{kind:"Name",value:"metaData"}}},{kind:"Argument",name:{kind:"Name",value:"size"},value:{kind:"Variable",name:{kind:"Name",value:"size"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UploadPayload"}}]}}]}},...ht.definitions]},Or={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"googleUserAccountAuth"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"GoogleUserAccountAuthInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"googleUserAccountAuth"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AuthResolverResponse"}}]}}]}},...mn.definitions]},Pr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"imageUploadFromUrl"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"url"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"imageUploadFromUrl"},arguments:[{kind:"Argument",name:{kind:"Name",value:"url"},value:{kind:"Variable",name:{kind:"Name",value:"url"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ImageUploadFromUrlPayload"}}]}}]}},...Kn.definitions]},jr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Ur={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationFigma"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationFigma"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Br={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationFront"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationFront"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Er={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationGithubCommitCreate"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationGithubCommitCreate"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"GitHubCommitIntegrationPayload"}}]}}]}},...$n.definitions]},zr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationGithubConnect"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"installationId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationGithubConnect"},arguments:[{kind:"Argument",name:{kind:"Name",value:"installationId"},value:{kind:"Variable",name:{kind:"Name",value:"installationId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Lr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationGitlabConnect"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"accessToken"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"gitlabUrl"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationGitlabConnect"},arguments:[{kind:"Argument",name:{kind:"Name",value:"accessToken"},value:{kind:"Variable",name:{kind:"Name",value:"accessToken"}}},{kind:"Argument",name:{kind:"Name",value:"gitlabUrl"},value:{kind:"Variable",name:{kind:"Name",value:"gitlabUrl"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Mr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationGoogleSheets"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationGoogleSheets"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Rr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationIntercom"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationIntercom"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Qr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationIntercomDelete"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationIntercomDelete"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Wr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationIntercomSettingsUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IntercomSettingsInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationIntercomSettingsUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Hr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationLoom"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationLoom"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Gr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationResourceArchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationResourceArchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Jr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationSentryConnect"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"installationId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"organizationSlug"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationSentryConnect"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"installationId"},value:{kind:"Variable",name:{kind:"Name",value:"installationId"}}},{kind:"Argument",name:{kind:"Name",value:"organizationSlug"},value:{kind:"Variable",name:{kind:"Name",value:"organizationSlug"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},$r={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationSettingsUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IntegrationSettingsInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationSettingsUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Kr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationSlack"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"shouldUseV2Auth"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationSlack"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}},{kind:"Argument",name:{kind:"Name",value:"shouldUseV2Auth"},value:{kind:"Variable",name:{kind:"Name",value:"shouldUseV2Auth"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Zr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationSlackImportEmojis"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationSlackImportEmojis"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Yr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationSlackPersonal"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationSlackPersonal"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Xr={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationSlackPost"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"shouldUseV2Auth"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"teamId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationSlackPost"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}},{kind:"Argument",name:{kind:"Name",value:"shouldUseV2Auth"},value:{kind:"Variable",name:{kind:"Name",value:"shouldUseV2Auth"}}},{kind:"Argument",name:{kind:"Name",value:"teamId"},value:{kind:"Variable",name:{kind:"Name",value:"teamId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},eo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationSlackProjectPost"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"projectId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationSlackProjectPost"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"projectId"},value:{kind:"Variable",name:{kind:"Name",value:"projectId"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},io={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"integrationZendesk"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"code"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"scope"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"subdomain"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"integrationZendesk"},arguments:[{kind:"Argument",name:{kind:"Name",value:"code"},value:{kind:"Variable",name:{kind:"Name",value:"code"}}},{kind:"Argument",name:{kind:"Name",value:"redirectUri"},value:{kind:"Variable",name:{kind:"Name",value:"redirectUri"}}},{kind:"Argument",name:{kind:"Name",value:"scope"},value:{kind:"Variable",name:{kind:"Name",value:"scope"}}},{kind:"Argument",name:{kind:"Name",value:"subdomain"},value:{kind:"Variable",name:{kind:"Name",value:"subdomain"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},no={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueArchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"trash"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueArchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"trash"},value:{kind:"Variable",name:{kind:"Name",value:"trash"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},ao={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueBatchUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"ids"}},type:{kind:"NonNullType",type:{kind:"ListType",type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"UUID"}}}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IssueUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueBatchUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"ids"},value:{kind:"Variable",name:{kind:"Name",value:"ids"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueBatchPayload"}}]}}]}},...ra.definitions]},to={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IssueCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssuePayload"}}]}}]}},...ya.definitions]},lo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},ro={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueImportCreateAsana"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"asanaTeamName"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"asanaToken"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeClosedIssues"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"instantProcess"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"teamId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueImportCreateAsana"},arguments:[{kind:"Argument",name:{kind:"Name",value:"asanaTeamName"},value:{kind:"Variable",name:{kind:"Name",value:"asanaTeamName"}}},{kind:"Argument",name:{kind:"Name",value:"asanaToken"},value:{kind:"Variable",name:{kind:"Name",value:"asanaToken"}}},{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"includeClosedIssues"},value:{kind:"Variable",name:{kind:"Name",value:"includeClosedIssues"}}},{kind:"Argument",name:{kind:"Name",value:"instantProcess"},value:{kind:"Variable",name:{kind:"Name",value:"instantProcess"}}},{kind:"Argument",name:{kind:"Name",value:"teamId"},value:{kind:"Variable",name:{kind:"Name",value:"teamId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImportPayload"}}]}}]}},...pa.definitions]},oo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueImportCreateClubhouse"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"clubhouseTeamName"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"clubhouseToken"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeClosedIssues"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"instantProcess"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"teamId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueImportCreateClubhouse"},arguments:[{kind:"Argument",name:{kind:"Name",value:"clubhouseTeamName"},value:{kind:"Variable",name:{kind:"Name",value:"clubhouseTeamName"}}},{kind:"Argument",name:{kind:"Name",value:"clubhouseToken"},value:{kind:"Variable",name:{kind:"Name",value:"clubhouseToken"}}},{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"includeClosedIssues"},value:{kind:"Variable",name:{kind:"Name",value:"includeClosedIssues"}}},{kind:"Argument",name:{kind:"Name",value:"instantProcess"},value:{kind:"Variable",name:{kind:"Name",value:"instantProcess"}}},{kind:"Argument",name:{kind:"Name",value:"teamId"},value:{kind:"Variable",name:{kind:"Name",value:"teamId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImportPayload"}}]}}]}},...pa.definitions]},so={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueImportCreateGithub"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"githubRepoName"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"githubRepoOwner"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"githubShouldImportOrgProjects"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"githubToken"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeClosedIssues"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"instantProcess"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"teamId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueImportCreateGithub"},arguments:[{kind:"Argument",name:{kind:"Name",value:"githubRepoName"},value:{kind:"Variable",name:{kind:"Name",value:"githubRepoName"}}},{kind:"Argument",name:{kind:"Name",value:"githubRepoOwner"},value:{kind:"Variable",name:{kind:"Name",value:"githubRepoOwner"}}},{kind:"Argument",name:{kind:"Name",value:"githubShouldImportOrgProjects"},value:{kind:"Variable",name:{kind:"Name",value:"githubShouldImportOrgProjects"}}},{kind:"Argument",name:{kind:"Name",value:"githubToken"},value:{kind:"Variable",name:{kind:"Name",value:"githubToken"}}},{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"includeClosedIssues"},value:{kind:"Variable",name:{kind:"Name",value:"includeClosedIssues"}}},{kind:"Argument",name:{kind:"Name",value:"instantProcess"},value:{kind:"Variable",name:{kind:"Name",value:"instantProcess"}}},{kind:"Argument",name:{kind:"Name",value:"teamId"},value:{kind:"Variable",name:{kind:"Name",value:"teamId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImportPayload"}}]}}]}},...pa.definitions]},mo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueImportCreateJira"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"includeClosedIssues"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"instantProcess"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"jiraEmail"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"jiraHostname"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"jiraProject"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"jiraToken"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"teamId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueImportCreateJira"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"includeClosedIssues"},value:{kind:"Variable",name:{kind:"Name",value:"includeClosedIssues"}}},{kind:"Argument",name:{kind:"Name",value:"instantProcess"},value:{kind:"Variable",name:{kind:"Name",value:"instantProcess"}}},{kind:"Argument",name:{kind:"Name",value:"jiraEmail"},value:{kind:"Variable",name:{kind:"Name",value:"jiraEmail"}}},{kind:"Argument",name:{kind:"Name",value:"jiraHostname"},value:{kind:"Variable",name:{kind:"Name",value:"jiraHostname"}}},{kind:"Argument",name:{kind:"Name",value:"jiraProject"},value:{kind:"Variable",name:{kind:"Name",value:"jiraProject"}}},{kind:"Argument",name:{kind:"Name",value:"jiraToken"},value:{kind:"Variable",name:{kind:"Name",value:"jiraToken"}}},{kind:"Argument",name:{kind:"Name",value:"teamId"},value:{kind:"Variable",name:{kind:"Name",value:"teamId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImportPayload"}}]}}]}},...pa.definitions]},uo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueImportDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"issueImportId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueImportDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"issueImportId"},value:{kind:"Variable",name:{kind:"Name",value:"issueImportId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImportDeletePayload"}}]}}]}},...Na.definitions]},ko={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueImportProcess"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"issueImportId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"mapping"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"JSONObject"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueImportProcess"},arguments:[{kind:"Argument",name:{kind:"Name",value:"issueImportId"},value:{kind:"Variable",name:{kind:"Name",value:"issueImportId"}}},{kind:"Argument",name:{kind:"Name",value:"mapping"},value:{kind:"Variable",name:{kind:"Name",value:"mapping"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImportPayload"}}]}}]}},...pa.definitions]},co={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueImportUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IssueImportUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueImportUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueImportPayload"}}]}}]}},...pa.definitions]},vo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueLabelArchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueLabelArchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},No={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueLabelCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IssueLabelCreateInput"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"replaceTeamLabels"}},type:{kind:"NamedType",name:{kind:"Name",value:"Boolean"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueLabelCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}},{kind:"Argument",name:{kind:"Name",value:"replaceTeamLabels"},value:{kind:"Variable",name:{kind:"Name",value:"replaceTeamLabels"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueLabelPayload"}}]}}]}},...ba.definitions]},po={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueLabelUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IssueLabelUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueLabelUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueLabelPayload"}}]}}]}},...ba.definitions]},fo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueRelationCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IssueRelationCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueRelationCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelationPayload"}}]}}]}},...Va.definitions]},ho={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueRelationDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueRelationDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},bo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueRelationUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IssueRelationUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueRelationUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssueRelationPayload"}}]}}]}},...Va.definitions]},yo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueUnarchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueUnarchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},So={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"issueUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"IssueUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"issueUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IssuePayload"}}]}}]}},...ya.definitions]},go={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"jiraIntegrationConnect"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"JiraConfigurationInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"jiraIntegrationConnect"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},Do={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"joinOrganizationFromOnboarding"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"JoinOrganizationInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"joinOrganizationFromOnboarding"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CreateOrJoinOrganizationResponse"}}]}}]}},...gn.definitions]},Vo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"leaveOrganization"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"organizationId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"leaveOrganization"},arguments:[{kind:"Argument",name:{kind:"Name",value:"organizationId"},value:{kind:"Variable",name:{kind:"Name",value:"organizationId"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"CreateOrJoinOrganizationResponse"}}]}}]}},...gn.definitions]},Fo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"milestoneCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"MilestoneCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"milestoneCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"MilestonePayload"}}]}}]}},...Ta.definitions]},Ao={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"milestoneDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"milestoneDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},To={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"milestoneUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"MilestoneUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"milestoneUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"MilestonePayload"}}]}}]}},...Ta.definitions]},_o={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"notificationArchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notificationArchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Io={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"notificationCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"NotificationUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notificationCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"NotificationPayload"}}]}}]}},...wa.definitions]},wo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"notificationSubscriptionCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"NotificationSubscriptionCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notificationSubscriptionCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"NotificationSubscriptionPayload"}}]}}]}},...Ca.definitions]},qo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"notificationSubscriptionDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notificationSubscriptionDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},xo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"notificationUnarchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notificationUnarchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Co={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"notificationUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"NotificationUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"notificationUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"NotificationPayload"}}]}}]}},...wa.definitions]},Oo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"oauthClientArchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"oauthClientArchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Po={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"oauthClientCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"OauthClientCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"oauthClientCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OauthClientPayload"}}]}}]}},...Pa.definitions]},jo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"oauthClientRotateSecret"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"oauthClientRotateSecret"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"RotateSecretPayload"}}]}}]}},...lt.definitions]},Uo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"oauthClientUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"OauthClientUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"oauthClientUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OauthClientPayload"}}]}}]}},...Pa.definitions]},Bo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"oauthTokenRevoke"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"appId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"scope"}},type:{kind:"NonNullType",type:{kind:"ListType",type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"oauthTokenRevoke"},arguments:[{kind:"Argument",name:{kind:"Name",value:"appId"},value:{kind:"Variable",name:{kind:"Name",value:"appId"}}},{kind:"Argument",name:{kind:"Name",value:"scope"},value:{kind:"Variable",name:{kind:"Name",value:"scope"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OauthTokenRevokePayload"}}]}}]}},...ja.definitions]},Eo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"organizationCancelDelete"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationCancelDelete"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationCancelDeletePayload"}}]}}]}},...Ua.definitions]},zo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"organizationDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"DeleteOrganizationInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationDeletePayload"}}]}}]}},...Ba.definitions]},Lo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"organizationDeleteChallenge"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationDeleteChallenge"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationDeletePayload"}}]}}]}},...Ba.definitions]},Mo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"organizationDomainCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"OrganizationDomainCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationDomainCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationDomainPayload"}}]}}]}},...za.definitions]},Ro={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"organizationDomainDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationDomainDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Qo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"organizationDomainVerify"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"OrganizationDomainVerificationInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationDomainVerify"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationDomainPayload"}}]}}]}},...za.definitions]},Wo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"organizationInviteCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"OrganizationInviteCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationInviteCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationInvitePayload"}}]}}]}},...Wa.definitions]},Ho={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"organizationInviteDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationInviteDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Go={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"organizationUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"UpdateOrganizationInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"organizationUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"OrganizationPayload"}}]}}]}},...Ha.definitions]},Jo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"projectArchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projectArchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},$o={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"projectCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ProjectCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projectCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectPayload"}}]}}]}},...Ya.definitions]},Ko={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"projectLinkCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ProjectLinkCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projectLinkCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectLinkPayload"}}]}}]}},...Za.definitions]},Zo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"projectLinkDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projectLinkDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Yo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"projectLinkUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ProjectLinkUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projectLinkUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectLinkPayload"}}]}}]}},...Za.definitions]},Xo={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"projectUnarchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projectUnarchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},es={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"projectUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ProjectUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"projectUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ProjectPayload"}}]}}]}},...Ya.definitions]},is={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"pushSubscriptionCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"PushSubscriptionCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"pushSubscriptionCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PushSubscriptionPayload"}}]}}]}},...it.definitions]},ns={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"pushSubscriptionDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"pushSubscriptionDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"PushSubscriptionPayload"}}]}}]}},...it.definitions]},as={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"reactionCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ReactionCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"reactionCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ReactionPayload"}}]}}]}},...dt.definitions]},ts={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"reactionDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"reactionDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},ds={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"refreshGoogleSheetsData"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"refreshGoogleSheetsData"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"IntegrationPayload"}}]}}]}},...Xn.definitions]},ls={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"resendOrganizationInvite"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"resendOrganizationInvite"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},rs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"samlTokenUserAccountAuth"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"TokenUserAccountAuthInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"samlTokenUserAccountAuth"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"AuthResolverResponse"}}]}}]}},...mn.definitions]},os={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"teamCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"copySettingsFromTeamId"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"TeamCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"copySettingsFromTeamId"},value:{kind:"Variable",name:{kind:"Name",value:"copySettingsFromTeamId"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamPayload"}}]}}]}},...ct.definitions]},ss={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"teamDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},ms={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"teamKeyDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamKeyDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},us={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"teamMembershipCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"TeamMembershipCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamMembershipCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamMembershipPayload"}}]}}]}},...kt.definitions]},ks={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"teamMembershipDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamMembershipDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},cs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"teamMembershipUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"TeamMembershipUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamMembershipUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamMembershipPayload"}}]}}]}},...kt.definitions]},vs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"teamUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"TeamUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"teamUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TeamPayload"}}]}}]}},...ct.definitions]},Ns={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"templateCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"TemplateCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"templateCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TemplatePayload"}}]}}]}},...Nt.definitions]},ps={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"templateDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"templateDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},fs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"templateUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"TemplateUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"templateUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"TemplatePayload"}}]}}]}},...Nt.definitions]},hs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userDemoteAdmin"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userDemoteAdmin"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserAdminPayload"}}]}}]}},...bt.definitions]},bs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userFlagUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"flag"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"UserFlagType"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"operation"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"UserFlagUpdateOperation"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userFlagUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"flag"},value:{kind:"Variable",name:{kind:"Name",value:"flag"}}},{kind:"Argument",name:{kind:"Name",value:"operation"},value:{kind:"Variable",name:{kind:"Name",value:"operation"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserSettingsFlagPayload"}}]}}]}},...gt.definitions]},ys={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userPromoteAdmin"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userPromoteAdmin"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserAdminPayload"}}]}}]}},...bt.definitions]},Ss={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userSettingsFlagIncrement"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"flag"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userSettingsFlagIncrement"},arguments:[{kind:"Argument",name:{kind:"Name",value:"flag"},value:{kind:"Variable",name:{kind:"Name",value:"flag"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserSettingsFlagPayload"}}]}}]}},...gt.definitions]},gs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userSettingsFlagsReset"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userSettingsFlagsReset"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserSettingsFlagsResetPayload"}}]}}]}},...Dt.definitions]},Ds={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userSettingsUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"UserSettingsUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userSettingsUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserSettingsPayload"}}]}}]}},...Vt.definitions]},Vs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userSubscribeToNewsletter"},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userSubscribeToNewsletter"},selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserSubscribeToNewsletterPayload"}}]}}]}},...Ft.definitions]},Fs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userSuspend"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userSuspend"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserAdminPayload"}}]}}]}},...bt.definitions]},As={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userUnsuspend"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userUnsuspend"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserAdminPayload"}}]}}]}},...bt.definitions]},Ts={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"userUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"UpdateUserInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"userUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"UserPayload"}}]}}]}},...St.definitions]},_s={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"viewPreferencesCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ViewPreferencesCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"viewPreferencesCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ViewPreferencesPayload"}}]}}]}},...Tt.definitions]},Is={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"viewPreferencesDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"viewPreferencesDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},ws={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"viewPreferencesUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"ViewPreferencesUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"viewPreferencesUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ViewPreferencesPayload"}}]}}]}},...Tt.definitions]},qs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"webhookCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"WebhookCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"webhookCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WebhookPayload"}}]}}]}},...wt.definitions]},xs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"webhookDelete"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"webhookDelete"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Cs={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"webhookUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"WebhookUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"webhookUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WebhookPayload"}}]}}]}},...wt.definitions]},Os={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"workflowStateArchive"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"workflowStateArchive"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"ArchivePayload"}}]}}]}},...nn.definitions]},Ps={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"workflowStateCreate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"WorkflowStateCreateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"workflowStateCreate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WorkflowStatePayload"}}]}}]}},...Ct.definitions]},js={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"mutation",name:{kind:"Name",value:"workflowStateUpdate"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"id"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}}},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"input"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"WorkflowStateUpdateInput"}}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"workflowStateUpdate"},arguments:[{kind:"Argument",name:{kind:"Name",value:"id"},value:{kind:"Variable",name:{kind:"Name",value:"id"}}},{kind:"Argument",name:{kind:"Name",value:"input"},value:{kind:"Variable",name:{kind:"Name",value:"input"}}}],selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:"WorkflowStatePayload"}}]}}]}},...Ct.definitions]};var Us=Object.freeze({__proto__:null,get IssueRelationType(){return yi},get PaginationOrderBy(){return Si},get TrashOptionType(){return gi},get UserFlagType(){return Di},get UserFlagUpdateOperation(){return Vi},get ViewPreferencesType(){return Fi},get ViewType(){return Ai},TemplateFragmentDoc:xi,UserFragmentDoc:Ci,UserAccountFragmentDoc:Oi,DocumentStepFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"DocumentStep"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"DocumentStep"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"clientId"}},{kind:"Field",name:{kind:"Name",value:"step"}},{kind:"Field",name:{kind:"Name",value:"version"}},{kind:"Field",name:{kind:"Name",value:"updatedAt"}},{kind:"Field",name:{kind:"Name",value:"archivedAt"}},{kind:"Field",name:{kind:"Name",value:"createdAt"}},{kind:"Field",name:{kind:"Name",value:"id"}}]}}]},SyncDeltaResponseFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SyncDeltaResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SyncDeltaResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"updates"}},{kind:"Field",name:{kind:"Name",value:"success"}},{kind:"Field",name:{kind:"Name",value:"loadMore"}}]}}]},SyncResponseFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SyncResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SyncResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"delta"}},{kind:"Field",name:{kind:"Name",value:"state"}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"subscribedSyncGroups"}},{kind:"Field",name:{kind:"Name",value:"databaseVersion"}}]}}]},ArchiveResponseFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"ArchiveResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"ArchiveResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"archive"}},{kind:"Field",name:{kind:"Name",value:"totalCount"}},{kind:"Field",name:{kind:"Name",value:"databaseVersion"}}]}}]},DependencyResponseFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"DependencyResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"DependencyResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"dependencies"}}]}}]},SyncBatchResponseFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SyncBatchResponse"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SyncBatchResponse"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"models"}}]}}]},GithubRepoFragmentDoc:Pi,GithubOrgFragmentDoc:ji,GithubOAuthTokenPayloadFragmentDoc:Ui,AuthorizedApplicationFragmentDoc:Bi,UserAuthorizedApplicationFragmentDoc:Ei,ApplicationFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"Application"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Application"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"name"}},{kind:"Field",name:{kind:"Name",value:"imageUrl"}},{kind:"Field",name:{kind:"Name",value:"description"}},{kind:"Field",name:{kind:"Name",value:"developer"}},{kind:"Field",name:{kind:"Name",value:"clientId"}},{kind:"Field",name:{kind:"Name",value:"developerUrl"}}]}}]},GoogleSheetsSettingsFragmentDoc:zi,IntercomSettingsFragmentDoc:Li,JiraProjectDataFragmentDoc:Mi,JiraLinearMappingFragmentDoc:Ri,JiraSettingsFragmentDoc:Qi,SentrySettingsFragmentDoc:Wi,SlackPostSettingsFragmentDoc:Hi,ZendeskSettingsFragmentDoc:Gi,IntegrationSettingsFragmentDoc:Ji,SamlConfigurationFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SamlConfiguration"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SamlConfiguration"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"ssoBinding"}},{kind:"Field",name:{kind:"Name",value:"allowedDomains"}},{kind:"Field",name:{kind:"Name",value:"ssoEndpoint"}},{kind:"Field",name:{kind:"Name",value:"ssoSignAlgo"}},{kind:"Field",name:{kind:"Name",value:"issuerEntityId"}},{kind:"Field",name:{kind:"Name",value:"ssoSigningCert"}}]}}]},UserSettingsFragmentDoc:$i,SubscriptionFragmentDoc:Ki,ApiKeyFragmentDoc:Zi,PageInfoFragmentDoc:Yi,ApiKeyConnectionFragmentDoc:Xi,ApiKeyPayloadFragmentDoc:en,ArchivePayloadFragmentDoc:nn,AttachmentFragmentDoc:an,AttachmentConnectionFragmentDoc:tn,AttachmentPayloadFragmentDoc:dn,AuditEntryFragmentDoc:ln,AuditEntryConnectionFragmentDoc:rn,AuditEntryTypeFragmentDoc:on,OrganizationFragmentDoc:sn,AuthResolverResponseFragmentDoc:mn,InvoiceFragmentDoc:un,CardFragmentDoc:kn,BillingDetailsPayloadFragmentDoc:cn,BillingEmailPayloadFragmentDoc:vn,StepsResponseFragmentDoc:Nn,CollaborationDocumentUpdatePayloadFragmentDoc:pn,CommentFragmentDoc:fn,CommentConnectionFragmentDoc:hn,CommentPayloadFragmentDoc:bn,ContactPayloadFragmentDoc:yn,CreateCsvExportReportPayloadFragmentDoc:Sn,CreateOrJoinOrganizationResponseFragmentDoc:gn,CustomViewFragmentDoc:Dn,CustomViewConnectionFragmentDoc:Vn,CustomViewPayloadFragmentDoc:Fn,CycleFragmentDoc:An,CycleConnectionFragmentDoc:Tn,CyclePayloadFragmentDoc:_n,DebugPayloadFragmentDoc:In,DocumentFragmentDoc:wn,DocumentConnectionFragmentDoc:qn,DocumentPayloadFragmentDoc:xn,DocumentVersionFragmentDoc:Cn,DocumentVersionConnectionFragmentDoc:On,EmailSubscribePayloadFragmentDoc:Pn,EmailUnsubscribePayloadFragmentDoc:jn,EmailUserAccountAuthChallengeResponseFragmentDoc:Un,EmojiFragmentDoc:Bn,EmojiConnectionFragmentDoc:En,EmojiPayloadFragmentDoc:zn,EventPayloadFragmentDoc:Ln,FavoriteFragmentDoc:Mn,FavoriteConnectionFragmentDoc:Rn,FavoritePayloadFragmentDoc:Qn,FeedbackPayloadFragmentDoc:Wn,FigmaEmbedFragmentDoc:Hn,FigmaEmbedPayloadFragmentDoc:Gn,FrontAttachmentPayloadFragmentDoc:Jn,GitHubCommitIntegrationPayloadFragmentDoc:$n,ImageUploadFromUrlPayloadFragmentDoc:Kn,IntegrationFragmentDoc:Zn,IntegrationConnectionFragmentDoc:Yn,IntegrationPayloadFragmentDoc:Xn,CommitPayloadFragmentDoc:ea,PullRequestPayloadFragmentDoc:ia,SentryIssuePayloadFragmentDoc:na,IntegrationResourceDataFragmentDoc:aa,IntegrationResourceFragmentDoc:ta,IntegrationResourceConnectionFragmentDoc:da,IssueFragmentDoc:la,IssueBatchPayloadFragmentDoc:ra,IssueConnectionFragmentDoc:oa,IssueDescriptionHistoryFragmentDoc:sa,IssueDescriptionHistoryPayloadFragmentDoc:ma,IssueRelationHistoryPayloadFragmentDoc:ua,IssueImportFragmentDoc:ka,IssueHistoryFragmentDoc:ca,IssueHistoryConnectionFragmentDoc:va,IssueImportDeletePayloadFragmentDoc:Na,IssueImportPayloadFragmentDoc:pa,IssueLabelFragmentDoc:fa,IssueLabelConnectionFragmentDoc:ha,IssueLabelPayloadFragmentDoc:ba,IssuePayloadFragmentDoc:ya,IssuePriorityValueFragmentDoc:Sa,IssueRelationFragmentDoc:ga,IssueRelationConnectionFragmentDoc:Da,IssueRelationPayloadFragmentDoc:Va,MilestoneFragmentDoc:Fa,MilestoneConnectionFragmentDoc:Aa,MilestonePayloadFragmentDoc:Ta,NotificationFragmentDoc:_a,NotificationConnectionFragmentDoc:Ia,NotificationPayloadFragmentDoc:wa,NotificationSubscriptionFragmentDoc:qa,NotificationSubscriptionConnectionFragmentDoc:xa,NotificationSubscriptionPayloadFragmentDoc:Ca,OauthAuthStringAuthorizePayloadFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OauthAuthStringAuthorizePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OauthAuthStringAuthorizePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},OauthAuthStringChallengePayloadFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OauthAuthStringChallengePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OauthAuthStringChallengePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"authString"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},OauthAuthStringCheckPayloadFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OauthAuthStringCheckPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OauthAuthStringCheckPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"token"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},OauthClientFragmentDoc:Oa,OauthClientPayloadFragmentDoc:Pa,OauthTokenRevokePayloadFragmentDoc:ja,OrganizationCancelDeletePayloadFragmentDoc:Ua,OrganizationDeletePayloadFragmentDoc:Ba,OrganizationDomainFragmentDoc:Ea,OrganizationDomainPayloadFragmentDoc:za,OrganizationDomainSimplePayloadFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"OrganizationDomainSimplePayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"OrganizationDomainSimplePayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},OrganizationExistsPayloadFragmentDoc:La,OrganizationInviteFragmentDoc:Ma,OrganizationInviteConnectionFragmentDoc:Ra,OrganizationInviteDetailsPayloadFragmentDoc:Qa,OrganizationInvitePayloadFragmentDoc:Wa,OrganizationPayloadFragmentDoc:Ha,ProjectFragmentDoc:Ga,ProjectConnectionFragmentDoc:Ja,ProjectLinkFragmentDoc:$a,ProjectLinkConnectionFragmentDoc:Ka,ProjectLinkPayloadFragmentDoc:Za,ProjectPayloadFragmentDoc:Ya,PushSubscriptionFragmentDoc:Xa,PushSubscriptionConnectionFragmentDoc:et,PushSubscriptionPayloadFragmentDoc:it,PushSubscriptionTestPayloadFragmentDoc:nt,ReactionFragmentDoc:at,ReactionConnectionFragmentDoc:tt,ReactionPayloadFragmentDoc:dt,RotateSecretPayloadFragmentDoc:lt,SsoUrlFromEmailResponseFragmentDoc:rt,SubscriptionPayloadFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SubscriptionPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SubscriptionPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"canceledAt"}},{kind:"Field",name:{kind:"Name",value:"lastSyncId"}},{kind:"Field",name:{kind:"Name",value:"success"}}]}}]},SubscriptionSessionPayloadFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SubscriptionSessionPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SubscriptionSessionPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"session"}}]}}]},SynchronizedPayloadFragmentDoc:{kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"SynchronizedPayload"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"SynchronizedPayload"}},selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"lastSyncId"}}]}}]},TeamFragmentDoc:ot,TeamConnectionFragmentDoc:st,TeamMembershipFragmentDoc:mt,TeamMembershipConnectionFragmentDoc:ut,TeamMembershipPayloadFragmentDoc:kt,TeamPayloadFragmentDoc:ct,TemplateConnectionFragmentDoc:vt,TemplatePayloadFragmentDoc:Nt,UploadFileHeaderFragmentDoc:pt,UploadFileFragmentDoc:ft,UploadPayloadFragmentDoc:ht,UserAdminPayloadFragmentDoc:bt,UserConnectionFragmentDoc:yt,UserPayloadFragmentDoc:St,UserSettingsFlagPayloadFragmentDoc:gt,UserSettingsFlagsResetPayloadFragmentDoc:Dt,UserSettingsPayloadFragmentDoc:Vt,UserSubscribeToNewsletterPayloadFragmentDoc:Ft,ViewPreferencesFragmentDoc:At,ViewPreferencesPayloadFragmentDoc:Tt,WebhookFragmentDoc:_t,WebhookConnectionFragmentDoc:It,WebhookPayloadFragmentDoc:wt,WorkflowStateFragmentDoc:qt,WorkflowStateConnectionFragmentDoc:xt,WorkflowStatePayloadFragmentDoc:Ct,AdministrableTeamsDocument:Ot,ApplicationWithAuthorizationDocument:Pt,AttachmentDocument:jt,AttachmentIssueDocument:Ut,AttachmentIssue_AttachmentsDocument:Bt,AttachmentIssue_ChildrenDocument:Et,AttachmentIssue_CommentsDocument:zt,AttachmentIssue_HistoryDocument:Lt,AttachmentIssue_InverseRelationsDocument:Mt,AttachmentIssue_LabelsDocument:Rt,AttachmentIssue_RelationsDocument:Qt,AttachmentIssue_SubscribersDocument:Wt,AttachmentsDocument:Ht,AttachmentsForUrlDocument:Gt,AuditEntriesDocument:Jt,AuditEntryTypesDocument:$t,AuthorizedApplicationsDocument:Kt,AvailableUsersDocument:Zt,BillingDetailsDocument:Yt,BillingDetails_PaymentMethodDocument:Xt,CollaborativeDocumentJoinDocument:ed,CollaborativeDocumentJoin_StepsDocument:id,CommentDocument:nd,CommentsDocument:ad,CustomViewDocument:td,CustomViewsDocument:dd,CycleDocument:ld,Cycle_IssuesDocument:rd,Cycle_UncompletedIssuesUponCloseDocument:od,CyclesDocument:sd,DocumentDocument:md,DocumentsDocument:ud,EmojiDocument:kd,EmojisDocument:cd,FavoriteDocument:vd,Favorite_ChildrenDocument:Nd,FavoritesDocument:pd,FigmaEmbedInfoDocument:fd,FigmaEmbedInfo_FigmaEmbedDocument:hd,IntegrationDocument:bd,IntegrationsDocument:yd,IssueDocument:Sd,Issue_AttachmentsDocument:gd,Issue_ChildrenDocument:Dd,Issue_CommentsDocument:Vd,Issue_HistoryDocument:Fd,Issue_InverseRelationsDocument:Ad,Issue_LabelsDocument:Td,Issue_RelationsDocument:_d,Issue_SubscribersDocument:Id,IssueImportFinishGithubOAuthDocument:wd,IssueLabelDocument:qd,IssueLabel_IssuesDocument:xd,IssueLabelsDocument:Cd,IssuePriorityValuesDocument:Od,IssueRelationDocument:Pd,IssueRelationsDocument:jd,IssueSearchDocument:Ud,IssuesDocument:Bd,MilestoneDocument:Ed,Milestone_ProjectsDocument:zd,MilestonesDocument:Ld,NotificationDocument:Md,NotificationSubscriptionDocument:Rd,NotificationSubscriptionsDocument:Qd,NotificationsDocument:Wd,OrganizationDocument:Hd,Organization_IntegrationsDocument:Gd,Organization_LabelsDocument:Jd,Organization_MilestonesDocument:$d,Organization_TeamsDocument:Kd,Organization_TemplatesDocument:Zd,Organization_UsersDocument:Yd,OrganizationExistsDocument:Xd,OrganizationInviteDocument:el,OrganizationInviteDetailsDocument:il,OrganizationInvitesDocument:nl,ProjectDocument:al,Project_DocumentsDocument:tl,Project_IssuesDocument:dl,Project_LinksDocument:ll,Project_MembersDocument:rl,Project_TeamsDocument:ol,ProjectLinkDocument:sl,ProjectLinksDocument:ml,ProjectsDocument:ul,PushSubscriptionTestDocument:kl,ReactionDocument:cl,ReactionsDocument:vl,SsoUrlFromEmailDocument:Nl,SubscriptionDocument:pl,TeamDocument:fl,Team_CyclesDocument:hl,Team_IssuesDocument:bl,Team_LabelsDocument:yl,Team_MembersDocument:Sl,Team_MembershipsDocument:gl,Team_ProjectsDocument:Dl,Team_StatesDocument:Vl,Team_TemplatesDocument:Fl,Team_WebhooksDocument:Al,TeamMembershipDocument:Tl,TeamMembershipsDocument:_l,TeamsDocument:Il,TemplateDocument:wl,TemplatesDocument:ql,UserDocument:xl,User_AssignedIssuesDocument:Cl,User_CreatedIssuesDocument:Ol,User_TeamMembershipsDocument:Pl,User_TeamsDocument:jl,UserSettingsDocument:Ul,UsersDocument:Bl,ViewerDocument:El,Viewer_AssignedIssuesDocument:zl,Viewer_CreatedIssuesDocument:Ll,Viewer_TeamMembershipsDocument:Ml,Viewer_TeamsDocument:Rl,WebhookDocument:Ql,WebhooksDocument:Wl,WorkflowStateDocument:Hl,WorkflowState_IssuesDocument:Gl,WorkflowStatesDocument:Jl,AttachmentArchiveDocument:$l,AttachmentCreateDocument:Kl,AttachmentDeleteDocument:Zl,AttachmentLinkFrontDocument:Yl,AttachmentLinkIntercomDocument:Xl,AttachmentLinkJiraIssueDocument:er,AttachmentLinkUrlDocument:ir,AttachmentLinkZendeskDocument:nr,AttachmentUpdateDocument:ar,BillingEmailUpdateDocument:tr,CollaborativeDocumentUpdateDocument:dr,CommentCreateDocument:lr,CommentDeleteDocument:rr,CommentUpdateDocument:or,ContactCreateDocument:sr,CreateCsvExportReportDocument:mr,CreateOrganizationFromOnboardingDocument:ur,CustomViewCreateDocument:kr,CustomViewDeleteDocument:cr,CustomViewUpdateDocument:vr,CycleArchiveDocument:Nr,CycleCreateDocument:pr,CycleUpdateDocument:fr,DebugFailWithInternalErrorDocument:hr,DocumentCreateDocument:br,DocumentDeleteDocument:yr,DocumentUpdateDocument:Sr,EmailSubscribeDocument:gr,EmailTokenUserAccountAuthDocument:Dr,EmailUnsubscribeDocument:Vr,EmailUserAccountAuthChallengeDocument:Fr,EmojiCreateDocument:Ar,EmojiDeleteDocument:Tr,EventCreateDocument:_r,FavoriteCreateDocument:Ir,FavoriteDeleteDocument:wr,FavoriteUpdateDocument:qr,FeedbackCreateDocument:xr,FileUploadDocument:Cr,GoogleUserAccountAuthDocument:Or,ImageUploadFromUrlDocument:Pr,IntegrationDeleteDocument:jr,IntegrationFigmaDocument:Ur,IntegrationFrontDocument:Br,IntegrationGithubCommitCreateDocument:Er,IntegrationGithubConnectDocument:zr,IntegrationGitlabConnectDocument:Lr,IntegrationGoogleSheetsDocument:Mr,IntegrationIntercomDocument:Rr,IntegrationIntercomDeleteDocument:Qr,IntegrationIntercomSettingsUpdateDocument:Wr,IntegrationLoomDocument:Hr,IntegrationResourceArchiveDocument:Gr,IntegrationSentryConnectDocument:Jr,IntegrationSettingsUpdateDocument:$r,IntegrationSlackDocument:Kr,IntegrationSlackImportEmojisDocument:Zr,IntegrationSlackPersonalDocument:Yr,IntegrationSlackPostDocument:Xr,IntegrationSlackProjectPostDocument:eo,IntegrationZendeskDocument:io,IssueArchiveDocument:no,IssueBatchUpdateDocument:ao,IssueCreateDocument:to,IssueDeleteDocument:lo,IssueImportCreateAsanaDocument:ro,IssueImportCreateClubhouseDocument:oo,IssueImportCreateGithubDocument:so,IssueImportCreateJiraDocument:mo,IssueImportDeleteDocument:uo,IssueImportProcessDocument:ko,IssueImportUpdateDocument:co,IssueLabelArchiveDocument:vo,IssueLabelCreateDocument:No,IssueLabelUpdateDocument:po,IssueRelationCreateDocument:fo,IssueRelationDeleteDocument:ho,IssueRelationUpdateDocument:bo,IssueUnarchiveDocument:yo,IssueUpdateDocument:So,JiraIntegrationConnectDocument:go,JoinOrganizationFromOnboardingDocument:Do,LeaveOrganizationDocument:Vo,MilestoneCreateDocument:Fo,MilestoneDeleteDocument:Ao,MilestoneUpdateDocument:To,NotificationArchiveDocument:_o,NotificationCreateDocument:Io,NotificationSubscriptionCreateDocument:wo,NotificationSubscriptionDeleteDocument:qo,NotificationUnarchiveDocument:xo,NotificationUpdateDocument:Co,OauthClientArchiveDocument:Oo,OauthClientCreateDocument:Po,OauthClientRotateSecretDocument:jo,OauthClientUpdateDocument:Uo,OauthTokenRevokeDocument:Bo,OrganizationCancelDeleteDocument:Eo,OrganizationDeleteDocument:zo,OrganizationDeleteChallengeDocument:Lo,OrganizationDomainCreateDocument:Mo,OrganizationDomainDeleteDocument:Ro,OrganizationDomainVerifyDocument:Qo,OrganizationInviteCreateDocument:Wo,OrganizationInviteDeleteDocument:Ho,OrganizationUpdateDocument:Go,ProjectArchiveDocument:Jo,ProjectCreateDocument:$o,ProjectLinkCreateDocument:Ko,ProjectLinkDeleteDocument:Zo,ProjectLinkUpdateDocument:Yo,ProjectUnarchiveDocument:Xo,ProjectUpdateDocument:es,PushSubscriptionCreateDocument:is,PushSubscriptionDeleteDocument:ns,ReactionCreateDocument:as,ReactionDeleteDocument:ts,RefreshGoogleSheetsDataDocument:ds,ResendOrganizationInviteDocument:ls,SamlTokenUserAccountAuthDocument:rs,TeamCreateDocument:os,TeamDeleteDocument:ss,TeamKeyDeleteDocument:ms,TeamMembershipCreateDocument:us,TeamMembershipDeleteDocument:ks,TeamMembershipUpdateDocument:cs,TeamUpdateDocument:vs,TemplateCreateDocument:Ns,TemplateDeleteDocument:ps,TemplateUpdateDocument:fs,UserDemoteAdminDocument:hs,UserFlagUpdateDocument:bs,UserPromoteAdminDocument:ys,UserSettingsFlagIncrementDocument:Ss,UserSettingsFlagsResetDocument:gs,UserSettingsUpdateDocument:Ds,UserSubscribeToNewsletterDocument:Vs,UserSuspendDocument:Fs,UserUnsuspendDocument:As,UserUpdateDocument:Ts,ViewPreferencesCreateDocument:_s,ViewPreferencesDeleteDocument:Is,ViewPreferencesUpdateDocument:ws,WebhookCreateDocument:qs,WebhookDeleteDocument:xs,WebhookUpdateDocument:Cs,WorkflowStateArchiveDocument:Os,WorkflowStateCreateDocument:Ps,WorkflowStateUpdateDocument:js});class Bs{constructor(e){this._request=e}}function Es(e){var i,n;return Object.assign(Object.assign({},e),{first:null!==(i=e.first)&&void 0!==i?i:e.after?50:void 0,last:null!==(n=e.last)&&void 0!==n?n:e.before?50:void 0})}class zs extends Bs{constructor(e){super(e),this.pageInfo=new Eu(e,{hasNextPage:!1,hasPreviousPage:!1}),this.nodes=[]}}class Ls extends zs{constructor(e,i,n,a){super(e),this._fetch=i,this.nodes=n,this.pageInfo=a}_appendNodes(e){var i;this.nodes=e?[...null!==(i=this.nodes)&&void 0!==i?i:[],...e]:this.nodes}_prependNodes(e){var i;this.nodes=e?[...e,...null!==(i=this.nodes)&&void 0!==i?i:[]]:this.nodes}_appendPageInfo(e){var i,n;this.pageInfo&&(this.pageInfo.endCursor=null!==(i=null==e?void 0:e.endCursor)&&void 0!==i?i:this.pageInfo.startCursor,this.pageInfo.hasNextPage=null!==(n=null==e?void 0:e.hasNextPage)&&void 0!==n?n:this.pageInfo.hasNextPage)}_prependPageInfo(e){var i,n;this.pageInfo&&(this.pageInfo.startCursor=null!==(i=null==e?void 0:e.startCursor)&&void 0!==i?i:this.pageInfo.startCursor,this.pageInfo.hasPreviousPage=null!==(n=null==e?void 0:e.hasPreviousPage)&&void 0!==n?n:this.pageInfo.hasPreviousPage)}fetchNext(){var e,i;return u(this,void 0,void 0,(function*(){if(null===(e=this.pageInfo)||void 0===e?void 0:e.hasNextPage){const e=yield this._fetch({after:null===(i=this.pageInfo)||void 0===i?void 0:i.endCursor});this._appendNodes(null==e?void 0:e.nodes),this._appendPageInfo(null==e?void 0:e.pageInfo)}return Promise.resolve(this)}))}fetchPrevious(){var e,i;return u(this,void 0,void 0,(function*(){if(null===(e=this.pageInfo)||void 0===e?void 0:e.hasPreviousPage){const e=yield this._fetch({before:null===(i=this.pageInfo)||void 0===i?void 0:i.startCursor});this._prependNodes(null==e?void 0:e.nodes),this._prependPageInfo(null==e?void 0:e.pageInfo)}return Promise.resolve(this)}))}}function Ms(e){try{return e?new Date(e):void 0}catch(e){return}}function Rs(e){try{return e?JSON.parse(e):void 0}catch(e){return}}class Qs extends Bs{constructor(e,i){var n,a,t;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.label=i.label,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date}}class Ws extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success}}class Hs extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.groupBySource=i.groupBySource,this.id=i.id,this.metadata=null!==(t=Rs(i.metadata))&&void 0!==t?t:{},this.source=null!==(d=Rs(i.source))&&void 0!==d?d:void 0,this.sourceType=null!==(l=Rs(i.sourceType))&&void 0!==l?l:void 0,this.subtitle=null!==(r=i.subtitle)&&void 0!==r?r:void 0,this.title=i.title,this.updatedAt=null!==(o=Ms(i.updatedAt))&&void 0!==o?o:new Date,this.url=i.url,this._creator=null!==(s=i.creator)&&void 0!==s?s:void 0,this._issue=i.issue}get creator(){var e,i;return(null===(e=this._creator)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._creator)||void 0===i?void 0:i.id):void 0}get issue(){return new mc(this._request).fetch(this._issue.id)}archive(){return new Xc(this._request).fetch(this.id)}delete(){return new iv(this._request).fetch(this.id)}update(e){return new rv(this._request).fetch(this.id,e)}}class Gs extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Hs(e,i))),new Eu(e,n.pageInfo))}}class Js extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._attachment=i.attachment}get attachment(){return new Ek(this._request).fetch(this._attachment.id)}}class $s extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s;super(e),this.actorId=null!==(n=i.actorId)&&void 0!==n?n:void 0,this.archivedAt=null!==(a=Ms(i.archivedAt))&&void 0!==a?a:void 0,this.countryCode=null!==(t=i.countryCode)&&void 0!==t?t:void 0,this.createdAt=null!==(d=Ms(i.createdAt))&&void 0!==d?d:new Date,this.id=i.id,this.ip=null!==(l=i.ip)&&void 0!==l?l:void 0,this.metadata=null!==(r=Rs(i.metadata))&&void 0!==r?r:void 0,this.type=i.type,this.updatedAt=null!==(o=Ms(i.updatedAt))&&void 0!==o?o:new Date,this._actor=null!==(s=i.actor)&&void 0!==s?s:void 0}get actor(){var e,i;return(null===(e=this._actor)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._actor)||void 0===i?void 0:i.id):void 0}}class Ks extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new $s(e,i))),new Eu(e,n.pageInfo))}}class Zs extends Bs{constructor(e,i){super(e),this.description=i.description,this.type=i.type}}class Ys extends Bs{constructor(e,i){var n,a,t,d;super(e),this.allowDomainAccess=null!==(n=i.allowDomainAccess)&&void 0!==n?n:void 0,this.email=null!==(a=i.email)&&void 0!==a?a:void 0,this.id=i.id,this.lastUsedOrganizationId=null!==(t=i.lastUsedOrganizationId)&&void 0!==t?t:void 0,this.token=null!==(d=i.token)&&void 0!==d?d:void 0,this.availableOrganizations=i.availableOrganizations?i.availableOrganizations.map((i=>new _u(e,i))):void 0,this.users=i.users.map((i=>new hk(e,i)))}}class Xs extends Bs{constructor(e,i){var n,a;super(e),this.appId=i.appId,this.clientId=i.clientId,this.description=null!==(n=i.description)&&void 0!==n?n:void 0,this.developer=i.developer,this.developerUrl=i.developerUrl,this.imageUrl=null!==(a=i.imageUrl)&&void 0!==a?a:void 0,this.name=i.name,this.scope=i.scope,this.webhooksEnabled=i.webhooksEnabled}}class em extends Bs{constructor(e,i){var n;super(e),this.email=null!==(n=i.email)&&void 0!==n?n:void 0,this.success=i.success,this.paymentMethod=i.paymentMethod?new nm(e,i.paymentMethod):void 0,this.invoices=i.invoices.map((i=>new Jm(e,i)))}}class im extends Bs{constructor(e,i){var n;super(e),this.email=null!==(n=i.email)&&void 0!==n?n:void 0,this.success=i.success}}class nm extends Bs{constructor(e,i){super(e),this.brand=i.brand,this.last4=i.last4}}class am extends Bs{constructor(e,i){super(e),this.success=i.success,this.steps=i.steps?new tk(e,i.steps):void 0}}class tm extends Bs{constructor(e,i){var n,a,t,d;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.body=i.body,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.editedAt=null!==(t=Ms(i.editedAt))&&void 0!==t?t:void 0,this.id=i.id,this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this.url=i.url,this._issue=i.issue,this._user=i.user}get issue(){return new mc(this._request).fetch(this._issue.id)}get user(){return new Wc(this._request).fetch(this._user.id)}delete(){return new uv(this._request).fetch(this.id)}update(e){return new kv(this._request).fetch(this.id,e)}}class dm extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new tm(e,i))),new Eu(e,n.pageInfo))}}class lm extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._comment=i.comment}get comment(){return new $k(this._request).fetch(this._comment.id)}}class rm extends Bs{constructor(e,i){super(e),this.added=i.added,this.id=i.id,this.message=i.message,this.modified=i.modified,this.removed=i.removed,this.timestamp=i.timestamp,this.url=i.url}}class om extends Bs{constructor(e,i){super(e),this.success=i.success}}class sm extends Bs{constructor(e,i){super(e),this.success=i.success}}class mm extends Bs{constructor(e,i){super(e),this._user=i.user}get organization(){return new Fc(this._request).fetch()}get user(){return new Wc(this._request).fetch(this._user.id)}}class um extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s,m;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.color=null!==(a=i.color)&&void 0!==a?a:void 0,this.createdAt=null!==(t=Ms(i.createdAt))&&void 0!==t?t:new Date,this.description=null!==(d=i.description)&&void 0!==d?d:void 0,this.filterData=null!==(l=Rs(i.filterData))&&void 0!==l?l:{},this.filters=null!==(r=Rs(i.filters))&&void 0!==r?r:{},this.icon=null!==(o=i.icon)&&void 0!==o?o:void 0,this.id=i.id,this.name=i.name,this.shared=i.shared,this.updatedAt=null!==(s=Ms(i.updatedAt))&&void 0!==s?s:new Date,this._creator=i.creator,this._team=null!==(m=i.team)&&void 0!==m?m:void 0}get creator(){return new Wc(this._request).fetch(this._creator.id)}get organization(){return new Fc(this._request).fetch()}get team(){var e,i;return(null===(e=this._team)||void 0===e?void 0:e.id)?new Ec(this._request).fetch(null===(i=this._team)||void 0===i?void 0:i.id):void 0}delete(){return new fv(this._request).fetch(this.id)}update(e){return new hv(this._request).fetch(this.id,e)}}class km extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new um(e,i))),new Eu(e,n.pageInfo))}}class cm extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._customView=i.customView}get customView(){return new Zk(this._request).fetch(this._customView.id)}}class vm extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.autoArchivedAt=null!==(a=Ms(i.autoArchivedAt))&&void 0!==a?a:void 0,this.completedAt=null!==(t=Ms(i.completedAt))&&void 0!==t?t:void 0,this.completedIssueCountHistory=i.completedIssueCountHistory,this.completedScopeHistory=i.completedScopeHistory,this.createdAt=null!==(d=Ms(i.createdAt))&&void 0!==d?d:new Date,this.endsAt=null!==(l=Ms(i.endsAt))&&void 0!==l?l:new Date,this.id=i.id,this.issueCountHistory=i.issueCountHistory,this.name=null!==(r=i.name)&&void 0!==r?r:void 0,this.number=i.number,this.progress=i.progress,this.scopeHistory=i.scopeHistory,this.startsAt=null!==(o=Ms(i.startsAt))&&void 0!==o?o:new Date,this.updatedAt=null!==(s=Ms(i.updatedAt))&&void 0!==s?s:new Date,this._team=i.team}get team(){return new Ec(this._request).fetch(this._team.id)}issues(e){return new zp(this._request,this.id,e).fetch(e)}uncompletedIssuesUponClose(e){return new Lp(this._request,this.id,e).fetch(e)}archive(){return new bv(this._request).fetch(this.id)}update(e){return new Sv(this._request).fetch(this.id,e)}}class Nm extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new vm(e,i))),new Eu(e,n.pageInfo))}}class pm extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._cycle=null!==(n=i.cycle)&&void 0!==n?n:void 0}get cycle(){var e,i;return(null===(e=this._cycle)||void 0===e?void 0:e.id)?new Xk(this._request).fetch(null===(i=this._cycle)||void 0===i?void 0:i.id):void 0}}class fm extends Bs{constructor(e,i){super(e),this.success=i.success}}class hm extends Bs{constructor(e,i){var n,a,t,d,l,r,o;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.color=null!==(a=i.color)&&void 0!==a?a:void 0,this.content=null!==(t=i.content)&&void 0!==t?t:void 0,this.contentData=null!==(d=Rs(i.contentData))&&void 0!==d?d:void 0,this.createdAt=null!==(l=Ms(i.createdAt))&&void 0!==l?l:new Date,this.icon=null!==(r=i.icon)&&void 0!==r?r:void 0,this.id=i.id,this.slugId=i.slugId,this.title=i.title,this.updatedAt=null!==(o=Ms(i.updatedAt))&&void 0!==o?o:new Date,this._creator=i.creator,this._project=i.project,this._updatedBy=i.updatedBy}get creator(){return new Wc(this._request).fetch(this._creator.id)}get project(){return new wc(this._request).fetch(this._project.id)}get updatedBy(){return new Wc(this._request).fetch(this._updatedBy.id)}delete(){return new Vv(this._request).fetch(this.id)}update(e){return new Fv(this._request).fetch(this.id,e)}}class bm extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new hm(e,i))),new Eu(e,n.pageInfo))}}class ym extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._document=i.document}get document(){return new ic(this._request).fetch(this._document.id)}}class Sm extends Bs{constructor(e,i){var n,a,t,d;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.content=null!==(a=i.content)&&void 0!==a?a:void 0,this.createdAt=null!==(t=Ms(i.createdAt))&&void 0!==t?t:new Date,this.id=i.id,this.revision=i.revision,this.title=i.title,this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this._creator=i.creator,this._project=i.project}get creator(){return new Wc(this._request).fetch(this._creator.id)}get project(){return new wc(this._request).fetch(this._project.id)}}class gm extends Bs{constructor(e,i){super(e),this.success=i.success}}class Dm extends Bs{constructor(e,i){super(e),this.success=i.success}}class Vm extends Bs{constructor(e,i){super(e),this.authType=i.authType,this.success=i.success}}class Fm extends Bs{constructor(e,i){var n,a,t;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.name=i.name,this.source=i.source,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this.url=i.url,this._creator=i.creator}get creator(){return new Wc(this._request).fetch(this._creator.id)}get organization(){return new Fc(this._request).fetch()}delete(){return new qv(this._request).fetch(this.id)}}class Am extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Fm(e,i))),new Eu(e,n.pageInfo))}}class Tm extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._emoji=i.emoji}get emoji(){return new ac(this._request).fetch(this._emoji.id)}}class _m extends Bs{constructor(e,i){super(e),this.success=i.success}}class Im extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s,m,u,k,c;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.folderName=null!==(t=i.folderName)&&void 0!==t?t:void 0,this.id=i.id,this.sortOrder=i.sortOrder,this.type=i.type,this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this._customView=null!==(l=i.customView)&&void 0!==l?l:void 0,this._cycle=null!==(r=i.cycle)&&void 0!==r?r:void 0,this._document=null!==(o=i.document)&&void 0!==o?o:void 0,this._issue=null!==(s=i.issue)&&void 0!==s?s:void 0,this._label=null!==(m=i.label)&&void 0!==m?m:void 0,this._parent=null!==(u=i.parent)&&void 0!==u?u:void 0,this._project=null!==(k=i.project)&&void 0!==k?k:void 0,this._projectTeam=null!==(c=i.projectTeam)&&void 0!==c?c:void 0,this._user=i.user}get customView(){var e,i;return(null===(e=this._customView)||void 0===e?void 0:e.id)?new Zk(this._request).fetch(null===(i=this._customView)||void 0===i?void 0:i.id):void 0}get cycle(){var e,i;return(null===(e=this._cycle)||void 0===e?void 0:e.id)?new Xk(this._request).fetch(null===(i=this._cycle)||void 0===i?void 0:i.id):void 0}get document(){var e,i;return(null===(e=this._document)||void 0===e?void 0:e.id)?new ic(this._request).fetch(null===(i=this._document)||void 0===i?void 0:i.id):void 0}get issue(){var e,i;return(null===(e=this._issue)||void 0===e?void 0:e.id)?new mc(this._request).fetch(null===(i=this._issue)||void 0===i?void 0:i.id):void 0}get label(){var e,i;return(null===(e=this._label)||void 0===e?void 0:e.id)?new kc(this._request).fetch(null===(i=this._label)||void 0===i?void 0:i.id):void 0}get parent(){var e,i;return(null===(e=this._parent)||void 0===e?void 0:e.id)?new dc(this._request).fetch(null===(i=this._parent)||void 0===i?void 0:i.id):void 0}get project(){var e,i;return(null===(e=this._project)||void 0===e?void 0:e.id)?new wc(this._request).fetch(null===(i=this._project)||void 0===i?void 0:i.id):void 0}get projectTeam(){var e,i;return(null===(e=this._projectTeam)||void 0===e?void 0:e.id)?new Ec(this._request).fetch(null===(i=this._projectTeam)||void 0===i?void 0:i.id):void 0}get user(){return new Wc(this._request).fetch(this._user.id)}children(e){return new Mp(this._request,this.id,e).fetch(e)}delete(){return new Ov(this._request).fetch(this.id)}update(e){return new Pv(this._request).fetch(this.id,e)}}class wm extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Im(e,i))),new Eu(e,n.pageInfo))}}class qm extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._favorite=i.favorite}get favorite(){return new dc(this._request).fetch(this._favorite.id)}}class xm extends Bs{constructor(e,i){super(e),this.success=i.success}}class Cm extends Bs{constructor(e,i){var n,a,t;super(e),this.lastModified=null!==(n=Ms(i.lastModified))&&void 0!==n?n:new Date,this.name=i.name,this.nodeName=null!==(a=i.nodeName)&&void 0!==a?a:void 0,this.url=null!==(t=i.url)&&void 0!==t?t:void 0}}class Om extends Bs{constructor(e,i){super(e),this.success=i.success,this.figmaEmbed=i.figmaEmbed?new Cm(e,i.figmaEmbed):void 0}}class Pm extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success}}class jm extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.webhookSecret=i.webhookSecret,this._integration=null!==(n=i.integration)&&void 0!==n?n:void 0}get integration(){var e,i;return(null===(e=this._integration)||void 0===e?void 0:e.id)?new oc(this._request).fetch(null===(i=this._integration)||void 0===i?void 0:i.id):void 0}}class Um extends Bs{constructor(e,i){var n;super(e),this.token=null!==(n=i.token)&&void 0!==n?n:void 0,this.organizations=i.organizations?i.organizations.map((i=>new Bm(e,i))):void 0}}class Bm extends Bs{constructor(e,i){super(e),this.id=i.id,this.login=i.login,this.name=i.name,this.repositories=i.repositories.map((i=>new Em(e,i)))}}class Em extends Bs{constructor(e,i){super(e),this.id=i.id,this.name=i.name}}class zm extends Bs{constructor(e,i){var n;super(e),this.sheetId=i.sheetId,this.spreadsheetId=i.spreadsheetId,this.spreadsheetUrl=i.spreadsheetUrl,this.updatedIssuesAt=null!==(n=Ms(i.updatedIssuesAt))&&void 0!==n?n:new Date}}class Lm extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.url=null!==(n=i.url)&&void 0!==n?n:void 0}}class Mm extends Bs{constructor(e,i){var n,a,t,d;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.service=i.service,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this._creator=i.creator,this._team=null!==(d=i.team)&&void 0!==d?d:void 0}get creator(){return new Wc(this._request).fetch(this._creator.id)}get organization(){return new Fc(this._request).fetch()}get team(){var e,i;return(null===(e=this._team)||void 0===e?void 0:e.id)?new Ec(this._request).fetch(null===(i=this._team)||void 0===i?void 0:i.id):void 0}delete(){return new zv(this._request).fetch(this.id)}resourceArchive(){return new Zv(this._request).fetch(this.id)}settingsUpdate(e){return new Xv(this._request).fetch(this.id,e)}}class Rm extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Mm(e,i))),new Eu(e,n.pageInfo))}}class Qm extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._integration=null!==(n=i.integration)&&void 0!==n?n:void 0}get integration(){var e,i;return(null===(e=this._integration)||void 0===e?void 0:e.id)?new oc(this._request).fetch(null===(i=this._integration)||void 0===i?void 0:i.id):void 0}}class Wm extends Bs{constructor(e,i){var n,a,t;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.resourceId=i.resourceId,this.resourceType=i.resourceType,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this.data=new Hm(e,i.data),this.pullRequest=new Hu(e,i.pullRequest),this._integration=i.integration,this._issue=i.issue}get integration(){return new oc(this._request).fetch(this._integration.id)}get issue(){return new mc(this._request).fetch(this._issue.id)}archive(){return new Zv(this._request).fetch(this.id)}}class Hm extends Bs{constructor(e,i){super(e),this.githubCommit=i.githubCommit?new rm(e,i.githubCommit):void 0,this.githubPullRequest=i.githubPullRequest?new Hu(e,i.githubPullRequest):void 0,this.gitlabMergeRequest=i.gitlabMergeRequest?new Hu(e,i.gitlabMergeRequest):void 0,this.sentryIssue=i.sentryIssue?new ek(e,i.sentryIssue):void 0}}class Gm extends Bs{constructor(e,i){var n,a;super(e),this.sendNoteOnComment=null!==(n=i.sendNoteOnComment)&&void 0!==n?n:void 0,this.sendNoteOnStatusChange=null!==(a=i.sendNoteOnStatusChange)&&void 0!==a?a:void 0}}class Jm extends Bs{constructor(e,i){var n,a,t;super(e),this.created=null!==(n=Ms(i.created))&&void 0!==n?n:new Date,this.dueDate=null!==(a=i.dueDate)&&void 0!==a?a:void 0,this.status=i.status,this.total=i.total,this.url=null!==(t=i.url)&&void 0!==t?t:void 0}}class $m extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s,m,u,k,c,v,N,p,f,h,b,y,S;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.autoArchivedAt=null!==(a=Ms(i.autoArchivedAt))&&void 0!==a?a:void 0,this.autoClosedAt=null!==(t=Ms(i.autoClosedAt))&&void 0!==t?t:void 0,this.boardOrder=i.boardOrder,this.branchName=i.branchName,this.canceledAt=null!==(d=Ms(i.canceledAt))&&void 0!==d?d:void 0,this.completedAt=null!==(l=Ms(i.completedAt))&&void 0!==l?l:void 0,this.createdAt=null!==(r=Ms(i.createdAt))&&void 0!==r?r:new Date,this.customerTicketCount=i.customerTicketCount,this.description=null!==(o=i.description)&&void 0!==o?o:void 0,this.dueDate=null!==(s=i.dueDate)&&void 0!==s?s:void 0,this.estimate=null!==(m=i.estimate)&&void 0!==m?m:void 0,this.id=i.id,this.identifier=i.identifier,this.number=i.number,this.previousIdentifiers=i.previousIdentifiers,this.priority=i.priority,this.priorityLabel=i.priorityLabel,this.snoozedUntilAt=null!==(u=Ms(i.snoozedUntilAt))&&void 0!==u?u:void 0,this.sortOrder=i.sortOrder,this.startedAt=null!==(k=Ms(i.startedAt))&&void 0!==k?k:void 0,this.subIssueSortOrder=null!==(c=i.subIssueSortOrder)&&void 0!==c?c:void 0,this.title=i.title,this.trashed=null!==(v=i.trashed)&&void 0!==v?v:void 0,this.updatedAt=null!==(N=Ms(i.updatedAt))&&void 0!==N?N:new Date,this.url=i.url,this._assignee=null!==(p=i.assignee)&&void 0!==p?p:void 0,this._creator=null!==(f=i.creator)&&void 0!==f?f:void 0,this._cycle=null!==(h=i.cycle)&&void 0!==h?h:void 0,this._parent=null!==(b=i.parent)&&void 0!==b?b:void 0,this._project=null!==(y=i.project)&&void 0!==y?y:void 0,this._snoozedBy=null!==(S=i.snoozedBy)&&void 0!==S?S:void 0,this._state=i.state,this._team=i.team}get assignee(){var e,i;return(null===(e=this._assignee)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._assignee)||void 0===i?void 0:i.id):void 0}get creator(){var e,i;return(null===(e=this._creator)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._creator)||void 0===i?void 0:i.id):void 0}get cycle(){var e,i;return(null===(e=this._cycle)||void 0===e?void 0:e.id)?new Xk(this._request).fetch(null===(i=this._cycle)||void 0===i?void 0:i.id):void 0}get parent(){var e,i;return(null===(e=this._parent)||void 0===e?void 0:e.id)?new mc(this._request).fetch(null===(i=this._parent)||void 0===i?void 0:i.id):void 0}get project(){var e,i;return(null===(e=this._project)||void 0===e?void 0:e.id)?new wc(this._request).fetch(null===(i=this._project)||void 0===i?void 0:i.id):void 0}get snoozedBy(){var e,i;return(null===(e=this._snoozedBy)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._snoozedBy)||void 0===i?void 0:i.id):void 0}get state(){return new Zc(this._request).fetch(this._state.id)}get team(){return new Ec(this._request).fetch(this._team.id)}attachments(e){return new Rp(this._request,this.id,e).fetch(e)}children(e){return new Qp(this._request,this.id,e).fetch(e)}comments(e){return new Wp(this._request,this.id,e).fetch(e)}history(e){return new Hp(this._request,this.id,e).fetch(e)}inverseRelations(e){return new Gp(this._request,this.id,e).fetch(e)}labels(e){return new Jp(this._request,this.id,e).fetch(e)}relations(e){return new $p(this._request,this.id,e).fetch(e)}subscribers(e){return new Kp(this._request,this.id,e).fetch(e)}archive(e){return new lN(this._request).fetch(this.id,e)}delete(){return new sN(this._request).fetch(this.id)}unarchive(){return new DN(this._request).fetch(this.id)}update(e){return new VN(this._request).fetch(this.id,e)}}class Km extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.issues=i.issues.map((i=>new $m(e,i)))}}class Zm extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new $m(e,i))),new Eu(e,n.pageInfo))}}class Ym extends Bs{constructor(e,i){var n,a;super(e),this.actorId=null!==(n=i.actorId)&&void 0!==n?n:void 0,this.descriptionData=i.descriptionData,this.id=i.id,this.type=i.type,this.updatedAt=null!==(a=Ms(i.updatedAt))&&void 0!==a?a:new Date}}class Xm extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s,m,u,k,c,v,N,p,f,h,b,y,S,g,D,V,F,A,T,_,I,w,q,x,C;super(e),this.addedLabelIds=null!==(n=i.addedLabelIds)&&void 0!==n?n:void 0,this.archived=null!==(a=i.archived)&&void 0!==a?a:void 0,this.archivedAt=null!==(t=Ms(i.archivedAt))&&void 0!==t?t:void 0,this.autoArchived=null!==(d=i.autoArchived)&&void 0!==d?d:void 0,this.autoClosed=null!==(l=i.autoClosed)&&void 0!==l?l:void 0,this.createdAt=null!==(r=Ms(i.createdAt))&&void 0!==r?r:new Date,this.fromDueDate=null!==(o=i.fromDueDate)&&void 0!==o?o:void 0,this.fromEstimate=null!==(s=i.fromEstimate)&&void 0!==s?s:void 0,this.fromPriority=null!==(m=i.fromPriority)&&void 0!==m?m:void 0,this.fromTitle=null!==(u=i.fromTitle)&&void 0!==u?u:void 0,this.id=i.id,this.removedLabelIds=null!==(k=i.removedLabelIds)&&void 0!==k?k:void 0,this.source=null!==(c=Rs(i.source))&&void 0!==c?c:void 0,this.toDueDate=null!==(v=i.toDueDate)&&void 0!==v?v:void 0,this.toEstimate=null!==(N=i.toEstimate)&&void 0!==N?N:void 0,this.toPriority=null!==(p=i.toPriority)&&void 0!==p?p:void 0,this.toTitle=null!==(f=i.toTitle)&&void 0!==f?f:void 0,this.trashed=null!==(h=i.trashed)&&void 0!==h?h:void 0,this.updatedAt=null!==(b=Ms(i.updatedAt))&&void 0!==b?b:new Date,this.updatedDescription=null!==(y=i.updatedDescription)&&void 0!==y?y:void 0,this.issueImport=i.issueImport?new iu(e,i.issueImport):void 0,this.relationChanges=i.relationChanges?i.relationChanges.map((i=>new uu(e,i))):void 0,this._actor=null!==(S=i.actor)&&void 0!==S?S:void 0,this._fromAssignee=null!==(g=i.fromAssignee)&&void 0!==g?g:void 0,this._fromCycle=null!==(D=i.fromCycle)&&void 0!==D?D:void 0,this._fromParent=null!==(V=i.fromParent)&&void 0!==V?V:void 0,this._fromProject=null!==(F=i.fromProject)&&void 0!==F?F:void 0,this._fromState=null!==(A=i.fromState)&&void 0!==A?A:void 0,this._fromTeam=null!==(T=i.fromTeam)&&void 0!==T?T:void 0,this._issue=i.issue,this._toAssignee=null!==(_=i.toAssignee)&&void 0!==_?_:void 0,this._toCycle=null!==(I=i.toCycle)&&void 0!==I?I:void 0,this._toParent=null!==(w=i.toParent)&&void 0!==w?w:void 0,this._toProject=null!==(q=i.toProject)&&void 0!==q?q:void 0,this._toState=null!==(x=i.toState)&&void 0!==x?x:void 0,this._toTeam=null!==(C=i.toTeam)&&void 0!==C?C:void 0}get actor(){var e,i;return(null===(e=this._actor)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._actor)||void 0===i?void 0:i.id):void 0}get fromAssignee(){var e,i;return(null===(e=this._fromAssignee)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._fromAssignee)||void 0===i?void 0:i.id):void 0}get fromCycle(){var e,i;return(null===(e=this._fromCycle)||void 0===e?void 0:e.id)?new Xk(this._request).fetch(null===(i=this._fromCycle)||void 0===i?void 0:i.id):void 0}get fromParent(){var e,i;return(null===(e=this._fromParent)||void 0===e?void 0:e.id)?new mc(this._request).fetch(null===(i=this._fromParent)||void 0===i?void 0:i.id):void 0}get fromProject(){var e,i;return(null===(e=this._fromProject)||void 0===e?void 0:e.id)?new wc(this._request).fetch(null===(i=this._fromProject)||void 0===i?void 0:i.id):void 0}get fromState(){var e,i;return(null===(e=this._fromState)||void 0===e?void 0:e.id)?new Zc(this._request).fetch(null===(i=this._fromState)||void 0===i?void 0:i.id):void 0}get fromTeam(){var e,i;return(null===(e=this._fromTeam)||void 0===e?void 0:e.id)?new Ec(this._request).fetch(null===(i=this._fromTeam)||void 0===i?void 0:i.id):void 0}get issue(){return new mc(this._request).fetch(this._issue.id)}get toAssignee(){var e,i;return(null===(e=this._toAssignee)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._toAssignee)||void 0===i?void 0:i.id):void 0}get toCycle(){var e,i;return(null===(e=this._toCycle)||void 0===e?void 0:e.id)?new Xk(this._request).fetch(null===(i=this._toCycle)||void 0===i?void 0:i.id):void 0}get toParent(){var e,i;return(null===(e=this._toParent)||void 0===e?void 0:e.id)?new mc(this._request).fetch(null===(i=this._toParent)||void 0===i?void 0:i.id):void 0}get toProject(){var e,i;return(null===(e=this._toProject)||void 0===e?void 0:e.id)?new wc(this._request).fetch(null===(i=this._toProject)||void 0===i?void 0:i.id):void 0}get toState(){var e,i;return(null===(e=this._toState)||void 0===e?void 0:e.id)?new Zc(this._request).fetch(null===(i=this._toState)||void 0===i?void 0:i.id):void 0}get toTeam(){var e,i;return(null===(e=this._toTeam)||void 0===e?void 0:e.id)?new Ec(this._request).fetch(null===(i=this._toTeam)||void 0===i?void 0:i.id):void 0}}class eu extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Xm(e,i))),new Eu(e,n.pageInfo))}}class iu extends Bs{constructor(e,i){var n,a,t,d,l;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.creatorId=i.creatorId,this.error=null!==(t=i.error)&&void 0!==t?t:void 0,this.id=i.id,this.mapping=null!==(d=Rs(i.mapping))&&void 0!==d?d:void 0,this.service=i.service,this.status=i.status,this.updatedAt=null!==(l=Ms(i.updatedAt))&&void 0!==l?l:new Date}delete(e){return new vN(this._request).fetch(e)}update(e){return new pN(this._request).fetch(this.id,e)}}class nu extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.issueImport=i.issueImport?new iu(e,i.issueImport):void 0}}class au extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.issueImport=i.issueImport?new iu(e,i.issueImport):void 0}}class tu extends Bs{constructor(e,i){var n,a,t,d,l,r;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.color=i.color,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.description=null!==(t=i.description)&&void 0!==t?t:void 0,this.id=i.id,this.name=i.name,this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this._creator=null!==(l=i.creator)&&void 0!==l?l:void 0,this._team=null!==(r=i.team)&&void 0!==r?r:void 0}get creator(){var e,i;return(null===(e=this._creator)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._creator)||void 0===i?void 0:i.id):void 0}get organization(){return new Fc(this._request).fetch()}get team(){var e,i;return(null===(e=this._team)||void 0===e?void 0:e.id)?new Ec(this._request).fetch(null===(i=this._team)||void 0===i?void 0:i.id):void 0}issues(e){return new Zp(this._request,this.id,e).fetch(e)}archive(){return new fN(this._request).fetch(this.id)}update(e){return new bN(this._request).fetch(this.id,e)}}class du extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new tu(e,i))),new Eu(e,n.pageInfo))}}class lu extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._issueLabel=i.issueLabel}get issueLabel(){return new kc(this._request).fetch(this._issueLabel.id)}}class ru extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._issue=null!==(n=i.issue)&&void 0!==n?n:void 0}get issue(){var e,i;return(null===(e=this._issue)||void 0===e?void 0:e.id)?new mc(this._request).fetch(null===(i=this._issue)||void 0===i?void 0:i.id):void 0}}class ou extends Bs{constructor(e,i){super(e),this.label=i.label,this.priority=i.priority}}class su extends Bs{constructor(e,i){var n,a,t;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.type=i.type,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this._issue=i.issue,this._relatedIssue=i.relatedIssue}get issue(){return new mc(this._request).fetch(this._issue.id)}get relatedIssue(){return new mc(this._request).fetch(this._relatedIssue.id)}delete(){return new SN(this._request).fetch(this.id)}update(e){return new gN(this._request).fetch(this.id,e)}}class mu extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new su(e,i))),new Eu(e,n.pageInfo))}}class uu extends Bs{constructor(e,i){super(e),this.identifier=i.identifier,this.type=i.type}}class ku extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._issueRelation=i.issueRelation}get issueRelation(){return new Nc(this._request).fetch(this._issueRelation.id)}}class cu extends Bs{constructor(e,i){super(e),this.jiraProjectId=i.jiraProjectId,this.linearTeamId=i.linearTeamId}}class vu extends Bs{constructor(e,i){super(e),this.id=i.id,this.key=i.key,this.name=i.name}}class Nu extends Bs{constructor(e,i){super(e),this.projectMapping=i.projectMapping?i.projectMapping.map((i=>new cu(e,i))):void 0,this.projects=i.projects.map((i=>new vu(e,i)))}}class pu extends Bs{constructor(e,i){var n,a,t;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.name=i.name,this.sortOrder=i.sortOrder,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date}get organization(){return new Fc(this._request).fetch()}projects(e){return new Yp(this._request,this.id,e).fetch(e)}delete(){return new IN(this._request).fetch(this.id)}update(e){return new wN(this._request).fetch(this.id,e)}}class fu extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new pu(e,i))),new Eu(e,n.pageInfo))}}class hu extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._milestone=null!==(n=i.milestone)&&void 0!==n?n:void 0}get milestone(){var e,i;return(null===(e=this._milestone)||void 0===e?void 0:e.id)?new bc(this._request).fetch(null===(i=this._milestone)||void 0===i?void 0:i.id):void 0}}class bu extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.emailedAt=null!==(t=Ms(i.emailedAt))&&void 0!==t?t:void 0,this.id=i.id,this.reactionEmoji=null!==(d=i.reactionEmoji)&&void 0!==d?d:void 0,this.readAt=null!==(l=Ms(i.readAt))&&void 0!==l?l:void 0,this.snoozedUntilAt=null!==(r=Ms(i.snoozedUntilAt))&&void 0!==r?r:void 0,this.type=i.type,this.updatedAt=null!==(o=Ms(i.updatedAt))&&void 0!==o?o:new Date,this._comment=null!==(s=i.comment)&&void 0!==s?s:void 0,this._issue=i.issue,this._team=i.team,this._user=i.user}get comment(){var e,i;return(null===(e=this._comment)||void 0===e?void 0:e.id)?new $k(this._request).fetch(null===(i=this._comment)||void 0===i?void 0:i.id):void 0}get issue(){return new mc(this._request).fetch(this._issue.id)}get team(){return new Ec(this._request).fetch(this._team.id)}get user(){return new Wc(this._request).fetch(this._user.id)}archive(){return new qN(this._request).fetch(this.id)}unarchive(){return new PN(this._request).fetch(this.id)}update(e){return new jN(this._request).fetch(this.id,e)}}class yu extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new bu(e,i))),new Eu(e,n.pageInfo))}}class Su extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._notification=i.notification}get notification(){return new Sc(this._request).fetch(this._notification.id)}}class gu extends Bs{constructor(e,i){var n,a,t,d,l;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.type=i.type,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this._project=null!==(d=i.project)&&void 0!==d?d:void 0,this._team=null!==(l=i.team)&&void 0!==l?l:void 0,this._user=i.user}get project(){var e,i;return(null===(e=this._project)||void 0===e?void 0:e.id)?new wc(this._request).fetch(null===(i=this._project)||void 0===i?void 0:i.id):void 0}get team(){var e,i;return(null===(e=this._team)||void 0===e?void 0:e.id)?new Ec(this._request).fetch(null===(i=this._team)||void 0===i?void 0:i.id):void 0}get user(){return new Wc(this._request).fetch(this._user.id)}delete(){return new ON(this._request).fetch(this.id)}}class Du extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new gu(e,i))),new Eu(e,n.pageInfo))}}class Vu extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._notificationSubscription=i.notificationSubscription}get notificationSubscription(){return new gc(this._request).fetch(this._notificationSubscription.id)}}class Fu extends Bs{constructor(e,i){var n,a,t,d;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.clientId=i.clientId,this.clientSecret=i.clientSecret,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.description=i.description,this.developer=i.developer,this.developerUrl=i.developerUrl,this.id=i.id,this.imageUrl=i.imageUrl,this.name=i.name,this.publicEnabled=i.publicEnabled,this.redirectUris=i.redirectUris,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this.webhookResourceTypes=i.webhookResourceTypes,this.webhookUrl=null!==(d=i.webhookUrl)&&void 0!==d?d:void 0}archive(){return new UN(this._request).fetch(this.id)}rotateSecret(){return new EN(this._request).fetch(this.id)}update(e){return new zN(this._request).fetch(this.id,e)}}class Au extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.oauthClient=new Fu(e,i.oauthClient)}}class Tu extends Bs{constructor(e,i){super(e),this.success=i.success}}class _u extends Bs{constructor(e,i){var n,a,t,d,l,r;super(e),this.allowedAuthServices=i.allowedAuthServices,this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.createdIssueCount=i.createdIssueCount,this.deletionRequestedAt=null!==(t=Ms(i.deletionRequestedAt))&&void 0!==t?t:void 0,this.gitBranchFormat=null!==(d=i.gitBranchFormat)&&void 0!==d?d:void 0,this.gitLinkbackMessagesEnabled=i.gitLinkbackMessagesEnabled,this.gitPublicLinkbackMessagesEnabled=i.gitPublicLinkbackMessagesEnabled,this.id=i.id,this.logoUrl=null!==(l=i.logoUrl)&&void 0!==l?l:void 0,this.name=i.name,this.periodUploadVolume=i.periodUploadVolume,this.roadmapEnabled=i.roadmapEnabled,this.samlEnabled=i.samlEnabled,this.updatedAt=null!==(r=Ms(i.updatedAt))&&void 0!==r?r:new Date,this.urlKey=i.urlKey,this.userCount=i.userCount}get subscription(){return new Bc(this._request).fetch()}integrations(e){return new Xp(this._request,e).fetch(e)}labels(e){return new ef(this._request,e).fetch(e)}milestones(e){return new nf(this._request,e).fetch(e)}teams(e){return new af(this._request,e).fetch(e)}templates(e){return new tf(this._request,e).fetch(e)}users(e){return new df(this._request,e).fetch(e)}delete(e){return new RN(this._request).fetch(e)}update(e){return new KN(this._request).fetch(e)}}class Iu extends Bs{constructor(e,i){super(e),this.success=i.success}}class wu extends Bs{constructor(e,i){super(e),this.success=i.success}}class qu extends Bs{constructor(e,i){var n,a,t,d,l;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.name=i.name,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this.verificationEmail=null!==(d=i.verificationEmail)&&void 0!==d?d:void 0,this.verified=i.verified,this._creator=null!==(l=i.creator)&&void 0!==l?l:void 0}get creator(){var e,i;return(null===(e=this._creator)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._creator)||void 0===i?void 0:i.id):void 0}delete(){return new HN(this._request).fetch(this.id)}}class xu extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.organizationDomain=new qu(e,i.organizationDomain)}}class Cu extends Bs{constructor(e,i){super(e),this.exists=i.exists,this.success=i.success}}class Ou extends Bs{constructor(e,i){var n,a,t,d,l,r;super(e),this.acceptedAt=null!==(n=Ms(i.acceptedAt))&&void 0!==n?n:void 0,this.archivedAt=null!==(a=Ms(i.archivedAt))&&void 0!==a?a:void 0,this.createdAt=null!==(t=Ms(i.createdAt))&&void 0!==t?t:new Date,this.email=i.email,this.expiresAt=null!==(d=Ms(i.expiresAt))&&void 0!==d?d:void 0,this.external=i.external,this.id=i.id,this.updatedAt=null!==(l=Ms(i.updatedAt))&&void 0!==l?l:new Date,this._invitee=null!==(r=i.invitee)&&void 0!==r?r:void 0,this._inviter=i.inviter}get invitee(){var e,i;return(null===(e=this._invitee)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._invitee)||void 0===i?void 0:i.id):void 0}get inviter(){return new Wc(this._request).fetch(this._inviter.id)}get organization(){return new Fc(this._request).fetch()}delete(){return new $N(this._request).fetch(this.id)}}class Pu extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Ou(e,i))),new Eu(e,n.pageInfo))}}class ju extends Bs{constructor(e,i){var n,a;super(e),this.accepted=i.accepted,this.createdAt=null!==(n=Ms(i.createdAt))&&void 0!==n?n:new Date,this.email=i.email,this.expired=i.expired,this.inviter=i.inviter,this.organizationId=i.organizationId,this.organizationLogoUrl=null!==(a=i.organizationLogoUrl)&&void 0!==a?a:void 0,this.organizationName=i.organizationName}}class Uu extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._organizationInvite=i.organizationInvite}get organizationInvite(){return new Tc(this._request).fetch(this._organizationInvite.id)}}class Bu extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success}get organization(){return new Fc(this._request).fetch()}}class Eu extends Bs{constructor(e,i){var n,a;super(e),this.endCursor=null!==(n=i.endCursor)&&void 0!==n?n:void 0,this.hasNextPage=i.hasNextPage,this.hasPreviousPage=i.hasPreviousPage,this.startCursor=null!==(a=i.startCursor)&&void 0!==a?a:void 0}}class zu extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s,m,u,k;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.autoArchivedAt=null!==(a=Ms(i.autoArchivedAt))&&void 0!==a?a:void 0,this.canceledAt=null!==(t=Ms(i.canceledAt))&&void 0!==t?t:void 0,this.color=i.color,this.completedAt=null!==(d=Ms(i.completedAt))&&void 0!==d?d:void 0,this.completedIssueCountHistory=i.completedIssueCountHistory,this.completedScopeHistory=i.completedScopeHistory,this.createdAt=null!==(l=Ms(i.createdAt))&&void 0!==l?l:new Date,this.description=i.description,this.icon=null!==(r=i.icon)&&void 0!==r?r:void 0,this.id=i.id,this.issueCountHistory=i.issueCountHistory,this.name=i.name,this.progress=i.progress,this.scopeHistory=i.scopeHistory,this.slackIssueComments=i.slackIssueComments,this.slackIssueStatuses=i.slackIssueStatuses,this.slackNewIssue=i.slackNewIssue,this.slugId=i.slugId,this.sortOrder=i.sortOrder,this.startedAt=null!==(o=Ms(i.startedAt))&&void 0!==o?o:void 0,this.state=i.state,this.targetDate=null!==(s=i.targetDate)&&void 0!==s?s:void 0,this.updatedAt=null!==(m=Ms(i.updatedAt))&&void 0!==m?m:new Date,this.url=i.url,this._creator=i.creator,this._lead=null!==(u=i.lead)&&void 0!==u?u:void 0,this._milestone=null!==(k=i.milestone)&&void 0!==k?k:void 0}get creator(){return new Wc(this._request).fetch(this._creator.id)}get lead(){var e,i;return(null===(e=this._lead)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._lead)||void 0===i?void 0:i.id):void 0}get milestone(){var e,i;return(null===(e=this._milestone)||void 0===e?void 0:e.id)?new bc(this._request).fetch(null===(i=this._milestone)||void 0===i?void 0:i.id):void 0}documents(e){return new lf(this._request,this.id,e).fetch(e)}issues(e){return new rf(this._request,this.id,e).fetch(e)}links(e){return new of(this._request,this.id,e).fetch(e)}members(e){return new sf(this._request,this.id,e).fetch(e)}teams(e){return new mf(this._request,this.id,e).fetch(e)}archive(){return new ZN(this._request).fetch(this.id)}unarchive(){return new np(this._request).fetch(this.id)}update(e){return new ap(this._request).fetch(this.id,e)}}class Lu extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new zu(e,i))),new Eu(e,n.pageInfo))}}class Mu extends Bs{constructor(e,i){var n,a,t;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.label=i.label,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this.url=i.url,this._creator=i.creator,this._project=i.project}get creator(){return new Wc(this._request).fetch(this._creator.id)}get project(){return new wc(this._request).fetch(this._project.id)}delete(){return new ep(this._request).fetch(this.id)}update(e){return new ip(this._request).fetch(this.id,e)}}class Ru extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Mu(e,i))),new Eu(e,n.pageInfo))}}class Qu extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._projectLink=i.projectLink}get projectLink(){return new qc(this._request).fetch(this._projectLink.id)}}class Wu extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._project=null!==(n=i.project)&&void 0!==n?n:void 0}get project(){var e,i;return(null===(e=this._project)||void 0===e?void 0:e.id)?new wc(this._request).fetch(null===(i=this._project)||void 0===i?void 0:i.id):void 0}}class Hu extends Bs{constructor(e,i){super(e),this.branch=i.branch,this.closedAt=i.closedAt,this.createdAt=i.createdAt,this.draft=i.draft,this.id=i.id,this.mergedAt=i.mergedAt,this.number=i.number,this.repoLogin=i.repoLogin,this.repoName=i.repoName,this.status=i.status,this.title=i.title,this.updatedAt=i.updatedAt,this.url=i.url,this.userId=i.userId,this.userLogin=i.userLogin}}class Gu extends Bs{constructor(e,i){var n,a,t;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date}delete(){return new dp(this._request).fetch(this.id)}}class Ju extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success}}class $u extends Bs{constructor(e,i){super(e),this.success=i.success}}class Ku extends Bs{constructor(e,i){var n,a,t;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.emoji=i.emoji,this.id=i.id,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this._comment=i.comment,this._user=i.user}get comment(){return new $k(this._request).fetch(this._comment.id)}get user(){return new Wc(this._request).fetch(this._user.id)}delete(){return new rp(this._request).fetch(this.id)}}class Zu extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Ku(e,i))),new Eu(e,n.pageInfo))}}class Yu extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._reaction=i.reaction}get reaction(){return new Pc(this._request).fetch(this._reaction.id)}}class Xu extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success}}class ek extends Bs{constructor(e,i){var n;super(e),this.actorId=i.actorId,this.actorName=i.actorName,this.actorType=i.actorType,this.firstSeen=i.firstSeen,this.firstVersion=null!==(n=i.firstVersion)&&void 0!==n?n:void 0,this.issueId=i.issueId,this.issueTitle=i.issueTitle,this.projectId=i.projectId,this.projectSlug=i.projectSlug,this.shortId=i.shortId,this.webUrl=i.webUrl}}class ik extends Bs{constructor(e,i){super(e),this.organizationSlug=i.organizationSlug}}class nk extends Bs{constructor(e,i){super(e),this.channel=i.channel,this.channelId=i.channelId,this.configurationUrl=i.configurationUrl}}class ak extends Bs{constructor(e,i){super(e),this.samlSsoUrl=i.samlSsoUrl,this.success=i.success}}class tk extends Bs{constructor(e,i){var n;super(e),this.clientIds=i.clientIds,this.steps=null!==(n=i.steps)&&void 0!==n?n:void 0,this.version=i.version}}class dk extends Bs{constructor(e,i){var n,a,t,d,l,r,o;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.canceledAt=null!==(a=Ms(i.canceledAt))&&void 0!==a?a:void 0,this.createdAt=null!==(t=Ms(i.createdAt))&&void 0!==t?t:new Date,this.id=i.id,this.nextBillingAt=null!==(d=Ms(i.nextBillingAt))&&void 0!==d?d:void 0,this.pendingChangeType=null!==(l=i.pendingChangeType)&&void 0!==l?l:void 0,this.seats=i.seats,this.type=i.type,this.updatedAt=null!==(r=Ms(i.updatedAt))&&void 0!==r?r:new Date,this._creator=null!==(o=i.creator)&&void 0!==o?o:void 0}get creator(){var e,i;return(null===(e=this._creator)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._creator)||void 0===i?void 0:i.id):void 0}get organization(){return new Fc(this._request).fetch()}}class lk extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s,m,u,k,c,v,N,p,f,h,b,y,S;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.autoArchivePeriod=i.autoArchivePeriod,this.autoClosePeriod=null!==(a=i.autoClosePeriod)&&void 0!==a?a:void 0,this.autoCloseStateId=null!==(t=i.autoCloseStateId)&&void 0!==t?t:void 0,this.color=null!==(d=i.color)&&void 0!==d?d:void 0,this.createdAt=null!==(l=Ms(i.createdAt))&&void 0!==l?l:new Date,this.cycleCalenderUrl=i.cycleCalenderUrl,this.cycleCooldownTime=i.cycleCooldownTime,this.cycleDuration=i.cycleDuration,this.cycleIssueAutoAssignCompleted=i.cycleIssueAutoAssignCompleted,this.cycleIssueAutoAssignStarted=i.cycleIssueAutoAssignStarted,this.cycleLockToActive=i.cycleLockToActive,this.cycleStartDay=i.cycleStartDay,this.cyclesEnabled=i.cyclesEnabled,this.defaultIssueEstimate=i.defaultIssueEstimate,this.defaultTemplateForMembersId=null!==(r=i.defaultTemplateForMembersId)&&void 0!==r?r:void 0,this.defaultTemplateForNonMembersId=null!==(o=i.defaultTemplateForNonMembersId)&&void 0!==o?o:void 0,this.description=null!==(s=i.description)&&void 0!==s?s:void 0,this.groupIssueHistory=i.groupIssueHistory,this.icon=null!==(m=i.icon)&&void 0!==m?m:void 0,this.id=i.id,this.inviteHash=i.inviteHash,this.issueEstimationAllowZero=i.issueEstimationAllowZero,this.issueEstimationExtended=i.issueEstimationExtended,this.issueEstimationType=i.issueEstimationType,this.issueOrderingNoPriorityFirst=i.issueOrderingNoPriorityFirst,this.key=i.key,this.name=i.name,this.private=i.private,this.slackIssueComments=i.slackIssueComments,this.slackIssueStatuses=i.slackIssueStatuses,this.slackNewIssue=i.slackNewIssue,this.timezone=i.timezone,this.triageEnabled=i.triageEnabled,this.upcomingCycleCount=i.upcomingCycleCount,this.updatedAt=null!==(u=Ms(i.updatedAt))&&void 0!==u?u:new Date,this._activeCycle=null!==(k=i.activeCycle)&&void 0!==k?k:void 0,this._defaultIssueState=null!==(c=i.defaultIssueState)&&void 0!==c?c:void 0,this._defaultTemplateForMembers=null!==(v=i.defaultTemplateForMembers)&&void 0!==v?v:void 0,this._defaultTemplateForNonMembers=null!==(N=i.defaultTemplateForNonMembers)&&void 0!==N?N:void 0,this._draftWorkflowState=null!==(p=i.draftWorkflowState)&&void 0!==p?p:void 0,this._markedAsDuplicateWorkflowState=null!==(f=i.markedAsDuplicateWorkflowState)&&void 0!==f?f:void 0,this._mergeWorkflowState=null!==(h=i.mergeWorkflowState)&&void 0!==h?h:void 0,this._reviewWorkflowState=null!==(b=i.reviewWorkflowState)&&void 0!==b?b:void 0,this._startWorkflowState=null!==(y=i.startWorkflowState)&&void 0!==y?y:void 0,this._triageIssueState=null!==(S=i.triageIssueState)&&void 0!==S?S:void 0}get activeCycle(){var e,i;return(null===(e=this._activeCycle)||void 0===e?void 0:e.id)?new Xk(this._request).fetch(null===(i=this._activeCycle)||void 0===i?void 0:i.id):void 0}get defaultIssueState(){var e,i;return(null===(e=this._defaultIssueState)||void 0===e?void 0:e.id)?new Zc(this._request).fetch(null===(i=this._defaultIssueState)||void 0===i?void 0:i.id):void 0}get defaultTemplateForMembers(){var e,i;return(null===(e=this._defaultTemplateForMembers)||void 0===e?void 0:e.id)?new Rc(this._request).fetch(null===(i=this._defaultTemplateForMembers)||void 0===i?void 0:i.id):void 0}get defaultTemplateForNonMembers(){var e,i;return(null===(e=this._defaultTemplateForNonMembers)||void 0===e?void 0:e.id)?new Rc(this._request).fetch(null===(i=this._defaultTemplateForNonMembers)||void 0===i?void 0:i.id):void 0}get draftWorkflowState(){var e,i;return(null===(e=this._draftWorkflowState)||void 0===e?void 0:e.id)?new Zc(this._request).fetch(null===(i=this._draftWorkflowState)||void 0===i?void 0:i.id):void 0}get markedAsDuplicateWorkflowState(){var e,i;return(null===(e=this._markedAsDuplicateWorkflowState)||void 0===e?void 0:e.id)?new Zc(this._request).fetch(null===(i=this._markedAsDuplicateWorkflowState)||void 0===i?void 0:i.id):void 0}get mergeWorkflowState(){var e,i;return(null===(e=this._mergeWorkflowState)||void 0===e?void 0:e.id)?new Zc(this._request).fetch(null===(i=this._mergeWorkflowState)||void 0===i?void 0:i.id):void 0}get organization(){return new Fc(this._request).fetch()}get reviewWorkflowState(){var e,i;return(null===(e=this._reviewWorkflowState)||void 0===e?void 0:e.id)?new Zc(this._request).fetch(null===(i=this._reviewWorkflowState)||void 0===i?void 0:i.id):void 0}get startWorkflowState(){var e,i;return(null===(e=this._startWorkflowState)||void 0===e?void 0:e.id)?new Zc(this._request).fetch(null===(i=this._startWorkflowState)||void 0===i?void 0:i.id):void 0}get triageIssueState(){var e,i;return(null===(e=this._triageIssueState)||void 0===e?void 0:e.id)?new Zc(this._request).fetch(null===(i=this._triageIssueState)||void 0===i?void 0:i.id):void 0}cycles(e){return new uf(this._request,this.id,e).fetch(e)}issues(e){return new kf(this._request,this.id,e).fetch(e)}labels(e){return new cf(this._request,this.id,e).fetch(e)}members(e){return new vf(this._request,this.id,e).fetch(e)}memberships(e){return new Nf(this._request,this.id,e).fetch(e)}projects(e){return new pf(this._request,this.id,e).fetch(e)}states(e){return new ff(this._request,this.id,e).fetch(e)}templates(e){return new hf(this._request,this.id,e).fetch(e)}webhooks(e){return new bf(this._request,this.id,e).fetch(e)}delete(){return new kp(this._request).fetch(this.id)}update(e){return new fp(this._request).fetch(this.id,e)}}class rk extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new lk(e,i))),new Eu(e,n.pageInfo))}}class ok extends Bs{constructor(e,i){var n,a,t,d;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.owner=null!==(t=i.owner)&&void 0!==t?t:void 0,this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this._team=i.team,this._user=i.user}get team(){return new Ec(this._request).fetch(this._team.id)}get user(){return new Wc(this._request).fetch(this._user.id)}delete(){return new Np(this._request).fetch(this.id)}update(e){return new pp(this._request).fetch(this.id,e)}}class sk extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new ok(e,i))),new Eu(e,n.pageInfo))}}class mk extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._teamMembership=null!==(n=i.teamMembership)&&void 0!==n?n:void 0}get teamMembership(){var e,i;return(null===(e=this._teamMembership)||void 0===e?void 0:e.id)?new zc(this._request).fetch(null===(i=this._teamMembership)||void 0===i?void 0:i.id):void 0}}class uk extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._team=null!==(n=i.team)&&void 0!==n?n:void 0}get team(){var e,i;return(null===(e=this._team)||void 0===e?void 0:e.id)?new Ec(this._request).fetch(null===(i=this._team)||void 0===i?void 0:i.id):void 0}}class kk extends Bs{constructor(e,i){var n,a,t,d,l,r,o;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.description=null!==(t=i.description)&&void 0!==t?t:void 0,this.id=i.id,this.name=i.name,this.templateData=null!==(d=Rs(i.templateData))&&void 0!==d?d:{},this.type=i.type,this.updatedAt=null!==(l=Ms(i.updatedAt))&&void 0!==l?l:new Date,this._creator=null!==(r=i.creator)&&void 0!==r?r:void 0,this._team=null!==(o=i.team)&&void 0!==o?o:void 0}get creator(){var e,i;return(null===(e=this._creator)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._creator)||void 0===i?void 0:i.id):void 0}get organization(){return new Fc(this._request).fetch()}get team(){var e,i;return(null===(e=this._team)||void 0===e?void 0:e.id)?new Ec(this._request).fetch(null===(i=this._team)||void 0===i?void 0:i.id):void 0}delete(){return new bp(this._request).fetch(this.id)}update(e){return new yp(this._request).fetch(this.id,e)}}class ck extends Bs{constructor(e,i){super(e),this.pageInfo=new Eu(e,i.pageInfo)}get nodes(){return new Qc(this._request).fetch()}}class vk extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._template=i.template}get template(){return new Rc(this._request).fetch(this._template.id)}}class Nk extends Bs{constructor(e,i){var n;super(e),this.assetUrl=i.assetUrl,this.contentType=i.contentType,this.filename=i.filename,this.metaData=null!==(n=Rs(i.metaData))&&void 0!==n?n:void 0,this.size=i.size,this.uploadUrl=i.uploadUrl,this.headers=i.headers.map((i=>new pk(e,i)))}}class pk extends Bs{constructor(e,i){super(e),this.key=i.key,this.value=i.value}}class fk extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.uploadFile=i.uploadFile?new Nk(e,i.uploadFile):void 0}}class hk extends Bs{constructor(e,i){var n,a,t,d,l,r,o,s,m,u,k;super(e),this.active=i.active,this.admin=i.admin,this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.avatarUrl=null!==(a=i.avatarUrl)&&void 0!==a?a:void 0,this.createdAt=null!==(t=Ms(i.createdAt))&&void 0!==t?t:new Date,this.createdIssueCount=i.createdIssueCount,this.description=null!==(d=i.description)&&void 0!==d?d:void 0,this.disableReason=null!==(l=i.disableReason)&&void 0!==l?l:void 0,this.displayName=i.displayName,this.email=i.email,this.id=i.id,this.inviteHash=i.inviteHash,this.isMe=i.isMe,this.lastSeen=null!==(r=Ms(i.lastSeen))&&void 0!==r?r:void 0,this.name=i.name,this.statusEmoji=null!==(o=i.statusEmoji)&&void 0!==o?o:void 0,this.statusLabel=null!==(s=i.statusLabel)&&void 0!==s?s:void 0,this.statusUntilAt=null!==(m=Ms(i.statusUntilAt))&&void 0!==m?m:void 0,this.timezone=null!==(u=i.timezone)&&void 0!==u?u:void 0,this.updatedAt=null!==(k=Ms(i.updatedAt))&&void 0!==k?k:new Date,this.url=i.url}get organization(){return new Fc(this._request).fetch()}assignedIssues(e){return new yf(this._request,this.id,e).fetch(e)}createdIssues(e){return new Sf(this._request,this.id,e).fetch(e)}teamMemberships(e){return new gf(this._request,this.id,e).fetch(e)}teams(e){return new Df(this._request,this.id,e).fetch(e)}settingsUpdate(e){return new Ap(this._request).fetch(this.id,e)}suspend(){return new _p(this._request).fetch(this.id)}unsuspend(){return new Ip(this._request).fetch(this.id)}update(e){return new wp(this._request).fetch(this.id,e)}}class bk extends Bs{constructor(e,i){super(e),this.success=i.success}}class yk extends Bs{constructor(e,i){var n,a;super(e),this.clientId=i.clientId,this.createdByLinear=i.createdByLinear,this.description=null!==(n=i.description)&&void 0!==n?n:void 0,this.developer=i.developer,this.developerUrl=i.developerUrl,this.imageUrl=null!==(a=i.imageUrl)&&void 0!==a?a:void 0,this.isAuthorized=i.isAuthorized,this.name=i.name,this.webhooksEnabled=i.webhooksEnabled}}class Sk extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new hk(e,i))),new Eu(e,n.pageInfo))}}class gk extends Bs{constructor(e,i){var n;super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._user=null!==(n=i.user)&&void 0!==n?n:void 0}get user(){var e,i;return(null===(e=this._user)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._user)||void 0===i?void 0:i.id):void 0}}class Dk extends Bs{constructor(e,i){var n,a,t,d;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.notificationPreferences=null!==(t=Rs(i.notificationPreferences))&&void 0!==t?t:{},this.unsubscribedFrom=i.unsubscribedFrom,this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this._user=i.user}get user(){return new Wc(this._request).fetch(this._user.id)}update(e){return new Ap(this._request).fetch(this.id,e)}}class Vk extends Bs{constructor(e,i){super(e),this.flag=i.flag,this.lastSyncId=i.lastSyncId,this.success=i.success,this.value=i.value}}class Fk extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success}}class Ak extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success}get userSettings(){return new Hc(this._request).fetch()}}class Tk extends Bs{constructor(e,i){super(e),this.success=i.success}}class _k extends Bs{constructor(e,i){var n,a,t;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.type=i.type,this.updatedAt=null!==(t=Ms(i.updatedAt))&&void 0!==t?t:new Date,this.viewType=i.viewType}delete(){return new xp(this._request).fetch(this.id)}update(e){return new Cp(this._request).fetch(this.id,e)}}class Ik extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.viewPreferences=new _k(e,i.viewPreferences)}}class wk extends Bs{constructor(e,i){var n,a,t,d,l,r;super(e),this.allPublicTeams=i.allPublicTeams,this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.enabled=i.enabled,this.id=i.id,this.label=i.label,this.resourceTypes=i.resourceTypes,this.secret=null!==(t=i.secret)&&void 0!==t?t:void 0,this.teamIds=i.teamIds,this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this.url=null!==(l=i.url)&&void 0!==l?l:void 0,this._creator=null!==(r=i.creator)&&void 0!==r?r:void 0,this._team=i.team}get creator(){var e,i;return(null===(e=this._creator)||void 0===e?void 0:e.id)?new Wc(this._request).fetch(null===(i=this._creator)||void 0===i?void 0:i.id):void 0}get team(){return new Ec(this._request).fetch(this._team.id)}delete(){return new Pp(this._request).fetch(this.id)}update(e){return new jp(this._request).fetch(this.id,e)}}class qk extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new wk(e,i))),new Eu(e,n.pageInfo))}}class xk extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._webhook=i.webhook}get webhook(){return new $c(this._request).fetch(this._webhook.id)}}class Ck extends Bs{constructor(e,i){var n,a,t,d;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.color=i.color,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.description=null!==(t=i.description)&&void 0!==t?t:void 0,this.id=i.id,this.name=i.name,this.position=i.position,this.type=i.type,this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this._team=i.team}get team(){return new Ec(this._request).fetch(this._team.id)}issues(e){return new Vf(this._request,this.id,e).fetch(e)}archive(){return new Up(this._request).fetch(this.id)}update(e){return new Ep(this._request).fetch(this.id,e)}}class Ok extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Ck(e,i))),new Eu(e,n.pageInfo))}}class Pk extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this._workflowState=i.workflowState}get workflowState(){return new Zc(this._request).fetch(this._workflowState.id)}}class jk extends Bs{constructor(e,i){super(e),this.botUserId=i.botUserId,this.subdomain=i.subdomain,this.url=i.url}}class Uk extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ot,e)).administrableTeams;return new rk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Bk extends Bs{constructor(e){super(e)}fetch(e,i,n){return u(this,void 0,void 0,(function*(){const a=(yield this._request(Pt,Object.assign({clientId:e,scope:i},n))).applicationWithAuthorization;return new yk(this._request,a)}))}}class Ek extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(jt,{id:e})).attachment;return new Hs(this._request,i)}))}}class zk extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ut,{id:e})).attachmentIssue;return new $m(this._request,i)}))}}class Lk extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ht,e)).attachments;return new Gs(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Mk extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Gt,Object.assign({url:e},i))).attachmentsForURL;return new Gs(this._request,(n=>this.fetch(e,Es(Object.assign(Object.assign({},i),n)))),n)}))}}class Rk extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Jt,e)).auditEntries;return new Ks(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Qk extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){return(yield this._request($t,{})).auditEntryTypes.map((e=>new Zs(this._request,e)))}))}}class Wk extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){return(yield this._request(Kt,{})).authorizedApplications.map((e=>new Xs(this._request,e)))}))}}class Hk extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Zt,{})).availableUsers;return new Ys(this._request,e)}))}}class Gk extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Yt,{})).billingDetails;return new em(this._request,e)}))}}class Jk extends Bs{constructor(e){super(e)}fetch(e,i,n){return u(this,void 0,void 0,(function*(){const a=(yield this._request(ed,{clientId:e,issueId:i,version:n})).collaborativeDocumentJoin;return new am(this._request,a)}))}}class $k extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(nd,{id:e})).comment;return new tm(this._request,i)}))}}class Kk extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ad,e)).comments;return new dm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Zk extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(td,{id:e})).customView;return new um(this._request,i)}))}}class Yk extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(dd,e)).customViews;return new km(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Xk extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ld,{id:e})).cycle;return new vm(this._request,i)}))}}class ec extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(sd,e)).cycles;return new Nm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class ic extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(md,{id:e})).document;return new hm(this._request,i)}))}}class nc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ud,e)).documents;return new bm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class ac extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(kd,{id:e})).emoji;return new Fm(this._request,i)}))}}class tc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(cd,e)).emojis;return new Am(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class dc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(vd,{id:e})).favorite;return new Im(this._request,i)}))}}class lc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(pd,e)).favorites;return new wm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class rc extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(fd,Object.assign({fileId:e},i))).figmaEmbedInfo;return new Om(this._request,n)}))}}class oc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(bd,{id:e})).integration;return new Mm(this._request,i)}))}}class sc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(yd,e)).integrations;return new Rm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class mc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Sd,{id:e})).issue;return new $m(this._request,i)}))}}class uc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(wd,{code:e})).issueImportFinishGithubOAuth;return new Um(this._request,i)}))}}class kc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(qd,{id:e})).issueLabel;return new tu(this._request,i)}))}}class cc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Cd,e)).issueLabels;return new du(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class vc extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){return(yield this._request(Od,{})).issuePriorityValues.map((e=>new ou(this._request,e)))}))}}class Nc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Pd,{id:e})).issueRelation;return new su(this._request,i)}))}}class pc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(jd,e)).issueRelations;return new mu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class fc extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Ud,Object.assign({query:e},i))).issueSearch;return new Zm(this._request,(n=>this.fetch(e,Es(Object.assign(Object.assign({},i),n)))),n)}))}}class hc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Bd,e)).issues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class bc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ed,{id:e})).milestone;return new pu(this._request,i)}))}}class yc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ld,e)).milestones;return new fu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Sc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Md,{id:e})).notification;return new bu(this._request,i)}))}}class gc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Rd,{id:e})).notificationSubscription;return new gu(this._request,i)}))}}class Dc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Qd,e)).notificationSubscriptions;return new Du(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Vc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Wd,e)).notifications;return new yu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Fc extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Hd,{})).organization;return new _u(this._request,e)}))}}class Ac extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Xd,{urlKey:e})).organizationExists;return new Cu(this._request,i)}))}}class Tc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(el,{id:e})).organizationInvite;return new Ou(this._request,i)}))}}class _c extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(il,{id:e})).organizationInviteDetails;return new ju(this._request,i)}))}}class Ic extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(nl,e)).organizationInvites;return new Pu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class wc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(al,{id:e})).project;return new zu(this._request,i)}))}}class qc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(sl,{id:e})).projectLink;return new Mu(this._request,i)}))}}class xc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ml,e)).projectLinks;return new Ru(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Cc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ul,e)).projects;return new Lu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Oc extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(kl,{})).pushSubscriptionTest;return new $u(this._request,e)}))}}class Pc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(cl,{id:e})).reaction;return new Ku(this._request,i)}))}}class jc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(vl,e)).reactions;return new Zu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Uc extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Nl,Object.assign({email:e},i))).ssoUrlFromEmail;return new ak(this._request,n)}))}}class Bc extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(pl,{})).subscription;return e?new dk(this._request,e):void 0}))}}class Ec extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(fl,{id:e})).team;return new lk(this._request,i)}))}}class zc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Tl,{id:e})).teamMembership;return new ok(this._request,i)}))}}class Lc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(_l,e)).teamMemberships;return new sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Mc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Il,e)).teams;return new rk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Rc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(wl,{id:e})).template;return new kk(this._request,i)}))}}class Qc extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){return(yield this._request(ql,{})).templates.map((e=>new kk(this._request,e)))}))}}class Wc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(xl,{id:e})).user;return new hk(this._request,i)}))}}class Hc extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Ul,{})).userSettings;return new Dk(this._request,e)}))}}class Gc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Bl,e)).users;return new Sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Jc extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(El,{})).viewer;return new hk(this._request,e)}))}}class $c extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ql,{id:e})).webhook;return new wk(this._request,i)}))}}class Kc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Wl,e)).webhooks;return new qk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Zc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Hl,{id:e})).workflowState;return new Ck(this._request,i)}))}}class Yc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Jl,e)).workflowStates;return new Ok(this._request,(i=>this.fetch(Es(Object.assign(Object.assign({},e),i)))),i)}))}}class Xc extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request($l,{id:e})).attachmentArchive;return new Ws(this._request,i)}))}}class ev extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Kl,{input:e})).attachmentCreate;return new Js(this._request,i)}))}}class iv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Zl,{id:e})).attachmentDelete;return new Ws(this._request,i)}))}}class nv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Yl,{conversationId:e,issueId:i})).attachmentLinkFront;return new Pm(this._request,n)}))}}class av extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Xl,{conversationId:e,issueId:i})).attachmentLinkIntercom;return new Js(this._request,n)}))}}class tv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(er,{issueId:e,jiraIssueId:i})).attachmentLinkJiraIssue;return new Js(this._request,n)}))}}class dv extends Bs{constructor(e){super(e)}fetch(e,i,n){return u(this,void 0,void 0,(function*(){const a=(yield this._request(ir,Object.assign({issueId:e,url:i},n))).attachmentLinkURL;return new Js(this._request,a)}))}}class lv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(nr,{issueId:e,ticketId:i})).attachmentLinkZendesk;return new Js(this._request,n)}))}}class rv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(ar,{id:e,input:i})).attachmentUpdate;return new Js(this._request,n)}))}}class ov extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(tr,{input:e})).billingEmailUpdate;return new im(this._request,i)}))}}class sv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(dr,{input:e})).collaborativeDocumentUpdate;return new am(this._request,i)}))}}class mv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(lr,{input:e})).commentCreate;return new lm(this._request,i)}))}}class uv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(rr,{id:e})).commentDelete;return new Ws(this._request,i)}))}}class kv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(or,{id:e,input:i})).commentUpdate;return new lm(this._request,n)}))}}class cv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(sr,{input:e})).contactCreate;return new om(this._request,i)}))}}class vv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(mr,e)).createCsvExportReport;return new sm(this._request,i)}))}}class Nv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(ur,Object.assign({input:e},i))).createOrganizationFromOnboarding;return new mm(this._request,n)}))}}class pv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(kr,{input:e})).customViewCreate;return new cm(this._request,i)}))}}class fv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(cr,{id:e})).customViewDelete;return new Ws(this._request,i)}))}}class hv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(vr,{id:e,input:i})).customViewUpdate;return new cm(this._request,n)}))}}class bv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Nr,{id:e})).cycleArchive;return new Ws(this._request,i)}))}}class yv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(pr,{input:e})).cycleCreate;return new pm(this._request,i)}))}}class Sv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(fr,{id:e,input:i})).cycleUpdate;return new pm(this._request,n)}))}}class gv extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(hr,{})).debugFailWithInternalError;return new fm(this._request,e)}))}}class Dv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(br,{input:e})).documentCreate;return new ym(this._request,i)}))}}class Vv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(yr,{id:e})).documentDelete;return new Ws(this._request,i)}))}}class Fv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Sr,{id:e,input:i})).documentUpdate;return new ym(this._request,n)}))}}class Av extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(gr,{input:e})).emailSubscribe;return new gm(this._request,i)}))}}class Tv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Dr,{input:e})).emailTokenUserAccountAuth;return new Ys(this._request,i)}))}}class _v extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Vr,{input:e})).emailUnsubscribe;return new Dm(this._request,i)}))}}class Iv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Fr,{input:e})).emailUserAccountAuthChallenge;return new Vm(this._request,i)}))}}class wv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ar,{input:e})).emojiCreate;return new Tm(this._request,i)}))}}class qv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Tr,{id:e})).emojiDelete;return new Ws(this._request,i)}))}}class xv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(_r,{input:e})).eventCreate;return new _m(this._request,i)}))}}class Cv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ir,{input:e})).favoriteCreate;return new qm(this._request,i)}))}}class Ov extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(wr,{id:e})).favoriteDelete;return new Ws(this._request,i)}))}}class Pv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(qr,{id:e,input:i})).favoriteUpdate;return new qm(this._request,n)}))}}class jv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(xr,{input:e})).feedbackCreate;return new xm(this._request,i)}))}}class Uv extends Bs{constructor(e){super(e)}fetch(e,i,n,a){return u(this,void 0,void 0,(function*(){const t=(yield this._request(Cr,Object.assign({contentType:e,filename:i,size:n},a))).fileUpload;return new fk(this._request,t)}))}}class Bv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Or,{input:e})).googleUserAccountAuth;return new Ys(this._request,i)}))}}class Ev extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Pr,{url:e})).imageUploadFromUrl;return new Lm(this._request,i)}))}}class zv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(jr,{id:e})).integrationDelete;return new Ws(this._request,i)}))}}class Lv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Ur,{code:e,redirectUri:i})).integrationFigma;return new Qm(this._request,n)}))}}class Mv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Br,{code:e,redirectUri:i})).integrationFront;return new Qm(this._request,n)}))}}class Rv extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Er,{})).integrationGithubCommitCreate;return new jm(this._request,e)}))}}class Qv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(zr,{installationId:e})).integrationGithubConnect;return new Qm(this._request,i)}))}}class Wv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Lr,{accessToken:e,gitlabUrl:i})).integrationGitlabConnect;return new Qm(this._request,n)}))}}class Hv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Mr,{code:e})).integrationGoogleSheets;return new Qm(this._request,i)}))}}class Gv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Rr,{code:e,redirectUri:i})).integrationIntercom;return new Qm(this._request,n)}))}}class Jv extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Qr,{})).integrationIntercomDelete;return new Qm(this._request,e)}))}}class $v extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Wr,{input:e})).integrationIntercomSettingsUpdate;return new Qm(this._request,i)}))}}class Kv extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Hr,{})).integrationLoom;return new Qm(this._request,e)}))}}class Zv extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Gr,{id:e})).integrationResourceArchive;return new Ws(this._request,i)}))}}class Yv extends Bs{constructor(e){super(e)}fetch(e,i,n){return u(this,void 0,void 0,(function*(){const a=(yield this._request(Jr,{code:e,installationId:i,organizationSlug:n})).integrationSentryConnect;return new Qm(this._request,a)}))}}class Xv extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request($r,{id:e,input:i})).integrationSettingsUpdate;return new Qm(this._request,n)}))}}class eN extends Bs{constructor(e){super(e)}fetch(e,i,n){return u(this,void 0,void 0,(function*(){const a=(yield this._request(Kr,Object.assign({code:e,redirectUri:i},n))).integrationSlack;return new Qm(this._request,a)}))}}class iN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Zr,{code:e,redirectUri:i})).integrationSlackImportEmojis;return new Qm(this._request,n)}))}}class nN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Yr,{code:e,redirectUri:i})).integrationSlackPersonal;return new Qm(this._request,n)}))}}class aN extends Bs{constructor(e){super(e)}fetch(e,i,n,a){return u(this,void 0,void 0,(function*(){const t=(yield this._request(Xr,Object.assign({code:e,redirectUri:i,teamId:n},a))).integrationSlackPost;return new Qm(this._request,t)}))}}class tN extends Bs{constructor(e){super(e)}fetch(e,i,n){return u(this,void 0,void 0,(function*(){const a=(yield this._request(eo,{code:e,projectId:i,redirectUri:n})).integrationSlackProjectPost;return new Qm(this._request,a)}))}}class dN extends Bs{constructor(e){super(e)}fetch(e,i,n,a){return u(this,void 0,void 0,(function*(){const t=(yield this._request(io,{code:e,redirectUri:i,scope:n,subdomain:a})).integrationZendesk;return new Qm(this._request,t)}))}}class lN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(no,Object.assign({id:e},i))).issueArchive;return new Ws(this._request,n)}))}}class rN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(ao,{ids:e,input:i})).issueBatchUpdate;return new Km(this._request,n)}))}}class oN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(to,{input:e})).issueCreate;return new ru(this._request,i)}))}}class sN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(lo,{id:e})).issueDelete;return new Ws(this._request,i)}))}}class mN extends Bs{constructor(e){super(e)}fetch(e,i,n,a){return u(this,void 0,void 0,(function*(){const t=(yield this._request(ro,Object.assign({asanaTeamName:e,asanaToken:i,teamId:n},a))).issueImportCreateAsana;return new au(this._request,t)}))}}class uN extends Bs{constructor(e){super(e)}fetch(e,i,n,a){return u(this,void 0,void 0,(function*(){const t=(yield this._request(oo,Object.assign({clubhouseTeamName:e,clubhouseToken:i,teamId:n},a))).issueImportCreateClubhouse;return new au(this._request,t)}))}}class kN extends Bs{constructor(e){super(e)}fetch(e,i,n,a,t){return u(this,void 0,void 0,(function*(){const d=(yield this._request(so,Object.assign({githubRepoName:e,githubRepoOwner:i,githubToken:n,teamId:a},t))).issueImportCreateGithub;return new au(this._request,d)}))}}class cN extends Bs{constructor(e){super(e)}fetch(e,i,n,a,t,d){return u(this,void 0,void 0,(function*(){const l=(yield this._request(mo,Object.assign({jiraEmail:e,jiraHostname:i,jiraProject:n,jiraToken:a,teamId:t},d))).issueImportCreateJira;return new au(this._request,l)}))}}class vN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(uo,{issueImportId:e})).issueImportDelete;return new nu(this._request,i)}))}}class NN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(ko,{issueImportId:e,mapping:i})).issueImportProcess;return new au(this._request,n)}))}}class pN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(co,{id:e,input:i})).issueImportUpdate;return new au(this._request,n)}))}}class fN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(vo,{id:e})).issueLabelArchive;return new Ws(this._request,i)}))}}class hN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(No,Object.assign({input:e},i))).issueLabelCreate;return new lu(this._request,n)}))}}class bN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(po,{id:e,input:i})).issueLabelUpdate;return new lu(this._request,n)}))}}class yN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(fo,{input:e})).issueRelationCreate;return new ku(this._request,i)}))}}class SN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ho,{id:e})).issueRelationDelete;return new Ws(this._request,i)}))}}class gN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(bo,{id:e,input:i})).issueRelationUpdate;return new ku(this._request,n)}))}}class DN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(yo,{id:e})).issueUnarchive;return new Ws(this._request,i)}))}}class VN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(So,{id:e,input:i})).issueUpdate;return new ru(this._request,n)}))}}class FN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(go,{input:e})).jiraIntegrationConnect;return new Qm(this._request,i)}))}}class AN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Do,{input:e})).joinOrganizationFromOnboarding;return new mm(this._request,i)}))}}class TN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Vo,{organizationId:e})).leaveOrganization;return new mm(this._request,i)}))}}class _N extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Fo,{input:e})).milestoneCreate;return new hu(this._request,i)}))}}class IN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ao,{id:e})).milestoneDelete;return new Ws(this._request,i)}))}}class wN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(To,{id:e,input:i})).milestoneUpdate;return new hu(this._request,n)}))}}class qN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(_o,{id:e})).notificationArchive;return new Ws(this._request,i)}))}}class xN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Io,{id:e,input:i})).notificationCreate;return new Su(this._request,n)}))}}class CN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(wo,{input:e})).notificationSubscriptionCreate;return new Vu(this._request,i)}))}}class ON extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(qo,{id:e})).notificationSubscriptionDelete;return new Ws(this._request,i)}))}}class PN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(xo,{id:e})).notificationUnarchive;return new Ws(this._request,i)}))}}class jN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Co,{id:e,input:i})).notificationUpdate;return new Su(this._request,n)}))}}class UN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Oo,{id:e})).oauthClientArchive;return new Ws(this._request,i)}))}}class BN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Po,{input:e})).oauthClientCreate;return new Au(this._request,i)}))}}class EN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(jo,{id:e})).oauthClientRotateSecret;return new Xu(this._request,i)}))}}class zN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Uo,{id:e,input:i})).oauthClientUpdate;return new Au(this._request,n)}))}}class LN extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Bo,{appId:e,scope:i})).oauthTokenRevoke;return new Tu(this._request,n)}))}}class MN extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Eo,{})).organizationCancelDelete;return new Iu(this._request,e)}))}}class RN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(zo,{input:e})).organizationDelete;return new wu(this._request,i)}))}}class QN extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Lo,{})).organizationDeleteChallenge;return new wu(this._request,e)}))}}class WN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Mo,{input:e})).organizationDomainCreate;return new xu(this._request,i)}))}}class HN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ro,{id:e})).organizationDomainDelete;return new Ws(this._request,i)}))}}class GN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Qo,{input:e})).organizationDomainVerify;return new xu(this._request,i)}))}}class JN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Wo,{input:e})).organizationInviteCreate;return new Uu(this._request,i)}))}}class $N extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ho,{id:e})).organizationInviteDelete;return new Ws(this._request,i)}))}}class KN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Go,{input:e})).organizationUpdate;return new Bu(this._request,i)}))}}class ZN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Jo,{id:e})).projectArchive;return new Ws(this._request,i)}))}}class YN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request($o,{input:e})).projectCreate;return new Wu(this._request,i)}))}}class XN extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ko,{input:e})).projectLinkCreate;return new Qu(this._request,i)}))}}class ep extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Zo,{id:e})).projectLinkDelete;return new Ws(this._request,i)}))}}class ip extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Yo,{id:e,input:i})).projectLinkUpdate;return new Qu(this._request,n)}))}}class np extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Xo,{id:e})).projectUnarchive;return new Ws(this._request,i)}))}}class ap extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(es,{id:e,input:i})).projectUpdate;return new Wu(this._request,n)}))}}class tp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(is,{input:e})).pushSubscriptionCreate;return new Ju(this._request,i)}))}}class dp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ns,{id:e})).pushSubscriptionDelete;return new Ju(this._request,i)}))}}class lp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(as,{input:e})).reactionCreate;return new Yu(this._request,i)}))}}class rp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ts,{id:e})).reactionDelete;return new Ws(this._request,i)}))}}class op extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ds,{id:e})).refreshGoogleSheetsData;return new Qm(this._request,i)}))}}class sp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ls,{id:e})).resendOrganizationInvite;return new Ws(this._request,i)}))}}class mp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(rs,{input:e})).samlTokenUserAccountAuth;return new Ys(this._request,i)}))}}class up extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(os,Object.assign({input:e},i))).teamCreate;return new uk(this._request,n)}))}}class kp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ss,{id:e})).teamDelete;return new Ws(this._request,i)}))}}class cp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ms,{id:e})).teamKeyDelete;return new Ws(this._request,i)}))}}class vp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(us,{input:e})).teamMembershipCreate;return new mk(this._request,i)}))}}class Np extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ks,{id:e})).teamMembershipDelete;return new Ws(this._request,i)}))}}class pp extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(cs,{id:e,input:i})).teamMembershipUpdate;return new mk(this._request,n)}))}}class fp extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(vs,{id:e,input:i})).teamUpdate;return new uk(this._request,n)}))}}class hp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ns,{input:e})).templateCreate;return new vk(this._request,i)}))}}class bp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ps,{id:e})).templateDelete;return new Ws(this._request,i)}))}}class yp extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(fs,{id:e,input:i})).templateUpdate;return new vk(this._request,n)}))}}class Sp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(hs,{id:e})).userDemoteAdmin;return new bk(this._request,i)}))}}class gp extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(bs,{flag:e,operation:i})).userFlagUpdate;return new Vk(this._request,n)}))}}class Dp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ys,{id:e})).userPromoteAdmin;return new bk(this._request,i)}))}}class Vp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ss,{flag:e})).userSettingsFlagIncrement;return new Vk(this._request,i)}))}}class Fp extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(gs,{})).userSettingsFlagsReset;return new Fk(this._request,e)}))}}class Ap extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Ds,{id:e,input:i})).userSettingsUpdate;return new Ak(this._request,n)}))}}class Tp extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Vs,{})).userSubscribeToNewsletter;return new Tk(this._request,e)}))}}class _p extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Fs,{id:e})).userSuspend;return new bk(this._request,i)}))}}class Ip extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(As,{id:e})).userUnsuspend;return new bk(this._request,i)}))}}class wp extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Ts,{id:e,input:i})).userUpdate;return new gk(this._request,n)}))}}class qp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(_s,{input:e})).viewPreferencesCreate;return new Ik(this._request,i)}))}}class xp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Is,{id:e})).viewPreferencesDelete;return new Ws(this._request,i)}))}}class Cp extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(ws,{id:e,input:i})).viewPreferencesUpdate;return new Ik(this._request,n)}))}}class Op extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(qs,{input:e})).webhookCreate;return new xk(this._request,i)}))}}class Pp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(xs,{id:e})).webhookDelete;return new Ws(this._request,i)}))}}class jp extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(Cs,{id:e,input:i})).webhookUpdate;return new xk(this._request,n)}))}}class Up extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Os,{id:e})).workflowStateArchive;return new Ws(this._request,i)}))}}class Bp extends Bs{constructor(e){super(e)}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ps,{input:e})).workflowStateCreate;return new Pk(this._request,i)}))}}class Ep extends Bs{constructor(e){super(e)}fetch(e,i){return u(this,void 0,void 0,(function*(){const n=(yield this._request(js,{id:e,input:i})).workflowStateUpdate;return new Pk(this._request,n)}))}}class zp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(rd,Object.assign(Object.assign({id:this._id},this._variables),e))).cycle.issues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Lp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(od,Object.assign(Object.assign({id:this._id},this._variables),e))).cycle.uncompletedIssuesUponClose;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Mp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Nd,Object.assign(Object.assign({id:this._id},this._variables),e))).favorite.children;return new wm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Rp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(gd,Object.assign(Object.assign({id:this._id},this._variables),e))).issue.attachments;return new Gs(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Qp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Dd,Object.assign(Object.assign({id:this._id},this._variables),e))).issue.children;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Wp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Vd,Object.assign(Object.assign({id:this._id},this._variables),e))).issue.comments;return new dm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Hp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Fd,Object.assign(Object.assign({id:this._id},this._variables),e))).issue.history;return new eu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Gp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ad,Object.assign(Object.assign({id:this._id},this._variables),e))).issue.inverseRelations;return new mu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Jp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Td,Object.assign(Object.assign({id:this._id},this._variables),e))).issue.labels;return new du(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class $p extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(_d,Object.assign(Object.assign({id:this._id},this._variables),e))).issue.relations;return new mu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Kp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Id,Object.assign(Object.assign({id:this._id},this._variables),e))).issue.subscribers;return new Sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Zp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(xd,Object.assign(Object.assign({id:this._id},this._variables),e))).issueLabel.issues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Yp extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(zd,Object.assign(Object.assign({id:this._id},this._variables),e))).milestone.projects;return new Lu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Xp extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Gd,e)).organization.integrations;return new Rm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class ef extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Jd,e)).organization.labels;return new du(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class nf extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request($d,e)).organization.milestones;return new fu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class af extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Kd,e)).organization.teams;return new rk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class tf extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Zd,e)).organization.templates;return new ck(this._request,i)}))}}class df extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Yd,e)).organization.users;return new Sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class lf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(tl,Object.assign(Object.assign({id:this._id},this._variables),e))).project.documents;return new bm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class rf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(dl,Object.assign(Object.assign({id:this._id},this._variables),e))).project.issues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class of extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ll,Object.assign(Object.assign({id:this._id},this._variables),e))).project.links;return new Ru(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class sf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(rl,Object.assign(Object.assign({id:this._id},this._variables),e))).project.members;return new Sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class mf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(ol,Object.assign(Object.assign({id:this._id},this._variables),e))).project.teams;return new rk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class uf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(hl,Object.assign(Object.assign({id:this._id},this._variables),e))).team.cycles;return new Nm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class kf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(bl,Object.assign(Object.assign({id:this._id},this._variables),e))).team.issues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class cf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(yl,Object.assign(Object.assign({id:this._id},this._variables),e))).team.labels;return new du(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class vf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Sl,Object.assign(Object.assign({id:this._id},this._variables),e))).team.members;return new Sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Nf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(gl,Object.assign(Object.assign({id:this._id},this._variables),e))).team.memberships;return new sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class pf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Dl,Object.assign(Object.assign({id:this._id},this._variables),e))).team.projects;return new Lu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class ff extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Vl,Object.assign(Object.assign({id:this._id},this._variables),e))).team.states;return new Ok(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class hf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Fl,Object.assign(Object.assign({id:this._id},this._variables),e))).team.templates;return new ck(this._request,i)}))}}class bf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Al,Object.assign(Object.assign({id:this._id},this._variables),e))).team.webhooks;return new qk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class yf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Cl,Object.assign(Object.assign({id:this._id},this._variables),e))).user.assignedIssues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Sf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ol,Object.assign(Object.assign({id:this._id},this._variables),e))).user.createdIssues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class gf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Pl,Object.assign(Object.assign({id:this._id},this._variables),e))).user.teamMemberships;return new sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Df extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(jl,Object.assign(Object.assign({id:this._id},this._variables),e))).user.teams;return new rk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Vf extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Gl,Object.assign(Object.assign({id:this._id},this._variables),e))).workflowState.issues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}}class Ff extends Bs{constructor(e){super(e)}administrableTeams(e){return new Uk(this._request).fetch(e)}applicationWithAuthorization(e,i,n){return new Bk(this._request).fetch(e,i,n)}attachment(e){return new Ek(this._request).fetch(e)}attachmentIssue(e){return new zk(this._request).fetch(e)}attachments(e){return new Lk(this._request).fetch(e)}attachmentsForURL(e,i){return new Mk(this._request).fetch(e,i)}auditEntries(e){return new Rk(this._request).fetch(e)}get auditEntryTypes(){return new Qk(this._request).fetch()}get authorizedApplications(){return new Wk(this._request).fetch()}get availableUsers(){return new Hk(this._request).fetch()}get billingDetails(){return new Gk(this._request).fetch()}collaborativeDocumentJoin(e,i,n){return new Jk(this._request).fetch(e,i,n)}comment(e){return new $k(this._request).fetch(e)}comments(e){return new Kk(this._request).fetch(e)}customView(e){return new Zk(this._request).fetch(e)}customViews(e){return new Yk(this._request).fetch(e)}cycle(e){return new Xk(this._request).fetch(e)}cycles(e){return new ec(this._request).fetch(e)}document(e){return new ic(this._request).fetch(e)}documents(e){return new nc(this._request).fetch(e)}emoji(e){return new ac(this._request).fetch(e)}emojis(e){return new tc(this._request).fetch(e)}favorite(e){return new dc(this._request).fetch(e)}favorites(e){return new lc(this._request).fetch(e)}figmaEmbedInfo(e,i){return new rc(this._request).fetch(e,i)}integration(e){return new oc(this._request).fetch(e)}integrations(e){return new sc(this._request).fetch(e)}issue(e){return new mc(this._request).fetch(e)}issueImportFinishGithubOAuth(e){return new uc(this._request).fetch(e)}issueLabel(e){return new kc(this._request).fetch(e)}issueLabels(e){return new cc(this._request).fetch(e)}get issuePriorityValues(){return new vc(this._request).fetch()}issueRelation(e){return new Nc(this._request).fetch(e)}issueRelations(e){return new pc(this._request).fetch(e)}issueSearch(e,i){return new fc(this._request).fetch(e,i)}issues(e){return new hc(this._request).fetch(e)}milestone(e){return new bc(this._request).fetch(e)}milestones(e){return new yc(this._request).fetch(e)}notification(e){return new Sc(this._request).fetch(e)}notificationSubscription(e){return new gc(this._request).fetch(e)}notificationSubscriptions(e){return new Dc(this._request).fetch(e)}notifications(e){return new Vc(this._request).fetch(e)}get organization(){return new Fc(this._request).fetch()}organizationExists(e){return new Ac(this._request).fetch(e)}organizationInvite(e){return new Tc(this._request).fetch(e)}organizationInviteDetails(e){return new _c(this._request).fetch(e)}organizationInvites(e){return new Ic(this._request).fetch(e)}project(e){return new wc(this._request).fetch(e)}projectLink(e){return new qc(this._request).fetch(e)}projectLinks(e){return new xc(this._request).fetch(e)}projects(e){return new Cc(this._request).fetch(e)}get pushSubscriptionTest(){return new Oc(this._request).fetch()}reaction(e){return new Pc(this._request).fetch(e)}reactions(e){return new jc(this._request).fetch(e)}ssoUrlFromEmail(e,i){return new Uc(this._request).fetch(e,i)}get subscription(){return new Bc(this._request).fetch()}team(e){return new Ec(this._request).fetch(e)}teamMembership(e){return new zc(this._request).fetch(e)}teamMemberships(e){return new Lc(this._request).fetch(e)}teams(e){return new Mc(this._request).fetch(e)}template(e){return new Rc(this._request).fetch(e)}get templates(){return new Qc(this._request).fetch()}user(e){return new Wc(this._request).fetch(e)}get userSettings(){return new Hc(this._request).fetch()}users(e){return new Gc(this._request).fetch(e)}get viewer(){return new Jc(this._request).fetch()}webhook(e){return new $c(this._request).fetch(e)}webhooks(e){return new Kc(this._request).fetch(e)}workflowState(e){return new Zc(this._request).fetch(e)}workflowStates(e){return new Yc(this._request).fetch(e)}attachmentArchive(e){return new Xc(this._request).fetch(e)}attachmentCreate(e){return new ev(this._request).fetch(e)}attachmentDelete(e){return new iv(this._request).fetch(e)}attachmentLinkFront(e,i){return new nv(this._request).fetch(e,i)}attachmentLinkIntercom(e,i){return new av(this._request).fetch(e,i)}attachmentLinkJiraIssue(e,i){return new tv(this._request).fetch(e,i)}attachmentLinkURL(e,i,n){return new dv(this._request).fetch(e,i,n)}attachmentLinkZendesk(e,i){return new lv(this._request).fetch(e,i)}attachmentUpdate(e,i){return new rv(this._request).fetch(e,i)}billingEmailUpdate(e){return new ov(this._request).fetch(e)}collaborativeDocumentUpdate(e){return new sv(this._request).fetch(e)}commentCreate(e){return new mv(this._request).fetch(e)}commentDelete(e){return new uv(this._request).fetch(e)}commentUpdate(e,i){return new kv(this._request).fetch(e,i)}contactCreate(e){return new cv(this._request).fetch(e)}createCsvExportReport(e){return new vv(this._request).fetch(e)}createOrganizationFromOnboarding(e,i){return new Nv(this._request).fetch(e,i)}customViewCreate(e){return new pv(this._request).fetch(e)}customViewDelete(e){return new fv(this._request).fetch(e)}customViewUpdate(e,i){return new hv(this._request).fetch(e,i)}cycleArchive(e){return new bv(this._request).fetch(e)}cycleCreate(e){return new yv(this._request).fetch(e)}cycleUpdate(e,i){return new Sv(this._request).fetch(e,i)}get debugFailWithInternalError(){return new gv(this._request).fetch()}documentCreate(e){return new Dv(this._request).fetch(e)}documentDelete(e){return new Vv(this._request).fetch(e)}documentUpdate(e,i){return new Fv(this._request).fetch(e,i)}emailSubscribe(e){return new Av(this._request).fetch(e)}emailTokenUserAccountAuth(e){return new Tv(this._request).fetch(e)}emailUnsubscribe(e){return new _v(this._request).fetch(e)}emailUserAccountAuthChallenge(e){return new Iv(this._request).fetch(e)}emojiCreate(e){return new wv(this._request).fetch(e)}emojiDelete(e){return new qv(this._request).fetch(e)}eventCreate(e){return new xv(this._request).fetch(e)}favoriteCreate(e){return new Cv(this._request).fetch(e)}favoriteDelete(e){return new Ov(this._request).fetch(e)}favoriteUpdate(e,i){return new Pv(this._request).fetch(e,i)}feedbackCreate(e){return new jv(this._request).fetch(e)}fileUpload(e,i,n,a){return new Uv(this._request).fetch(e,i,n,a)}googleUserAccountAuth(e){return new Bv(this._request).fetch(e)}imageUploadFromUrl(e){return new Ev(this._request).fetch(e)}integrationDelete(e){return new zv(this._request).fetch(e)}integrationFigma(e,i){return new Lv(this._request).fetch(e,i)}integrationFront(e,i){return new Mv(this._request).fetch(e,i)}get integrationGithubCommitCreate(){return new Rv(this._request).fetch()}integrationGithubConnect(e){return new Qv(this._request).fetch(e)}integrationGitlabConnect(e,i){return new Wv(this._request).fetch(e,i)}integrationGoogleSheets(e){return new Hv(this._request).fetch(e)}integrationIntercom(e,i){return new Gv(this._request).fetch(e,i)}get integrationIntercomDelete(){return new Jv(this._request).fetch()}integrationIntercomSettingsUpdate(e){return new $v(this._request).fetch(e)}get integrationLoom(){return new Kv(this._request).fetch()}integrationResourceArchive(e){return new Zv(this._request).fetch(e)}integrationSentryConnect(e,i,n){return new Yv(this._request).fetch(e,i,n)}integrationSettingsUpdate(e,i){return new Xv(this._request).fetch(e,i)}integrationSlack(e,i,n){return new eN(this._request).fetch(e,i,n)}integrationSlackImportEmojis(e,i){return new iN(this._request).fetch(e,i)}integrationSlackPersonal(e,i){return new nN(this._request).fetch(e,i)}integrationSlackPost(e,i,n,a){return new aN(this._request).fetch(e,i,n,a)}integrationSlackProjectPost(e,i,n){return new tN(this._request).fetch(e,i,n)}integrationZendesk(e,i,n,a){return new dN(this._request).fetch(e,i,n,a)}issueArchive(e,i){return new lN(this._request).fetch(e,i)}issueBatchUpdate(e,i){return new rN(this._request).fetch(e,i)}issueCreate(e){return new oN(this._request).fetch(e)}issueDelete(e){return new sN(this._request).fetch(e)}issueImportCreateAsana(e,i,n,a){return new mN(this._request).fetch(e,i,n,a)}issueImportCreateClubhouse(e,i,n,a){return new uN(this._request).fetch(e,i,n,a)}issueImportCreateGithub(e,i,n,a,t){return new kN(this._request).fetch(e,i,n,a,t)}issueImportCreateJira(e,i,n,a,t,d){return new cN(this._request).fetch(e,i,n,a,t,d)}issueImportDelete(e){return new vN(this._request).fetch(e)}issueImportProcess(e,i){return new NN(this._request).fetch(e,i)}issueImportUpdate(e,i){return new pN(this._request).fetch(e,i)}issueLabelArchive(e){return new fN(this._request).fetch(e)}issueLabelCreate(e,i){return new hN(this._request).fetch(e,i)}issueLabelUpdate(e,i){return new bN(this._request).fetch(e,i)}issueRelationCreate(e){return new yN(this._request).fetch(e)}issueRelationDelete(e){return new SN(this._request).fetch(e)}issueRelationUpdate(e,i){return new gN(this._request).fetch(e,i)}issueUnarchive(e){return new DN(this._request).fetch(e)}issueUpdate(e,i){return new VN(this._request).fetch(e,i)}jiraIntegrationConnect(e){return new FN(this._request).fetch(e)}joinOrganizationFromOnboarding(e){return new AN(this._request).fetch(e)}leaveOrganization(e){return new TN(this._request).fetch(e)}milestoneCreate(e){return new _N(this._request).fetch(e)}milestoneDelete(e){return new IN(this._request).fetch(e)}milestoneUpdate(e,i){return new wN(this._request).fetch(e,i)}notificationArchive(e){return new qN(this._request).fetch(e)}notificationCreate(e,i){return new xN(this._request).fetch(e,i)}notificationSubscriptionCreate(e){return new CN(this._request).fetch(e)}notificationSubscriptionDelete(e){return new ON(this._request).fetch(e)}notificationUnarchive(e){return new PN(this._request).fetch(e)}notificationUpdate(e,i){return new jN(this._request).fetch(e,i)}oauthClientArchive(e){return new UN(this._request).fetch(e)}oauthClientCreate(e){return new BN(this._request).fetch(e)}oauthClientRotateSecret(e){return new EN(this._request).fetch(e)}oauthClientUpdate(e,i){return new zN(this._request).fetch(e,i)}oauthTokenRevoke(e,i){return new LN(this._request).fetch(e,i)}get organizationCancelDelete(){return new MN(this._request).fetch()}organizationDelete(e){return new RN(this._request).fetch(e)}get organizationDeleteChallenge(){return new QN(this._request).fetch()}organizationDomainCreate(e){return new WN(this._request).fetch(e)}organizationDomainDelete(e){return new HN(this._request).fetch(e)}organizationDomainVerify(e){return new GN(this._request).fetch(e)}organizationInviteCreate(e){return new JN(this._request).fetch(e)}organizationInviteDelete(e){return new $N(this._request).fetch(e)}organizationUpdate(e){return new KN(this._request).fetch(e)}projectArchive(e){return new ZN(this._request).fetch(e)}projectCreate(e){return new YN(this._request).fetch(e)}projectLinkCreate(e){return new XN(this._request).fetch(e)}projectLinkDelete(e){return new ep(this._request).fetch(e)}projectLinkUpdate(e,i){return new ip(this._request).fetch(e,i)}projectUnarchive(e){return new np(this._request).fetch(e)}projectUpdate(e,i){return new ap(this._request).fetch(e,i)}pushSubscriptionCreate(e){return new tp(this._request).fetch(e)}pushSubscriptionDelete(e){return new dp(this._request).fetch(e)}reactionCreate(e){return new lp(this._request).fetch(e)}reactionDelete(e){return new rp(this._request).fetch(e)}refreshGoogleSheetsData(e){return new op(this._request).fetch(e)}resendOrganizationInvite(e){return new sp(this._request).fetch(e)}samlTokenUserAccountAuth(e){return new mp(this._request).fetch(e)}teamCreate(e,i){return new up(this._request).fetch(e,i)}teamDelete(e){return new kp(this._request).fetch(e)}teamKeyDelete(e){return new cp(this._request).fetch(e)}teamMembershipCreate(e){return new vp(this._request).fetch(e)}teamMembershipDelete(e){return new Np(this._request).fetch(e)}teamMembershipUpdate(e,i){return new pp(this._request).fetch(e,i)}teamUpdate(e,i){return new fp(this._request).fetch(e,i)}templateCreate(e){return new hp(this._request).fetch(e)}templateDelete(e){return new bp(this._request).fetch(e)}templateUpdate(e,i){return new yp(this._request).fetch(e,i)}userDemoteAdmin(e){return new Sp(this._request).fetch(e)}userFlagUpdate(e,i){return new gp(this._request).fetch(e,i)}userPromoteAdmin(e){return new Dp(this._request).fetch(e)}userSettingsFlagIncrement(e){return new Vp(this._request).fetch(e)}get userSettingsFlagsReset(){return new Fp(this._request).fetch()}userSettingsUpdate(e,i){return new Ap(this._request).fetch(e,i)}get userSubscribeToNewsletter(){return new Tp(this._request).fetch()}userSuspend(e){return new _p(this._request).fetch(e)}userUnsuspend(e){return new Ip(this._request).fetch(e)}userUpdate(e,i){return new wp(this._request).fetch(e,i)}viewPreferencesCreate(e){return new qp(this._request).fetch(e)}viewPreferencesDelete(e){return new xp(this._request).fetch(e)}viewPreferencesUpdate(e,i){return new Cp(this._request).fetch(e,i)}webhookCreate(e){return new Op(this._request).fetch(e)}webhookDelete(e){return new Pp(this._request).fetch(e)}webhookUpdate(e,i){return new jp(this._request).fetch(e,i)}workflowStateArchive(e){return new Up(this._request).fetch(e)}workflowStateCreate(e){return new Bp(this._request).fetch(e)}workflowStateUpdate(e,i){return new Ep(this._request).fetch(e,i)}}exports.AdministrableTeamsQuery=Uk,exports.ApiKey=Qs,exports.ApiKeyConnection=class extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Qs(e,i))),new Eu(e,n.pageInfo))}},exports.ApiKeyPayload=class extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId,this.success=i.success,this.apiKey=new Qs(e,i.apiKey)}},exports.Application=class extends Bs{constructor(e,i){var n,a;super(e),this.clientId=i.clientId,this.description=null!==(n=i.description)&&void 0!==n?n:void 0,this.developer=i.developer,this.developerUrl=i.developerUrl,this.imageUrl=null!==(a=i.imageUrl)&&void 0!==a?a:void 0,this.name=i.name}},exports.ApplicationWithAuthorizationQuery=Bk,exports.ArchivePayload=Ws,exports.ArchiveResponse=class extends Bs{constructor(e,i){super(e),this.archive=i.archive,this.databaseVersion=i.databaseVersion,this.totalCount=i.totalCount}},exports.Attachment=Hs,exports.AttachmentArchiveMutation=Xc,exports.AttachmentConnection=Gs,exports.AttachmentCreateMutation=ev,exports.AttachmentDeleteMutation=iv,exports.AttachmentIssueQuery=zk,exports.AttachmentIssue_AttachmentsQuery=class extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Bt,Object.assign(Object.assign({id:this._id},this._variables),e))).attachmentIssue.attachments;return new Gs(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.AttachmentIssue_ChildrenQuery=class extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Et,Object.assign(Object.assign({id:this._id},this._variables),e))).attachmentIssue.children;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.AttachmentIssue_CommentsQuery=class extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(zt,Object.assign(Object.assign({id:this._id},this._variables),e))).attachmentIssue.comments;return new dm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.AttachmentIssue_HistoryQuery=class extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Lt,Object.assign(Object.assign({id:this._id},this._variables),e))).attachmentIssue.history;return new eu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.AttachmentIssue_InverseRelationsQuery=class extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Mt,Object.assign(Object.assign({id:this._id},this._variables),e))).attachmentIssue.inverseRelations;return new mu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.AttachmentIssue_LabelsQuery=class extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Rt,Object.assign(Object.assign({id:this._id},this._variables),e))).attachmentIssue.labels;return new du(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.AttachmentIssue_RelationsQuery=class extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Qt,Object.assign(Object.assign({id:this._id},this._variables),e))).attachmentIssue.relations;return new mu(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.AttachmentIssue_SubscribersQuery=class extends Bs{constructor(e,i,n){super(e),this._id=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Wt,Object.assign(Object.assign({id:this._id},this._variables),e))).attachmentIssue.subscribers;return new Sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.AttachmentLinkFrontMutation=nv,exports.AttachmentLinkIntercomMutation=av,exports.AttachmentLinkJiraIssueMutation=tv,exports.AttachmentLinkUrlMutation=dv,exports.AttachmentLinkZendeskMutation=lv,exports.AttachmentPayload=Js,exports.AttachmentQuery=Ek,exports.AttachmentUpdateMutation=rv,exports.AttachmentsForUrlQuery=Mk,exports.AttachmentsQuery=Lk,exports.AuditEntriesQuery=Rk,exports.AuditEntry=$s,exports.AuditEntryConnection=Ks,exports.AuditEntryType=Zs,exports.AuditEntryTypesQuery=Qk,exports.AuthResolverResponse=Ys,exports.AuthenticationLinearError=S,exports.AuthorizedApplication=Xs,exports.AuthorizedApplicationsQuery=Wk,exports.AvailableUsersQuery=Hk,exports.BillingDetailsPayload=em,exports.BillingDetailsQuery=Gk,exports.BillingDetails_PaymentMethodQuery=class extends Bs{constructor(e){super(e)}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(Xt,{})).billingDetails.paymentMethod;return e?new nm(this._request,e):void 0}))}},exports.BillingEmailPayload=im,exports.BillingEmailUpdateMutation=ov,exports.BootstrapLinearError=D,exports.Card=nm,exports.CollaborationDocumentUpdatePayload=am,exports.CollaborativeDocumentJoinQuery=Jk,exports.CollaborativeDocumentJoin_StepsQuery=class extends Bs{constructor(e,i,n,a){super(e),this._clientId=i,this._issueId=n,this._version=a}fetch(){return u(this,void 0,void 0,(function*(){const e=(yield this._request(id,{clientId:this._clientId,issueId:this._issueId,version:this._version})).collaborativeDocumentJoin.steps;return e?new tk(this._request,e):void 0}))}},exports.CollaborativeDocumentUpdateMutation=sv,exports.Comment=tm,exports.CommentConnection=dm,exports.CommentCreateMutation=mv,exports.CommentDeleteMutation=uv,exports.CommentPayload=lm,exports.CommentQuery=$k,exports.CommentUpdateMutation=kv,exports.CommentsQuery=Kk,exports.CommitPayload=rm,exports.Connection=Ls,exports.ContactCreateMutation=cv,exports.ContactPayload=om,exports.CreateCsvExportReportMutation=vv,exports.CreateCsvExportReportPayload=sm,exports.CreateOrJoinOrganizationResponse=mm,exports.CreateOrganizationFromOnboardingMutation=Nv,exports.CustomView=um,exports.CustomViewConnection=km,exports.CustomViewCreateMutation=pv,exports.CustomViewDeleteMutation=fv,exports.CustomViewPayload=cm,exports.CustomViewQuery=Zk,exports.CustomViewUpdateMutation=hv,exports.CustomViewsQuery=Yk,exports.Cycle=vm,exports.CycleArchiveMutation=bv,exports.CycleConnection=Nm,exports.CycleCreateMutation=yv,exports.CyclePayload=pm,exports.CycleQuery=Xk,exports.CycleUpdateMutation=Sv,exports.Cycle_IssuesQuery=zp,exports.Cycle_UncompletedIssuesUponCloseQuery=Lp,exports.CyclesQuery=ec,exports.DebugFailWithInternalErrorMutation=gv,exports.DebugPayload=fm,exports.DependencyResponse=class extends Bs{constructor(e,i){super(e),this.dependencies=i.dependencies}},exports.Document=hm,exports.DocumentConnection=bm,exports.DocumentCreateMutation=Dv,exports.DocumentDeleteMutation=Vv,exports.DocumentPayload=ym,exports.DocumentQuery=ic,exports.DocumentStep=class extends Bs{constructor(e,i){var n,a,t,d;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.clientId=i.clientId,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.id=i.id,this.step=null!==(t=Rs(i.step))&&void 0!==t?t:{},this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this.version=i.version}},exports.DocumentUpdateMutation=Fv,exports.DocumentVersion=Sm,exports.DocumentVersionConnection=class extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Sm(e,i))),new Eu(e,n.pageInfo))}},exports.DocumentsQuery=nc,exports.EmailSubscribeMutation=Av,exports.EmailSubscribePayload=gm,exports.EmailTokenUserAccountAuthMutation=Tv,exports.EmailUnsubscribeMutation=_v,exports.EmailUnsubscribePayload=Dm,exports.EmailUserAccountAuthChallengeMutation=Iv,exports.EmailUserAccountAuthChallengeResponse=Vm,exports.Emoji=Fm,exports.EmojiConnection=Am,exports.EmojiCreateMutation=wv,exports.EmojiDeleteMutation=qv,exports.EmojiPayload=Tm,exports.EmojiQuery=ac,exports.EmojisQuery=tc,exports.EventCreateMutation=xv,exports.EventPayload=_m,exports.Favorite=Im,exports.FavoriteConnection=wm,exports.FavoriteCreateMutation=Cv,exports.FavoriteDeleteMutation=Ov,exports.FavoritePayload=qm,exports.FavoriteQuery=dc,exports.FavoriteUpdateMutation=Pv,exports.Favorite_ChildrenQuery=Mp,exports.FavoritesQuery=lc,exports.FeatureNotAccessibleLinearError=f,exports.FeedbackCreateMutation=jv,exports.FeedbackPayload=xm,exports.FigmaEmbed=Cm,exports.FigmaEmbedInfoQuery=rc,exports.FigmaEmbedInfo_FigmaEmbedQuery=class extends Bs{constructor(e,i,n){super(e),this._fileId=i,this._variables=n}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(hd,Object.assign(Object.assign({fileId:this._fileId},this._variables),e))).figmaEmbedInfo.figmaEmbed;return i?new Cm(this._request,i):void 0}))}},exports.FigmaEmbedPayload=Om,exports.FileUploadMutation=Uv,exports.ForbiddenLinearError=g,exports.FrontAttachmentPayload=Pm,exports.GitHubCommitIntegrationPayload=jm,exports.GithubOAuthTokenPayload=Um,exports.GithubOrg=Bm,exports.GithubRepo=Em,exports.GoogleSheetsSettings=zm,exports.GoogleUserAccountAuthMutation=Bv,exports.GraphQLClientError=_i,exports.GraphqlLinearError=_,exports.ImageUploadFromUrlMutation=Ev,exports.ImageUploadFromUrlPayload=Lm,exports.Integration=Mm,exports.IntegrationConnection=Rm,exports.IntegrationDeleteMutation=zv,exports.IntegrationFigmaMutation=Lv,exports.IntegrationFrontMutation=Mv,exports.IntegrationGithubCommitCreateMutation=Rv,exports.IntegrationGithubConnectMutation=Qv,exports.IntegrationGitlabConnectMutation=Wv,exports.IntegrationGoogleSheetsMutation=Hv,exports.IntegrationIntercomDeleteMutation=Jv,exports.IntegrationIntercomMutation=Gv,exports.IntegrationIntercomSettingsUpdateMutation=$v,exports.IntegrationLoomMutation=Kv,exports.IntegrationPayload=Qm,exports.IntegrationQuery=oc,exports.IntegrationResource=Wm,exports.IntegrationResourceArchiveMutation=Zv,exports.IntegrationResourceConnection=class extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Wm(e,i))),new Eu(e,n.pageInfo))}},exports.IntegrationResourceData=Hm,exports.IntegrationSentryConnectMutation=Yv,exports.IntegrationSettings=class extends Bs{constructor(e,i){super(e),this.googleSheets=i.googleSheets?new zm(e,i.googleSheets):void 0,this.intercom=i.intercom?new Gm(e,i.intercom):void 0,this.jira=i.jira?new Nu(e,i.jira):void 0,this.sentry=i.sentry?new ik(e,i.sentry):void 0,this.slackPost=i.slackPost?new nk(e,i.slackPost):void 0,this.slackProjectPost=i.slackProjectPost?new nk(e,i.slackProjectPost):void 0,this.zendesk=i.zendesk?new jk(e,i.zendesk):void 0}update(e,i){return new Xv(this._request).fetch(e,i)}},exports.IntegrationSettingsUpdateMutation=Xv,exports.IntegrationSlackImportEmojisMutation=iN,exports.IntegrationSlackMutation=eN,exports.IntegrationSlackPersonalMutation=nN,exports.IntegrationSlackPostMutation=aN,exports.IntegrationSlackProjectPostMutation=tN,exports.IntegrationZendeskMutation=dN,exports.IntegrationsQuery=sc,exports.IntercomSettings=Gm,exports.InternalLinearError=F,exports.InvalidInputLinearError=h,exports.Invoice=Jm,exports.Issue=$m,exports.IssueArchiveMutation=lN,exports.IssueBatchPayload=Km,exports.IssueBatchUpdateMutation=rN,exports.IssueConnection=Zm,exports.IssueCreateMutation=oN,exports.IssueDeleteMutation=sN,exports.IssueDescriptionHistory=Ym,exports.IssueDescriptionHistoryPayload=class extends Bs{constructor(e,i){super(e),this.success=i.success,this.history=i.history?i.history.map((i=>new Ym(e,i))):void 0}},exports.IssueHistory=Xm,exports.IssueHistoryConnection=eu,exports.IssueImport=iu,exports.IssueImportCreateAsanaMutation=mN,exports.IssueImportCreateClubhouseMutation=uN,exports.IssueImportCreateGithubMutation=kN,exports.IssueImportCreateJiraMutation=cN,exports.IssueImportDeleteMutation=vN,exports.IssueImportDeletePayload=nu,exports.IssueImportFinishGithubOAuthQuery=uc,exports.IssueImportPayload=au,exports.IssueImportProcessMutation=NN,exports.IssueImportUpdateMutation=pN,exports.IssueLabel=tu,exports.IssueLabelArchiveMutation=fN,exports.IssueLabelConnection=du,exports.IssueLabelCreateMutation=hN,exports.IssueLabelPayload=lu,exports.IssueLabelQuery=kc,exports.IssueLabelUpdateMutation=bN,exports.IssueLabel_IssuesQuery=Zp,exports.IssueLabelsQuery=cc,exports.IssuePayload=ru,exports.IssuePriorityValue=ou,exports.IssuePriorityValuesQuery=vc,exports.IssueQuery=mc,exports.IssueRelation=su,exports.IssueRelationConnection=mu,exports.IssueRelationCreateMutation=yN,exports.IssueRelationDeleteMutation=SN,exports.IssueRelationHistoryPayload=uu,exports.IssueRelationPayload=ku,exports.IssueRelationQuery=Nc,exports.IssueRelationUpdateMutation=gN,exports.IssueRelationsQuery=pc,exports.IssueSearchQuery=fc,exports.IssueUnarchiveMutation=DN,exports.IssueUpdateMutation=VN,exports.Issue_AttachmentsQuery=Rp,exports.Issue_ChildrenQuery=Qp,exports.Issue_CommentsQuery=Wp,exports.Issue_HistoryQuery=Hp,exports.Issue_InverseRelationsQuery=Gp,exports.Issue_LabelsQuery=Jp,exports.Issue_RelationsQuery=$p,exports.Issue_SubscribersQuery=Kp,exports.IssuesQuery=hc,exports.JiraIntegrationConnectMutation=FN,exports.JiraLinearMapping=cu,exports.JiraProjectData=vu,exports.JiraSettings=Nu,exports.JoinOrganizationFromOnboardingMutation=AN,exports.LeaveOrganizationMutation=TN,exports.LinearClient=class extends Ff{constructor(e){const i=function(e){var i,n,a,{apiKey:t,accessToken:d,apiUrl:l,headers:r}=e,o=m(e,["apiKey","accessToken","apiUrl","headers"]);if(!d&&!t)throw new Error("No accessToken or apiKey provided to the LinearClient - create one here: https://linear.app/settings/api");return Object.assign({headers:Object.assign(Object.assign({Authorization:d?d.startsWith("Bearer ")?d:`Bearer ${d}`:null!=t?t:""},r),{"User-Agent":(a={[null!==(i=process.env.npm_package_name)&&void 0!==i?i:"@linear/sdk"]:null!==(n=process.env.npm_package_version)&&void 0!==n?n:"unknown"},Object.entries(a).reduce(((e,[i,n])=>{const a=`${i}@${encodeURIComponent(n)}`;return e?`${e} ${a}`:a}),""))}),apiUrl:null!=l?l:"https://api.linear.app/graphql"},o)}(e),n=new Ii(i.apiUrl,i);super(((e,i)=>this.client.request(e,i).catch((e=>{throw q(e)})))),this.options=i,this.client=n}},exports.LinearConnection=zs,exports.LinearDocument=Us,exports.LinearError=p,exports.LinearGraphQLClient=Ii,exports.LinearGraphQLError=N,exports.LinearSdk=Ff,exports.LockTimeoutLinearError=I,exports.Milestone=pu,exports.MilestoneConnection=fu,exports.MilestoneCreateMutation=_N,exports.MilestoneDeleteMutation=IN,exports.MilestonePayload=hu,exports.MilestoneQuery=bc,exports.MilestoneUpdateMutation=wN,exports.Milestone_ProjectsQuery=Yp,exports.MilestonesQuery=yc,exports.NetworkLinearError=y,exports.Notification=bu,exports.NotificationArchiveMutation=qN,exports.NotificationConnection=yu,exports.NotificationCreateMutation=xN,exports.NotificationPayload=Su,exports.NotificationQuery=Sc,exports.NotificationSubscription=gu,exports.NotificationSubscriptionConnection=Du,exports.NotificationSubscriptionCreateMutation=CN,exports.NotificationSubscriptionDeleteMutation=ON,exports.NotificationSubscriptionPayload=Vu,exports.NotificationSubscriptionQuery=gc,exports.NotificationSubscriptionsQuery=Dc,exports.NotificationUnarchiveMutation=PN,exports.NotificationUpdateMutation=jN,exports.NotificationsQuery=Vc,exports.OauthAuthStringAuthorizePayload=class extends Bs{constructor(e,i){super(e),this.success=i.success}},exports.OauthAuthStringChallengePayload=class extends Bs{constructor(e,i){super(e),this.authString=i.authString,this.success=i.success}},exports.OauthAuthStringCheckPayload=class extends Bs{constructor(e,i){var n;super(e),this.success=i.success,this.token=null!==(n=i.token)&&void 0!==n?n:void 0}},exports.OauthClient=Fu,exports.OauthClientArchiveMutation=UN,exports.OauthClientCreateMutation=BN,exports.OauthClientPayload=Au,exports.OauthClientRotateSecretMutation=EN,exports.OauthClientUpdateMutation=zN,exports.OauthTokenRevokeMutation=LN,exports.OauthTokenRevokePayload=Tu,exports.Organization=_u,exports.OrganizationCancelDeleteMutation=MN,exports.OrganizationCancelDeletePayload=Iu,exports.OrganizationDeleteChallengeMutation=QN,exports.OrganizationDeleteMutation=RN,exports.OrganizationDeletePayload=wu,exports.OrganizationDomain=qu,exports.OrganizationDomainCreateMutation=WN,exports.OrganizationDomainDeleteMutation=HN,exports.OrganizationDomainPayload=xu,exports.OrganizationDomainSimplePayload=class extends Bs{constructor(e,i){super(e),this.success=i.success}},exports.OrganizationDomainVerifyMutation=GN,exports.OrganizationExistsPayload=Cu,exports.OrganizationExistsQuery=Ac,exports.OrganizationInvite=Ou,exports.OrganizationInviteConnection=Pu,exports.OrganizationInviteCreateMutation=JN,exports.OrganizationInviteDeleteMutation=$N,exports.OrganizationInviteDetailsPayload=ju,exports.OrganizationInviteDetailsQuery=_c,exports.OrganizationInvitePayload=Uu,exports.OrganizationInviteQuery=Tc,exports.OrganizationInvitesQuery=Ic,exports.OrganizationPayload=Bu,exports.OrganizationQuery=Fc,exports.OrganizationUpdateMutation=KN,exports.Organization_IntegrationsQuery=Xp,exports.Organization_LabelsQuery=ef,exports.Organization_MilestonesQuery=nf,exports.Organization_TeamsQuery=af,exports.Organization_TemplatesQuery=tf,exports.Organization_UsersQuery=df,exports.OtherLinearError=A,exports.PageInfo=Eu,exports.Project=zu,exports.ProjectArchiveMutation=ZN,exports.ProjectConnection=Lu,exports.ProjectCreateMutation=YN,exports.ProjectLink=Mu,exports.ProjectLinkConnection=Ru,exports.ProjectLinkCreateMutation=XN,exports.ProjectLinkDeleteMutation=ep,exports.ProjectLinkPayload=Qu,exports.ProjectLinkQuery=qc,exports.ProjectLinkUpdateMutation=ip,exports.ProjectLinksQuery=xc,exports.ProjectPayload=Wu,exports.ProjectQuery=wc,exports.ProjectUnarchiveMutation=np,exports.ProjectUpdateMutation=ap,exports.Project_DocumentsQuery=lf,exports.Project_IssuesQuery=rf,exports.Project_LinksQuery=of,exports.Project_MembersQuery=sf,exports.Project_TeamsQuery=mf,exports.ProjectsQuery=Cc,exports.PullRequestPayload=Hu,exports.PushSubscription=Gu,exports.PushSubscriptionConnection=class extends Ls{constructor(e,i,n){super(e,i,n.nodes.map((i=>new Gu(e,i))),new Eu(e,n.pageInfo))}},exports.PushSubscriptionCreateMutation=tp,exports.PushSubscriptionDeleteMutation=dp,exports.PushSubscriptionPayload=Ju,exports.PushSubscriptionTestPayload=$u,exports.PushSubscriptionTestQuery=Oc,exports.RatelimitedLinearError=b,exports.Reaction=Ku,exports.ReactionConnection=Zu,exports.ReactionCreateMutation=lp,exports.ReactionDeleteMutation=rp,exports.ReactionPayload=Yu,exports.ReactionQuery=Pc,exports.ReactionsQuery=jc,exports.RefreshGoogleSheetsDataMutation=op,exports.Request=Bs,exports.ResendOrganizationInviteMutation=sp,exports.RotateSecretPayload=Xu,exports.SamlConfiguration=class extends Bs{constructor(e,i){var n,a,t,d,l,r;super(e),this.allowedDomains=null!==(n=i.allowedDomains)&&void 0!==n?n:void 0,this.issuerEntityId=null!==(a=i.issuerEntityId)&&void 0!==a?a:void 0,this.ssoBinding=null!==(t=i.ssoBinding)&&void 0!==t?t:void 0,this.ssoEndpoint=null!==(d=i.ssoEndpoint)&&void 0!==d?d:void 0,this.ssoSignAlgo=null!==(l=i.ssoSignAlgo)&&void 0!==l?l:void 0,this.ssoSigningCert=null!==(r=i.ssoSigningCert)&&void 0!==r?r:void 0}},exports.SamlTokenUserAccountAuthMutation=mp,exports.SentryIssuePayload=ek,exports.SentrySettings=ik,exports.SlackPostSettings=nk,exports.SsoUrlFromEmailQuery=Uc,exports.SsoUrlFromEmailResponse=ak,exports.StepsResponse=tk,exports.Subscription=dk,exports.SubscriptionPayload=class extends Bs{constructor(e,i){var n;super(e),this.canceledAt=null!==(n=Ms(i.canceledAt))&&void 0!==n?n:void 0,this.lastSyncId=i.lastSyncId,this.success=i.success}get subscription(){return new Bc(this._request).fetch()}},exports.SubscriptionQuery=Bc,exports.SubscriptionSessionPayload=class extends Bs{constructor(e,i){var n;super(e),this.session=null!==(n=i.session)&&void 0!==n?n:void 0}},exports.SyncBatchResponse=class extends Bs{constructor(e,i){super(e),this.models=i.models}},exports.SyncDeltaResponse=class extends Bs{constructor(e,i){var n;super(e),this.loadMore=i.loadMore,this.success=i.success,this.updates=null!==(n=i.updates)&&void 0!==n?n:void 0}},exports.SyncResponse=class extends Bs{constructor(e,i){var n,a;super(e),this.databaseVersion=i.databaseVersion,this.delta=null!==(n=i.delta)&&void 0!==n?n:void 0,this.lastSyncId=i.lastSyncId,this.state=null!==(a=i.state)&&void 0!==a?a:void 0,this.subscribedSyncGroups=i.subscribedSyncGroups}},exports.SynchronizedPayload=class extends Bs{constructor(e,i){super(e),this.lastSyncId=i.lastSyncId}},exports.Team=lk,exports.TeamConnection=rk,exports.TeamCreateMutation=up,exports.TeamDeleteMutation=kp,exports.TeamKeyDeleteMutation=cp,exports.TeamMembership=ok,exports.TeamMembershipConnection=sk,exports.TeamMembershipCreateMutation=vp,exports.TeamMembershipDeleteMutation=Np,exports.TeamMembershipPayload=mk,exports.TeamMembershipQuery=zc,exports.TeamMembershipUpdateMutation=pp,exports.TeamMembershipsQuery=Lc,exports.TeamPayload=uk,exports.TeamQuery=Ec,exports.TeamUpdateMutation=fp,exports.Team_CyclesQuery=uf,exports.Team_IssuesQuery=kf,exports.Team_LabelsQuery=cf,exports.Team_MembersQuery=vf,exports.Team_MembershipsQuery=Nf,exports.Team_ProjectsQuery=pf,exports.Team_StatesQuery=ff,exports.Team_TemplatesQuery=hf,exports.Team_WebhooksQuery=bf,exports.TeamsQuery=Mc,exports.Template=kk,exports.TemplateConnection=ck,exports.TemplateCreateMutation=hp,exports.TemplateDeleteMutation=bp,exports.TemplatePayload=vk,exports.TemplateQuery=Rc,exports.TemplateUpdateMutation=yp,exports.TemplatesQuery=Qc,exports.UnknownLinearError=V,exports.UploadFile=Nk,exports.UploadFileHeader=pk,exports.UploadPayload=fk,exports.User=hk,exports.UserAccount=class extends Bs{constructor(e,i){var n,a,t,d;super(e),this.archivedAt=null!==(n=Ms(i.archivedAt))&&void 0!==n?n:void 0,this.createdAt=null!==(a=Ms(i.createdAt))&&void 0!==a?a:new Date,this.email=i.email,this.id=i.id,this.name=null!==(t=i.name)&&void 0!==t?t:void 0,this.service=i.service,this.updatedAt=null!==(d=Ms(i.updatedAt))&&void 0!==d?d:new Date,this.users=i.users.map((i=>new hk(e,i)))}},exports.UserAdminPayload=bk,exports.UserAuthorizedApplication=yk,exports.UserConnection=Sk,exports.UserDemoteAdminMutation=Sp,exports.UserFlagUpdateMutation=gp,exports.UserLinearError=T,exports.UserPayload=gk,exports.UserPromoteAdminMutation=Dp,exports.UserQuery=Wc,exports.UserSettings=Dk,exports.UserSettingsFlagIncrementMutation=Vp,exports.UserSettingsFlagPayload=Vk,exports.UserSettingsFlagsResetMutation=Fp,exports.UserSettingsFlagsResetPayload=Fk,exports.UserSettingsPayload=Ak,exports.UserSettingsQuery=Hc,exports.UserSettingsUpdateMutation=Ap,exports.UserSubscribeToNewsletterMutation=Tp,exports.UserSubscribeToNewsletterPayload=Tk,exports.UserSuspendMutation=_p,exports.UserUnsuspendMutation=Ip,exports.UserUpdateMutation=wp,exports.User_AssignedIssuesQuery=yf,exports.User_CreatedIssuesQuery=Sf,exports.User_TeamMembershipsQuery=gf,exports.User_TeamsQuery=Df,exports.UsersQuery=Gc,exports.ViewPreferences=_k,exports.ViewPreferencesCreateMutation=qp,exports.ViewPreferencesDeleteMutation=xp,exports.ViewPreferencesPayload=Ik,exports.ViewPreferencesUpdateMutation=Cp,exports.ViewerQuery=Jc,exports.Viewer_AssignedIssuesQuery=class extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(zl,e)).viewer.assignedIssues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.Viewer_CreatedIssuesQuery=class extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ll,e)).viewer.createdIssues;return new Zm(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.Viewer_TeamMembershipsQuery=class extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Ml,e)).viewer.teamMemberships;return new sk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.Viewer_TeamsQuery=class extends Bs{constructor(e,i){super(e),this._variables=i}fetch(e){return u(this,void 0,void 0,(function*(){const i=(yield this._request(Rl,e)).viewer.teams;return new rk(this._request,(i=>this.fetch(Es(Object.assign(Object.assign(Object.assign({},this._variables),e),i)))),i)}))}},exports.Webhook=wk,exports.WebhookConnection=qk,exports.WebhookCreateMutation=Op,exports.WebhookDeleteMutation=Pp,exports.WebhookPayload=xk,exports.WebhookQuery=$c,exports.WebhookUpdateMutation=jp,exports.WebhooksQuery=Kc,exports.WorkflowState=Ck,exports.WorkflowStateArchiveMutation=Up,exports.WorkflowStateConnection=Ok,exports.WorkflowStateCreateMutation=Bp,exports.WorkflowStatePayload=Pk,exports.WorkflowStateQuery=Zc,exports.WorkflowStateUpdateMutation=Ep,exports.WorkflowState_IssuesQuery=Vf,exports.WorkflowStatesQuery=Yc,exports.ZendeskSettings=jk,exports.parseLinearError=q;
//# sourceMappingURL=index-cjs.min.js.map


/***/ }),

/***/ 334:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

const REGEX_IS_INSTALLATION_LEGACY = /^v1\./;
const REGEX_IS_INSTALLATION = /^ghs_/;
const REGEX_IS_USER_TO_SERVER = /^ghu_/;
async function auth(token) {
  const isApp = token.split(/\./).length === 3;
  const isInstallation = REGEX_IS_INSTALLATION_LEGACY.test(token) || REGEX_IS_INSTALLATION.test(token);
  const isUserToServer = REGEX_IS_USER_TO_SERVER.test(token);
  const tokenType = isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth";
  return {
    type: "token",
    token: token,
    tokenType
  };
}

/**
 * Prefix token for usage in the Authorization header
 *
 * @param token OAuth token or JSON Web Token
 */
function withAuthorizationPrefix(token) {
  if (token.split(/\./).length === 3) {
    return `bearer ${token}`;
  }

  return `token ${token}`;
}

async function hook(token, request, route, parameters) {
  const endpoint = request.endpoint.merge(route, parameters);
  endpoint.headers.authorization = withAuthorizationPrefix(token);
  return request(endpoint);
}

const createTokenAuth = function createTokenAuth(token) {
  if (!token) {
    throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
  }

  if (typeof token !== "string") {
    throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
  }

  token = token.replace(/^(token|bearer) +/i, "");
  return Object.assign(auth.bind(null, token), {
    hook: hook.bind(null, token)
  });
};

exports.createTokenAuth = createTokenAuth;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 6762:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var universalUserAgent = __nccwpck_require__(5030);
var beforeAfterHook = __nccwpck_require__(3682);
var request = __nccwpck_require__(6234);
var graphql = __nccwpck_require__(8467);
var authToken = __nccwpck_require__(334);

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

const VERSION = "3.6.0";

const _excluded = ["authStrategy"];
class Octokit {
  constructor(options = {}) {
    const hook = new beforeAfterHook.Collection();
    const requestDefaults = {
      baseUrl: request.request.endpoint.DEFAULTS.baseUrl,
      headers: {},
      request: Object.assign({}, options.request, {
        // @ts-ignore internal usage only, no need to type
        hook: hook.bind(null, "request")
      }),
      mediaType: {
        previews: [],
        format: ""
      }
    }; // prepend default user agent with `options.userAgent` if set

    requestDefaults.headers["user-agent"] = [options.userAgent, `octokit-core.js/${VERSION} ${universalUserAgent.getUserAgent()}`].filter(Boolean).join(" ");

    if (options.baseUrl) {
      requestDefaults.baseUrl = options.baseUrl;
    }

    if (options.previews) {
      requestDefaults.mediaType.previews = options.previews;
    }

    if (options.timeZone) {
      requestDefaults.headers["time-zone"] = options.timeZone;
    }

    this.request = request.request.defaults(requestDefaults);
    this.graphql = graphql.withCustomRequest(this.request).defaults(requestDefaults);
    this.log = Object.assign({
      debug: () => {},
      info: () => {},
      warn: console.warn.bind(console),
      error: console.error.bind(console)
    }, options.log);
    this.hook = hook; // (1) If neither `options.authStrategy` nor `options.auth` are set, the `octokit` instance
    //     is unauthenticated. The `this.auth()` method is a no-op and no request hook is registered.
    // (2) If only `options.auth` is set, use the default token authentication strategy.
    // (3) If `options.authStrategy` is set then use it and pass in `options.auth`. Always pass own request as many strategies accept a custom request instance.
    // TODO: type `options.auth` based on `options.authStrategy`.

    if (!options.authStrategy) {
      if (!options.auth) {
        // (1)
        this.auth = async () => ({
          type: "unauthenticated"
        });
      } else {
        // (2)
        const auth = authToken.createTokenAuth(options.auth); // @ts-ignore  ¯\_(ツ)_/¯

        hook.wrap("request", auth.hook);
        this.auth = auth;
      }
    } else {
      const {
        authStrategy
      } = options,
            otherOptions = _objectWithoutProperties(options, _excluded);

      const auth = authStrategy(Object.assign({
        request: this.request,
        log: this.log,
        // we pass the current octokit instance as well as its constructor options
        // to allow for authentication strategies that return a new octokit instance
        // that shares the same internal state as the current one. The original
        // requirement for this was the "event-octokit" authentication strategy
        // of https://github.com/probot/octokit-auth-probot.
        octokit: this,
        octokitOptions: otherOptions
      }, options.auth)); // @ts-ignore  ¯\_(ツ)_/¯

      hook.wrap("request", auth.hook);
      this.auth = auth;
    } // apply plugins
    // https://stackoverflow.com/a/16345172


    const classConstructor = this.constructor;
    classConstructor.plugins.forEach(plugin => {
      Object.assign(this, plugin(this, options));
    });
  }

  static defaults(defaults) {
    const OctokitWithDefaults = class extends this {
      constructor(...args) {
        const options = args[0] || {};

        if (typeof defaults === "function") {
          super(defaults(options));
          return;
        }

        super(Object.assign({}, defaults, options, options.userAgent && defaults.userAgent ? {
          userAgent: `${options.userAgent} ${defaults.userAgent}`
        } : null));
      }

    };
    return OctokitWithDefaults;
  }
  /**
   * Attach a plugin (or many) to your Octokit instance.
   *
   * @example
   * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
   */


  static plugin(...newPlugins) {
    var _a;

    const currentPlugins = this.plugins;
    const NewOctokit = (_a = class extends this {}, _a.plugins = currentPlugins.concat(newPlugins.filter(plugin => !currentPlugins.includes(plugin))), _a);
    return NewOctokit;
  }

}
Octokit.VERSION = VERSION;
Octokit.plugins = [];

exports.Octokit = Octokit;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 9440:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var isPlainObject = __nccwpck_require__(3287);
var universalUserAgent = __nccwpck_require__(5030);

function lowercaseKeys(object) {
  if (!object) {
    return {};
  }

  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}

function mergeDeep(defaults, options) {
  const result = Object.assign({}, defaults);
  Object.keys(options).forEach(key => {
    if (isPlainObject.isPlainObject(options[key])) {
      if (!(key in defaults)) Object.assign(result, {
        [key]: options[key]
      });else result[key] = mergeDeep(defaults[key], options[key]);
    } else {
      Object.assign(result, {
        [key]: options[key]
      });
    }
  });
  return result;
}

function removeUndefinedProperties(obj) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }

  return obj;
}

function merge(defaults, route, options) {
  if (typeof route === "string") {
    let [method, url] = route.split(" ");
    options = Object.assign(url ? {
      method,
      url
    } : {
      url: method
    }, options);
  } else {
    options = Object.assign({}, route);
  } // lowercase header names before merging with defaults to avoid duplicates


  options.headers = lowercaseKeys(options.headers); // remove properties with undefined values before merging

  removeUndefinedProperties(options);
  removeUndefinedProperties(options.headers);
  const mergedOptions = mergeDeep(defaults || {}, options); // mediaType.previews arrays are merged, instead of overwritten

  if (defaults && defaults.mediaType.previews.length) {
    mergedOptions.mediaType.previews = defaults.mediaType.previews.filter(preview => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
  }

  mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(preview => preview.replace(/-preview/, ""));
  return mergedOptions;
}

function addQueryParameters(url, parameters) {
  const separator = /\?/.test(url) ? "&" : "?";
  const names = Object.keys(parameters);

  if (names.length === 0) {
    return url;
  }

  return url + separator + names.map(name => {
    if (name === "q") {
      return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
    }

    return `${name}=${encodeURIComponent(parameters[name])}`;
  }).join("&");
}

const urlVariableRegex = /\{[^}]+\}/g;

function removeNonChars(variableName) {
  return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
}

function extractUrlVariableNames(url) {
  const matches = url.match(urlVariableRegex);

  if (!matches) {
    return [];
  }

  return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}

function omit(object, keysToOmit) {
  return Object.keys(object).filter(option => !keysToOmit.includes(option)).reduce((obj, key) => {
    obj[key] = object[key];
    return obj;
  }, {});
}

// Based on https://github.com/bramstein/url-template, licensed under BSD
// TODO: create separate package.
//
// Copyright (c) 2012-2014, Bram Stein
// All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/* istanbul ignore file */
function encodeReserved(str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
    if (!/%[0-9A-Fa-f]/.test(part)) {
      part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
    }

    return part;
  }).join("");
}

function encodeUnreserved(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

function encodeValue(operator, value, key) {
  value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);

  if (key) {
    return encodeUnreserved(key) + "=" + value;
  } else {
    return value;
  }
}

function isDefined(value) {
  return value !== undefined && value !== null;
}

function isKeyOperator(operator) {
  return operator === ";" || operator === "&" || operator === "?";
}

function getValues(context, operator, key, modifier) {
  var value = context[key],
      result = [];

  if (isDefined(value) && value !== "") {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      value = value.toString();

      if (modifier && modifier !== "*") {
        value = value.substring(0, parseInt(modifier, 10));
      }

      result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
    } else {
      if (modifier === "*") {
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function (value) {
            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
          });
        } else {
          Object.keys(value).forEach(function (k) {
            if (isDefined(value[k])) {
              result.push(encodeValue(operator, value[k], k));
            }
          });
        }
      } else {
        const tmp = [];

        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function (value) {
            tmp.push(encodeValue(operator, value));
          });
        } else {
          Object.keys(value).forEach(function (k) {
            if (isDefined(value[k])) {
              tmp.push(encodeUnreserved(k));
              tmp.push(encodeValue(operator, value[k].toString()));
            }
          });
        }

        if (isKeyOperator(operator)) {
          result.push(encodeUnreserved(key) + "=" + tmp.join(","));
        } else if (tmp.length !== 0) {
          result.push(tmp.join(","));
        }
      }
    }
  } else {
    if (operator === ";") {
      if (isDefined(value)) {
        result.push(encodeUnreserved(key));
      }
    } else if (value === "" && (operator === "&" || operator === "?")) {
      result.push(encodeUnreserved(key) + "=");
    } else if (value === "") {
      result.push("");
    }
  }

  return result;
}

function parseUrl(template) {
  return {
    expand: expand.bind(null, template)
  };
}

function expand(template, context) {
  var operators = ["+", "#", ".", "/", ";", "?", "&"];
  return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
    if (expression) {
      let operator = "";
      const values = [];

      if (operators.indexOf(expression.charAt(0)) !== -1) {
        operator = expression.charAt(0);
        expression = expression.substr(1);
      }

      expression.split(/,/g).forEach(function (variable) {
        var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
        values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
      });

      if (operator && operator !== "+") {
        var separator = ",";

        if (operator === "?") {
          separator = "&";
        } else if (operator !== "#") {
          separator = operator;
        }

        return (values.length !== 0 ? operator : "") + values.join(separator);
      } else {
        return values.join(",");
      }
    } else {
      return encodeReserved(literal);
    }
  });
}

function parse(options) {
  // https://fetch.spec.whatwg.org/#methods
  let method = options.method.toUpperCase(); // replace :varname with {varname} to make it RFC 6570 compatible

  let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit(options, ["method", "baseUrl", "url", "headers", "request", "mediaType"]); // extract variable names from URL to calculate remaining variables later

  const urlVariableNames = extractUrlVariableNames(url);
  url = parseUrl(url).expand(parameters);

  if (!/^http/.test(url)) {
    url = options.baseUrl + url;
  }

  const omittedParameters = Object.keys(options).filter(option => urlVariableNames.includes(option)).concat("baseUrl");
  const remainingParameters = omit(parameters, omittedParameters);
  const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);

  if (!isBinaryRequest) {
    if (options.mediaType.format) {
      // e.g. application/vnd.github.v3+json => application/vnd.github.v3.raw
      headers.accept = headers.accept.split(/,/).map(preview => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`)).join(",");
    }

    if (options.mediaType.previews.length) {
      const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
      headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map(preview => {
        const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
        return `application/vnd.github.${preview}-preview${format}`;
      }).join(",");
    }
  } // for GET/HEAD requests, set URL query parameters from remaining parameters
  // for PATCH/POST/PUT/DELETE requests, set request body from remaining parameters


  if (["GET", "HEAD"].includes(method)) {
    url = addQueryParameters(url, remainingParameters);
  } else {
    if ("data" in remainingParameters) {
      body = remainingParameters.data;
    } else {
      if (Object.keys(remainingParameters).length) {
        body = remainingParameters;
      } else {
        headers["content-length"] = 0;
      }
    }
  } // default content-type for JSON if body is set


  if (!headers["content-type"] && typeof body !== "undefined") {
    headers["content-type"] = "application/json; charset=utf-8";
  } // GitHub expects 'content-length: 0' header for PUT/PATCH requests without body.
  // fetch does not allow to set `content-length` header, but we can set body to an empty string


  if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
    body = "";
  } // Only return body/request keys if present


  return Object.assign({
    method,
    url,
    headers
  }, typeof body !== "undefined" ? {
    body
  } : null, options.request ? {
    request: options.request
  } : null);
}

function endpointWithDefaults(defaults, route, options) {
  return parse(merge(defaults, route, options));
}

function withDefaults(oldDefaults, newDefaults) {
  const DEFAULTS = merge(oldDefaults, newDefaults);
  const endpoint = endpointWithDefaults.bind(null, DEFAULTS);
  return Object.assign(endpoint, {
    DEFAULTS,
    defaults: withDefaults.bind(null, DEFAULTS),
    merge: merge.bind(null, DEFAULTS),
    parse
  });
}

const VERSION = "6.0.12";

const userAgent = `octokit-endpoint.js/${VERSION} ${universalUserAgent.getUserAgent()}`; // DEFAULTS has all properties set that EndpointOptions has, except url.
// So we use RequestParameters and add method as additional required property.

const DEFAULTS = {
  method: "GET",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": userAgent
  },
  mediaType: {
    format: "",
    previews: []
  }
};

const endpoint = withDefaults(null, DEFAULTS);

exports.endpoint = endpoint;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 8467:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var request = __nccwpck_require__(6234);
var universalUserAgent = __nccwpck_require__(5030);

const VERSION = "4.8.0";

function _buildMessageForResponseErrors(data) {
  return `Request failed due to following response errors:\n` + data.errors.map(e => ` - ${e.message}`).join("\n");
}

class GraphqlResponseError extends Error {
  constructor(request, headers, response) {
    super(_buildMessageForResponseErrors(response));
    this.request = request;
    this.headers = headers;
    this.response = response;
    this.name = "GraphqlResponseError"; // Expose the errors and response data in their shorthand properties.

    this.errors = response.errors;
    this.data = response.data; // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

}

const NON_VARIABLE_OPTIONS = ["method", "baseUrl", "url", "headers", "request", "query", "mediaType"];
const FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
const GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
function graphql(request, query, options) {
  if (options) {
    if (typeof query === "string" && "query" in options) {
      return Promise.reject(new Error(`[@octokit/graphql] "query" cannot be used as variable name`));
    }

    for (const key in options) {
      if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key)) continue;
      return Promise.reject(new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`));
    }
  }

  const parsedOptions = typeof query === "string" ? Object.assign({
    query
  }, options) : query;
  const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = parsedOptions[key];
      return result;
    }

    if (!result.variables) {
      result.variables = {};
    }

    result.variables[key] = parsedOptions[key];
    return result;
  }, {}); // workaround for GitHub Enterprise baseUrl set with /api/v3 suffix
  // https://github.com/octokit/auth-app.js/issues/111#issuecomment-657610451

  const baseUrl = parsedOptions.baseUrl || request.endpoint.DEFAULTS.baseUrl;

  if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
    requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
  }

  return request(requestOptions).then(response => {
    if (response.data.errors) {
      const headers = {};

      for (const key of Object.keys(response.headers)) {
        headers[key] = response.headers[key];
      }

      throw new GraphqlResponseError(requestOptions, headers, response.data);
    }

    return response.data.data;
  });
}

function withDefaults(request$1, newDefaults) {
  const newRequest = request$1.defaults(newDefaults);

  const newApi = (query, options) => {
    return graphql(newRequest, query, options);
  };

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: request.request.endpoint
  });
}

const graphql$1 = withDefaults(request.request, {
  headers: {
    "user-agent": `octokit-graphql.js/${VERSION} ${universalUserAgent.getUserAgent()}`
  },
  method: "POST",
  url: "/graphql"
});
function withCustomRequest(customRequest) {
  return withDefaults(customRequest, {
    method: "POST",
    url: "/graphql"
  });
}

exports.GraphqlResponseError = GraphqlResponseError;
exports.graphql = graphql$1;
exports.withCustomRequest = withCustomRequest;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 4193:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

const VERSION = "2.17.0";

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

/**
 * Some “list” response that can be paginated have a different response structure
 *
 * They have a `total_count` key in the response (search also has `incomplete_results`,
 * /installation/repositories also has `repository_selection`), as well as a key with
 * the list of the items which name varies from endpoint to endpoint.
 *
 * Octokit normalizes these responses so that paginated results are always returned following
 * the same structure. One challenge is that if the list response has only one page, no Link
 * header is provided, so this header alone is not sufficient to check wether a response is
 * paginated or not.
 *
 * We check if a "total_count" key is present in the response data, but also make sure that
 * a "url" property is not, as the "Get the combined status for a specific ref" endpoint would
 * otherwise match: https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
 */
function normalizePaginatedListResponse(response) {
  // endpoints can respond with 204 if repository is empty
  if (!response.data) {
    return _objectSpread2(_objectSpread2({}, response), {}, {
      data: []
    });
  }

  const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
  if (!responseNeedsNormalization) return response; // keep the additional properties intact as there is currently no other way
  // to retrieve the same information.

  const incompleteResults = response.data.incomplete_results;
  const repositorySelection = response.data.repository_selection;
  const totalCount = response.data.total_count;
  delete response.data.incomplete_results;
  delete response.data.repository_selection;
  delete response.data.total_count;
  const namespaceKey = Object.keys(response.data)[0];
  const data = response.data[namespaceKey];
  response.data = data;

  if (typeof incompleteResults !== "undefined") {
    response.data.incomplete_results = incompleteResults;
  }

  if (typeof repositorySelection !== "undefined") {
    response.data.repository_selection = repositorySelection;
  }

  response.data.total_count = totalCount;
  return response;
}

function iterator(octokit, route, parameters) {
  const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
  const requestMethod = typeof route === "function" ? route : octokit.request;
  const method = options.method;
  const headers = options.headers;
  let url = options.url;
  return {
    [Symbol.asyncIterator]: () => ({
      async next() {
        if (!url) return {
          done: true
        };

        try {
          const response = await requestMethod({
            method,
            url,
            headers
          });
          const normalizedResponse = normalizePaginatedListResponse(response); // `response.headers.link` format:
          // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
          // sets `url` to undefined if "next" URL is not present or `link` header is not set

          url = ((normalizedResponse.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
          return {
            value: normalizedResponse
          };
        } catch (error) {
          if (error.status !== 409) throw error;
          url = "";
          return {
            value: {
              status: 200,
              headers: {},
              data: []
            }
          };
        }
      }

    })
  };
}

function paginate(octokit, route, parameters, mapFn) {
  if (typeof parameters === "function") {
    mapFn = parameters;
    parameters = undefined;
  }

  return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
}

function gather(octokit, results, iterator, mapFn) {
  return iterator.next().then(result => {
    if (result.done) {
      return results;
    }

    let earlyExit = false;

    function done() {
      earlyExit = true;
    }

    results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);

    if (earlyExit) {
      return results;
    }

    return gather(octokit, results, iterator, mapFn);
  });
}

const composePaginateRest = Object.assign(paginate, {
  iterator
});

const paginatingEndpoints = ["GET /app/hook/deliveries", "GET /app/installations", "GET /applications/grants", "GET /authorizations", "GET /enterprises/{enterprise}/actions/permissions/organizations", "GET /enterprises/{enterprise}/actions/runner-groups", "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/organizations", "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/runners", "GET /enterprises/{enterprise}/actions/runners", "GET /enterprises/{enterprise}/actions/runners/downloads", "GET /events", "GET /gists", "GET /gists/public", "GET /gists/starred", "GET /gists/{gist_id}/comments", "GET /gists/{gist_id}/commits", "GET /gists/{gist_id}/forks", "GET /installation/repositories", "GET /issues", "GET /marketplace_listing/plans", "GET /marketplace_listing/plans/{plan_id}/accounts", "GET /marketplace_listing/stubbed/plans", "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts", "GET /networks/{owner}/{repo}/events", "GET /notifications", "GET /organizations", "GET /orgs/{org}/actions/permissions/repositories", "GET /orgs/{org}/actions/runner-groups", "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories", "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/runners", "GET /orgs/{org}/actions/runners", "GET /orgs/{org}/actions/runners/downloads", "GET /orgs/{org}/actions/secrets", "GET /orgs/{org}/actions/secrets/{secret_name}/repositories", "GET /orgs/{org}/blocks", "GET /orgs/{org}/credential-authorizations", "GET /orgs/{org}/events", "GET /orgs/{org}/failed_invitations", "GET /orgs/{org}/hooks", "GET /orgs/{org}/hooks/{hook_id}/deliveries", "GET /orgs/{org}/installations", "GET /orgs/{org}/invitations", "GET /orgs/{org}/invitations/{invitation_id}/teams", "GET /orgs/{org}/issues", "GET /orgs/{org}/members", "GET /orgs/{org}/migrations", "GET /orgs/{org}/migrations/{migration_id}/repositories", "GET /orgs/{org}/outside_collaborators", "GET /orgs/{org}/packages", "GET /orgs/{org}/projects", "GET /orgs/{org}/public_members", "GET /orgs/{org}/repos", "GET /orgs/{org}/secret-scanning/alerts", "GET /orgs/{org}/team-sync/groups", "GET /orgs/{org}/teams", "GET /orgs/{org}/teams/{team_slug}/discussions", "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments", "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", "GET /orgs/{org}/teams/{team_slug}/invitations", "GET /orgs/{org}/teams/{team_slug}/members", "GET /orgs/{org}/teams/{team_slug}/projects", "GET /orgs/{org}/teams/{team_slug}/repos", "GET /orgs/{org}/teams/{team_slug}/team-sync/group-mappings", "GET /orgs/{org}/teams/{team_slug}/teams", "GET /projects/columns/{column_id}/cards", "GET /projects/{project_id}/collaborators", "GET /projects/{project_id}/columns", "GET /repos/{owner}/{repo}/actions/artifacts", "GET /repos/{owner}/{repo}/actions/runners", "GET /repos/{owner}/{repo}/actions/runners/downloads", "GET /repos/{owner}/{repo}/actions/runs", "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts", "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs", "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs", "GET /repos/{owner}/{repo}/actions/secrets", "GET /repos/{owner}/{repo}/actions/workflows", "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs", "GET /repos/{owner}/{repo}/assignees", "GET /repos/{owner}/{repo}/autolinks", "GET /repos/{owner}/{repo}/branches", "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations", "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs", "GET /repos/{owner}/{repo}/code-scanning/alerts", "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances", "GET /repos/{owner}/{repo}/code-scanning/analyses", "GET /repos/{owner}/{repo}/collaborators", "GET /repos/{owner}/{repo}/comments", "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions", "GET /repos/{owner}/{repo}/commits", "GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head", "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments", "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls", "GET /repos/{owner}/{repo}/commits/{ref}/check-runs", "GET /repos/{owner}/{repo}/commits/{ref}/check-suites", "GET /repos/{owner}/{repo}/commits/{ref}/statuses", "GET /repos/{owner}/{repo}/contributors", "GET /repos/{owner}/{repo}/deployments", "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses", "GET /repos/{owner}/{repo}/events", "GET /repos/{owner}/{repo}/forks", "GET /repos/{owner}/{repo}/git/matching-refs/{ref}", "GET /repos/{owner}/{repo}/hooks", "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries", "GET /repos/{owner}/{repo}/invitations", "GET /repos/{owner}/{repo}/issues", "GET /repos/{owner}/{repo}/issues/comments", "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", "GET /repos/{owner}/{repo}/issues/events", "GET /repos/{owner}/{repo}/issues/{issue_number}/comments", "GET /repos/{owner}/{repo}/issues/{issue_number}/events", "GET /repos/{owner}/{repo}/issues/{issue_number}/labels", "GET /repos/{owner}/{repo}/issues/{issue_number}/reactions", "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline", "GET /repos/{owner}/{repo}/keys", "GET /repos/{owner}/{repo}/labels", "GET /repos/{owner}/{repo}/milestones", "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels", "GET /repos/{owner}/{repo}/notifications", "GET /repos/{owner}/{repo}/pages/builds", "GET /repos/{owner}/{repo}/projects", "GET /repos/{owner}/{repo}/pulls", "GET /repos/{owner}/{repo}/pulls/comments", "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments", "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits", "GET /repos/{owner}/{repo}/pulls/{pull_number}/files", "GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers", "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews", "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments", "GET /repos/{owner}/{repo}/releases", "GET /repos/{owner}/{repo}/releases/{release_id}/assets", "GET /repos/{owner}/{repo}/secret-scanning/alerts", "GET /repos/{owner}/{repo}/stargazers", "GET /repos/{owner}/{repo}/subscribers", "GET /repos/{owner}/{repo}/tags", "GET /repos/{owner}/{repo}/teams", "GET /repositories", "GET /repositories/{repository_id}/environments/{environment_name}/secrets", "GET /scim/v2/enterprises/{enterprise}/Groups", "GET /scim/v2/enterprises/{enterprise}/Users", "GET /scim/v2/organizations/{org}/Users", "GET /search/code", "GET /search/commits", "GET /search/issues", "GET /search/labels", "GET /search/repositories", "GET /search/topics", "GET /search/users", "GET /teams/{team_id}/discussions", "GET /teams/{team_id}/discussions/{discussion_number}/comments", "GET /teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}/reactions", "GET /teams/{team_id}/discussions/{discussion_number}/reactions", "GET /teams/{team_id}/invitations", "GET /teams/{team_id}/members", "GET /teams/{team_id}/projects", "GET /teams/{team_id}/repos", "GET /teams/{team_id}/team-sync/group-mappings", "GET /teams/{team_id}/teams", "GET /user/blocks", "GET /user/emails", "GET /user/followers", "GET /user/following", "GET /user/gpg_keys", "GET /user/installations", "GET /user/installations/{installation_id}/repositories", "GET /user/issues", "GET /user/keys", "GET /user/marketplace_purchases", "GET /user/marketplace_purchases/stubbed", "GET /user/memberships/orgs", "GET /user/migrations", "GET /user/migrations/{migration_id}/repositories", "GET /user/orgs", "GET /user/packages", "GET /user/public_emails", "GET /user/repos", "GET /user/repository_invitations", "GET /user/starred", "GET /user/subscriptions", "GET /user/teams", "GET /users", "GET /users/{username}/events", "GET /users/{username}/events/orgs/{org}", "GET /users/{username}/events/public", "GET /users/{username}/followers", "GET /users/{username}/following", "GET /users/{username}/gists", "GET /users/{username}/gpg_keys", "GET /users/{username}/keys", "GET /users/{username}/orgs", "GET /users/{username}/packages", "GET /users/{username}/projects", "GET /users/{username}/received_events", "GET /users/{username}/received_events/public", "GET /users/{username}/repos", "GET /users/{username}/starred", "GET /users/{username}/subscriptions"];

function isPaginatingEndpoint(arg) {
  if (typeof arg === "string") {
    return paginatingEndpoints.includes(arg);
  } else {
    return false;
  }
}

/**
 * @param octokit Octokit instance
 * @param options Options passed to Octokit constructor
 */

function paginateRest(octokit) {
  return {
    paginate: Object.assign(paginate.bind(null, octokit), {
      iterator: iterator.bind(null, octokit)
    })
  };
}
paginateRest.VERSION = VERSION;

exports.composePaginateRest = composePaginateRest;
exports.isPaginatingEndpoint = isPaginatingEndpoint;
exports.paginateRest = paginateRest;
exports.paginatingEndpoints = paginatingEndpoints;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 3044:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

const Endpoints = {
  actions: {
    addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
    approveWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve"],
    cancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],
    createOrUpdateEnvironmentSecret: ["PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"],
    createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
    createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    createRegistrationTokenForOrg: ["POST /orgs/{org}/actions/runners/registration-token"],
    createRegistrationTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/registration-token"],
    createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
    createRemoveTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/remove-token"],
    createWorkflowDispatch: ["POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"],
    deleteArtifact: ["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    deleteEnvironmentSecret: ["DELETE /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"],
    deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
    deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    deleteSelfHostedRunnerFromOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}"],
    deleteSelfHostedRunnerFromRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],
    deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
    deleteWorkflowRunLogs: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
    disableSelectedRepositoryGithubActionsOrganization: ["DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}"],
    disableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"],
    downloadArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"],
    downloadJobLogsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],
    downloadWorkflowRunAttemptLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs"],
    downloadWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
    enableSelectedRepositoryGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories/{repository_id}"],
    enableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"],
    getAllowedActionsOrganization: ["GET /orgs/{org}/actions/permissions/selected-actions"],
    getAllowedActionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions/selected-actions"],
    getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    getEnvironmentPublicKey: ["GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key"],
    getEnvironmentSecret: ["GET /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"],
    getGithubActionsPermissionsOrganization: ["GET /orgs/{org}/actions/permissions"],
    getGithubActionsPermissionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions"],
    getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
    getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
    getPendingDeploymentsForRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],
    getRepoPermissions: ["GET /repos/{owner}/{repo}/actions/permissions", {}, {
      renamed: ["actions", "getGithubActionsPermissionsRepository"]
    }],
    getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
    getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    getReviewsForRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals"],
    getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
    getSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],
    getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
    getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
    getWorkflowRunAttempt: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}"],
    getWorkflowRunUsage: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],
    getWorkflowUsage: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],
    listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
    listEnvironmentSecrets: ["GET /repositories/{repository_id}/environments/{environment_name}/secrets"],
    listJobsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],
    listJobsForWorkflowRunAttempt: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs"],
    listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
    listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
    listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
    listRunnerApplicationsForRepo: ["GET /repos/{owner}/{repo}/actions/runners/downloads"],
    listSelectedReposForOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],
    listSelectedRepositoriesEnabledGithubActionsOrganization: ["GET /orgs/{org}/actions/permissions/repositories"],
    listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
    listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
    listWorkflowRunArtifacts: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],
    listWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],
    listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
    removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
    reviewPendingDeploymentsForRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],
    setAllowedActionsOrganization: ["PUT /orgs/{org}/actions/permissions/selected-actions"],
    setAllowedActionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/selected-actions"],
    setGithubActionsPermissionsOrganization: ["PUT /orgs/{org}/actions/permissions"],
    setGithubActionsPermissionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions"],
    setSelectedReposForOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"],
    setSelectedRepositoriesEnabledGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories"]
  },
  activity: {
    checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
    deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
    deleteThreadSubscription: ["DELETE /notifications/threads/{thread_id}/subscription"],
    getFeeds: ["GET /feeds"],
    getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
    getThread: ["GET /notifications/threads/{thread_id}"],
    getThreadSubscriptionForAuthenticatedUser: ["GET /notifications/threads/{thread_id}/subscription"],
    listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
    listNotificationsForAuthenticatedUser: ["GET /notifications"],
    listOrgEventsForAuthenticatedUser: ["GET /users/{username}/events/orgs/{org}"],
    listPublicEvents: ["GET /events"],
    listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
    listPublicEventsForUser: ["GET /users/{username}/events/public"],
    listPublicOrgEvents: ["GET /orgs/{org}/events"],
    listReceivedEventsForUser: ["GET /users/{username}/received_events"],
    listReceivedPublicEventsForUser: ["GET /users/{username}/received_events/public"],
    listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
    listRepoNotificationsForAuthenticatedUser: ["GET /repos/{owner}/{repo}/notifications"],
    listReposStarredByAuthenticatedUser: ["GET /user/starred"],
    listReposStarredByUser: ["GET /users/{username}/starred"],
    listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
    listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
    listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
    listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
    markNotificationsAsRead: ["PUT /notifications"],
    markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
    markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
    setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
    setThreadSubscription: ["PUT /notifications/threads/{thread_id}/subscription"],
    starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
    unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
  },
  apps: {
    addRepoToInstallation: ["PUT /user/installations/{installation_id}/repositories/{repository_id}", {}, {
      renamed: ["apps", "addRepoToInstallationForAuthenticatedUser"]
    }],
    addRepoToInstallationForAuthenticatedUser: ["PUT /user/installations/{installation_id}/repositories/{repository_id}"],
    checkToken: ["POST /applications/{client_id}/token"],
    createContentAttachment: ["POST /content_references/{content_reference_id}/attachments", {
      mediaType: {
        previews: ["corsair"]
      }
    }],
    createContentAttachmentForRepo: ["POST /repos/{owner}/{repo}/content_references/{content_reference_id}/attachments", {
      mediaType: {
        previews: ["corsair"]
      }
    }],
    createFromManifest: ["POST /app-manifests/{code}/conversions"],
    createInstallationAccessToken: ["POST /app/installations/{installation_id}/access_tokens"],
    deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
    deleteInstallation: ["DELETE /app/installations/{installation_id}"],
    deleteToken: ["DELETE /applications/{client_id}/token"],
    getAuthenticated: ["GET /app"],
    getBySlug: ["GET /apps/{app_slug}"],
    getInstallation: ["GET /app/installations/{installation_id}"],
    getOrgInstallation: ["GET /orgs/{org}/installation"],
    getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
    getSubscriptionPlanForAccount: ["GET /marketplace_listing/accounts/{account_id}"],
    getSubscriptionPlanForAccountStubbed: ["GET /marketplace_listing/stubbed/accounts/{account_id}"],
    getUserInstallation: ["GET /users/{username}/installation"],
    getWebhookConfigForApp: ["GET /app/hook/config"],
    getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
    listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
    listAccountsForPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],
    listInstallationReposForAuthenticatedUser: ["GET /user/installations/{installation_id}/repositories"],
    listInstallations: ["GET /app/installations"],
    listInstallationsForAuthenticatedUser: ["GET /user/installations"],
    listPlans: ["GET /marketplace_listing/plans"],
    listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
    listReposAccessibleToInstallation: ["GET /installation/repositories"],
    listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
    listSubscriptionsForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed"],
    listWebhookDeliveries: ["GET /app/hook/deliveries"],
    redeliverWebhookDelivery: ["POST /app/hook/deliveries/{delivery_id}/attempts"],
    removeRepoFromInstallation: ["DELETE /user/installations/{installation_id}/repositories/{repository_id}", {}, {
      renamed: ["apps", "removeRepoFromInstallationForAuthenticatedUser"]
    }],
    removeRepoFromInstallationForAuthenticatedUser: ["DELETE /user/installations/{installation_id}/repositories/{repository_id}"],
    resetToken: ["PATCH /applications/{client_id}/token"],
    revokeInstallationAccessToken: ["DELETE /installation/token"],
    scopeToken: ["POST /applications/{client_id}/token/scoped"],
    suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
    unsuspendInstallation: ["DELETE /app/installations/{installation_id}/suspended"],
    updateWebhookConfigForApp: ["PATCH /app/hook/config"]
  },
  billing: {
    getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
    getGithubActionsBillingUser: ["GET /users/{username}/settings/billing/actions"],
    getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
    getGithubPackagesBillingUser: ["GET /users/{username}/settings/billing/packages"],
    getSharedStorageBillingOrg: ["GET /orgs/{org}/settings/billing/shared-storage"],
    getSharedStorageBillingUser: ["GET /users/{username}/settings/billing/shared-storage"]
  },
  checks: {
    create: ["POST /repos/{owner}/{repo}/check-runs"],
    createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
    get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
    getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
    listAnnotations: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"],
    listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
    listForSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"],
    listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
    rerequestRun: ["POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest"],
    rerequestSuite: ["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"],
    setSuitesPreferences: ["PATCH /repos/{owner}/{repo}/check-suites/preferences"],
    update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"]
  },
  codeScanning: {
    deleteAnalysis: ["DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}"],
    getAlert: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}", {}, {
      renamedParameters: {
        alert_id: "alert_number"
      }
    }],
    getAnalysis: ["GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}"],
    getSarif: ["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],
    listAlertInstances: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
    listAlertsInstances: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances", {}, {
      renamed: ["codeScanning", "listAlertInstances"]
    }],
    listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
    updateAlert: ["PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"],
    uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"]
  },
  codesOfConduct: {
    getAllCodesOfConduct: ["GET /codes_of_conduct"],
    getConductCode: ["GET /codes_of_conduct/{key}"]
  },
  emojis: {
    get: ["GET /emojis"]
  },
  enterpriseAdmin: {
    disableSelectedOrganizationGithubActionsEnterprise: ["DELETE /enterprises/{enterprise}/actions/permissions/organizations/{org_id}"],
    enableSelectedOrganizationGithubActionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions/organizations/{org_id}"],
    getAllowedActionsEnterprise: ["GET /enterprises/{enterprise}/actions/permissions/selected-actions"],
    getGithubActionsPermissionsEnterprise: ["GET /enterprises/{enterprise}/actions/permissions"],
    listSelectedOrganizationsEnabledGithubActionsEnterprise: ["GET /enterprises/{enterprise}/actions/permissions/organizations"],
    setAllowedActionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions/selected-actions"],
    setGithubActionsPermissionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions"],
    setSelectedOrganizationsEnabledGithubActionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions/organizations"]
  },
  gists: {
    checkIsStarred: ["GET /gists/{gist_id}/star"],
    create: ["POST /gists"],
    createComment: ["POST /gists/{gist_id}/comments"],
    delete: ["DELETE /gists/{gist_id}"],
    deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
    fork: ["POST /gists/{gist_id}/forks"],
    get: ["GET /gists/{gist_id}"],
    getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
    getRevision: ["GET /gists/{gist_id}/{sha}"],
    list: ["GET /gists"],
    listComments: ["GET /gists/{gist_id}/comments"],
    listCommits: ["GET /gists/{gist_id}/commits"],
    listForUser: ["GET /users/{username}/gists"],
    listForks: ["GET /gists/{gist_id}/forks"],
    listPublic: ["GET /gists/public"],
    listStarred: ["GET /gists/starred"],
    star: ["PUT /gists/{gist_id}/star"],
    unstar: ["DELETE /gists/{gist_id}/star"],
    update: ["PATCH /gists/{gist_id}"],
    updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
  },
  git: {
    createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
    createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
    createRef: ["POST /repos/{owner}/{repo}/git/refs"],
    createTag: ["POST /repos/{owner}/{repo}/git/tags"],
    createTree: ["POST /repos/{owner}/{repo}/git/trees"],
    deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
    getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
    getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
    getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
    getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
    getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
    listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
    updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
  },
  gitignore: {
    getAllTemplates: ["GET /gitignore/templates"],
    getTemplate: ["GET /gitignore/templates/{name}"]
  },
  interactions: {
    getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
    getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
    getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
    getRestrictionsForYourPublicRepos: ["GET /user/interaction-limits", {}, {
      renamed: ["interactions", "getRestrictionsForAuthenticatedUser"]
    }],
    removeRestrictionsForAuthenticatedUser: ["DELETE /user/interaction-limits"],
    removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
    removeRestrictionsForRepo: ["DELETE /repos/{owner}/{repo}/interaction-limits"],
    removeRestrictionsForYourPublicRepos: ["DELETE /user/interaction-limits", {}, {
      renamed: ["interactions", "removeRestrictionsForAuthenticatedUser"]
    }],
    setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
    setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
    setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
    setRestrictionsForYourPublicRepos: ["PUT /user/interaction-limits", {}, {
      renamed: ["interactions", "setRestrictionsForAuthenticatedUser"]
    }]
  },
  issues: {
    addAssignees: ["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
    addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
    create: ["POST /repos/{owner}/{repo}/issues"],
    createComment: ["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    createLabel: ["POST /repos/{owner}/{repo}/labels"],
    createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
    deleteComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
    deleteMilestone: ["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],
    get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
    getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
    getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
    getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
    list: ["GET /issues"],
    listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
    listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
    listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
    listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
    listEventsForTimeline: ["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline"],
    listForAuthenticatedUser: ["GET /user/issues"],
    listForOrg: ["GET /orgs/{org}/issues"],
    listForRepo: ["GET /repos/{owner}/{repo}/issues"],
    listLabelsForMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],
    listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
    listLabelsOnIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
    lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    removeAllLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    removeAssignees: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
    removeLabel: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],
    setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
    updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
    updateMilestone: ["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"]
  },
  licenses: {
    get: ["GET /licenses/{license}"],
    getAllCommonlyUsed: ["GET /licenses"],
    getForRepo: ["GET /repos/{owner}/{repo}/license"]
  },
  markdown: {
    render: ["POST /markdown"],
    renderRaw: ["POST /markdown/raw", {
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    }]
  },
  meta: {
    get: ["GET /meta"],
    getOctocat: ["GET /octocat"],
    getZen: ["GET /zen"],
    root: ["GET /"]
  },
  migrations: {
    cancelImport: ["DELETE /repos/{owner}/{repo}/import"],
    deleteArchiveForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/archive"],
    deleteArchiveForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/archive"],
    downloadArchiveForOrg: ["GET /orgs/{org}/migrations/{migration_id}/archive"],
    getArchiveForAuthenticatedUser: ["GET /user/migrations/{migration_id}/archive"],
    getCommitAuthors: ["GET /repos/{owner}/{repo}/import/authors"],
    getImportStatus: ["GET /repos/{owner}/{repo}/import"],
    getLargeFiles: ["GET /repos/{owner}/{repo}/import/large_files"],
    getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}"],
    getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}"],
    listForAuthenticatedUser: ["GET /user/migrations"],
    listForOrg: ["GET /orgs/{org}/migrations"],
    listReposForAuthenticatedUser: ["GET /user/migrations/{migration_id}/repositories"],
    listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories"],
    listReposForUser: ["GET /user/migrations/{migration_id}/repositories", {}, {
      renamed: ["migrations", "listReposForAuthenticatedUser"]
    }],
    mapCommitAuthor: ["PATCH /repos/{owner}/{repo}/import/authors/{author_id}"],
    setLfsPreference: ["PATCH /repos/{owner}/{repo}/import/lfs"],
    startForAuthenticatedUser: ["POST /user/migrations"],
    startForOrg: ["POST /orgs/{org}/migrations"],
    startImport: ["PUT /repos/{owner}/{repo}/import"],
    unlockRepoForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock"],
    unlockRepoForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock"],
    updateImport: ["PATCH /repos/{owner}/{repo}/import"]
  },
  orgs: {
    blockUser: ["PUT /orgs/{org}/blocks/{username}"],
    cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
    checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
    checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
    checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
    convertMemberToOutsideCollaborator: ["PUT /orgs/{org}/outside_collaborators/{username}"],
    createInvitation: ["POST /orgs/{org}/invitations"],
    createWebhook: ["POST /orgs/{org}/hooks"],
    deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
    get: ["GET /orgs/{org}"],
    getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
    getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
    getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
    getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
    getWebhookDelivery: ["GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}"],
    list: ["GET /organizations"],
    listAppInstallations: ["GET /orgs/{org}/installations"],
    listBlockedUsers: ["GET /orgs/{org}/blocks"],
    listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
    listForAuthenticatedUser: ["GET /user/orgs"],
    listForUser: ["GET /users/{username}/orgs"],
    listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
    listMembers: ["GET /orgs/{org}/members"],
    listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
    listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
    listPendingInvitations: ["GET /orgs/{org}/invitations"],
    listPublicMembers: ["GET /orgs/{org}/public_members"],
    listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
    listWebhooks: ["GET /orgs/{org}/hooks"],
    pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
    redeliverWebhookDelivery: ["POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],
    removeMember: ["DELETE /orgs/{org}/members/{username}"],
    removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
    removeOutsideCollaborator: ["DELETE /orgs/{org}/outside_collaborators/{username}"],
    removePublicMembershipForAuthenticatedUser: ["DELETE /orgs/{org}/public_members/{username}"],
    setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
    setPublicMembershipForAuthenticatedUser: ["PUT /orgs/{org}/public_members/{username}"],
    unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
    update: ["PATCH /orgs/{org}"],
    updateMembershipForAuthenticatedUser: ["PATCH /user/memberships/orgs/{org}"],
    updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
    updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"]
  },
  packages: {
    deletePackageForAuthenticatedUser: ["DELETE /user/packages/{package_type}/{package_name}"],
    deletePackageForOrg: ["DELETE /orgs/{org}/packages/{package_type}/{package_name}"],
    deletePackageForUser: ["DELETE /users/{username}/packages/{package_type}/{package_name}"],
    deletePackageVersionForAuthenticatedUser: ["DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],
    deletePackageVersionForOrg: ["DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
    deletePackageVersionForUser: ["DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
    getAllPackageVersionsForAPackageOwnedByAnOrg: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions", {}, {
      renamed: ["packages", "getAllPackageVersionsForPackageOwnedByOrg"]
    }],
    getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions", {}, {
      renamed: ["packages", "getAllPackageVersionsForPackageOwnedByAuthenticatedUser"]
    }],
    getAllPackageVersionsForPackageOwnedByAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions"],
    getAllPackageVersionsForPackageOwnedByOrg: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions"],
    getAllPackageVersionsForPackageOwnedByUser: ["GET /users/{username}/packages/{package_type}/{package_name}/versions"],
    getPackageForAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}"],
    getPackageForOrganization: ["GET /orgs/{org}/packages/{package_type}/{package_name}"],
    getPackageForUser: ["GET /users/{username}/packages/{package_type}/{package_name}"],
    getPackageVersionForAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],
    getPackageVersionForOrganization: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
    getPackageVersionForUser: ["GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
    listPackagesForAuthenticatedUser: ["GET /user/packages"],
    listPackagesForOrganization: ["GET /orgs/{org}/packages"],
    listPackagesForUser: ["GET /users/{username}/packages"],
    restorePackageForAuthenticatedUser: ["POST /user/packages/{package_type}/{package_name}/restore{?token}"],
    restorePackageForOrg: ["POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}"],
    restorePackageForUser: ["POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}"],
    restorePackageVersionForAuthenticatedUser: ["POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"],
    restorePackageVersionForOrg: ["POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"],
    restorePackageVersionForUser: ["POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"]
  },
  projects: {
    addCollaborator: ["PUT /projects/{project_id}/collaborators/{username}"],
    createCard: ["POST /projects/columns/{column_id}/cards"],
    createColumn: ["POST /projects/{project_id}/columns"],
    createForAuthenticatedUser: ["POST /user/projects"],
    createForOrg: ["POST /orgs/{org}/projects"],
    createForRepo: ["POST /repos/{owner}/{repo}/projects"],
    delete: ["DELETE /projects/{project_id}"],
    deleteCard: ["DELETE /projects/columns/cards/{card_id}"],
    deleteColumn: ["DELETE /projects/columns/{column_id}"],
    get: ["GET /projects/{project_id}"],
    getCard: ["GET /projects/columns/cards/{card_id}"],
    getColumn: ["GET /projects/columns/{column_id}"],
    getPermissionForUser: ["GET /projects/{project_id}/collaborators/{username}/permission"],
    listCards: ["GET /projects/columns/{column_id}/cards"],
    listCollaborators: ["GET /projects/{project_id}/collaborators"],
    listColumns: ["GET /projects/{project_id}/columns"],
    listForOrg: ["GET /orgs/{org}/projects"],
    listForRepo: ["GET /repos/{owner}/{repo}/projects"],
    listForUser: ["GET /users/{username}/projects"],
    moveCard: ["POST /projects/columns/cards/{card_id}/moves"],
    moveColumn: ["POST /projects/columns/{column_id}/moves"],
    removeCollaborator: ["DELETE /projects/{project_id}/collaborators/{username}"],
    update: ["PATCH /projects/{project_id}"],
    updateCard: ["PATCH /projects/columns/cards/{card_id}"],
    updateColumn: ["PATCH /projects/columns/{column_id}"]
  },
  pulls: {
    checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    create: ["POST /repos/{owner}/{repo}/pulls"],
    createReplyForReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"],
    createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    createReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
    deletePendingReview: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    deleteReviewComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    dismissReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"],
    get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
    getReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    list: ["GET /repos/{owner}/{repo}/pulls"],
    listCommentsForReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"],
    listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
    listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
    listRequestedReviewers: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    listReviewComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
    listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
    listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    removeRequestedReviewers: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    requestReviewers: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    submitReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],
    update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
    updateBranch: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch"],
    updateReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    updateReviewComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"]
  },
  rateLimit: {
    get: ["GET /rate_limit"]
  },
  reactions: {
    createForCommitComment: ["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions"],
    createForIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
    createForIssueComment: ["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],
    createForPullRequestReviewComment: ["POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"],
    createForRelease: ["POST /repos/{owner}/{repo}/releases/{release_id}/reactions"],
    createForTeamDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"],
    createForTeamDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"],
    deleteForCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}"],
    deleteForIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}"],
    deleteForIssueComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}"],
    deleteForPullRequestComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}"],
    deleteForTeamDiscussion: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}"],
    deleteForTeamDiscussionComment: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}"],
    listForCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions"],
    listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
    listForIssueComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],
    listForPullRequestReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"],
    listForTeamDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"],
    listForTeamDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"]
  },
  repos: {
    acceptInvitation: ["PATCH /user/repository_invitations/{invitation_id}", {}, {
      renamed: ["repos", "acceptInvitationForAuthenticatedUser"]
    }],
    acceptInvitationForAuthenticatedUser: ["PATCH /user/repository_invitations/{invitation_id}"],
    addAppAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
    addStatusCheckContexts: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    addTeamAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    addUserAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
    checkVulnerabilityAlerts: ["GET /repos/{owner}/{repo}/vulnerability-alerts"],
    compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
    compareCommitsWithBasehead: ["GET /repos/{owner}/{repo}/compare/{basehead}"],
    createAutolink: ["POST /repos/{owner}/{repo}/autolinks"],
    createCommitComment: ["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
    createCommitSignatureProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],
    createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
    createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
    createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
    createDeploymentStatus: ["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
    createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
    createForAuthenticatedUser: ["POST /user/repos"],
    createFork: ["POST /repos/{owner}/{repo}/forks"],
    createInOrg: ["POST /orgs/{org}/repos"],
    createOrUpdateEnvironment: ["PUT /repos/{owner}/{repo}/environments/{environment_name}"],
    createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
    createPagesSite: ["POST /repos/{owner}/{repo}/pages"],
    createRelease: ["POST /repos/{owner}/{repo}/releases"],
    createUsingTemplate: ["POST /repos/{template_owner}/{template_repo}/generate"],
    createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
    declineInvitation: ["DELETE /user/repository_invitations/{invitation_id}", {}, {
      renamed: ["repos", "declineInvitationForAuthenticatedUser"]
    }],
    declineInvitationForAuthenticatedUser: ["DELETE /user/repository_invitations/{invitation_id}"],
    delete: ["DELETE /repos/{owner}/{repo}"],
    deleteAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
    deleteAdminBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    deleteAnEnvironment: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}"],
    deleteAutolink: ["DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}"],
    deleteBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],
    deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
    deleteCommitSignatureProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],
    deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
    deleteDeployment: ["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],
    deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
    deleteInvitation: ["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],
    deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages"],
    deletePullRequestReviewProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
    deleteReleaseAsset: ["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
    disableAutomatedSecurityFixes: ["DELETE /repos/{owner}/{repo}/automated-security-fixes"],
    disableLfsForRepo: ["DELETE /repos/{owner}/{repo}/lfs"],
    disableVulnerabilityAlerts: ["DELETE /repos/{owner}/{repo}/vulnerability-alerts"],
    downloadArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}", {}, {
      renamed: ["repos", "downloadZipballArchive"]
    }],
    downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
    downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
    enableAutomatedSecurityFixes: ["PUT /repos/{owner}/{repo}/automated-security-fixes"],
    enableLfsForRepo: ["PUT /repos/{owner}/{repo}/lfs"],
    enableVulnerabilityAlerts: ["PUT /repos/{owner}/{repo}/vulnerability-alerts"],
    generateReleaseNotes: ["POST /repos/{owner}/{repo}/releases/generate-notes"],
    get: ["GET /repos/{owner}/{repo}"],
    getAccessRestrictions: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
    getAdminBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
    getAllStatusCheckContexts: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"],
    getAllTopics: ["GET /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    getAppsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"],
    getAutolink: ["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],
    getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
    getBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection"],
    getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
    getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
    getCollaboratorPermissionLevel: ["GET /repos/{owner}/{repo}/collaborators/{username}/permission"],
    getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
    getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
    getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
    getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
    getCommitSignatureProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],
    getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
    getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
    getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
    getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
    getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
    getDeploymentStatus: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"],
    getEnvironment: ["GET /repos/{owner}/{repo}/environments/{environment_name}"],
    getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
    getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
    getPages: ["GET /repos/{owner}/{repo}/pages"],
    getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
    getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
    getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
    getPullRequestReviewProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
    getReadme: ["GET /repos/{owner}/{repo}/readme"],
    getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
    getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
    getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
    getStatusChecksProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    getTeamsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"],
    getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
    getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
    getUsersWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"],
    getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
    getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
    getWebhookConfigForRepo: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/config"],
    getWebhookDelivery: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}"],
    listAutolinks: ["GET /repos/{owner}/{repo}/autolinks"],
    listBranches: ["GET /repos/{owner}/{repo}/branches"],
    listBranchesForHeadCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head"],
    listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
    listCommentsForCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
    listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
    listCommitStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],
    listCommits: ["GET /repos/{owner}/{repo}/commits"],
    listContributors: ["GET /repos/{owner}/{repo}/contributors"],
    listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
    listDeploymentStatuses: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
    listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
    listForAuthenticatedUser: ["GET /user/repos"],
    listForOrg: ["GET /orgs/{org}/repos"],
    listForUser: ["GET /users/{username}/repos"],
    listForks: ["GET /repos/{owner}/{repo}/forks"],
    listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
    listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
    listLanguages: ["GET /repos/{owner}/{repo}/languages"],
    listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
    listPublic: ["GET /repositories"],
    listPullRequestsAssociatedWithCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls"],
    listReleaseAssets: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],
    listReleases: ["GET /repos/{owner}/{repo}/releases"],
    listTags: ["GET /repos/{owner}/{repo}/tags"],
    listTeams: ["GET /repos/{owner}/{repo}/teams"],
    listWebhookDeliveries: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries"],
    listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
    merge: ["POST /repos/{owner}/{repo}/merges"],
    mergeUpstream: ["POST /repos/{owner}/{repo}/merge-upstream"],
    pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
    redeliverWebhookDelivery: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],
    removeAppAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    removeCollaborator: ["DELETE /repos/{owner}/{repo}/collaborators/{username}"],
    removeStatusCheckContexts: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    removeStatusCheckProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    removeTeamAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    removeUserAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
    replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
    setAdminBranchProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    setAppAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    setStatusCheckContexts: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    setTeamAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    setUserAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
    transfer: ["POST /repos/{owner}/{repo}/transfer"],
    update: ["PATCH /repos/{owner}/{repo}"],
    updateBranchProtection: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],
    updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
    updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
    updateInvitation: ["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],
    updatePullRequestReviewProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
    updateReleaseAsset: ["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    updateStatusCheckPotection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks", {}, {
      renamed: ["repos", "updateStatusCheckProtection"]
    }],
    updateStatusCheckProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
    updateWebhookConfigForRepo: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"],
    uploadReleaseAsset: ["POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}", {
      baseUrl: "https://uploads.github.com"
    }]
  },
  search: {
    code: ["GET /search/code"],
    commits: ["GET /search/commits"],
    issuesAndPullRequests: ["GET /search/issues"],
    labels: ["GET /search/labels"],
    repos: ["GET /search/repositories"],
    topics: ["GET /search/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    users: ["GET /search/users"]
  },
  secretScanning: {
    getAlert: ["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],
    listAlertsForOrg: ["GET /orgs/{org}/secret-scanning/alerts"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
    updateAlert: ["PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"]
  },
  teams: {
    addOrUpdateMembershipForUserInOrg: ["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    addOrUpdateProjectPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}"],
    addOrUpdateRepoPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    checkPermissionsForProjectInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects/{project_id}"],
    checkPermissionsForRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    create: ["POST /orgs/{org}/teams"],
    createDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
    createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
    deleteDiscussionCommentInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    deleteDiscussionInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
    getByName: ["GET /orgs/{org}/teams/{team_slug}"],
    getDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    getDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    getMembershipForUserInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    list: ["GET /orgs/{org}/teams"],
    listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
    listDiscussionCommentsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
    listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
    listForAuthenticatedUser: ["GET /user/teams"],
    listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
    listPendingInvitationsInOrg: ["GET /orgs/{org}/teams/{team_slug}/invitations"],
    listProjectsInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects"],
    listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
    removeMembershipForUserInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    removeProjectInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}"],
    removeRepoInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    updateDiscussionCommentInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    updateDiscussionInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
  },
  users: {
    addEmailForAuthenticated: ["POST /user/emails", {}, {
      renamed: ["users", "addEmailForAuthenticatedUser"]
    }],
    addEmailForAuthenticatedUser: ["POST /user/emails"],
    block: ["PUT /user/blocks/{username}"],
    checkBlocked: ["GET /user/blocks/{username}"],
    checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
    checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
    createGpgKeyForAuthenticated: ["POST /user/gpg_keys", {}, {
      renamed: ["users", "createGpgKeyForAuthenticatedUser"]
    }],
    createGpgKeyForAuthenticatedUser: ["POST /user/gpg_keys"],
    createPublicSshKeyForAuthenticated: ["POST /user/keys", {}, {
      renamed: ["users", "createPublicSshKeyForAuthenticatedUser"]
    }],
    createPublicSshKeyForAuthenticatedUser: ["POST /user/keys"],
    deleteEmailForAuthenticated: ["DELETE /user/emails", {}, {
      renamed: ["users", "deleteEmailForAuthenticatedUser"]
    }],
    deleteEmailForAuthenticatedUser: ["DELETE /user/emails"],
    deleteGpgKeyForAuthenticated: ["DELETE /user/gpg_keys/{gpg_key_id}", {}, {
      renamed: ["users", "deleteGpgKeyForAuthenticatedUser"]
    }],
    deleteGpgKeyForAuthenticatedUser: ["DELETE /user/gpg_keys/{gpg_key_id}"],
    deletePublicSshKeyForAuthenticated: ["DELETE /user/keys/{key_id}", {}, {
      renamed: ["users", "deletePublicSshKeyForAuthenticatedUser"]
    }],
    deletePublicSshKeyForAuthenticatedUser: ["DELETE /user/keys/{key_id}"],
    follow: ["PUT /user/following/{username}"],
    getAuthenticated: ["GET /user"],
    getByUsername: ["GET /users/{username}"],
    getContextForUser: ["GET /users/{username}/hovercard"],
    getGpgKeyForAuthenticated: ["GET /user/gpg_keys/{gpg_key_id}", {}, {
      renamed: ["users", "getGpgKeyForAuthenticatedUser"]
    }],
    getGpgKeyForAuthenticatedUser: ["GET /user/gpg_keys/{gpg_key_id}"],
    getPublicSshKeyForAuthenticated: ["GET /user/keys/{key_id}", {}, {
      renamed: ["users", "getPublicSshKeyForAuthenticatedUser"]
    }],
    getPublicSshKeyForAuthenticatedUser: ["GET /user/keys/{key_id}"],
    list: ["GET /users"],
    listBlockedByAuthenticated: ["GET /user/blocks", {}, {
      renamed: ["users", "listBlockedByAuthenticatedUser"]
    }],
    listBlockedByAuthenticatedUser: ["GET /user/blocks"],
    listEmailsForAuthenticated: ["GET /user/emails", {}, {
      renamed: ["users", "listEmailsForAuthenticatedUser"]
    }],
    listEmailsForAuthenticatedUser: ["GET /user/emails"],
    listFollowedByAuthenticated: ["GET /user/following", {}, {
      renamed: ["users", "listFollowedByAuthenticatedUser"]
    }],
    listFollowedByAuthenticatedUser: ["GET /user/following"],
    listFollowersForAuthenticatedUser: ["GET /user/followers"],
    listFollowersForUser: ["GET /users/{username}/followers"],
    listFollowingForUser: ["GET /users/{username}/following"],
    listGpgKeysForAuthenticated: ["GET /user/gpg_keys", {}, {
      renamed: ["users", "listGpgKeysForAuthenticatedUser"]
    }],
    listGpgKeysForAuthenticatedUser: ["GET /user/gpg_keys"],
    listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
    listPublicEmailsForAuthenticated: ["GET /user/public_emails", {}, {
      renamed: ["users", "listPublicEmailsForAuthenticatedUser"]
    }],
    listPublicEmailsForAuthenticatedUser: ["GET /user/public_emails"],
    listPublicKeysForUser: ["GET /users/{username}/keys"],
    listPublicSshKeysForAuthenticated: ["GET /user/keys", {}, {
      renamed: ["users", "listPublicSshKeysForAuthenticatedUser"]
    }],
    listPublicSshKeysForAuthenticatedUser: ["GET /user/keys"],
    setPrimaryEmailVisibilityForAuthenticated: ["PATCH /user/email/visibility", {}, {
      renamed: ["users", "setPrimaryEmailVisibilityForAuthenticatedUser"]
    }],
    setPrimaryEmailVisibilityForAuthenticatedUser: ["PATCH /user/email/visibility"],
    unblock: ["DELETE /user/blocks/{username}"],
    unfollow: ["DELETE /user/following/{username}"],
    updateAuthenticated: ["PATCH /user"]
  }
};

const VERSION = "5.13.0";

function endpointsToMethods(octokit, endpointsMap) {
  const newMethods = {};

  for (const [scope, endpoints] of Object.entries(endpointsMap)) {
    for (const [methodName, endpoint] of Object.entries(endpoints)) {
      const [route, defaults, decorations] = endpoint;
      const [method, url] = route.split(/ /);
      const endpointDefaults = Object.assign({
        method,
        url
      }, defaults);

      if (!newMethods[scope]) {
        newMethods[scope] = {};
      }

      const scopeMethods = newMethods[scope];

      if (decorations) {
        scopeMethods[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
        continue;
      }

      scopeMethods[methodName] = octokit.request.defaults(endpointDefaults);
    }
  }

  return newMethods;
}

function decorate(octokit, scope, methodName, defaults, decorations) {
  const requestWithDefaults = octokit.request.defaults(defaults);
  /* istanbul ignore next */

  function withDecorations(...args) {
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
    let options = requestWithDefaults.endpoint.merge(...args); // There are currently no other decorations than `.mapToData`

    if (decorations.mapToData) {
      options = Object.assign({}, options, {
        data: options[decorations.mapToData],
        [decorations.mapToData]: undefined
      });
      return requestWithDefaults(options);
    }

    if (decorations.renamed) {
      const [newScope, newMethodName] = decorations.renamed;
      octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
    }

    if (decorations.deprecated) {
      octokit.log.warn(decorations.deprecated);
    }

    if (decorations.renamedParameters) {
      // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
      const options = requestWithDefaults.endpoint.merge(...args);

      for (const [name, alias] of Object.entries(decorations.renamedParameters)) {
        if (name in options) {
          octokit.log.warn(`"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);

          if (!(alias in options)) {
            options[alias] = options[name];
          }

          delete options[name];
        }
      }

      return requestWithDefaults(options);
    } // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488


    return requestWithDefaults(...args);
  }

  return Object.assign(withDecorations, requestWithDefaults);
}

function restEndpointMethods(octokit) {
  const api = endpointsToMethods(octokit, Endpoints);
  return {
    rest: api
  };
}
restEndpointMethods.VERSION = VERSION;
function legacyRestEndpointMethods(octokit) {
  const api = endpointsToMethods(octokit, Endpoints);
  return _objectSpread2(_objectSpread2({}, api), {}, {
    rest: api
  });
}
legacyRestEndpointMethods.VERSION = VERSION;

exports.legacyRestEndpointMethods = legacyRestEndpointMethods;
exports.restEndpointMethods = restEndpointMethods;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 537:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var deprecation = __nccwpck_require__(8932);
var once = _interopDefault(__nccwpck_require__(1223));

const logOnceCode = once(deprecation => console.warn(deprecation));
const logOnceHeaders = once(deprecation => console.warn(deprecation));
/**
 * Error with extra properties to help with debugging
 */

class RequestError extends Error {
  constructor(message, statusCode, options) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = "HttpError";
    this.status = statusCode;
    let headers;

    if ("headers" in options && typeof options.headers !== "undefined") {
      headers = options.headers;
    }

    if ("response" in options) {
      this.response = options.response;
      headers = options.response.headers;
    } // redact request credentials without mutating original request options


    const requestCopy = Object.assign({}, options.request);

    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]")
      });
    }

    requestCopy.url = requestCopy.url // client_id & client_secret can be passed as URL query parameters to increase rate limit
    // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
    .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]") // OAuth tokens can be passed as URL query parameters, although it is not recommended
    // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
    .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy; // deprecations

    Object.defineProperty(this, "code", {
      get() {
        logOnceCode(new deprecation.Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
        return statusCode;
      }

    });
    Object.defineProperty(this, "headers", {
      get() {
        logOnceHeaders(new deprecation.Deprecation("[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`."));
        return headers || {};
      }

    });
  }

}

exports.RequestError = RequestError;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 6234:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var endpoint = __nccwpck_require__(9440);
var universalUserAgent = __nccwpck_require__(5030);
var isPlainObject = __nccwpck_require__(3287);
var nodeFetch = _interopDefault(__nccwpck_require__(467));
var requestError = __nccwpck_require__(537);

const VERSION = "5.6.3";

function getBufferResponse(response) {
  return response.arrayBuffer();
}

function fetchWrapper(requestOptions) {
  const log = requestOptions.request && requestOptions.request.log ? requestOptions.request.log : console;

  if (isPlainObject.isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  let headers = {};
  let status;
  let url;
  const fetch = requestOptions.request && requestOptions.request.fetch || nodeFetch;
  return fetch(requestOptions.url, Object.assign({
    method: requestOptions.method,
    body: requestOptions.body,
    headers: requestOptions.headers,
    redirect: requestOptions.redirect
  }, // `requestOptions.request.agent` type is incompatible
  // see https://github.com/octokit/types.ts/pull/264
  requestOptions.request)).then(async response => {
    url = response.url;
    status = response.status;

    for (const keyAndValue of response.headers) {
      headers[keyAndValue[0]] = keyAndValue[1];
    }

    if ("deprecation" in headers) {
      const matches = headers.link && headers.link.match(/<([^>]+)>; rel="deprecation"/);
      const deprecationLink = matches && matches.pop();
      log.warn(`[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${headers.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`);
    }

    if (status === 204 || status === 205) {
      return;
    } // GitHub API returns 200 for HEAD requests


    if (requestOptions.method === "HEAD") {
      if (status < 400) {
        return;
      }

      throw new requestError.RequestError(response.statusText, status, {
        response: {
          url,
          status,
          headers,
          data: undefined
        },
        request: requestOptions
      });
    }

    if (status === 304) {
      throw new requestError.RequestError("Not modified", status, {
        response: {
          url,
          status,
          headers,
          data: await getResponseData(response)
        },
        request: requestOptions
      });
    }

    if (status >= 400) {
      const data = await getResponseData(response);
      const error = new requestError.RequestError(toErrorMessage(data), status, {
        response: {
          url,
          status,
          headers,
          data
        },
        request: requestOptions
      });
      throw error;
    }

    return getResponseData(response);
  }).then(data => {
    return {
      status,
      url,
      headers,
      data
    };
  }).catch(error => {
    if (error instanceof requestError.RequestError) throw error;
    throw new requestError.RequestError(error.message, 500, {
      request: requestOptions
    });
  });
}

async function getResponseData(response) {
  const contentType = response.headers.get("content-type");

  if (/application\/json/.test(contentType)) {
    return response.json();
  }

  if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
    return response.text();
  }

  return getBufferResponse(response);
}

function toErrorMessage(data) {
  if (typeof data === "string") return data; // istanbul ignore else - just in case

  if ("message" in data) {
    if (Array.isArray(data.errors)) {
      return `${data.message}: ${data.errors.map(JSON.stringify).join(", ")}`;
    }

    return data.message;
  } // istanbul ignore next - just in case


  return `Unknown error: ${JSON.stringify(data)}`;
}

function withDefaults(oldEndpoint, newDefaults) {
  const endpoint = oldEndpoint.defaults(newDefaults);

  const newApi = function (route, parameters) {
    const endpointOptions = endpoint.merge(route, parameters);

    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper(endpoint.parse(endpointOptions));
    }

    const request = (route, parameters) => {
      return fetchWrapper(endpoint.parse(endpoint.merge(route, parameters)));
    };

    Object.assign(request, {
      endpoint,
      defaults: withDefaults.bind(null, endpoint)
    });
    return endpointOptions.request.hook(request, endpointOptions);
  };

  return Object.assign(newApi, {
    endpoint,
    defaults: withDefaults.bind(null, endpoint)
  });
}

const request = withDefaults(endpoint.endpoint, {
  headers: {
    "user-agent": `octokit-request.js/${VERSION} ${universalUserAgent.getUserAgent()}`
  }
});

exports.request = request;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 3682:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var register = __nccwpck_require__(4670)
var addHook = __nccwpck_require__(5549)
var removeHook = __nccwpck_require__(6819)

// bind with array of arguments: https://stackoverflow.com/a/21792913
var bind = Function.bind
var bindable = bind.bind(bind)

function bindApi (hook, state, name) {
  var removeHookRef = bindable(removeHook, null).apply(null, name ? [state, name] : [state])
  hook.api = { remove: removeHookRef }
  hook.remove = removeHookRef

  ;['before', 'error', 'after', 'wrap'].forEach(function (kind) {
    var args = name ? [state, kind, name] : [state, kind]
    hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args)
  })
}

function HookSingular () {
  var singularHookName = 'h'
  var singularHookState = {
    registry: {}
  }
  var singularHook = register.bind(null, singularHookState, singularHookName)
  bindApi(singularHook, singularHookState, singularHookName)
  return singularHook
}

function HookCollection () {
  var state = {
    registry: {}
  }

  var hook = register.bind(null, state)
  bindApi(hook, state)

  return hook
}

var collectionHookDeprecationMessageDisplayed = false
function Hook () {
  if (!collectionHookDeprecationMessageDisplayed) {
    console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4')
    collectionHookDeprecationMessageDisplayed = true
  }
  return HookCollection()
}

Hook.Singular = HookSingular.bind()
Hook.Collection = HookCollection.bind()

module.exports = Hook
// expose constructors as a named property for TypeScript
module.exports.Hook = Hook
module.exports.Singular = Hook.Singular
module.exports.Collection = Hook.Collection


/***/ }),

/***/ 5549:
/***/ ((module) => {

module.exports = addHook;

function addHook(state, kind, name, hook) {
  var orig = hook;
  if (!state.registry[name]) {
    state.registry[name] = [];
  }

  if (kind === "before") {
    hook = function (method, options) {
      return Promise.resolve()
        .then(orig.bind(null, options))
        .then(method.bind(null, options));
    };
  }

  if (kind === "after") {
    hook = function (method, options) {
      var result;
      return Promise.resolve()
        .then(method.bind(null, options))
        .then(function (result_) {
          result = result_;
          return orig(result, options);
        })
        .then(function () {
          return result;
        });
    };
  }

  if (kind === "error") {
    hook = function (method, options) {
      return Promise.resolve()
        .then(method.bind(null, options))
        .catch(function (error) {
          return orig(error, options);
        });
    };
  }

  state.registry[name].push({
    hook: hook,
    orig: orig,
  });
}


/***/ }),

/***/ 4670:
/***/ ((module) => {

module.exports = register;

function register(state, name, method, options) {
  if (typeof method !== "function") {
    throw new Error("method for before hook must be a function");
  }

  if (!options) {
    options = {};
  }

  if (Array.isArray(name)) {
    return name.reverse().reduce(function (callback, name) {
      return register.bind(null, state, name, callback, options);
    }, method)();
  }

  return Promise.resolve().then(function () {
    if (!state.registry[name]) {
      return method(options);
    }

    return state.registry[name].reduce(function (method, registered) {
      return registered.hook.bind(null, method, options);
    }, method)();
  });
}


/***/ }),

/***/ 6819:
/***/ ((module) => {

module.exports = removeHook;

function removeHook(state, name, method) {
  if (!state.registry[name]) {
    return;
  }

  var index = state.registry[name]
    .map(function (registered) {
      return registered.orig;
    })
    .indexOf(method);

  if (index === -1) {
    return;
  }

  state.registry[name].splice(index, 1);
}


/***/ }),

/***/ 8932:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

class Deprecation extends Error {
  constructor(message) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'Deprecation';
  }

}

exports.Deprecation = Deprecation;


/***/ }),

/***/ 3287:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor,prot;

  if (isObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

exports.isPlainObject = isPlainObject;


/***/ }),

/***/ 467:
/***/ ((module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__nccwpck_require__(2781));
var http = _interopDefault(__nccwpck_require__(3685));
var Url = _interopDefault(__nccwpck_require__(7310));
var whatwgUrl = _interopDefault(__nccwpck_require__(8665));
var https = _interopDefault(__nccwpck_require__(5687));
var zlib = _interopDefault(__nccwpck_require__(9796));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = (__nccwpck_require__(2877).convert);
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');
const URL = Url.URL || whatwgUrl.URL;

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

/**
 * Wrapper around `new URL` to handle arbitrary URLs
 *
 * @param  {string} urlStr
 * @return {void}
 */
function parseURL(urlStr) {
	/*
 	Check whether the URL is absolute or not
 		Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
 	Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
 */
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.exec(urlStr)) {
		urlStr = new URL(urlStr).toString();
	}

	// Fallback to old implementation for arbitrary URLs
	return parse_url(urlStr);
}

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parseURL(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parseURL(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parseURL(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

const URL$1 = Url.URL || whatwgUrl.URL;

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;

const isDomainOrSubdomain = function isDomainOrSubdomain(destination, original) {
	const orig = new URL$1(original).hostname;
	const dest = new URL$1(destination).hostname;

	return orig === dest || orig[orig.length - dest.length - 1] === '.' && orig.endsWith(dest);
};

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				let locationURL = null;
				try {
					locationURL = location === null ? null : new URL$1(location, request.url).toString();
				} catch (err) {
					// error here can only be invalid URL in Location: header
					// do not throw when options.redirect == manual
					// let the user extract the errorneous redirect URL
					if (request.redirect !== 'manual') {
						reject(new FetchError(`uri requested responds with an invalid redirect URL: ${location}`, 'invalid-redirect'));
						finalize();
						return;
					}
				}

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						if (!isDomainOrSubdomain(request.url, locationURL)) {
							for (const name of ['authorization', 'www-authenticate', 'cookie', 'cookie2']) {
								requestOpts.headers.delete(name);
							}
						}

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;


/***/ }),

/***/ 1223:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var wrappy = __nccwpck_require__(2940)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),

/***/ 4256:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var punycode = __nccwpck_require__(5477);
var mappingTable = __nccwpck_require__(2020);

var PROCESSING_OPTIONS = {
  TRANSITIONAL: 0,
  NONTRANSITIONAL: 1
};

function normalize(str) { // fix bug in v8
  return str.split('\u0000').map(function (s) { return s.normalize('NFC'); }).join('\u0000');
}

function findStatus(val) {
  var start = 0;
  var end = mappingTable.length - 1;

  while (start <= end) {
    var mid = Math.floor((start + end) / 2);

    var target = mappingTable[mid];
    if (target[0][0] <= val && target[0][1] >= val) {
      return target;
    } else if (target[0][0] > val) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return null;
}

var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function countSymbols(string) {
  return string
    // replace every surrogate pair with a BMP symbol
    .replace(regexAstralSymbols, '_')
    // then get the length
    .length;
}

function mapChars(domain_name, useSTD3, processing_option) {
  var hasError = false;
  var processed = "";

  var len = countSymbols(domain_name);
  for (var i = 0; i < len; ++i) {
    var codePoint = domain_name.codePointAt(i);
    var status = findStatus(codePoint);

    switch (status[1]) {
      case "disallowed":
        hasError = true;
        processed += String.fromCodePoint(codePoint);
        break;
      case "ignored":
        break;
      case "mapped":
        processed += String.fromCodePoint.apply(String, status[2]);
        break;
      case "deviation":
        if (processing_option === PROCESSING_OPTIONS.TRANSITIONAL) {
          processed += String.fromCodePoint.apply(String, status[2]);
        } else {
          processed += String.fromCodePoint(codePoint);
        }
        break;
      case "valid":
        processed += String.fromCodePoint(codePoint);
        break;
      case "disallowed_STD3_mapped":
        if (useSTD3) {
          hasError = true;
          processed += String.fromCodePoint(codePoint);
        } else {
          processed += String.fromCodePoint.apply(String, status[2]);
        }
        break;
      case "disallowed_STD3_valid":
        if (useSTD3) {
          hasError = true;
        }

        processed += String.fromCodePoint(codePoint);
        break;
    }
  }

  return {
    string: processed,
    error: hasError
  };
}

var combiningMarksRegex = /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u192B\u1930-\u193B\u19B0-\u19C0\u19C8\u19C9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2D]|\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD804[\uDC00-\uDC02\uDC38-\uDC46\uDC7F-\uDC82\uDCB0-\uDCBA\uDD00-\uDD02\uDD27-\uDD34\uDD73\uDD80-\uDD82\uDDB3-\uDDC0\uDE2C-\uDE37\uDEDF-\uDEEA\uDF01-\uDF03\uDF3C\uDF3E-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF62\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDCB0-\uDCC3\uDDAF-\uDDB5\uDDB8-\uDDC0\uDE30-\uDE40\uDEAB-\uDEB7]|\uD81A[\uDEF0-\uDEF4\uDF30-\uDF36]|\uD81B[\uDF51-\uDF7E\uDF8F-\uDF92]|\uD82F[\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD83A[\uDCD0-\uDCD6]|\uDB40[\uDD00-\uDDEF]/;

function validateLabel(label, processing_option) {
  if (label.substr(0, 4) === "xn--") {
    label = punycode.toUnicode(label);
    processing_option = PROCESSING_OPTIONS.NONTRANSITIONAL;
  }

  var error = false;

  if (normalize(label) !== label ||
      (label[3] === "-" && label[4] === "-") ||
      label[0] === "-" || label[label.length - 1] === "-" ||
      label.indexOf(".") !== -1 ||
      label.search(combiningMarksRegex) === 0) {
    error = true;
  }

  var len = countSymbols(label);
  for (var i = 0; i < len; ++i) {
    var status = findStatus(label.codePointAt(i));
    if ((processing === PROCESSING_OPTIONS.TRANSITIONAL && status[1] !== "valid") ||
        (processing === PROCESSING_OPTIONS.NONTRANSITIONAL &&
         status[1] !== "valid" && status[1] !== "deviation")) {
      error = true;
      break;
    }
  }

  return {
    label: label,
    error: error
  };
}

function processing(domain_name, useSTD3, processing_option) {
  var result = mapChars(domain_name, useSTD3, processing_option);
  result.string = normalize(result.string);

  var labels = result.string.split(".");
  for (var i = 0; i < labels.length; ++i) {
    try {
      var validation = validateLabel(labels[i]);
      labels[i] = validation.label;
      result.error = result.error || validation.error;
    } catch(e) {
      result.error = true;
    }
  }

  return {
    string: labels.join("."),
    error: result.error
  };
}

module.exports.toASCII = function(domain_name, useSTD3, processing_option, verifyDnsLength) {
  var result = processing(domain_name, useSTD3, processing_option);
  var labels = result.string.split(".");
  labels = labels.map(function(l) {
    try {
      return punycode.toASCII(l);
    } catch(e) {
      result.error = true;
      return l;
    }
  });

  if (verifyDnsLength) {
    var total = labels.slice(0, labels.length - 1).join(".").length;
    if (total.length > 253 || total.length === 0) {
      result.error = true;
    }

    for (var i=0; i < labels.length; ++i) {
      if (labels.length > 63 || labels.length === 0) {
        result.error = true;
        break;
      }
    }
  }

  if (result.error) return null;
  return labels.join(".");
};

module.exports.toUnicode = function(domain_name, useSTD3) {
  var result = processing(domain_name, useSTD3, PROCESSING_OPTIONS.NONTRANSITIONAL);

  return {
    domain: result.string,
    error: result.error
  };
};

module.exports.PROCESSING_OPTIONS = PROCESSING_OPTIONS;


/***/ }),

/***/ 4294:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(4219);


/***/ }),

/***/ 4219:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


var net = __nccwpck_require__(1808);
var tls = __nccwpck_require__(4404);
var http = __nccwpck_require__(3685);
var https = __nccwpck_require__(5687);
var events = __nccwpck_require__(2361);
var assert = __nccwpck_require__(9491);
var util = __nccwpck_require__(3837);


exports.httpOverHttp = httpOverHttp;
exports.httpsOverHttp = httpsOverHttp;
exports.httpOverHttps = httpOverHttps;
exports.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ 5030:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }

  if (typeof process === "object" && "version" in process) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
  }

  return "<environment undetectable>";
}

exports.getUserAgent = getUserAgent;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 4886:
/***/ ((module) => {

"use strict";


var conversions = {};
module.exports = conversions;

function sign(x) {
    return x < 0 ? -1 : 1;
}

function evenRound(x) {
    // Round x to the nearest integer, choosing the even integer if it lies halfway between two.
    if ((x % 1) === 0.5 && (x & 1) === 0) { // [even number].5; round down (i.e. floor)
        return Math.floor(x);
    } else {
        return Math.round(x);
    }
}

function createNumberConversion(bitLength, typeOpts) {
    if (!typeOpts.unsigned) {
        --bitLength;
    }
    const lowerBound = typeOpts.unsigned ? 0 : -Math.pow(2, bitLength);
    const upperBound = Math.pow(2, bitLength) - 1;

    const moduloVal = typeOpts.moduloBitLength ? Math.pow(2, typeOpts.moduloBitLength) : Math.pow(2, bitLength);
    const moduloBound = typeOpts.moduloBitLength ? Math.pow(2, typeOpts.moduloBitLength - 1) : Math.pow(2, bitLength - 1);

    return function(V, opts) {
        if (!opts) opts = {};

        let x = +V;

        if (opts.enforceRange) {
            if (!Number.isFinite(x)) {
                throw new TypeError("Argument is not a finite number");
            }

            x = sign(x) * Math.floor(Math.abs(x));
            if (x < lowerBound || x > upperBound) {
                throw new TypeError("Argument is not in byte range");
            }

            return x;
        }

        if (!isNaN(x) && opts.clamp) {
            x = evenRound(x);

            if (x < lowerBound) x = lowerBound;
            if (x > upperBound) x = upperBound;
            return x;
        }

        if (!Number.isFinite(x) || x === 0) {
            return 0;
        }

        x = sign(x) * Math.floor(Math.abs(x));
        x = x % moduloVal;

        if (!typeOpts.unsigned && x >= moduloBound) {
            return x - moduloVal;
        } else if (typeOpts.unsigned) {
            if (x < 0) {
              x += moduloVal;
            } else if (x === -0) { // don't return negative zero
              return 0;
            }
        }

        return x;
    }
}

conversions["void"] = function () {
    return undefined;
};

conversions["boolean"] = function (val) {
    return !!val;
};

conversions["byte"] = createNumberConversion(8, { unsigned: false });
conversions["octet"] = createNumberConversion(8, { unsigned: true });

conversions["short"] = createNumberConversion(16, { unsigned: false });
conversions["unsigned short"] = createNumberConversion(16, { unsigned: true });

conversions["long"] = createNumberConversion(32, { unsigned: false });
conversions["unsigned long"] = createNumberConversion(32, { unsigned: true });

conversions["long long"] = createNumberConversion(32, { unsigned: false, moduloBitLength: 64 });
conversions["unsigned long long"] = createNumberConversion(32, { unsigned: true, moduloBitLength: 64 });

conversions["double"] = function (V) {
    const x = +V;

    if (!Number.isFinite(x)) {
        throw new TypeError("Argument is not a finite floating-point value");
    }

    return x;
};

conversions["unrestricted double"] = function (V) {
    const x = +V;

    if (isNaN(x)) {
        throw new TypeError("Argument is NaN");
    }

    return x;
};

// not quite valid, but good enough for JS
conversions["float"] = conversions["double"];
conversions["unrestricted float"] = conversions["unrestricted double"];

conversions["DOMString"] = function (V, opts) {
    if (!opts) opts = {};

    if (opts.treatNullAsEmptyString && V === null) {
        return "";
    }

    return String(V);
};

conversions["ByteString"] = function (V, opts) {
    const x = String(V);
    let c = undefined;
    for (let i = 0; (c = x.codePointAt(i)) !== undefined; ++i) {
        if (c > 255) {
            throw new TypeError("Argument is not a valid bytestring");
        }
    }

    return x;
};

conversions["USVString"] = function (V) {
    const S = String(V);
    const n = S.length;
    const U = [];
    for (let i = 0; i < n; ++i) {
        const c = S.charCodeAt(i);
        if (c < 0xD800 || c > 0xDFFF) {
            U.push(String.fromCodePoint(c));
        } else if (0xDC00 <= c && c <= 0xDFFF) {
            U.push(String.fromCodePoint(0xFFFD));
        } else {
            if (i === n - 1) {
                U.push(String.fromCodePoint(0xFFFD));
            } else {
                const d = S.charCodeAt(i + 1);
                if (0xDC00 <= d && d <= 0xDFFF) {
                    const a = c & 0x3FF;
                    const b = d & 0x3FF;
                    U.push(String.fromCodePoint((2 << 15) + (2 << 9) * a + b));
                    ++i;
                } else {
                    U.push(String.fromCodePoint(0xFFFD));
                }
            }
        }
    }

    return U.join('');
};

conversions["Date"] = function (V, opts) {
    if (!(V instanceof Date)) {
        throw new TypeError("Argument is not a Date object");
    }
    if (isNaN(V)) {
        return undefined;
    }

    return V;
};

conversions["RegExp"] = function (V, opts) {
    if (!(V instanceof RegExp)) {
        V = new RegExp(V);
    }

    return V;
};


/***/ }),

/***/ 7537:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

const usm = __nccwpck_require__(2158);

exports.implementation = class URLImpl {
  constructor(constructorArgs) {
    const url = constructorArgs[0];
    const base = constructorArgs[1];

    let parsedBase = null;
    if (base !== undefined) {
      parsedBase = usm.basicURLParse(base);
      if (parsedBase === "failure") {
        throw new TypeError("Invalid base URL");
      }
    }

    const parsedURL = usm.basicURLParse(url, { baseURL: parsedBase });
    if (parsedURL === "failure") {
      throw new TypeError("Invalid URL");
    }

    this._url = parsedURL;

    // TODO: query stuff
  }

  get href() {
    return usm.serializeURL(this._url);
  }

  set href(v) {
    const parsedURL = usm.basicURLParse(v);
    if (parsedURL === "failure") {
      throw new TypeError("Invalid URL");
    }

    this._url = parsedURL;
  }

  get origin() {
    return usm.serializeURLOrigin(this._url);
  }

  get protocol() {
    return this._url.scheme + ":";
  }

  set protocol(v) {
    usm.basicURLParse(v + ":", { url: this._url, stateOverride: "scheme start" });
  }

  get username() {
    return this._url.username;
  }

  set username(v) {
    if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
      return;
    }

    usm.setTheUsername(this._url, v);
  }

  get password() {
    return this._url.password;
  }

  set password(v) {
    if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
      return;
    }

    usm.setThePassword(this._url, v);
  }

  get host() {
    const url = this._url;

    if (url.host === null) {
      return "";
    }

    if (url.port === null) {
      return usm.serializeHost(url.host);
    }

    return usm.serializeHost(url.host) + ":" + usm.serializeInteger(url.port);
  }

  set host(v) {
    if (this._url.cannotBeABaseURL) {
      return;
    }

    usm.basicURLParse(v, { url: this._url, stateOverride: "host" });
  }

  get hostname() {
    if (this._url.host === null) {
      return "";
    }

    return usm.serializeHost(this._url.host);
  }

  set hostname(v) {
    if (this._url.cannotBeABaseURL) {
      return;
    }

    usm.basicURLParse(v, { url: this._url, stateOverride: "hostname" });
  }

  get port() {
    if (this._url.port === null) {
      return "";
    }

    return usm.serializeInteger(this._url.port);
  }

  set port(v) {
    if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
      return;
    }

    if (v === "") {
      this._url.port = null;
    } else {
      usm.basicURLParse(v, { url: this._url, stateOverride: "port" });
    }
  }

  get pathname() {
    if (this._url.cannotBeABaseURL) {
      return this._url.path[0];
    }

    if (this._url.path.length === 0) {
      return "";
    }

    return "/" + this._url.path.join("/");
  }

  set pathname(v) {
    if (this._url.cannotBeABaseURL) {
      return;
    }

    this._url.path = [];
    usm.basicURLParse(v, { url: this._url, stateOverride: "path start" });
  }

  get search() {
    if (this._url.query === null || this._url.query === "") {
      return "";
    }

    return "?" + this._url.query;
  }

  set search(v) {
    // TODO: query stuff

    const url = this._url;

    if (v === "") {
      url.query = null;
      return;
    }

    const input = v[0] === "?" ? v.substring(1) : v;
    url.query = "";
    usm.basicURLParse(input, { url, stateOverride: "query" });
  }

  get hash() {
    if (this._url.fragment === null || this._url.fragment === "") {
      return "";
    }

    return "#" + this._url.fragment;
  }

  set hash(v) {
    if (v === "") {
      this._url.fragment = null;
      return;
    }

    const input = v[0] === "#" ? v.substring(1) : v;
    this._url.fragment = "";
    usm.basicURLParse(input, { url: this._url, stateOverride: "fragment" });
  }

  toJSON() {
    return this.href;
  }
};


/***/ }),

/***/ 3394:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const conversions = __nccwpck_require__(4886);
const utils = __nccwpck_require__(3185);
const Impl = __nccwpck_require__(7537);

const impl = utils.implSymbol;

function URL(url) {
  if (!this || this[impl] || !(this instanceof URL)) {
    throw new TypeError("Failed to construct 'URL': Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
  }
  if (arguments.length < 1) {
    throw new TypeError("Failed to construct 'URL': 1 argument required, but only " + arguments.length + " present.");
  }
  const args = [];
  for (let i = 0; i < arguments.length && i < 2; ++i) {
    args[i] = arguments[i];
  }
  args[0] = conversions["USVString"](args[0]);
  if (args[1] !== undefined) {
  args[1] = conversions["USVString"](args[1]);
  }

  module.exports.setup(this, args);
}

URL.prototype.toJSON = function toJSON() {
  if (!this || !module.exports.is(this)) {
    throw new TypeError("Illegal invocation");
  }
  const args = [];
  for (let i = 0; i < arguments.length && i < 0; ++i) {
    args[i] = arguments[i];
  }
  return this[impl].toJSON.apply(this[impl], args);
};
Object.defineProperty(URL.prototype, "href", {
  get() {
    return this[impl].href;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].href = V;
  },
  enumerable: true,
  configurable: true
});

URL.prototype.toString = function () {
  if (!this || !module.exports.is(this)) {
    throw new TypeError("Illegal invocation");
  }
  return this.href;
};

Object.defineProperty(URL.prototype, "origin", {
  get() {
    return this[impl].origin;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "protocol", {
  get() {
    return this[impl].protocol;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].protocol = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "username", {
  get() {
    return this[impl].username;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].username = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "password", {
  get() {
    return this[impl].password;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].password = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "host", {
  get() {
    return this[impl].host;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].host = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "hostname", {
  get() {
    return this[impl].hostname;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].hostname = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "port", {
  get() {
    return this[impl].port;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].port = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "pathname", {
  get() {
    return this[impl].pathname;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].pathname = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "search", {
  get() {
    return this[impl].search;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].search = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "hash", {
  get() {
    return this[impl].hash;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].hash = V;
  },
  enumerable: true,
  configurable: true
});


module.exports = {
  is(obj) {
    return !!obj && obj[impl] instanceof Impl.implementation;
  },
  create(constructorArgs, privateData) {
    let obj = Object.create(URL.prototype);
    this.setup(obj, constructorArgs, privateData);
    return obj;
  },
  setup(obj, constructorArgs, privateData) {
    if (!privateData) privateData = {};
    privateData.wrapper = obj;

    obj[impl] = new Impl.implementation(constructorArgs, privateData);
    obj[impl][utils.wrapperSymbol] = obj;
  },
  interface: URL,
  expose: {
    Window: { URL: URL },
    Worker: { URL: URL }
  }
};



/***/ }),

/***/ 8665:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


exports.URL = __nccwpck_require__(3394)["interface"];
exports.serializeURL = __nccwpck_require__(2158).serializeURL;
exports.serializeURLOrigin = __nccwpck_require__(2158).serializeURLOrigin;
exports.basicURLParse = __nccwpck_require__(2158).basicURLParse;
exports.setTheUsername = __nccwpck_require__(2158).setTheUsername;
exports.setThePassword = __nccwpck_require__(2158).setThePassword;
exports.serializeHost = __nccwpck_require__(2158).serializeHost;
exports.serializeInteger = __nccwpck_require__(2158).serializeInteger;
exports.parseURL = __nccwpck_require__(2158).parseURL;


/***/ }),

/***/ 2158:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const punycode = __nccwpck_require__(5477);
const tr46 = __nccwpck_require__(4256);

const specialSchemes = {
  ftp: 21,
  file: null,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

const failure = Symbol("failure");

function countSymbols(str) {
  return punycode.ucs2.decode(str).length;
}

function at(input, idx) {
  const c = input[idx];
  return isNaN(c) ? undefined : String.fromCodePoint(c);
}

function isASCIIDigit(c) {
  return c >= 0x30 && c <= 0x39;
}

function isASCIIAlpha(c) {
  return (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A);
}

function isASCIIAlphanumeric(c) {
  return isASCIIAlpha(c) || isASCIIDigit(c);
}

function isASCIIHex(c) {
  return isASCIIDigit(c) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66);
}

function isSingleDot(buffer) {
  return buffer === "." || buffer.toLowerCase() === "%2e";
}

function isDoubleDot(buffer) {
  buffer = buffer.toLowerCase();
  return buffer === ".." || buffer === "%2e." || buffer === ".%2e" || buffer === "%2e%2e";
}

function isWindowsDriveLetterCodePoints(cp1, cp2) {
  return isASCIIAlpha(cp1) && (cp2 === 58 || cp2 === 124);
}

function isWindowsDriveLetterString(string) {
  return string.length === 2 && isASCIIAlpha(string.codePointAt(0)) && (string[1] === ":" || string[1] === "|");
}

function isNormalizedWindowsDriveLetterString(string) {
  return string.length === 2 && isASCIIAlpha(string.codePointAt(0)) && string[1] === ":";
}

function containsForbiddenHostCodePoint(string) {
  return string.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|%|\/|:|\?|@|\[|\\|\]/) !== -1;
}

function containsForbiddenHostCodePointExcludingPercent(string) {
  return string.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|\/|:|\?|@|\[|\\|\]/) !== -1;
}

function isSpecialScheme(scheme) {
  return specialSchemes[scheme] !== undefined;
}

function isSpecial(url) {
  return isSpecialScheme(url.scheme);
}

function defaultPort(scheme) {
  return specialSchemes[scheme];
}

function percentEncode(c) {
  let hex = c.toString(16).toUpperCase();
  if (hex.length === 1) {
    hex = "0" + hex;
  }

  return "%" + hex;
}

function utf8PercentEncode(c) {
  const buf = new Buffer(c);

  let str = "";

  for (let i = 0; i < buf.length; ++i) {
    str += percentEncode(buf[i]);
  }

  return str;
}

function utf8PercentDecode(str) {
  const input = new Buffer(str);
  const output = [];
  for (let i = 0; i < input.length; ++i) {
    if (input[i] !== 37) {
      output.push(input[i]);
    } else if (input[i] === 37 && isASCIIHex(input[i + 1]) && isASCIIHex(input[i + 2])) {
      output.push(parseInt(input.slice(i + 1, i + 3).toString(), 16));
      i += 2;
    } else {
      output.push(input[i]);
    }
  }
  return new Buffer(output).toString();
}

function isC0ControlPercentEncode(c) {
  return c <= 0x1F || c > 0x7E;
}

const extraPathPercentEncodeSet = new Set([32, 34, 35, 60, 62, 63, 96, 123, 125]);
function isPathPercentEncode(c) {
  return isC0ControlPercentEncode(c) || extraPathPercentEncodeSet.has(c);
}

const extraUserinfoPercentEncodeSet =
  new Set([47, 58, 59, 61, 64, 91, 92, 93, 94, 124]);
function isUserinfoPercentEncode(c) {
  return isPathPercentEncode(c) || extraUserinfoPercentEncodeSet.has(c);
}

function percentEncodeChar(c, encodeSetPredicate) {
  const cStr = String.fromCodePoint(c);

  if (encodeSetPredicate(c)) {
    return utf8PercentEncode(cStr);
  }

  return cStr;
}

function parseIPv4Number(input) {
  let R = 10;

  if (input.length >= 2 && input.charAt(0) === "0" && input.charAt(1).toLowerCase() === "x") {
    input = input.substring(2);
    R = 16;
  } else if (input.length >= 2 && input.charAt(0) === "0") {
    input = input.substring(1);
    R = 8;
  }

  if (input === "") {
    return 0;
  }

  const regex = R === 10 ? /[^0-9]/ : (R === 16 ? /[^0-9A-Fa-f]/ : /[^0-7]/);
  if (regex.test(input)) {
    return failure;
  }

  return parseInt(input, R);
}

function parseIPv4(input) {
  const parts = input.split(".");
  if (parts[parts.length - 1] === "") {
    if (parts.length > 1) {
      parts.pop();
    }
  }

  if (parts.length > 4) {
    return input;
  }

  const numbers = [];
  for (const part of parts) {
    if (part === "") {
      return input;
    }
    const n = parseIPv4Number(part);
    if (n === failure) {
      return input;
    }

    numbers.push(n);
  }

  for (let i = 0; i < numbers.length - 1; ++i) {
    if (numbers[i] > 255) {
      return failure;
    }
  }
  if (numbers[numbers.length - 1] >= Math.pow(256, 5 - numbers.length)) {
    return failure;
  }

  let ipv4 = numbers.pop();
  let counter = 0;

  for (const n of numbers) {
    ipv4 += n * Math.pow(256, 3 - counter);
    ++counter;
  }

  return ipv4;
}

function serializeIPv4(address) {
  let output = "";
  let n = address;

  for (let i = 1; i <= 4; ++i) {
    output = String(n % 256) + output;
    if (i !== 4) {
      output = "." + output;
    }
    n = Math.floor(n / 256);
  }

  return output;
}

function parseIPv6(input) {
  const address = [0, 0, 0, 0, 0, 0, 0, 0];
  let pieceIndex = 0;
  let compress = null;
  let pointer = 0;

  input = punycode.ucs2.decode(input);

  if (input[pointer] === 58) {
    if (input[pointer + 1] !== 58) {
      return failure;
    }

    pointer += 2;
    ++pieceIndex;
    compress = pieceIndex;
  }

  while (pointer < input.length) {
    if (pieceIndex === 8) {
      return failure;
    }

    if (input[pointer] === 58) {
      if (compress !== null) {
        return failure;
      }
      ++pointer;
      ++pieceIndex;
      compress = pieceIndex;
      continue;
    }

    let value = 0;
    let length = 0;

    while (length < 4 && isASCIIHex(input[pointer])) {
      value = value * 0x10 + parseInt(at(input, pointer), 16);
      ++pointer;
      ++length;
    }

    if (input[pointer] === 46) {
      if (length === 0) {
        return failure;
      }

      pointer -= length;

      if (pieceIndex > 6) {
        return failure;
      }

      let numbersSeen = 0;

      while (input[pointer] !== undefined) {
        let ipv4Piece = null;

        if (numbersSeen > 0) {
          if (input[pointer] === 46 && numbersSeen < 4) {
            ++pointer;
          } else {
            return failure;
          }
        }

        if (!isASCIIDigit(input[pointer])) {
          return failure;
        }

        while (isASCIIDigit(input[pointer])) {
          const number = parseInt(at(input, pointer));
          if (ipv4Piece === null) {
            ipv4Piece = number;
          } else if (ipv4Piece === 0) {
            return failure;
          } else {
            ipv4Piece = ipv4Piece * 10 + number;
          }
          if (ipv4Piece > 255) {
            return failure;
          }
          ++pointer;
        }

        address[pieceIndex] = address[pieceIndex] * 0x100 + ipv4Piece;

        ++numbersSeen;

        if (numbersSeen === 2 || numbersSeen === 4) {
          ++pieceIndex;
        }
      }

      if (numbersSeen !== 4) {
        return failure;
      }

      break;
    } else if (input[pointer] === 58) {
      ++pointer;
      if (input[pointer] === undefined) {
        return failure;
      }
    } else if (input[pointer] !== undefined) {
      return failure;
    }

    address[pieceIndex] = value;
    ++pieceIndex;
  }

  if (compress !== null) {
    let swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex !== 0 && swaps > 0) {
      const temp = address[compress + swaps - 1];
      address[compress + swaps - 1] = address[pieceIndex];
      address[pieceIndex] = temp;
      --pieceIndex;
      --swaps;
    }
  } else if (compress === null && pieceIndex !== 8) {
    return failure;
  }

  return address;
}

function serializeIPv6(address) {
  let output = "";
  const seqResult = findLongestZeroSequence(address);
  const compress = seqResult.idx;
  let ignore0 = false;

  for (let pieceIndex = 0; pieceIndex <= 7; ++pieceIndex) {
    if (ignore0 && address[pieceIndex] === 0) {
      continue;
    } else if (ignore0) {
      ignore0 = false;
    }

    if (compress === pieceIndex) {
      const separator = pieceIndex === 0 ? "::" : ":";
      output += separator;
      ignore0 = true;
      continue;
    }

    output += address[pieceIndex].toString(16);

    if (pieceIndex !== 7) {
      output += ":";
    }
  }

  return output;
}

function parseHost(input, isSpecialArg) {
  if (input[0] === "[") {
    if (input[input.length - 1] !== "]") {
      return failure;
    }

    return parseIPv6(input.substring(1, input.length - 1));
  }

  if (!isSpecialArg) {
    return parseOpaqueHost(input);
  }

  const domain = utf8PercentDecode(input);
  const asciiDomain = tr46.toASCII(domain, false, tr46.PROCESSING_OPTIONS.NONTRANSITIONAL, false);
  if (asciiDomain === null) {
    return failure;
  }

  if (containsForbiddenHostCodePoint(asciiDomain)) {
    return failure;
  }

  const ipv4Host = parseIPv4(asciiDomain);
  if (typeof ipv4Host === "number" || ipv4Host === failure) {
    return ipv4Host;
  }

  return asciiDomain;
}

function parseOpaqueHost(input) {
  if (containsForbiddenHostCodePointExcludingPercent(input)) {
    return failure;
  }

  let output = "";
  const decoded = punycode.ucs2.decode(input);
  for (let i = 0; i < decoded.length; ++i) {
    output += percentEncodeChar(decoded[i], isC0ControlPercentEncode);
  }
  return output;
}

function findLongestZeroSequence(arr) {
  let maxIdx = null;
  let maxLen = 1; // only find elements > 1
  let currStart = null;
  let currLen = 0;

  for (let i = 0; i < arr.length; ++i) {
    if (arr[i] !== 0) {
      if (currLen > maxLen) {
        maxIdx = currStart;
        maxLen = currLen;
      }

      currStart = null;
      currLen = 0;
    } else {
      if (currStart === null) {
        currStart = i;
      }
      ++currLen;
    }
  }

  // if trailing zeros
  if (currLen > maxLen) {
    maxIdx = currStart;
    maxLen = currLen;
  }

  return {
    idx: maxIdx,
    len: maxLen
  };
}

function serializeHost(host) {
  if (typeof host === "number") {
    return serializeIPv4(host);
  }

  // IPv6 serializer
  if (host instanceof Array) {
    return "[" + serializeIPv6(host) + "]";
  }

  return host;
}

function trimControlChars(url) {
  return url.replace(/^[\u0000-\u001F\u0020]+|[\u0000-\u001F\u0020]+$/g, "");
}

function trimTabAndNewline(url) {
  return url.replace(/\u0009|\u000A|\u000D/g, "");
}

function shortenPath(url) {
  const path = url.path;
  if (path.length === 0) {
    return;
  }
  if (url.scheme === "file" && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) {
    return;
  }

  path.pop();
}

function includesCredentials(url) {
  return url.username !== "" || url.password !== "";
}

function cannotHaveAUsernamePasswordPort(url) {
  return url.host === null || url.host === "" || url.cannotBeABaseURL || url.scheme === "file";
}

function isNormalizedWindowsDriveLetter(string) {
  return /^[A-Za-z]:$/.test(string);
}

function URLStateMachine(input, base, encodingOverride, url, stateOverride) {
  this.pointer = 0;
  this.input = input;
  this.base = base || null;
  this.encodingOverride = encodingOverride || "utf-8";
  this.stateOverride = stateOverride;
  this.url = url;
  this.failure = false;
  this.parseError = false;

  if (!this.url) {
    this.url = {
      scheme: "",
      username: "",
      password: "",
      host: null,
      port: null,
      path: [],
      query: null,
      fragment: null,

      cannotBeABaseURL: false
    };

    const res = trimControlChars(this.input);
    if (res !== this.input) {
      this.parseError = true;
    }
    this.input = res;
  }

  const res = trimTabAndNewline(this.input);
  if (res !== this.input) {
    this.parseError = true;
  }
  this.input = res;

  this.state = stateOverride || "scheme start";

  this.buffer = "";
  this.atFlag = false;
  this.arrFlag = false;
  this.passwordTokenSeenFlag = false;

  this.input = punycode.ucs2.decode(this.input);

  for (; this.pointer <= this.input.length; ++this.pointer) {
    const c = this.input[this.pointer];
    const cStr = isNaN(c) ? undefined : String.fromCodePoint(c);

    // exec state machine
    const ret = this["parse " + this.state](c, cStr);
    if (!ret) {
      break; // terminate algorithm
    } else if (ret === failure) {
      this.failure = true;
      break;
    }
  }
}

URLStateMachine.prototype["parse scheme start"] = function parseSchemeStart(c, cStr) {
  if (isASCIIAlpha(c)) {
    this.buffer += cStr.toLowerCase();
    this.state = "scheme";
  } else if (!this.stateOverride) {
    this.state = "no scheme";
    --this.pointer;
  } else {
    this.parseError = true;
    return failure;
  }

  return true;
};

URLStateMachine.prototype["parse scheme"] = function parseScheme(c, cStr) {
  if (isASCIIAlphanumeric(c) || c === 43 || c === 45 || c === 46) {
    this.buffer += cStr.toLowerCase();
  } else if (c === 58) {
    if (this.stateOverride) {
      if (isSpecial(this.url) && !isSpecialScheme(this.buffer)) {
        return false;
      }

      if (!isSpecial(this.url) && isSpecialScheme(this.buffer)) {
        return false;
      }

      if ((includesCredentials(this.url) || this.url.port !== null) && this.buffer === "file") {
        return false;
      }

      if (this.url.scheme === "file" && (this.url.host === "" || this.url.host === null)) {
        return false;
      }
    }
    this.url.scheme = this.buffer;
    this.buffer = "";
    if (this.stateOverride) {
      return false;
    }
    if (this.url.scheme === "file") {
      if (this.input[this.pointer + 1] !== 47 || this.input[this.pointer + 2] !== 47) {
        this.parseError = true;
      }
      this.state = "file";
    } else if (isSpecial(this.url) && this.base !== null && this.base.scheme === this.url.scheme) {
      this.state = "special relative or authority";
    } else if (isSpecial(this.url)) {
      this.state = "special authority slashes";
    } else if (this.input[this.pointer + 1] === 47) {
      this.state = "path or authority";
      ++this.pointer;
    } else {
      this.url.cannotBeABaseURL = true;
      this.url.path.push("");
      this.state = "cannot-be-a-base-URL path";
    }
  } else if (!this.stateOverride) {
    this.buffer = "";
    this.state = "no scheme";
    this.pointer = -1;
  } else {
    this.parseError = true;
    return failure;
  }

  return true;
};

URLStateMachine.prototype["parse no scheme"] = function parseNoScheme(c) {
  if (this.base === null || (this.base.cannotBeABaseURL && c !== 35)) {
    return failure;
  } else if (this.base.cannotBeABaseURL && c === 35) {
    this.url.scheme = this.base.scheme;
    this.url.path = this.base.path.slice();
    this.url.query = this.base.query;
    this.url.fragment = "";
    this.url.cannotBeABaseURL = true;
    this.state = "fragment";
  } else if (this.base.scheme === "file") {
    this.state = "file";
    --this.pointer;
  } else {
    this.state = "relative";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse special relative or authority"] = function parseSpecialRelativeOrAuthority(c) {
  if (c === 47 && this.input[this.pointer + 1] === 47) {
    this.state = "special authority ignore slashes";
    ++this.pointer;
  } else {
    this.parseError = true;
    this.state = "relative";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse path or authority"] = function parsePathOrAuthority(c) {
  if (c === 47) {
    this.state = "authority";
  } else {
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse relative"] = function parseRelative(c) {
  this.url.scheme = this.base.scheme;
  if (isNaN(c)) {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice();
    this.url.query = this.base.query;
  } else if (c === 47) {
    this.state = "relative slash";
  } else if (c === 63) {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice();
    this.url.query = "";
    this.state = "query";
  } else if (c === 35) {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice();
    this.url.query = this.base.query;
    this.url.fragment = "";
    this.state = "fragment";
  } else if (isSpecial(this.url) && c === 92) {
    this.parseError = true;
    this.state = "relative slash";
  } else {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice(0, this.base.path.length - 1);

    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse relative slash"] = function parseRelativeSlash(c) {
  if (isSpecial(this.url) && (c === 47 || c === 92)) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "special authority ignore slashes";
  } else if (c === 47) {
    this.state = "authority";
  } else {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse special authority slashes"] = function parseSpecialAuthoritySlashes(c) {
  if (c === 47 && this.input[this.pointer + 1] === 47) {
    this.state = "special authority ignore slashes";
    ++this.pointer;
  } else {
    this.parseError = true;
    this.state = "special authority ignore slashes";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse special authority ignore slashes"] = function parseSpecialAuthorityIgnoreSlashes(c) {
  if (c !== 47 && c !== 92) {
    this.state = "authority";
    --this.pointer;
  } else {
    this.parseError = true;
  }

  return true;
};

URLStateMachine.prototype["parse authority"] = function parseAuthority(c, cStr) {
  if (c === 64) {
    this.parseError = true;
    if (this.atFlag) {
      this.buffer = "%40" + this.buffer;
    }
    this.atFlag = true;

    // careful, this is based on buffer and has its own pointer (this.pointer != pointer) and inner chars
    const len = countSymbols(this.buffer);
    for (let pointer = 0; pointer < len; ++pointer) {
      const codePoint = this.buffer.codePointAt(pointer);

      if (codePoint === 58 && !this.passwordTokenSeenFlag) {
        this.passwordTokenSeenFlag = true;
        continue;
      }
      const encodedCodePoints = percentEncodeChar(codePoint, isUserinfoPercentEncode);
      if (this.passwordTokenSeenFlag) {
        this.url.password += encodedCodePoints;
      } else {
        this.url.username += encodedCodePoints;
      }
    }
    this.buffer = "";
  } else if (isNaN(c) || c === 47 || c === 63 || c === 35 ||
             (isSpecial(this.url) && c === 92)) {
    if (this.atFlag && this.buffer === "") {
      this.parseError = true;
      return failure;
    }
    this.pointer -= countSymbols(this.buffer) + 1;
    this.buffer = "";
    this.state = "host";
  } else {
    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse hostname"] =
URLStateMachine.prototype["parse host"] = function parseHostName(c, cStr) {
  if (this.stateOverride && this.url.scheme === "file") {
    --this.pointer;
    this.state = "file host";
  } else if (c === 58 && !this.arrFlag) {
    if (this.buffer === "") {
      this.parseError = true;
      return failure;
    }

    const host = parseHost(this.buffer, isSpecial(this.url));
    if (host === failure) {
      return failure;
    }

    this.url.host = host;
    this.buffer = "";
    this.state = "port";
    if (this.stateOverride === "hostname") {
      return false;
    }
  } else if (isNaN(c) || c === 47 || c === 63 || c === 35 ||
             (isSpecial(this.url) && c === 92)) {
    --this.pointer;
    if (isSpecial(this.url) && this.buffer === "") {
      this.parseError = true;
      return failure;
    } else if (this.stateOverride && this.buffer === "" &&
               (includesCredentials(this.url) || this.url.port !== null)) {
      this.parseError = true;
      return false;
    }

    const host = parseHost(this.buffer, isSpecial(this.url));
    if (host === failure) {
      return failure;
    }

    this.url.host = host;
    this.buffer = "";
    this.state = "path start";
    if (this.stateOverride) {
      return false;
    }
  } else {
    if (c === 91) {
      this.arrFlag = true;
    } else if (c === 93) {
      this.arrFlag = false;
    }
    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse port"] = function parsePort(c, cStr) {
  if (isASCIIDigit(c)) {
    this.buffer += cStr;
  } else if (isNaN(c) || c === 47 || c === 63 || c === 35 ||
             (isSpecial(this.url) && c === 92) ||
             this.stateOverride) {
    if (this.buffer !== "") {
      const port = parseInt(this.buffer);
      if (port > Math.pow(2, 16) - 1) {
        this.parseError = true;
        return failure;
      }
      this.url.port = port === defaultPort(this.url.scheme) ? null : port;
      this.buffer = "";
    }
    if (this.stateOverride) {
      return false;
    }
    this.state = "path start";
    --this.pointer;
  } else {
    this.parseError = true;
    return failure;
  }

  return true;
};

const fileOtherwiseCodePoints = new Set([47, 92, 63, 35]);

URLStateMachine.prototype["parse file"] = function parseFile(c) {
  this.url.scheme = "file";

  if (c === 47 || c === 92) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "file slash";
  } else if (this.base !== null && this.base.scheme === "file") {
    if (isNaN(c)) {
      this.url.host = this.base.host;
      this.url.path = this.base.path.slice();
      this.url.query = this.base.query;
    } else if (c === 63) {
      this.url.host = this.base.host;
      this.url.path = this.base.path.slice();
      this.url.query = "";
      this.state = "query";
    } else if (c === 35) {
      this.url.host = this.base.host;
      this.url.path = this.base.path.slice();
      this.url.query = this.base.query;
      this.url.fragment = "";
      this.state = "fragment";
    } else {
      if (this.input.length - this.pointer - 1 === 0 || // remaining consists of 0 code points
          !isWindowsDriveLetterCodePoints(c, this.input[this.pointer + 1]) ||
          (this.input.length - this.pointer - 1 >= 2 && // remaining has at least 2 code points
           !fileOtherwiseCodePoints.has(this.input[this.pointer + 2]))) {
        this.url.host = this.base.host;
        this.url.path = this.base.path.slice();
        shortenPath(this.url);
      } else {
        this.parseError = true;
      }

      this.state = "path";
      --this.pointer;
    }
  } else {
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse file slash"] = function parseFileSlash(c) {
  if (c === 47 || c === 92) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "file host";
  } else {
    if (this.base !== null && this.base.scheme === "file") {
      if (isNormalizedWindowsDriveLetterString(this.base.path[0])) {
        this.url.path.push(this.base.path[0]);
      } else {
        this.url.host = this.base.host;
      }
    }
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse file host"] = function parseFileHost(c, cStr) {
  if (isNaN(c) || c === 47 || c === 92 || c === 63 || c === 35) {
    --this.pointer;
    if (!this.stateOverride && isWindowsDriveLetterString(this.buffer)) {
      this.parseError = true;
      this.state = "path";
    } else if (this.buffer === "") {
      this.url.host = "";
      if (this.stateOverride) {
        return false;
      }
      this.state = "path start";
    } else {
      let host = parseHost(this.buffer, isSpecial(this.url));
      if (host === failure) {
        return failure;
      }
      if (host === "localhost") {
        host = "";
      }
      this.url.host = host;

      if (this.stateOverride) {
        return false;
      }

      this.buffer = "";
      this.state = "path start";
    }
  } else {
    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse path start"] = function parsePathStart(c) {
  if (isSpecial(this.url)) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "path";

    if (c !== 47 && c !== 92) {
      --this.pointer;
    }
  } else if (!this.stateOverride && c === 63) {
    this.url.query = "";
    this.state = "query";
  } else if (!this.stateOverride && c === 35) {
    this.url.fragment = "";
    this.state = "fragment";
  } else if (c !== undefined) {
    this.state = "path";
    if (c !== 47) {
      --this.pointer;
    }
  }

  return true;
};

URLStateMachine.prototype["parse path"] = function parsePath(c) {
  if (isNaN(c) || c === 47 || (isSpecial(this.url) && c === 92) ||
      (!this.stateOverride && (c === 63 || c === 35))) {
    if (isSpecial(this.url) && c === 92) {
      this.parseError = true;
    }

    if (isDoubleDot(this.buffer)) {
      shortenPath(this.url);
      if (c !== 47 && !(isSpecial(this.url) && c === 92)) {
        this.url.path.push("");
      }
    } else if (isSingleDot(this.buffer) && c !== 47 &&
               !(isSpecial(this.url) && c === 92)) {
      this.url.path.push("");
    } else if (!isSingleDot(this.buffer)) {
      if (this.url.scheme === "file" && this.url.path.length === 0 && isWindowsDriveLetterString(this.buffer)) {
        if (this.url.host !== "" && this.url.host !== null) {
          this.parseError = true;
          this.url.host = "";
        }
        this.buffer = this.buffer[0] + ":";
      }
      this.url.path.push(this.buffer);
    }
    this.buffer = "";
    if (this.url.scheme === "file" && (c === undefined || c === 63 || c === 35)) {
      while (this.url.path.length > 1 && this.url.path[0] === "") {
        this.parseError = true;
        this.url.path.shift();
      }
    }
    if (c === 63) {
      this.url.query = "";
      this.state = "query";
    }
    if (c === 35) {
      this.url.fragment = "";
      this.state = "fragment";
    }
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.

    if (c === 37 &&
      (!isASCIIHex(this.input[this.pointer + 1]) ||
        !isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    this.buffer += percentEncodeChar(c, isPathPercentEncode);
  }

  return true;
};

URLStateMachine.prototype["parse cannot-be-a-base-URL path"] = function parseCannotBeABaseURLPath(c) {
  if (c === 63) {
    this.url.query = "";
    this.state = "query";
  } else if (c === 35) {
    this.url.fragment = "";
    this.state = "fragment";
  } else {
    // TODO: Add: not a URL code point
    if (!isNaN(c) && c !== 37) {
      this.parseError = true;
    }

    if (c === 37 &&
        (!isASCIIHex(this.input[this.pointer + 1]) ||
         !isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    if (!isNaN(c)) {
      this.url.path[0] = this.url.path[0] + percentEncodeChar(c, isC0ControlPercentEncode);
    }
  }

  return true;
};

URLStateMachine.prototype["parse query"] = function parseQuery(c, cStr) {
  if (isNaN(c) || (!this.stateOverride && c === 35)) {
    if (!isSpecial(this.url) || this.url.scheme === "ws" || this.url.scheme === "wss") {
      this.encodingOverride = "utf-8";
    }

    const buffer = new Buffer(this.buffer); // TODO: Use encoding override instead
    for (let i = 0; i < buffer.length; ++i) {
      if (buffer[i] < 0x21 || buffer[i] > 0x7E || buffer[i] === 0x22 || buffer[i] === 0x23 ||
          buffer[i] === 0x3C || buffer[i] === 0x3E) {
        this.url.query += percentEncode(buffer[i]);
      } else {
        this.url.query += String.fromCodePoint(buffer[i]);
      }
    }

    this.buffer = "";
    if (c === 35) {
      this.url.fragment = "";
      this.state = "fragment";
    }
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.
    if (c === 37 &&
      (!isASCIIHex(this.input[this.pointer + 1]) ||
        !isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse fragment"] = function parseFragment(c) {
  if (isNaN(c)) { // do nothing
  } else if (c === 0x0) {
    this.parseError = true;
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.
    if (c === 37 &&
      (!isASCIIHex(this.input[this.pointer + 1]) ||
        !isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    this.url.fragment += percentEncodeChar(c, isC0ControlPercentEncode);
  }

  return true;
};

function serializeURL(url, excludeFragment) {
  let output = url.scheme + ":";
  if (url.host !== null) {
    output += "//";

    if (url.username !== "" || url.password !== "") {
      output += url.username;
      if (url.password !== "") {
        output += ":" + url.password;
      }
      output += "@";
    }

    output += serializeHost(url.host);

    if (url.port !== null) {
      output += ":" + url.port;
    }
  } else if (url.host === null && url.scheme === "file") {
    output += "//";
  }

  if (url.cannotBeABaseURL) {
    output += url.path[0];
  } else {
    for (const string of url.path) {
      output += "/" + string;
    }
  }

  if (url.query !== null) {
    output += "?" + url.query;
  }

  if (!excludeFragment && url.fragment !== null) {
    output += "#" + url.fragment;
  }

  return output;
}

function serializeOrigin(tuple) {
  let result = tuple.scheme + "://";
  result += serializeHost(tuple.host);

  if (tuple.port !== null) {
    result += ":" + tuple.port;
  }

  return result;
}

module.exports.serializeURL = serializeURL;

module.exports.serializeURLOrigin = function (url) {
  // https://url.spec.whatwg.org/#concept-url-origin
  switch (url.scheme) {
    case "blob":
      try {
        return module.exports.serializeURLOrigin(module.exports.parseURL(url.path[0]));
      } catch (e) {
        // serializing an opaque origin returns "null"
        return "null";
      }
    case "ftp":
    case "gopher":
    case "http":
    case "https":
    case "ws":
    case "wss":
      return serializeOrigin({
        scheme: url.scheme,
        host: url.host,
        port: url.port
      });
    case "file":
      // spec says "exercise to the reader", chrome says "file://"
      return "file://";
    default:
      // serializing an opaque origin returns "null"
      return "null";
  }
};

module.exports.basicURLParse = function (input, options) {
  if (options === undefined) {
    options = {};
  }

  const usm = new URLStateMachine(input, options.baseURL, options.encodingOverride, options.url, options.stateOverride);
  if (usm.failure) {
    return "failure";
  }

  return usm.url;
};

module.exports.setTheUsername = function (url, username) {
  url.username = "";
  const decoded = punycode.ucs2.decode(username);
  for (let i = 0; i < decoded.length; ++i) {
    url.username += percentEncodeChar(decoded[i], isUserinfoPercentEncode);
  }
};

module.exports.setThePassword = function (url, password) {
  url.password = "";
  const decoded = punycode.ucs2.decode(password);
  for (let i = 0; i < decoded.length; ++i) {
    url.password += percentEncodeChar(decoded[i], isUserinfoPercentEncode);
  }
};

module.exports.serializeHost = serializeHost;

module.exports.cannotHaveAUsernamePasswordPort = cannotHaveAUsernamePasswordPort;

module.exports.serializeInteger = function (integer) {
  return String(integer);
};

module.exports.parseURL = function (input, options) {
  if (options === undefined) {
    options = {};
  }

  // We don't handle blobs, so this just delegates:
  return module.exports.basicURLParse(input, { baseURL: options.baseURL, encodingOverride: options.encodingOverride });
};


/***/ }),

/***/ 3185:
/***/ ((module) => {

"use strict";


module.exports.mixin = function mixin(target, source) {
  const keys = Object.getOwnPropertyNames(source);
  for (let i = 0; i < keys.length; ++i) {
    Object.defineProperty(target, keys[i], Object.getOwnPropertyDescriptor(source, keys[i]));
  }
};

module.exports.wrapperSymbol = Symbol("wrapper");
module.exports.implSymbol = Symbol("impl");

module.exports.wrapperForImpl = function (impl) {
  return impl[module.exports.wrapperSymbol];
};

module.exports.implForWrapper = function (wrapper) {
  return wrapper[module.exports.implSymbol];
};



/***/ }),

/***/ 2940:
/***/ ((module) => {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),

/***/ 2877:
/***/ ((module) => {

module.exports = eval("require")("encoding");


/***/ }),

/***/ 9491:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 2361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 3685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 5687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1808:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 2037:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 1017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 5477:
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ 2781:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 4404:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 7310:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 3837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 9796:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ 2020:
/***/ ((module) => {

"use strict";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(3109);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;