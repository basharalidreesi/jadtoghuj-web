const client = require("../sanity.client")

module.exports = async function () {
	const query = `
	*[_type == "settings" && website == "jadtoghuj.com"][0] {
		title,
		description,
		keywords,
		"logo": logo.asset->{url},
		"navigation": {
			"groups": navigation[] {
				"pages": pages[] {
					_type == "page" => @->{
						title,
						"type": _type,
						"address": address.current,
					},
					_type == "external" => {
						title,
						"type": _type,
						address,
					},
				},
			},
		},
		footer[] {
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
		url,
		baseUrl,
		projectPath,
		analytics,
	}
	`
	const params = {}
	return await client.fetch(query, params)
}