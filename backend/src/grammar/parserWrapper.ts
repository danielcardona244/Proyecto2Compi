// @ts-ignore
const parserModule = require("./parser");
import { ErrorCollector } from "../errors/errorCollector";

export default {
  parse: (input: string, errorCollector?: ErrorCollector) => {
    const parser = parserModule.parser || parserModule;
    if (errorCollector) {
      (parser as any).yy = (parser as any).yy || {};
      (parser as any).yy.errorCollector = errorCollector;
    }
    return parser.parse(input);
  }
};
