// @ts-ignore
const parser = require("./parser");
import { ErrorCollector } from "../errors/errorCollector";

export default {
  parse: (input: string, errorCollector?: ErrorCollector) => {
    if (errorCollector && typeof (parser as any).errorCollector !== 'undefined') {
      (parser as any).errorCollector = errorCollector;
    }
    return parser.parse(input);
  }
};