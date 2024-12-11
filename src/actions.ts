import {
  getBooleanInput,
  getInput,
  setOutput,
} from "@actions/core";

import { format, SeverityType } from "./dotnet";
import { checkVersion } from "./version";

export async function check(): Promise<void> {
  const onlyChangedFiles = getBooleanInput("only-changed-files");
  const failFast = getBooleanInput("fail-fast");
  const project = getInput("project");

  const noRestore = getBooleanInput("no-restore");
  const severity = getInput("severity") as SeverityType;

  const version = getInput("version", { required: true });

  const dotnetFormatVersion = checkVersion(version);

  const result = await format(dotnetFormatVersion)({
    noRestore,
    onlyChangedFiles,
    severity,
    project,
  });

  setOutput("has-changes", result.toString());

  // fail fast will cause the workflow to stop on this job
  if (result && failFast) {
    throw Error("Formatting issues found");
  }
}

export async function fix(): Promise<void> {
  const onlyChangedFiles = getBooleanInput("only-changed-files");
  const noRestore = getBooleanInput("no-restore");
  const severity = getInput("severity") as SeverityType;

  const version = getInput("version", { required: true });

  const dotnetFormatVersion = checkVersion(version);

  const result = await format(dotnetFormatVersion)({
    noRestore,
    onlyChangedFiles,
    severity,
  });

  setOutput("has-changes", result.toString());
}
