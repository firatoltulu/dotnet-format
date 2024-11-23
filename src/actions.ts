import {
  getBooleanInput,
  getInput,
  setOutput,
} from "@actions/core";

import { format } from "./dotnet";
import { checkVersion } from "./version";

export async function check(): Promise<void> {
  const onlyChangedFiles = getBooleanInput("only-changed-files");
  const failFast = getBooleanInput("fail-fast");
  const noRestore = getBooleanInput("no-restore");

  const version = getInput("version", { required: true });

  const dotnetFormatVersion = checkVersion(version);

  const result = await format(dotnetFormatVersion)({
    noRestore,
    onlyChangedFiles,
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

  const version = getInput("version", { required: true });

  const dotnetFormatVersion = checkVersion(version);

  const result = await format(dotnetFormatVersion)({
    noRestore,
    onlyChangedFiles,
  });

  setOutput("has-changes", result.toString());
}
