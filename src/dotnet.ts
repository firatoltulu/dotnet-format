import {
  debug,
  info,
  warning,
} from "@actions/core";
import { exec } from "@actions/exec";
import { context } from "@actions/github";
import { which } from "@actions/io";

import { getPullRequestFiles } from "./files";

import type { ExecOptions } from "@actions/exec/lib/interfaces";

import type { DotNetFormatVersion } from "./version";

export type FormatFunction = (options: FormatOptions) => Promise<boolean>;

export type SeverityType =
  | "info"
  | "warning"
  | "error"
  ;


export interface FormatOptions {
  onlyChangedFiles: boolean;
  noRestore: boolean;
  severity: SeverityType;
  project?: string;
  diagnostics?:string;
}

function formatOnlyChangedFiles(onlyChangedFiles: boolean): boolean {
  if (onlyChangedFiles) {
    if (context.eventName === "issue_comment" || context.eventName === "pull_request") {
      return true;
    }

    warning("Formatting only changed files is available on the issue_comment and pull_request events only");

    return false;
  }

  return false;
}

async function formatVersion8(options: FormatOptions): Promise<boolean> {
  const execOptions: ExecOptions = { ignoreReturnCode: true };

  const dotnetFormatOptions = ["format"];

  if (options.project) {
    dotnetFormatOptions.push(options.project);
  }

  dotnetFormatOptions.push("--verify-no-changes", "--verbosity");

  if (options.noRestore) {
    dotnetFormatOptions.push("--no-restore");
  }

  if (options.diagnostics) {
    dotnetFormatOptions.push("--diagnostics", options.diagnostics);
  }

  if (options.severity) {
    dotnetFormatOptions.push("--severity", options.severity);
  }

  if (formatOnlyChangedFiles(options.onlyChangedFiles)) {
    const filesToCheck = await getPullRequestFiles();

    info(`Checking ${filesToCheck.length} files`);

    // if there weren't any files to check then we need to bail
    if (!filesToCheck.length) {
      debug("No files found for formatting");
      return false;
    }

    dotnetFormatOptions.push("--include", filesToCheck.join(" "));
  }

  const dotnetPath: string = await which("dotnet", true);
  const dotnetResult = await exec(`"${dotnetPath}"`, dotnetFormatOptions, execOptions);

  return !!dotnetResult;
}

export function format(version: DotNetFormatVersion): FormatFunction {
  switch (version || "") {
    case "8":
      return formatVersion8;

    default:
      throw Error(`dotnet-format version "${version}" is unsupported`);
  }
}
