/**
 *
 * 
 * -i rules ini
 * -r rules json
 * -f file 
 * -u url
 */



if(require.main != module) {
	exports = module.exports = require('./lib/seo');
	return;
} 

// cli mode

var yargv = require('yargs')
	.usage('seo task')
	.example('$0 -j rules.json -f index.html ')
	.alias('i', 'ini').describe('i', 'set rules by ini')
	.alias('j', 'json').describe('j', 'set rules by json')
	.alias('f', 'file').describe('f', 'check seo rules on file')
	.alias('u', 'url').describe('u', 'check seo rules on url')
	.alias('o', 'output').describe('o', 'save output to file')
	.help('h').alias('h', 'help');

var argv = yargv.argv;
const seoObj = require('./lib/seo');
const seo = new seoObj();

seo.processer.adsence = function(node){
	return (node.length === 0)? true: false;
};

if(!argv.file && !argv.url) {
	yargv.showHelp();
	process.exit(0);
}

if(argv.file && argv.url) {
	console.log("will use file as major \n");
}

const output = argv.output? fs.createWriteStream(argv.output) : process.stdout;

if(argv.file) {
	var fs = require('fs');
	if(!fs.existsSync(argv.file)) {
		process.exit(0);
	}

	fs.createReadStream(argv.file, {
		flags: 'r',  
		defaultEncoding: 'utf8'
	}).pipe(seo).pipe(output);

} else if (argv.url) {
	var got = require('got');
	if(!/^http(s):\/\/[\w\.]+/.test(argv.url)) {
		process.exit(0);
	}

	got.stream(argv.url).pipe(seo).pipe(output);
}



