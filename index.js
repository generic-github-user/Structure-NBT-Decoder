var fs = require('fs'),
    nbt = require('prismarine-nbt'),
	readline = require('readline').createInterface({
		input: process.stdin,
		output: process.stdout
	});

function simplifyJSON(data) {
	var size = data.size.value.value;
	var box = new Array(size[1]).fill(0).map(
			(i) => new Array(size[0]).fill(0).map(
				(j) => new Array(size[2]).fill('minecraft:air')
			)
		);
	data.blocks.value.value.forEach((block) => {
		var pos = block.pos.value.value;
		box[pos[1]][pos[0]][pos[2]] = data.palette.value.value[block.state.value].Name.value;
	});
	return box;
}
	
readline.question('Name of .nbt file to open: ', (name) => {
	fs.readFile('./' + name + '.nbt', function(error, data) {
		if (error) throw error;

		nbt.parse(data, function(error, data) {
			var dir = './' + name;
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			
			fs.writeFile(name + '/' + name + '-original.json', JSON.stringify(data.value, null, "\t"), (err) => {
				if (err) throw err;
			});
			fs.writeFile(name + '/' + name + '-simplified.json', JSON.stringify(simplifyJSON(data.value), null, "\t"), (err) => {
				if (err) throw err;
			});
			
			console.log('Conversion successful!');
		});
	});
	readline.close();
});