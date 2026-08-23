const path = require('path');
const fs = require('node:fs');
const core = require('@actions/core');

// escapeRegExp :: string => string
// escape all characters with special meanings in regexp
const escapeRegExp = (s) =>
	s.replace(/[/\-^$*+?.()|[\]{}]/g, "\\\\$&");

// variable :: string => RegExp
// create regex to match ${{ key }}
const variable = (key) =>
	new RegExp("\\${{\\s*?" + key + "\\s*?}}", "g");

// templatePath :: string
const templatePath = path.join(__dirname, "gcc_matcher.jsontemplate");

// matcherPath :: string
const outputPath = path.join(__dirname, "gcc_matcher.json");

// rootdir :: string
const rootdir = core.getInput('build-directory', {required: false});

// skipdirs :: string[]
const skipdirs = core.getMultilineInput('skip-directories', {required: false});

// parse :: string => string => Error | null
const parse = (templatePath) => (matcherPath) => {
	const content = fs.readFileSync(templatePath, 'utf-8');

    const parsed = content.replace(variable("BASE"), escapeRegExp(rootdir));

	for(let i = 0; i < skipdirs.length; i++)
  		skipdirs[i].value = escapeRegExp(skipdirs[i]);
	
    const parsed2 = parsed.replace(variable("SKIP"), skipdirs.join("|"));
		
    fs.writeFileSync(matcherPath, parsed2);

	console.log('::add-matcher::' + matcherPath.replaceAll('\\', '\\\\'));
}

// main:
try {
	parse(templatePath)(outputPath);
} catch (err) {
	core.setFailed(`Action failed with error ${err}`)
}


// for testing
exports.escapeRegExp = escapeRegExp
exports.variable = variable;
