// Import requirements
var fs = require('fs'),
    nbt = require('prismarine-nbt'),
	// Prompting
	readline = require('readline').createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
require('./blocks.js');
// console.log(blocks);
	
// Convert JSON-structured structure data to a simplified version with only an array of blocks
function simplifyJSON(data) {
	// Get size information from decoded NBT data
	var size = data.size.value.value;
	// Create three-dimensional array with dimensions matching structure
	var box = new Array(size[1]).fill(0).map(
			(i) => new Array(size[0]).fill(0).map(
				(j) => new Array(size[2]).fill('minecraft:air')
			)
		);
	// Loop through all non-air blocks in structure
	data.blocks.value.value.forEach((block) => {
		var pos = block.pos.value.value;
		// Set name of block in correct position
		box[pos[1]][pos[0]][pos[2]] = data.palette.value.value[block.state.value].Name.value;
	});
	// Return generated array
	return box;
}

// Convert data into an object containing an array where each number corresponds to a block
function valueEncodeSimple(data) {
	var output = {
		'blocks': [],
		'palette': []
	};
	output.blocks = simplifyJSON(data);
	for (var i = 0; i < output.blocks.length; i ++) {
		for (var j = 0; j < output.blocks[i].length; j ++) {
			for (var k = 0; k < output.blocks[i][j].length; k ++) {
				var block = output.blocks[i][j][k];
				if (!output.palette.includes(block)) {
					output.palette.push(block);
				}
				output.blocks[i][j][k] = output.palette.indexOf(block);
			}
		}
	}
	return output;
}

// It is essentially a simplification of the default JSON data generated when the .nbt file is parsed
function valueEncodeComplex(data) {
	var output = {
		'blocks': [],
		'palette': []
	};
	
	var size = data.size.value.value;
	var box = new Array(size[1]).fill(0).map(
			(i) => new Array(size[0]).fill(0).map(
				(j) => new Array(size[2]).fill(0)
			)
		);
	output.blocks = box;
	
	data.blocks.value.value.forEach((block) => {
		var pos = block.pos.value.value;
		output.blocks[pos[1]][pos[0]][pos[2]] = block.state.value;
	});
	data.palette.value.value.forEach((state) => {
		output.palette.push({
			'name': state.Name.value,
			'properties': state.Properties ? state.Properties.value : {}
		});
	});
	
	return output;
}

function allBlockEncoding(data) {
	var output = {
		'blocks': [],
		'palette': blocks
	};
	output.blocks = simplifyJSON(data);
	for (var i = 0; i < output.blocks.length; i ++) {
		for (var j = 0; j < output.blocks[i].length; j ++) {
			for (var k = 0; k < output.blocks[i][j].length; k ++) {
				var block = output.blocks[i][j][k];
				output.blocks[i][j][k] = output.palette.indexOf(block);
			}
		}
	}
	return output;
}

readline.question('Name of .nbt file to open: ', (name) => {
	fs.readFile('./' + name + '.nbt', function(error, data) {
		// Error handling
		if (error) throw error;

		nbt.parse(data, function(error, data) {
			// If directory does not exist, create it
			var dir = './' + name;
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			
			// Create parsed JSON file or original NBT data
			fs.writeFile(name + '/' + name + '-original.json', JSON.stringify(data.value, null, "\t"), (err) => {
				if (err) throw err;
			});
			// Create simplified array of blocks
			fs.writeFile(name + '/' + name + '-simplified.json', JSON.stringify(simplifyJSON(data.value), null, "\t"), (err) => {
				if (err) throw err;
			});
			// Create array of blocks by ID
			fs.writeFile(name + '/' + name + '-values_simple.json', JSON.stringify(valueEncodeSimple(data.value), null, "\t"), (err) => {
				if (err) throw err;
			});
			// Encode all block states and types as separate numbers
			fs.writeFile(name + '/' + name + '-values_complex.json', JSON.stringify(valueEncodeComplex(data.value), null, "\t"), (err) => {
				if (err) throw err;
			});
			// Global block ID encoding
			fs.writeFile(name + '/' + name + '-global.json', JSON.stringify(allBlockEncoding(data.value), null, "\t"), (err) => {
				if (err) throw err;
			});
			
			// Log success message
			console.log('Conversion successful!');
		});
	});
	// Close prompts
	readline.close();
});