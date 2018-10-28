/**
 * Show and hide elements based on stage of conversion
 * 
 * @param stage		Stage to change to
 */
function changeStage(stage)
{
	var stages = ["upload", "convert", "download"];                         // Class names of stages
	var stageMsg = ["","","<a onclick='load();'>Convert another flag</a>"]; // Messages to display with stages
	for (var ind = 0; ind < stages.length; ind++)
	{
		// Show stage elements if stage matches passed stage
		if (stages[ind] == stage)
		{
			document.getElementById(stages[ind]).style.display = 'block';
			document.getElementById("message").innerHTML = stageMsg[ind];
		}
		// Hide stage elements if stage does not matches passed stage
		else
		{
			document.getElementById(stages[ind]).style.display = 'none';
		}
	}
}

/**
 * Set page elements
 */
function load()
{
	changeStage("upload");
	// Remove generated file
	var newFileElement = document.getElementById("newfile");
	if (newFileElement != null)
		document.body.removeChild(newFileElement);
	// Parse file if file uploaded
	var fileInput = document.getElementById("file-input");
	fileInput.onchange = function(event)
	{
		changeStage("convert");
		// Parse file into array of objects
		parse(fileInput.files[0]);
	}
}

/**
 * Upload flag to convert and parse into multidimentional array
 * 
 * @param file	Uploaded file
 */
function parse(file, callback)
{
	// Fail if file is larger than 256KB
	if (file.size > 256 * 1024)
	{
		document.getElementById("message").innerHTML = "File is too large! Maximum is 256KB.<br><a onclick='load();'>Restart</a>";
		return []
	}
	// Fail if file is not a .flag
	else if (file.name.substr(file.name.lastIndexOf('.') + 1) != "flag")
	{
		document.getElementById("message").innerHTML = "File is not a .flag!<br><a onclick='load();'>Restart</a>";
		return []
	}
	
	// Parse file as array of objects
	var flagObjects = [];          // Objects
	var flagObject = [];           // Object
	var reader = new FileReader(); // File reader
	reader.onload = function()
	{
		// Iterate over each line in file
		var lines = this.result.split("\r\n");
		for (var line = 0; line < lines.length; line++)
		{
			// Add object to array of objects
			if (lines[line] == "")
			{
				flagObjects.push(flagObject);
				flagObject = [];
			}
			// Add line as object property
			else
			{
				flagObject.push(lines[line]);
			}
		}
		
		// Convert objects
		flagObjects = convert(flagObjects);
		// Encode objects as new file
		encode(flagObjects, file.name);
		changeStage("download");
	};
	reader.readAsText(file);
}

/**
 * Replace FlagMaker1 object values in with FlagMaker2 object values
 * 
 * @param flagObjects	Array of flag objects
 */
