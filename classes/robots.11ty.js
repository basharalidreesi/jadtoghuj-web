class Robots {
	data() {
		return {
			permalink: "/robots.txt",
			eleventyExcludeFromCollections: true,
		}
	}
	render(data) {
		return (`Sitemap: ${[data.settings?.url, data.settings?.baseUrl]?.filter(Boolean)?.join("")}/sitemap.xml

			User-agent: *
			Disallow:`).replace(/^\t\t\t/mg, "\t".repeat(0))
	}
}

module.exports = Robots