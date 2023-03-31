const util = require("util")
const fs = require("fs")
const Image = require("@11ty/eleventy-img")
const toHTML = require("@portabletext/to-html").toHTML

module.exports = function(eleventyConfig) {

	eleventyConfig.addPassthroughCopy({
		"_assets": "assets"
	})

	eleventyConfig.addFilter("console", function(value) {
		return util.inspect(value)
	})

	eleventyConfig.addAsyncShortcode("getImage", async function(url, formats, path, filename, alt = "") {
		const stats = await Image(url, {
			formats,
			urlPath: path,
			outputDir: `./_site${path}`,
			filenameFormat: function() {
				return `${filename}.${formats}`
			}
		})
		const attributes = {
			alt,
			decoding: "async",
		}
		return Image.generateHTML(stats, attributes)
	})

	eleventyConfig.addShortcode("injectSvg", function(path) {
		const data = fs.readFileSync("./_site" + path, 
			function(err, contents) {
			   if (err) return err
			   return contents
			})
		return data.toString("utf8")
	})

	eleventyConfig.addFilter("strip", function(value) {
		return value.replace(/\s+/g, " ").trim()
	})

	eleventyConfig.addFilter("replaceCamelCase", function(value) {
		return value.replace(/([A-Z])/g, function($1) {
			return "-"+$1.toLowerCase();
		})
	})

	eleventyConfig.addFilter("portableTextToHtml", function(value) {
		return toHTML(value, {
			components: {
				block: (props) => {
					return `<p dir="auto">${props?.children}</p>`
				},
			},
		})
	})

	eleventyConfig.addFilter("portableTextToPlainText", function(value) {
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
							// return "[REF]"
						}
					}).join("")
				})
				.join("\n\n")
		}
	})

	eleventyConfig.setServerOptions({
		showAllHosts: true,
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