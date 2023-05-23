const client = require("../sanity.client")
const patterns = require("./patterns.js")

module.exports = async function () {
	const query = (`
	*[_type == "page"] {
		title,
		"address": address.current,
		content[] {
			"type": _type,
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
			_type == "pageBlock" => {
				pages[] -> {
					title,
					"address": address.current,
				},
			},
			_type == "lookBlock" => {
				"projects": [project -> {
					${patterns.projectFilters} => {
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
								^.hasCustomColour != true => {
									${patterns.imagePalette}
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
					hasCustomColour,
					hasCustomColour == true => {
						colour,
					},
					"looks": array::compact(looks[]->image.asset -> {
						_id in array::compact(^.^.^.^.^.content[].looks[]._ref) => {
							"isRepeated": true
						},
						${patterns.imageMetadata}
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