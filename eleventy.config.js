const toHTML = require("@portabletext/to-html").toHTML
const { uriLooksSafe } = require("@portabletext/to-html")

module.exports = function(eleventyConfig) {
	
	eleventyConfig.addJavaScriptFunction("sanityImage", function(value) {
		return `<img src="${ value?.url }" alt="" loading="lazy" width="${ value?.width }" height="${ value?.height }" />`
	})

	eleventyConfig.addJavaScriptFunction("createSvgFromUrl", async function(value) {
		if (!value) { return }
		return await fetch(value).then(async function (response) {
			return response.text()
		})
	})

	eleventyConfig.addJavaScriptFunction("parseUrl", function(value) {
		const hostname = new URL(value).hostname.replace("www.", "")
		return {
			url: value,
			hostname: hostname,
		}
	})

	eleventyConfig.addJavaScriptFunction("createVideoFromUrl", async function(value) {
		if (!value.url || !value.hostname) { return }
		const url = encodeURIComponent(value.url)
		if (value.hostname === "youtube.com" || value.hostname === "youtu.be") {
			return await fetch(`https://youtube.com/oembed?url=${url}&format=json`).then(async function (response) {
				return response.json().then(function (data) {
					return data.html
						? data.html.replace("youtube.com", "youtube-nocookie.com")
						: ""
				})
			})
		}
		if (value.hostname === "vimeo.com") {
			return await fetch(`https://vimeo.com/api/oembed.json?url=${url}`).then(async function (response) {
				return response.json().then(function (data) {
					return data.html
						? data.html
						: ""
				})
			})
		}
	})

	eleventyConfig.addJavaScriptFunction("strip", function(value) {
		return value.replace(/\s+/g, " ").trim()
	})

	eleventyConfig.addJavaScriptFunction("camelCaseToKebabCase", function(value) {
		return value.replace(/([A-Z])/g, function($1) {
			return "-"+$1.toLowerCase();
		})
	})

	eleventyConfig.addJavaScriptFunction("formatCss", function(value) {
		if (!value) { return }
		return Object.entries(value)?.map(rule => {
			return rule[0] && rule[1] ? `${rule[0]}: ${rule[1]};` : ""
		})?.filter(Boolean)?.join(" ")
	})

	eleventyConfig.addJavaScriptFunction("portableTextToHtml", function(value) {
		return toHTML(value, {
			components: {
				block: (props) => {
					return `<p class="text" dir="auto">${props?.children.replace(/ (?=[^ ]*$)/i, "&nbsp;")}</p>`
				},
				types: {
					person: ({value}) => {
						const href = value.url || ""
						if (value.url && uriLooksSafe(href)) {
							const rel = href.startsWith("/") ? undefined : "noopener"
							return `<span class="name"><a class="link" href="${href}" rel="${rel}" target="_blank">${value.name}</a></span>`
						}
						return `<span class="name">${value.name}</span>`
					},
				},
				marks: {
					link: ({children, value}) => {
						const href = value.url || ""
						if (uriLooksSafe(href)) {
							const rel = href.startsWith("/") ? undefined : "noopener"
							return `<a class="link" href="${href}" rel="${rel}" target="_blank">${children}</a>`
						}
						return children
					},
				},
			},
		})
	})

	eleventyConfig.addJavaScriptFunction("portableTextToPlainText", function(value) {
		if (value) {
			return value
				.map(block => {
					if (block._type !== "block" || !block.children) {
						return ""
					}
					return block.children.map((child) => {
						if (child._type == "span") {
							return child.text
						}
						if (child._type == "person") {
							return child.name
						}
					}).join("")
				})
				.join("\n\n")
		}
	})

	eleventyConfig.setServerOptions({
		showAllHosts: true,
	})

	eleventyConfig.addPassthroughCopy({
		"_assets": "assets"
	})
	eleventyConfig.addPassthroughCopy({
		"_static": "/"
	})
	eleventyConfig.addPassthroughCopy({
		"_js": "assets/js"
	})

	return {
		dir: {
			input: ".",
			includes: "_includes",
			layouts: "_layouts",
			data: "_data",
			output: "_site",
		},
	}

}