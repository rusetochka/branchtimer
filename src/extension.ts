import * as vscode from "vscode";
const { execSync } = require("child_process");
const fs = require("fs");

import { getFormattedDate, calculateBranchTimesFromFile } from "./utils";

const config = vscode.workspace.getConfiguration("branchTimer");
const logFilePath = config.get<string>("logFilePath", "");
const customBranchCodeRegex = config.get<string>("branchCodeRegex", "");
const excludedBranches = config.get<string[]>("excludedBranches", [""]);
const prefix = config.get<string>("prefix", "");

export function activate(context: vscode.ExtensionContext) {
  // Command to log branch switch
  const logBranchSwitchDisposable = vscode.commands.registerCommand(
    "branch-timer.logBranchSwitch",
    () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;

      if (workspaceFolders && workspaceFolders.length > 0) {
        const workspaceFolder = workspaceFolders[0];
        const branchName = execSync("git rev-parse --abbrev-ref HEAD", {
          cwd: workspaceFolder.uri.fsPath,
        })
          .toString()
          .trim();

        if (!excludedBranches.includes(branchName.toLowerCase())) {
          const regex = new RegExp(customBranchCodeRegex, "i");

          if (regex.test(branchName)) {

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

  // Command to generate report
  const generateReportDisposable = vscode.commands.registerCommand(
    "branch-timer.generateReport",
    () => {
      calculateBranchTimesFromFile(logFilePath)
        .then((branchTimes) => {
          // Display the branch times in a quick pick menu
          const items = Object.keys(branchTimes).map((branch) => ({
            label: branch,
            description: `${branchTimes[branch]}`,
          }));

          vscode.window.showQuickPick(items, { placeHolder: "Select a branch:" });
        })
        .catch((error) => {
          vscode.window.showErrorMessage(`Error generating report: ${error.message}`);
        });
    }
  );

  //Command to write "Stopped [date time]" into a log
  const logStoppedEntryDisposable = vscode.commands.registerCommand(
    "branch-timer.logStoppedEntry",
    () => {
      const logEntry = `Stopped ${getFormattedDate()}\n`;
      fs.appendFileSync(logFilePath, logEntry);
      vscode.window.showInformationMessage("Logged 'Stopped' entry.");
    }
  );

  // Status bar button to trigger the generateReport command
  const statusBarButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarButton.text = "$(file-text) Generate Branch Time Report";
  statusBarButton.command = "branch-timer.generateReport";
  statusBarButton.show();

  context.subscriptions.push(logBranchSwitchDisposable);
  context.subscriptions.push(generateReportDisposable);
  context.subscriptions.push(logStoppedEntryDisposable);
  context.subscriptions.push(statusBarButton);
}

export function deactivate() {
  const logEntry = `Stopped ${getFormattedDate()}\n`;
  fs.appendFileSync(logFilePath, logEntry);
}
