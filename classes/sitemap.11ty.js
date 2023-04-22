class Sitemap {
	data() {
		return {
			permalink: "/sitemap.xml",
			eleventyExcludeFromCollections: true,
		}
	}
	
	render(data) {
		return (`
			<?xml version="1.0" encoding="utf-8"?>
			<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
				${data.collections?.all?.sort((a, b) => {
					return a?.url?.toLowerCase().localeCompare(b?.url?.toLowerCase())
				})?.map(page => {
					return (`
					<url>
						<loc>${ [data.settings?.url, data.settings?.baseUrl, page?.url]?.filter(Boolean)?.join("") }</loc>
					</url>
					`).replace(/^\t\t/mg, "\t".repeat(1))
				})?.join("")}
			</urlset>
		`).replace(/^\t\t\t/mg, "\t".repeat(0)).replace(/^\s*\n/mg, "")
	}
}

module.exports = Sitemap