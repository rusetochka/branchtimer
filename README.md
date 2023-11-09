# Branch Timer

Branch Timer is a Visual Studio Code extension that allows you to log branch switches in your Git repositories. Keep track of your work progress by automatically recording the branch name and timestamp whenever you switch branches in your projects.

## Features

- **Manual Logging:** You can log branch switches by clicking CTRL + Shift + 3 with the format "MyFancyPrefix-XXXX DATE TIME" in a specified log file.
- **Customizable Log Format:** Customize the log entry format to match your preferences.
- **Exclude Specific Branches:** Exclude specific branches (e.g., "develop") from being logged.

## Usage

1. **Install the Extension:**
   - Search for "Branch Timer" in the VS Code Extensions view and install it.

2. **Configure the Log File:**
   - By default, the extension logs branch switches in a file named `log.txt` within the extension directory. You can customize the log file path in the extension settings.

3. **Switch Branches:**
   - Whenever you switch branches in your Git repository, call the logging function by clicking CTRL + SHIFT + 3 to log the branch name and timestamp in the specified log file.

4. **View Branch Logs:**
   - Open the log file using your preferred editor to view the recorded branch switches and timestamps and calculate time spent on each branch.

## Extension Settings

- `branchTimer.logFilePath`: Path to the log file where branch switches will be recorded. Default value: `./log.txt`.

- `branchTimer.logEntryFormat`: Customize the log entry format. Available placeholders: `{prefix}`, `{code}`, `{date}`, `{time}`. Default value: `"{prefix}{code} {date} {time}"`.

- `branchTimer.prefix`: Prefix to be added to the log entry. Default value: `"MyFancyPrefix-"`.

- `branchTimer.excludedBranches`: Array of branch names to exclude from logging. Default value: `["develop"]`.

- `branchTimer.branchCodeRegex`: Custom regex pattern to match branch codes. Example: `MyFancyPrefix-\\d{4}`. Default value: `"MyFancyPrefix-\\d{4}"`.

## Requirements

- Visual Studio Code 1.60.0 or higher.

## Known Issues

- None at the moment.

## Release Notes

### 1.0.0

- Initial release of Branch Timer.

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.
