const { reporters } = require('mocha');

module.exports = class MultiReporter extends reporters.Base {
	constructor(runner, options) {
		super(runner, options, [
			new reporters.Spec(runner, { reporterOption: options.reporterOption?.specReporterOptions }),
			new reporters.JSON(runner, { reporterOption: options.reporterOption?.jsonReporterOptions })
		]);
	}
};
