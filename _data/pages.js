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
					"image": image.asset,
				},
				_type == "projectBlock" => {
					"projects": projects[]-> {
						title,
						"address": address.current,
						"image0": lookbook[0].asset-> {
							url,
							"aspectRatio": metadata.dimensions.aspectRatio,
							"height": metadata.dimensions.height,
							"width": metadata.dimensions.width,
							"lqip": metadata.lqip,
							"palette": metadata.palette.dominant {
								background,
								foreground,
							},
						},
						"looks": array::compact(looks[]->display.asset-> {
							url,
							"aspectRatio": metadata.dimensions.aspectRatio,
							"height": metadata.dimensions.height,
							"width": metadata.dimensions.width,
							"lqip": metadata.lqip,
						}),
					}
				},
				_type == "categoryBlock" => {
					"projects": *[_type == "project" && references(categories[]._ref) && isPublic == true] | order(year desc, title asc) {
						title,
						"address": address.current,
						"image0": lookbook[0].asset-> {
							url,
							"aspectRatio": metadata.dimensions.aspectRatio,
							"height": metadata.dimensions.height,
							"width": metadata.dimensions.width,
							"lqip": metadata.lqip,
							"palette": metadata.palette.dominant {
								background,
								foreground,
							},
						},
						"looks": array::compact(looks[]->display.asset-> {
							url,
							"aspectRatio": metadata.dimensions.aspectRatio,
							"height": metadata.dimensions.height,
							"width": metadata.dimensions.width,
							"lqip": metadata.lqip,
						}),
					},
				},
				// _type == "campaignBlock" => {}
			},
		},
	}
	`
	const params = {}
	return await client.fetch(query, params)
}