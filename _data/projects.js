const client = require("../sanity.client")

module.exports = async function () {
	const targetProjects = await client.fetch(`
	array::compact(*[_type == "page" && website == "jadtoghuj.com" && defined(contents)] {
		contents[] {
			_type == "projectBlock" => {
				"projects": projects[]._ref
			},
			_type == "categoryBlock" => {
				"projects": *[_type == "project" && references(categories[]._ref) && isPublic == true]._id,
			},
			// _type == "campaignBlock" => {},
		}
	}.contents[].projects[])
	`, {})
	const query = `
	*[_type == "project" && _id in $targetProjects && isPublic == true] {
		title,
		"address": address.current,
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
	}
	`
	const params = {
		targetProjects: targetProjects,
	}
	return await client.fetch(query, params)
}