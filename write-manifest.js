const fs = require('fs');
const version = require('./package.json').version;

const config = {
	id: 'multilinks',
	name: 'Multilinks',
	src: `https://unpkg.com/contentful-multilinks@${version}`,
	fieldTypes: ['Object'],
};

fs.writeFileSync('./extension.json', JSON.stringify(config, null, '\t') + '\n');
