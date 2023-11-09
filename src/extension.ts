import * as vscode from "vscode";
const { execSync } = require("child_process");
const fs = require("fs");

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand("branch-timer.logBranchSwitch");

  let disposable = vscode.commands.registerCommand(
    "branch-timer.logBranchSwitch",
    () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const logFilePath = vscode.workspace
        .getConfiguration("branchTimer")
        .get<string>("logFilePath", "");
      const excludedBranches = vscode.workspace
        .getConfiguration("branchTimer")
        .get<string[]>("excludedBranches", [""]);
      console.log("logFilePath: ", logFilePath);
      console.log("excludedBranches", excludedBranches);
      if (workspaceFolders && workspaceFolders.length > 0) {
        const workspaceFolder = workspaceFolders[0];
        const branchName = execSync("git rev-parse --abbrev-ref HEAD", {
          cwd: workspaceFolder.uri.fsPath,
        })
          .toString()
          .trim();

        if (!excludedBranches.includes(branchName.toLowerCase())) {
          const config = vscode.workspace.getConfiguration("branchTimer");
          const customBranchCodeRegex = config.get<string>(
            "branchCodeRegex",
            "seal-\\d{4}"
          );

          const regex = new RegExp(customBranchCodeRegex, "i");

          if (regex.test(branchName)) {
            const config = vscode.workspace.getConfiguration("branchTimer");
            const prefix = config.get<string>("prefix", "");

            const sealCodeMatch = branchName.match(/\d{4}/);
            const code = sealCodeMatch ? sealCodeMatch[0] : branchName;
            const logEntry = `${prefix}${code.toUpperCase()} ${getFormattedDate()}`;
            // Handle the logEntry by appending it to a log file
            fs.appendFileSync(logFilePath, `${logEntry}\n`);

            vscode.window.showInformationMessage(
              `Logged branch switch: ${logEntry}`
            );
          }
        }
      } else {
        vscode.window.showErrorMessage("No workspace folder found.");
      }
    }
  );

  context.subscriptions.push(disposable);
}

function getFormattedDate() {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function deactivate() {}
