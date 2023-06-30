const toHTML = require("@portabletext/to-html").toHTML
const { uriLooksSafe } = require("@portabletext/to-html")

module.exports = function(eleventyConfig) {

	eleventyConfig.addJavaScriptFunction("sanityImage", function(value, params = {}) {
		if (!value || !value?.url) { return }
		const {
			element = "div",
			className = "",
			classNames = [],
			backgroundSize = "100% 100%",
			backgroundPosition = "center",
			attributes = {},
		} = params
		const _class = `class="${[className, ...classNames]?.filter(Boolean)?.join(" ")}"`
		const style = {
			"background-image": value.lqip && value.isOpaque ? `url(${value.lqip})` : "",
			"background-repeat": value.lqip && value.isOpaque ? "no-repeat" : "",
			"background-size": value.lqip && value.isOpaque ? backgroundSize : "",
			"background-position": value.lqip && value.isOpaque ? backgroundPosition : "",
		}
		const dataIsOpaque = `data-is-opaque="${value.isOpaque}"`
		const options = [
			(className || classNames.filter(Boolean)?.length >= 1) ? _class : "",
			value.lqip && value.isOpaque ? `style="${eleventyConfig.getFilter("formatCss")(style)}"` : "",
			dataIsOpaque,
			attributes ? eleventyConfig.getFilter("formatAttributes")(attributes) : "",
		]
		return (`
			<${element} ${options?.filter(Boolean)?.join(" ")}>
				<img src="${ value.url }" alt="" loading="lazy" width="${ value.width }" height="${ value.height }" />
			</${element}>
		`)
	})
	
	eleventyConfig.addJavaScriptFunction("oEmbed", function(value, params = {}) {
		if (!value) { return }
		const {
			element = "div",
			className = "",
			classNames = [],
			style = {},
			attributes = {},
		} = params
		const _class = `class="${[className, ...classNames]?.filter(Boolean)?.join(" ")}"`
		const options = [
			(className || classNames.filter(Boolean)?.length >= 1) ? _class : "",
			Array.from(style).length >= 1 ? `style="${eleventyConfig.getFilter("formatCss")(style)}"` : "",
			attributes ? eleventyConfig.getFilter("formatAttributes")(attributes) : "",
		]
		const url = value
		const hostname = new URL(value).hostname.replace("www.", "")
		return (`
			<${element} ${options?.filter(Boolean)?.join(" ")} data-oembed="true" data-oembed-url="${url}" data-oembed-hostname="${hostname}">
				<!-- placeholder -->
			</${element}>
		`)
	})

	eleventyConfig.addJavaScriptFunction("globe", function(params = {}) {
		const {
			url = "",
			title = "",
			current = "",
		} = params
		if (!url || !title) { return }
		const _class = `class="globe"`
		const href = `href="${url}"`
		const ariaCurrent = current.replaceAll("/", "") === url.replaceAll("/", "") ? `aria-current="page"` : ""
		const options = [_class, href, ariaCurrent]
		return(`
			<a class="globe" ${options?.filter(Boolean)?.join(" ")}>
				<div class="globe-background"></div>
				<div class="globe-longitude">
					${(`<div></div>`).repeat(5)}
				</div>
				<div class="globe-latitude">
					${(`<div></div>`).repeat(5)}
				</div>
				<div class="globe-buttons">
					<div class="globe-button">
						<span class="globe-bubble">
							<span>
								${title}
							</span>
						</span>
					</div>
				</div>
			</a>
		`)
	})

	eleventyConfig.addJavaScriptFunction("svgFromUrl", async function(value, fallback) {
		if (!value) { return }
		try {
			const data = await fetch(value).then((response) => response.text())
			return eleventyConfig.getFilter("strip")(data)
		} catch {
			return fallback ? fallback : ""
		}
	})

	eleventyConfig.addJavaScriptFunction("strip", function(value) {
		if (!value) { return }
		return value.replace(/\s+/g, " ").trim()
	})

	eleventyConfig.addJavaScriptFunction("camelCaseToKebabCase", function(value) {
		if (!value) { return }
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

	eleventyConfig.addJavaScriptFunction("formatAttributes", function(value) {
		if (!value) { return }
		return Object.entries(value)?.map(attribute => {
			return attribute[0] && attribute[1] ? `${attribute[0]}="${attribute[1]}"` : ""
		})?.filter(Boolean)?.join(" ")
	})

	eleventyConfig.addJavaScriptFunction("calculateForegroundColour", function(value) {
		if (!value) { return }
		// https://stackoverflow.com/a/41491220
		var colour = (value.charAt(0) === "#") ? value.substring(1, 7) : value
		var r = parseInt(colour.substring(0, 2), 16) // hexToR
		var g = parseInt(colour.substring(2, 4), 16) // hexToG
		var b = parseInt(colour.substring(4, 6), 16) // hexToB
		return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 128) ? "#000000" : "#ffffff"
	})

	eleventyConfig.addJavaScriptFunction("portableTextToHtml", function(value) {
		if (!value) { return }
		return toHTML(value, {
			components: {
				block: (props) => {
					return `<p class="text" dir="auto">${props?.children.replace(/ (?<!<[^>]*)(?=[^ ]*$)/i, "&nbsp;")}</p>`
				},
				types: {
					entity: ({value}) => {
						const HRef = value.url || ""
						if (value.url && uriLooksSafe(HRef)) {
							const Rel = HRef.startsWith("/") ? undefined : "noopener"
							return `<span class="entity"><a class="link" href="${HRef}" rel="${Rel}" target="_blank">${value.name}</a></span>`
						}
						return `<span class="entity">${value.name}</span>`
					},
					project: ({value}) => {
						if (value.address) {
							return `<span class="project"><a class="link" href="${value.address}">${value.title}</a></span>`
						}
						return `<span class="project">${value.title}</span>`
					},
					press: ({value}) => {
						if (value.url) {
							return `<span class="press"><a class="link" href="${value.url}">${value.title}</a></span>`
						}
						return `<span class="project">${value.title}</span>`
					},
				},
				marks: {
					bdi: ({children}) => {
						return `<bdi>${children}</bdi>`
					},
					link: ({children, value}) => {
						const Href = value.url || ""
						if (uriLooksSafe(Href)) {
							return `<a class="link" href="${Href}" rel="noopener" target="_blank">${children}</a>`
						}
						return children
					},
				},
			},
		})
	})

	eleventyConfig.addJavaScriptFunction("portableTextToPlainText", function(value) {
		if (!value) { return }
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
	})

	eleventyConfig.setServerOptions({
		showAllHosts: true,
	})

	eleventyConfig.addPassthroughCopy({
		"fonts": "assets/fonts"
	})
	eleventyConfig.addPassthroughCopy({
		"static": "/"
	})
	eleventyConfig.addPassthroughCopy({
		"js": "assets/js"
	})

	return {
		dir: {
			input: ".",
			includes: "includes",
			layouts: "layouts",
			data: "data",
			output: "dist",
		},
	}

}