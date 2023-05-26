const client = require("../sanity.client")
const patterns = require("./patterns.js")

module.exports = async function () {
	const query = (`
	*[_type == "page" && target == "internal"] {
		title,
		"address": address.current,
		content[] {
			"type": _type,
			"key": _key,
			_type == "textBlock" => {
				text[] {
					${patterns.portableText}
				},
			},
			_type == "imageBlock" => {
				"image": asset -> {
					${patterns.imageMetadata}
				},
			},
			_type == "pressBlock" => {
				press[] -> {
					${patterns.press}
					"image": image.asset -> {
						${patterns.imageMetadata}
					},
				}
			},
			_type == "pageBlock" => {
				pages[] -> {
					title,
					"address": address.current,
				},
			},
			_type == "lookBlock" => {
				"projects": [project -> {
					${patterns.projectFilters} => {
						"id": _id,
						title,
						"address": address.current,
						"looks": array::compact(^.looks[]->image.asset -> {
							${patterns.imageMetadata}
						}),
						hasCustomColour,
						hasCustomColour == true => {
							colour,
						},
						hasCustomColour != true && lookbook[0]._type == "image" => {
							"image0": lookbook[0].asset -> {
								${patterns.imagePalette}
							},
						},
					},
				}],
			},
			_type == "projectBlock" => {
				"projects": projects[] -> {
					${patterns.projectFilters} => {
						"id": _id,
						title,
						"address": address.current,
						"looks": array::compact(looks[] -> {
							_id in array::compact(^.^.^.content[].looks[]._ref) => {
								"isRepeated": true
							},
							"": image {
								asset -> {
									${patterns.imageMetadata}
								}
							}.asset
						}),
						lookbook[0]._type == "image" => {
							"image0": lookbook[0].asset -> {
								${patterns.imageMetadata}
								^.hasCustomColour != true => {
									${patterns.imagePalette}
								},
							},
						},
						lookbook[0]._type == "video" => {
							"video0": lookbook[0] {
								url,
							},
						},
						"press0": press[0..1] -> {
							_id in array::compact(^.^.^.content[].press[]._ref) => {
								"isRepeated": true
							},
							${patterns.press}
							"image": image.asset -> {
								${patterns.imageMetadata}
							},
						},
						hasCustomColour,
						hasCustomColour == true => {
							colour,
						},
					},
				},
			},
			_type == "categoryBlock" => {
				"projects": *[_type == "project" && references(^.categories[]._ref) && ${patterns.projectFilters}] {
					_id in array::compact(^.^.content[].projects[]._ref) => {
						"isRepeated": true,
						lookbook[1]._type == "image" => {
							"image1": lookbook[1].asset -> {
								${patterns.imageMetadata}
							},
						},
						lookbook[1]._type == "video" => {
							"video1": lookbook[1] {
								url,
							},
						},
						"press1": press[2..3] -> {
							_id in array::compact(^.^.^.content[].press[]._ref) => {
								"isRepeated": true
							},
							${patterns.press}
							"image": image.asset -> {
								${patterns.imageMetadata}
							},
						},
					},
					"id": _id,
					title,
					year,
					"address": address.current,
					lookbook[0]._type == "image" => {
						"image0": lookbook[0].asset -> {
							${patterns.imageMetadata}
							^.hasCustomColour != true => {
								${patterns.imagePalette}
							},
						},
					},
					lookbook[0]._type == "video" => {
						"video0": lookbook[0] {
							url,
						},
					},
					"press0": press[0..1] -> {
						_id in array::compact(^.^.^.content[].press[]._ref) => {
							"isRepeated": true
						},
						${patterns.press}
						"image": image.asset -> {
							${patterns.imageMetadata}
						},
					},
					hasCustomColour,
					hasCustomColour == true => {
						colour,
					},
					"looks": array::compact(looks[] -> {
						_id in array::compact(^.^.^.content[].looks[]._ref) => {
							"isRepeated": true
						},
						"": image {
							asset -> {
								${patterns.imageMetadata}
							}
						}.asset
					}),
				} | order(year desc, lower(title) asc),
			},
		},
		hasCustomColours,
		hasCustomColours == true => {
			${patterns.gradient}
		},
		doesAllowTinting,
	}
	`)
	const params = {}
	return await client.fetch(query, params)
}