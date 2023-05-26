const patterns = {
	portableText: (`
		_type == "block" => {
			..., 
			children[] {
				...,
				_type == "entity" => @-> {
					name,
					url,
				},
				_type == "project" => @-> {
					title,
					"address": address.current,
				},
				_type == "press" => @-> {
					url,
					title,
				},
			},
		},
	`),
	imageMetadata: (`
		url,
		"height": metadata.dimensions.height,
		"width": metadata.dimensions.width,
		"isOpaque": metadata.isOpaque,
		"lqip": metadata.lqip,
	`),
	imagePalette: (`
		"palette": metadata.palette.dominant {
			background,
			foreground,
		},
	`),
	gradient: (`
		colours {
			top,
			bottom,
			text,
		},
	`),
	projectFilters: (`
		isPublic == true
		&& defined(address.current)
		&& (
			count(array::compact(looks[]->image.asset._ref)) >= 1
			|| count(array::compact(lookbook[].asset._ref)) >= 1
			|| count(array::compact(lookbook[].url)) >= 1
		)
	`),
	press: (`
		url,
		title,
		publisher,
		datePublished,
	`),
}

module.exports = patterns