function convert(flagObjects)
{
	// Iterate over each object in flag
	for (var objInd = 0; objInd < flagObjects.length; objInd++)
	{
		var obj = flagObjects[objInd];      // Object
		var objName = obj[1].split("=")[1]; // Object name
		// Modify object if it is overlay type
		if (obj[0] == "overlay")
		{
			// Set new property names and values
			if (["box", "diamond", "ellipse"].indexOf(objName) > -1)
			{
				var newPropNames = ["Color","X","Y","Width","Height"];
			}
			else if (["border","fimbriation backward","fimbriation forward","half saltire","saltire"].indexOf(objName) > -1)
			{
				var newPropNames = ["Color","Thickness"];
			}
			else if (objName == "checkerboard")
			{
				var newPropNames = ["Color","X","Y","Width","Height","CountX","CountY"];
			}
			else if (objName == "cross")
			{
				var newPropNames = ["Color","X","Y","Thickness"];
			}
			else if (objName == "flag")
			{
				var newPropNames = ["path","X","Y","Width","Height"];
				// Prompt for new flag path
				document.getElementById("message").innerHTML = "A flag overlay has been detected.<br>Please follow the prompt.";
				var valOld = obj[2].split("=")[1];
				var msg = "A flag overlay has been detected.\nThis MUST be compatible with FlagMaker2.\n\nPlease either click OK to keep current flag, or enter a new one.\nNOTE: Overlays can have relative paths, not just absolute.";
				var valNew = prompt(msg, valOld);
				if (valNew == null)
					valNew = valOld;
				obj[2] = obj[2].split("=")[0] + "=" + valNew;
			}
			else if (objName == "half ellipse")
			{
				var newPropNames = ["Color","X","Y","Width","Height","Rotation"];
			}
			else if (objName == "image")
			{
				var newPropNames = ["path","X","Y","Width","Height"];
				// Prompt for new image path
				document.getElementById("message").innerHTML = "An image has been detected.<br>Please follow the prompt.";
				var valOld = obj[2].split("=")[1];
				var msg = "An image has been detected.\n\nPlease either click OK to keep current image, or enter a new one.\nNOTE: Images can have relative paths, not just absolute.";
				var valNew = prompt(msg, valOld);
				if (valNew == null)
					valNew = valOld;
				obj[2] = obj[2].split("=")[0] + "=" + valNew;
			}
			else if (objName == "line")
			{
				var newPropNames = ["Color","X1","Y1","X2","Y2","Thickness"];
			}
			else if (objName == "line horizontal")
			{
				var newPropNames = ["Color","Y","Thickness"];
			}
			else if (objName == "line vertical")
			{
				var newPropNames = ["Color","X","Thickness"];
			}
			else if (objName == "pall")
			{
				var newPropNames = ["Color","X","Thickness"];
				// Convert thickness value to new method
			}
			else if (objName == "quadrilateral")
			{
				var newPropNames = ["Color","X1","Y1","X2","Y2","X3","Y3","X4","Y4"];
			}
			else if (objName == "rays")
			{
				var newPropNames = ["Color","X","Y","Count"];
			}
			else if (objName == "repeater lateral")
			{
				var newPropNames = ["X","Y","Width","Height","CountX","CountY"];
			}
			else if (objName == "repeater radial")
			{
				var newPropNames = ["X","Y","Radius","Count","Rotate"];
				// Convert rotate value from number to boolean
				var valOld = obj[7].split("=")[1];
				if (valOld <= Number(flagObjects[0][1].split(":")[1]) / 2)
					var valNew = "false";
				else
					var valNew = "true";
				obj[7] = obj[7].split("=")[0] + "=" + valNew;
			}
			else if (objName == "ring")
			{
				var newPropNames = ["Color","X","Y","Width","Height","Size"];
			}
			else if (objName == "transformer")
			{
				var newPropNames = ["X","Y","SkewX","SkewY","Width","Height","Rotation"];
			}
			else if (objName == "triangle")
			{
				var newPropNames = ["Color","X1","Y1","X2","Y2","X3","Y3"];
			}
			else
			{
				var newPropNames = ["Color","X","Y","Size","Rotation","Stroke","StrokeCurved","StrokeColor"];
				// Convert StrokeCurved value from number to boolean
				var valOld = obj[8].split("=")[1];
				if (valOld == 0)
					var valNew = "false";
				else
					var valNew = "true";
				obj[8] = obj[8].split("=")[0] + "=" + valNew;
			}

			// Remove colour property for certain objects
			if (["flag","image","repeater lateral","repeater radial","transformer"].indexOf(objName) > -1)
			{
				if (obj[2].split("=")[0] == "color")
					obj.splice(2,1);
				else if (obj[3].split("=")[0] == "color")
					obj.splice(3,1);
			}

			// Rename each object property
			var propIndSub = 0;
			for (var propInd = 0; propInd < obj.length; propInd++)
			{
				var propName = obj[propInd].split("=")[0];  // Property name
				var propValue = obj[propInd].split("=")[1]; // Property value
				// Skip if property is object type title
				if (["overlay","type"].indexOf(propName) > -1)
					propIndSub++;
				// Rename object property
				else
					obj[propInd] = newPropNames[propInd - propIndSub] + "=" + propValue;
			}

			// Add new properties to object
			if (objName == "rays")
				obj.push("Rotation=0");
		}
	}
	
	return flagObjects;
}

/**
 * Encode converted objects as new file
 * 
 * @param flagObjects	Array of flag objects
 * @param fileName		Name of uploaded file
 */
function encode(flagObjects, fileName)
{
	var string = ""; // String to write objects to
	// Iterate over each object in flag
	for (var objectInd = 0; objectInd < flagObjects.length; objectInd++)
	{
		var object = flagObjects[objectInd]; // Object
		// Iterate over each property of object
		for (var propertyInd = 0; propertyInd < object.length; propertyInd++)
		{
			// Write object type title to string as empty line
			if (["overlay","division"].indexOf(object[propertyInd]) > -1)
				string = string.concat("\n");
			// Write object property to string
			else
				string = string.concat(object[propertyInd] + "\n");
		}
	}
	
	// Encode string as file and add to invisible download link
	var element = document.createElement('a');
	element.id = "newfile";
	element.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(string));
	element.setAttribute('download', "[FM2]" + fileName);
	element.style.display = 'none';
	document.body.appendChild(element);
}

/**
 * Download converted flag
 */
function download()
{
	document.getElementById("newfile").click();
}
