/**
 * 
 */


const cheerio = require('cheerio'),
	defRules = require('./rules.json'),
	Transform = require('stream').Transform,
	util = require('util');


const seo = module.exports = function(options) { 
	let cio, _res = [], _rules = defRules, _ = this;
	options = options || {};

    if (!(this instanceof seo))
        return new Parser(options);

    let opts = Object.assign(options, {
        objectMode: true
    });

    Transform.call(this, options);

    this.cache = '';
    this._transform = (data, encoding, callback) => {
    	// console.log(data);

    	this.cache += data;
    	if(data.indexOf('</html>') !== -1) {
    		callback();
    	}
    };

    this._flush = (callback) => {
    	callback(null, _.load(_.cache).run().output(true));
    };

	/**
	 * load Html
	 *
	 *  to do: stream
	 * 
	 * @return 
	 */
	this.load = (content) => {
		cio = cheerio.load(content);
		return this;
	};

	/**
	 * set sep rules
	 * 
	 * @param  array  opt 
	 * @return 
	 */
	this.setRule = (opt) => {
		_rules = opt;
		return this;
	};


	/**
	 * run rules;
	 * 
	 * @return {[type]} [description]
	 */
	this.run = () => {
		_rules.forEach((e, i) => {
			process(e);
		});
		return this;
	};

	/**
	 * processer
	 * 
	 */
	this.processer = {
		hasNotAttr : (node,attrName) => {
			if(!node.length) {
				return false;
			}
			let doms = [];
			node.toArray().forEach((d, i) => {
				if(!d.attribs[attrName]) { // empty ?
					doms.push(JSON.stringify(d.attribs));
				}
			});
			return doms.length? doms : false;
		},
		haveChild : (node,childName) => {
			if(!node.length) {
				return false;
			}
			return (node.children(childName).length === 0)? true : false;
		},
		gt : (node,num) => {
			return node.length > num;
		},
		lt : (node,num) => {
			return node.length < num;
		},
		adsence : (node) => {
			return (node.length === 0)? true: false;
		}
	};

	/**
	 * output message processer
	 * 
	 */
	this.outputProcesser = {
		hasNotAttr : (info, rule) => {
			return info.length + ' without ' + rule[1];
		},
		haveChild : (info, rule) => {
			return ' have no ' + rule[1];
		},
		gt : (info, rule) => {
			return ' more then ' + rule[1];
		},
		lt : (info, rule) => {
			return 'less then ' + rule[1];
		},
		adsence : (info, rule) => {
			return 'not exist in HTML ';
		}	
	};

	/**
	 * process rule;
	 * 
	 */
	var process = (ruleNode) => {
		if(typeof(ruleNode.tag) !== 'string') {
			console.error(ruleNode);
			return;
		}
		if(!Array.isArray(ruleNode.rules)) {
			console.error(ruleNode);
			return ;
		}
		let rule = ruleNode.rules, 
			tagName = ruleNode.tag, 
			node = cio(tagName)
			result = {tag: tagName, out:[]};

		rule.forEach((n,i) => {
			if(!n || !n[0]) {
				return;
			}
			let r = JSON.stringify(n);
			let fname = n.shift();
			n.unshift(node);
			
			let o = _.processer[fname].apply(this, n);
			if(!o) {
				return;
			}
			result.out.push({rule:r, out:o});

		});

		if(result.out.length > 0) {
			_res.push(result);
		}		
	};

	/**
	 * output result
	 *
	 * write stream; console output; 
	 * 
	 * @return string, buffer, console;
	 */
	this.output = (stream) => {
		let wmesg = '';
		stream = stream || false;
		_res.forEach((n,i) => {
			let mesg = 'There is ' + n.tag + ' ';

			n.out.forEach((f,j) => {
				let op = JSON.parse(f.rule);
				let fname = op[0];
				
				if(typeof _.outputProcesser[fname] !== 'function') {
					return;
				}
				if(i > 1) {
					mesg += "\t";
				}
				mesg += _.outputProcesser[fname](f.out, op) + "\n";
			});

			if(!stream) {
				console.log(mesg);
			} else {
				wmesg += mesg;
			}
		});
		return wmesg;
	};
};


util.inherits(seo, Transform);