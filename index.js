//                        \│/  ╦ ╦╔═╗╦═╗╔╗╔╦╔╗╔╔═╗  \│/
//      ─────────────────── ─  ║║║╠═╣╠╦╝║║║║║║║║ ╦  ─ ───────────────────
//                        /│\  ╚╩╝╩ ╩╩╚═╝╚╝╩╝╚╝╚═╝  /│\
//      ┬ ┬┌┐┌┌┬┐┌─┐┌─┐┬ ┬┌┬┐┌─┐┌┐┌┌┬┐┌─┐┌┬┐  ┌─┐┌─┐┬┌─┐  ┬┌┐┌  ┬ ┬┌─┐┌─┐
//      │ ││││ │││ ││  │ ││││├┤ │││ │ ├┤  ││  ├─┤├─┘│└─┐  ││││  │ │└─┐├┤
//      └─┘┘└┘─┴┘└─┘└─┘└─┘┴ ┴└─┘┘└┘ ┴ └─┘─┴┘  ┴ ┴┴  ┴└─┘  ┴┘└┘  └─┘└─┘└─┘
// ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
// WARNING: THIS HOOK USES PRIVATE, UNDOCUMENTED APIs THAT COULD CHANGE AT ANY TIME
// ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
// This hook uses an undocumented, private Sails core method, you should not copy
// or reuse code because future releases of Sails--even patch releases--may cause
// it to stop functioning, do not turn this hook on in production!
/* eslint-disable no-unused-vars, consistent-this */

const { runEslint, runTslint } = require('lint-js');

module.exports = function (sails) {
  return {
    /**
     * Default configuration
     *
     * We do this in a function since the configuration key for
     * the hook is itself configurable, so we can't just return
     * an object.
     */
    defaults: {
      __configKey__: {
        // Turn eslint on/off
        runEsLint: true,
        // Turn eslint on/off
        runTsLint: true,
        //use polling to watch file changes
        //slower but sometimes needed for VM environments
        usePolling: false,
        // choose which formatter to use
        // formatter: path.join(__dirname, "pretty-formatter"),
        // decide which folders/dirs should be checked
        dirs: [
          path.resolve(sails.config.appPath, 'config'),
          path.resolve(sails.config.appPath, 'api'),
        ],
        // Ignored paths, passed to anymatch
        // String to be directly matched, string with glob patterns,
        // regular expression test, function
        // or an array of any number and mix of these types
        ignored: [],
      },
    },

    configure: function () {
      sails.config[this.configKey].runEsLint =
        typeof sails.config[this.configKey].runEsLint !== 'undefined'
          ? // If an explicit value for the "runEsLint" config option is set, use it
            sails.config[this.configKey].runEsLint
          : // Otherwise turn off in production environment, on for all others
            sails.config.environment != 'production';
    },

    /**
     * Initialize the hook
     * @param  {Function} cb Callback for when we're done initializing
     */
    initialize: function (cb) {
      var self = this;

      // check for global config and reassign configKey
      if (sails.config.eslint && sails.config.eslint.dirs)
        this.configKey = 'eslint';

      var dirs = sails.config[this.configKey].dirs || ['config', 'api'];
      var formatDirs = [];

      if (sails.config[this.configKey].dirs) {
        sails.config[this.configKey].dirs.forEach(function (item) {
          formatDirs.push('path: ' + item.replace(process.cwd(), ''));
        });
        paths = chalk.yellow('\n' + formatDirs.join('\n'));
      }

      // Run First eslint Test
      sails.log.verbose('ESlint watching', sails.config[this.configKey].dirs);
      sails.log.info('ESlint watching...'); //, paths);

      const tsLintOptions = sails.config[this.configKey].tslintOptions || {};
      const esLintOptions = sails.config[this.configKey].eslintOptions || {};

      if (process.env.NODE_ENV !== 'production') {
        sails.on('lifted', () => {
          if (sails.config[this.configKey].runEsLint) {
            runEslint(dirs, esLintOptions);
          }
          if (sails.config[this.configKey].runTsLint) {
            runTslint(dirs, tsLintOptions);
          }
        });
      }
      return cb();
    },
  };
};
