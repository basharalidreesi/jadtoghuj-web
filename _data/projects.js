const client = require("../sanity.client")

module.exports = async function () {
	const targetProjects = await client.fetch(`
	array::compact(*[_type == "page" && website == "jadtoghuj.com" && defined(contents)] {
		contents[] {
			_type == "projectBlock" => {
				"projects": projects[]._ref
			},
			_type == "categoryBlock" => {
				"projects": *[_type == "project" && references(categories[]._ref) && isPublic == true && defined(lookbook[]) && defined(address.current)]._id,
			},
			// _type == "campaignBlock" => {},
		}
	}.contents[].projects[])
	`, {})
	const query = `
	*[_type == "project" && _id in $targetProjects && isPublic == true && defined(lookbook[]) && defined(address.current)] {
		title,
		description[] {
			_type == "block" => {
				..., 
				children[] {
					...,
					_type == "person" => {
						...,
						"name": @->.name,
						"url": @->.url,
					},
				},
			},
		},
		year,
		"address": address.current,
		"categories": categories[]->title,
		contributors[] {
			role,
			persons[] -> {
				name,
				url,
			},
		},
		looks[] -> {
			"id": _id,
			title,
			"display": display.asset -> {
				url,
				"height": metadata.dimensions.height,
				"width": metadata.dimensions.width,
				"extension": metadata.extension,
				"lqip": metadata.lqip,
			},
			description[] {
				_type == "block" => {
					..., 
					children[] {
						...,
						_type == "person" => {
							...,
							"name": @->.name,
							"url": @->.url,
						},
					},
				},
			},
		},
		lookbook[] {
			asset -> {
				url,
				"height": metadata.dimensions.height,
				"width": metadata.dimensions.width,
				"extension": metadata.extension,
				"lqip": metadata.lqip,
			},
			"looks": looks[]._ref,
		},
		"image0": lookbook[0].asset-> {
			url,
			"palette": metadata.palette.dominant {
				background,
				foreground,
			},
		},
	}
	`
	const params = {
		targetProjects: targetProjects,
	}
	return await client.fetch(query, params)
}