'use strict'

// Description:
//   Generates help commands for Hubot.
//
// Commands:
//   hubot help - Displays all of the help commands that this bot knows about.
//   hubot help <query> - Displays all help commands that match <query>.
//   hubot help <page #> - Displays help via pagination 10 commands at a time.
//
// URLS:
//   /hubot/help
//
// Configuration:
//   HUBOT_HELP_REPLY_IN_PRIVATE - if set to any value, all `hubot help` replies are sent in private
//   HUBOT_HELP_DISABLE_HTTP - if set, no web entry point will be declared
//   HUBOT_HELP_HIDDEN_COMMANDS - comma-separated list of commands that will not be displayed in help
//
// Notes:
//   These commands are grabbed from comment blocks at the top of each file.
// 
// Author:
//   Matt Sudol
//   Based on the original hubot-help


//TODO: ugly formatting need to change this eventually
const helpContents = (name, commands) => `\
<!DOCTYPE html>
<html>
  <head>
  <meta charset="utf-8">
  <title>${name} help</title>
  <style type="text/css">
    body {
      background: #ddd;
      color: #000;
      text-shadow: 0 1px 1px rgba(255, 255, 255, .5);
    }
    h1 {
      margin: 8px 0;
      padding: 0;
    }
    .commands {
      font-size: 14px;
    }
    p {
      border-bottom: 1px solid #eee;
      margin: 6px 0 0 0;
      padding-bottom: 5px;
    }
    p:last-child {
      border: 0;
    }
  </style>
  </head>
  <body>
    <h1>${name} help</h1>
    <div class="commands">
      ${commands}
    </div>
  </body>
</html>\
`


// main function for the script
module.exports = (robot) => {
    
    // get the robot name
    const robotName = robot.alias || robot.name;        

    // if reply in private will be set
    const replyInPrivate = process.env.HUBOT_HELP_REPLY_IN_PRIVATE;
    
    // probably should make this sync with a callback?
    var doHelp = function() {
            
        var hiddenCommands, ref;
        
        // check the process env for human error
        var envHiddenCommands = process.env.HUBOT_HELP_HIDDEN_COMMANDS || null;
        
        if ((envHiddenCommands !== null) && (envHiddenCommands.trim() !== "")) {
            hiddenCommands = envHiddenCommands.split(',');
        } 
        else {
            hiddenCommands = null;
        }
        
        if (hiddenCommands !== null) {
            robot.logger.debug("Help Plus: Hidden Commands = " + hiddenCommands.length + " | " + hiddenCommands);   
        }
        
        // routine to get hidden commands via regex pattern test 
        var hiddenCommandsPattern = function() {
            var hideCmd = new RegExp("^hubot (?:" + hiddenCommands.join('|') + ")|^(?:" + hiddenCommands.join('|') + ")");
            return hideCmd;
        };
        
        // pull the helpCommands from the robot
        var helpCommands = robot.helpCommands();
        var hiddenHelpCommands;
        
        // filter the hidden help commands if there are any
        if (hiddenCommands !== null) {
            hiddenHelpCommands = helpCommands.filter(command => !hiddenCommandsPattern().test(command));
            robot.logger.debug("Help Plus: Filtering Hidden Commands... ");  
        }
        else {
            hiddenHelpCommands = helpCommands;
            robot.logger.debug("Help Plus: No Hidden Commands... ");  
        }
        
        // replace hubot with botname
        var repHelpCommands = hiddenHelpCommands.map((command) => {
            if (robotName.length === 1) {
                return command.replace(/^hubot\s*/i, robotName);
            }
            return command.replace(/^hubot/i, robotName);
        });

        // sort the final help command set
        var finalHelpCommands = repHelpCommands.sort();
    
        return finalHelpCommands;
    };

    // listen for "hubot help <query>"
    robot.respond(/help(?:\s+(.*))?$/i, (msg) => {
    
        // get the command list
        let cmds = doHelp();
        var filter = msg.match[1];
        var paginate = 0;
        
        if (filter) {
            
            // if is not a number do a query
            if (isNaN(filter)) {             
                cmds = cmds.filter(cmd => cmd.match(new RegExp(filter, 'i')))
                if (cmds.length === 0) {
                    msg.send("No available commands match: " + filter);
                    return;
                }
            }
            else {
                // method for pagination of overlong helps  
                paginate = filter;
            }
        }

        var emit;
        
        // pagination help
        if (paginate > 0) {  
        
            var cut = cmds.slice(paginate*10 - 10, paginate*10); 
            emit = cut.join('\n');
            
        }
        
        // normal help
        else {

            emit = cmds.join('\n');
        
            // temporary if the help is too long just don't let it print
            if (emit.length >=2000) {

                //trim the string to the maximum length
                var trimmedString = emit.substr(0, 1900);

                //re-trim if we are in the middle of a sentence so the help doesn't get cut off
                trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf("\n")));   
                
                emit = trimmedString + "\n... more help available, try " + robot.name + " help <page number>";
               
            }
            
        }
        
        if (emit.length == 0) {
            emit = "No help found...";
        }
              
        // reply in private, check adapter for special cases like slack and discord
        if (replyInPrivate && (robot.adapterName === 'slack' || robot.adapterName === 'discord' || robot.adapterName === 'discobot') && msg.message && msg.message.user && msg.message.user.id) {
            msg.reply('replied to you in private!');
            return robot.send({ room: msg.message.user.id }, emit);
        } 
        else if (replyInPrivate && msg.message && msg.message.user && msg.message.user.name) {
            msg.reply('replied to you in private!');
            return robot.send({ room: msg.message.user.name }, emit);
        } 
        else {
            return msg.send(emit);
        }
    })

    // display the help on the bot webpage
    if (process.env.HUBOT_HELP_DISABLE_HTTP == null) {

        // setup web url  
        return robot.router.get("/" + robot.name + "/help", (req, res) => {

            // get the available commands
            let cmds = doHelp();
            cmds = cmds.map(cmd => cmd.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

            if (req.query.q != null) {
                cmds = cmds.filter(cmd => cmd.match(new RegExp(req.query.q, 'i')));
            }

            let emit = `<p>${cmds.join('</p><p>')}</p>`;

            emit = emit.replace(new RegExp(`${robot.name}`, 'ig'), `<b>${robot.name}</b>`);

            res.setHeader('content-type', 'text/html');
            res.end(helpContents(robot.name, emit));
            
        })
        
    }
  
}
