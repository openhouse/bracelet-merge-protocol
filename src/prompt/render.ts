import { readFileSync } from "node:fs";
import Handlebars from "handlebars";
import { defaultJudgePromptTemplate } from "./defaultTemplates.js";
import type { JudgePromptContext } from "./types.js";

export function loadJudgeTemplate(path?: string): {
  template: string;
  name: string;
  version: string;
} {
  if (!path)
    return {
      template: defaultJudgePromptTemplate,
      name: "default-judge-local-insertion",
      version: "1.0.0",
    };
  return { template: readFileSync(path, "utf8"), name: path, version: "custom" };
}

export function renderJudgePrompt(context: JudgePromptContext, template: string): string {
  return Handlebars.compile(template, { noEscape: true })(context).trim();
}
