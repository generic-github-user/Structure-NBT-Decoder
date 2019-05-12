// Import requirements
var fs = require('fs'),
    nbt = require('prismarine-nbt'),
	// Prompting
	readline = require('readline').createInterface({
		input: process.stdin,
		output: process.stdout
	});

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
			
			// Log success message
			console.log('Conversion successful!');
		});
	});
	// Close prompts
	readline.close();
});