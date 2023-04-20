const client = require("../sanity.client")

module.exports = async function () {
	const targetProjects = await client.fetch(`
	array::compact(*[_type == "page" && website == "jadtoghuj.com" && defined(contents)] {
		contents[] {
			_type == "lookBlock" => {
				"projects": project._ref
			},
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
		"contributions": contributors[] {
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
				"isOpaque": metadata.isOpaque,
				"lqip": metadata.lqip,
				"palette": metadata.palette.dominant {
					background,
					foreground,
				},
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
			"type": _type,
			_type == "image" => {
				asset -> {
					url,
					"height": metadata.dimensions.height,
					"width": metadata.dimensions.width,
					"isOpaque": metadata.isOpaque,
					"lqip": metadata.lqip,
				},
			},
			_type == "video" => {
				url,
			},
			"looks": looks[]._ref,
		},
		lookbook[0]._type == "image" => {
			"image0": lookbook[0].asset-> {
				url,
				"palette": metadata.palette.dominant {
					background,
					foreground,
				},
			},
		},
		lookbook[0]._type == "video" => {
			"video0": lookbook[0] {
				url,
			},
		},
	}
	`
	const params = {
		targetProjects: targetProjects,
	}
	return await client.fetch(query, params)
}