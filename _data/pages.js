const client = require("../sanity.client")

module.exports = async function () {
	const query = `
	*[_type == "page" && website == "jadtoghuj.com"] {
		title,
		"address": address.current,
		defined(contents) => {
			contents[] {
				"type": _type,
				_type == "textBlock" => {
					text[] {
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
				_type == "imageBlock" => {
					"image": asset -> {
						url,
						"height": metadata.dimensions.height,
						"width": metadata.dimensions.width,
						"isOpaque": metadata.isOpaque,
						"lqip": metadata.lqip,
					},
				},
				_type == "lookBlock" => {
					"projects": [project -> {
						(isPublic == true && defined(address.current)) => {
							title,
							"address": address.current,
							lookbook[0]._type == "image" => {
								"image0": lookbook[0].asset -> {
									"palette": metadata.palette.dominant {
										background,
										foreground,
									},
								},
							},
							"looks": array::compact(^.looks[]->display.asset -> {
								url,
								"height": metadata.dimensions.height,
								"width": metadata.dimensions.width,
								"isOpaque": metadata.isOpaque,
								"lqip": metadata.lqip,
							}),
						},
					}],
				},
				_type == "projectBlock" => {
					"projects": projects[] -> {
						(isPublic == true && defined(address.current)) => {
							title,
							"address": address.current,
							lookbook[0]._type == "image" => {
								"image0": lookbook[0].asset -> {
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
							},
							lookbook[0]._type == "video" => {
								"video0": lookbook[0] {
									url,
								},
							},
							"looks": array::compact(looks[] -> {
								_id in array::compact(^.^.^.contents[].looks[]._ref) => {
									"isRepeated": true
								},
								"url": display.asset->url,
								"height": display.asset->metadata.dimensions.height,
								"width": display.asset->metadata.dimensions.width,
								"isOpaque": display.asset->metadata.isOpaque,
								"lqip": display.asset->metadata.lqip,
							}),
						},
					},
				},
				_type == "categoryBlock" => {
					"projects": *[_type == "project" && references(^.categories[]._ref) && isPublic == true && defined(address.current)] {
						_id in array::compact(^.^.contents[].projects[]._ref) => {
							"isRepeated": true,
							lookbook[1]._type == "image" => {
								"image1": lookbook[1].asset -> {
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
							},
							lookbook[1]._type == "video" => {
								"video1": lookbook[1] {
									url,
								},
							},
						},
						title,
						year,
						"address": address.current,
						lookbook[0]._type == "image" => {
							"image0": lookbook[0].asset -> {
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
						},
						lookbook[0]._type == "video" => {
							"video0": lookbook[0] {
								url,
							},
						},
						"looks": array::compact(looks[] -> {
							_id in array::compact(^.^.^.contents[].looks[]._ref) => {
								"isRepeated": true
							},
							"url": display.asset->url,
							"height": display.asset->metadata.dimensions.height,
							"width": display.asset->metadata.dimensions.width,
							"isOpaque": display.asset->metadata.isOpaque,
							"lqip": display.asset->metadata.lqip,
						}),
					} | order(year desc, lower(title) asc),
				},
				// _type == "campaignBlock" => {}
			},
		},
	}
	`
	const params = {}
	return await client.fetch(query, params)
}