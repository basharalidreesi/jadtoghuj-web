const client = require("../sanity.client")
const patterns = require("./patterns.js")

module.exports = async function () {
	const query = (`
		*[_type == "settings" && _id == "settings"][0] {
			title,
			description,
			"logo": logo.asset -> {url},
			colours {
				top,
				bottom,
				text,
			},
			navigation[] {
				members[] {
					"type": _type,
					_type == "page" => @-> {
						title,
						"address": address.current,
					},
					_type == "separator" => {
						label,
					},
				},
			},
			footer[] {
				${patterns.portableText}
			},
			url,
			basePath,
			projectPath,
			analytics,
		}
	`)
	const params = {}
	return await client.fetch(query, params)
}