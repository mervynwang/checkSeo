# task_seo


```
seo task

Options:
  --version     Show version number                                    [boolean]
  -i, --ini     set rules by ini
  -j, --json    set rules by json
  -f, --file    check seo rules on file
  -u, --url     check seo rules on url
  -o, --output  save output to file
  -h, --help    Show help                                              [boolean]

Examples:
  index.js -j rules.json -f index.html

```


## demo create processer; 

```
const seoObj = require('./lib/seo');
const seo = new seoObj();

/**
 * processer  
 *
 * @param  object node cheerio object;
 * @return boolean/mix 
 */
seo.processer.adsence = function(node){
	return (node.length === 0)? true: false;
};

/**
 *  output processer 
 *
 * @param  mix  info processer return;
 * @param  object rule you rule
 * @return string  for output;
 */
seo.outputProcesser.adsence = function(info, rule){
	return 'not exist in HTML ';
}

```