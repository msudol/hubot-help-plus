# hubot-help-plus

Show available hubot commands with improvements. An upgrade to the original hubot-help https://github.com/hubotio/hubot-help. 

Note: If you are using this hubot script, remove hubot-help as the commands will conflict.

## Installation

Not yet published on NPM, still in development. Coming soon.

## Configuration

You can set various environment variables to tune up the behavior of thios help plugin:

- `HUBOT_HELP_REPLY_IN_PRIVATE` (set to any value) will force calls to `hubot help` to be answered in private
- `HUBOT_HELP_DISABLE_HTTP` (set to any value) will disable the web interface for help
- `HUBOT_HELP_HIDDEN_COMMANDS` comma-separated list of commands that will not be displayed in help

## Improvements Upon Original

- Fixed webpage display
- Fixed several errors and bugs
- Fixing 2000 character limit response for adapters like slack and discord
- Fixing hidden commands env variable not working


