# hubot-help-plus

Show available hubot commands with improvements. An upgrade to the original hubot-help https://github.com/hubotio/hubot-help. 

Note: If you are using this hubot script, remove hubot-help as the commands will conflict.

## Installation

In hubot project repo, run:

`npm install hubot-help-plus --save`

Then add **hubot-help-plus** to your `external-scripts.json`:

```json ["hubot-help-plus"] ```

If you were running hubot-help original, be sure to remove it.

## Configuration

You can set various environment variables to tune up the behavior of this help plugin:

- `HUBOT_HELP_REPLY_IN_PRIVATE` (set to any value) will force calls to `hubot help` to be answered in private
- `HUBOT_HELP_DISABLE_HTTP` (set to any value) will disable the web interface for help
- `HUBOT_HELP_HIDDEN_COMMANDS` comma-separated list of commands that will not be displayed in help

### Hidden Commands

When setting hidden commands, the environment variable array will remove an commands matching `^value`
The effect of this will remove any commands starting "value", for example:

`[he]` will remove any commands from the help list beginning with "he" including `help` and `hubot help` 

Hidden commands only removes commands from the help list, these commands will still be available to the
bot, just not exposed to users via help. They will also be exclused from the web interface for help.

## Improvements Upon Original

- Fixed webpage display
- Fixed several errors and bugs
- Fixed 2000 character limit response for adapters like slack and discord
- Fixed hidden commands env variable not working
- Added a pagination feature


