const client = require("../sanity.client")
const patterns = require("./patterns.js")

module.exports = async function () {
	const targetProjects = await client.fetch((`
		array::compact(*[_type == "page" && defined(content)] {
			content[] {
				_type == "lookBlock" => {
					"projects": project._ref
				},
				_type == "projectBlock" => {
					"projects": projects[]._ref
				},
				_type == "categoryBlock" => {
					"projects": *[_type == "project" && references(categories[]._ref) && ${patterns.projectFilters}]._id,
				},
			}
		}.content[].projects[])
	`), {})
	const query = (`
		*[_type == "project" && _id in $targetProjects && ${patterns.projectFilters}] {
			title,
			description[] {
				${patterns.portableText}
			},
			year,
			"address": address.current,
			"categories": categories[]->title,
			contributions[] {
				contribution,
				contributors[] -> {
					name,
					url,
				},
			},
			looks[] -> {
				title,
				"image": image.asset -> {
					${patterns.imageMetadata}
				},
				description[] {
					${patterns.portableText}
				},
			},
			lookbook[] {
				defined(asset) || defined(url) => {
					"type": _type,
					_type == "image" => {
						asset -> {
							${patterns.imageMetadata}
						},
					},
					_type == "video" => {
						url,
					},
				}
			},
			references[] {
				url,
				title,
				source,
			},
			hasCustomColour,
			hasCustomColour == true => {
				colour,
			},
			hasCustomColour != true && defined(lookbook[0].asset) => {
				"palette": lookbook[0] {
					asset -> {
						${patterns.imagePalette}
					},
				}.asset.palette,
			},
		}
	`)
	const params = {
		targetProjects: targetProjects,
	}
	return await client.fetch(query, params)
}