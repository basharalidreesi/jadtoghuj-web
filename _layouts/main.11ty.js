class Main {
	async render(data) {
		const eleventy = this
		return (`
			<!DOCTYPE html>
			<html lang="en-GB" dir="auto">
			<head>
				<title>${title(data)}</title>
				<meta name="description" content="${description(data)}">
				<meta name="keywords" content="${keywords(data)}">
				<meta name="theme-color" content="${themeColour(data)}">
				<meta name="viewport" content="width=device-width, initial-scale=1.0 viewport-fit=cover">
				<meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1">
				<link rel="canonical" href="${canonical(data)}">
				<link rel="preload" href="${baseUrl(data)}/assets/css/main.css" as="style">
				<link rel="preload" href="${baseUrl(data)}/assets/css/fonts.css" as="style">
				<link rel="stylesheet" href="${baseUrl(data)}/assets/css/main.css" />
				<link rel="stylesheet" href="${baseUrl(data)}/assets/css/fonts.css" />
				<meta property="og:type" content="website">
				<meta property="og:title" content="${title(data)}">
				<meta property="og:description" content="${description(data)}">
				<meta property="og:url" content="${canonical(data)}">
				<!-- <meta property="og:image" content=""> -->
				<!-- <meta property="twitter:card" content="summary_large_image"> -->
				<meta property="twitter:title" content="${title(data)}">
				<meta property="twitter:description" content="${description(data)}">
				<meta property="twitter:url" content="${canonical(data)}">
				<!-- <meta property="twitter:image" content=""> -->
				<script defer src="${baseUrl(data)}/assets/js/main.js"></script>
				${analytics(data)}
				${colours(data, eleventy)}
			</head>
			<body ${bodyOptions(data, eleventy)}>
				<header class="header">
					<div class="logo">
						<a href="${baseUrl(data)}/">
							${eleventy.strip(await logo(data, eleventy))}
						</a>
					</div>
					<button id="nav-button" class="nav-expand" aria-controls="nav-menu" aria-haspopup="true" aria-expanded="false">
						<span>Menu</span>
						${eleventy.strip(navButton)}
					</button>
					<nav id="nav-menu" class="nav" aria-role="menu" aria-labelledby="nav-button">
						${nav(data, eleventy)}
					</nav>
				</header>
				<main class="main">
					${content(data)}
				</main>
				<footer class="footer">
					${footer(data, eleventy)}
				</footer>
			</body>
			</html>
		`).replace(/^\t\t\t/gm, "").replace(/^\s*\n/gm, "")
	}
}

const title = (data) => {
	const pageTitle = data.page.url === "/" ? "" : data.title
	const siteTitle = data.settings.title || ""
	return [pageTitle, siteTitle]?.filter(Boolean)?.join(" • ")
}

const description = (data) => {
	const pageDescription = data.description || ""
	const siteDescription = data.settings.description || ""
	return [pageDescription, siteDescription]?.filter(Boolean)?.join(" • ")
}

const keywords = (data) => {
	return data.settings.keywords?.filter(Boolean)?.join(", ")
}

const themeColour = (data) => {
	return data.settings.colours?.top || ""
}

const canonical = (data) => {
	const url = data.settings.url
	const baseUrl = data.settings.baseUrl
	const pageUrl = data.page.url
	return [url, baseUrl, pageUrl]?.filter(Boolean)?.join("")
}

const baseUrl = (data) => {
	return data.settings.baseUrl || ""
}

const analytics = (data) => {
	return data.settings.analytics || ""
}

const colours = (data, eleventy) => {
	const style = {
		"--colour-1": data.settings.colours.text,
		"--colour-2": data.settings.colours.top,
		"--colour-3": data.settings.colours.bottom,
	}
	return `<style> :root { ${eleventy.formatCss(style)} } </style>`
}

const bodyOptions = (data, eleventy) => {
	const options = []
	const style = {
		"--colour-dominant-background": data.colourDominantBackground,
		"--colour-dominant-foreground": data.colourDominantForeground,
		"--colour-background-bottom": "var(--colour-dominant-background)",
	}
	const dataLayout = data.page.fileSlug
	if (data.page.fileSlug === "projects" && data.image) {
		options.push(`style="${eleventy.formatCss(style)}"`)
	}
	options.push(`data-layout="${dataLayout}"`)
	return options?.filter(Boolean)?.join(" ")
}

const logo = (data, eleventy) => {
	const defaultLogo = `
		<svg width="508.02" height="150" viewBox="0 0 508.02 150" xmlns="http://www.w3.org/2000/svg">
			<g>
				<path d="M72.83,28.11h0.94c2.64-7.36,10.94-13.02,17.36-13.77V13.4C84.91,13.02,79.62,6.6,80.38,0h-0.94 c-2.45,6.79-10,12.64-17.36,12.83v0.94C69.06,14.34,73.4,21.32,72.83,28.11z"></path>
				<path d="M194.91,61.13c-3.21,8.87-9.62,16.6-16.6,16.6c-11.89,0-6.79-18.87,0.75-39.62c4.53-12.83,10.38-26.98,16.6-35.66h-32.07 v0.75c17.92,0,13.96,17.92,7.17,37.92h-0.38c-0.75-5.28-3.21-9.06-10.19-9.06c-10.19,0-20,9.06-27.36,29.06h0 c-3.02,8.68-9.06,17.36-16.04,17.36c-4.91,0-7.92-3.58-7.92-10.38c0-9.62,4.34-23.96,14.15-33.96l-0.75-0.75 c-3.02,2.26-4.72,2.64-7.17,2.64c-5.47,0-8.87-3.77-16.6-3.77c-10.19,0-20.38,8.87-27.74,28.87c-0.46,1.26-0.95,2.63-1.44,4.09 c1.47-6.03,2.74-11.03,3.71-14.09c2.83-9.06,5.47-15.47,10.94-15.66v-0.94H52.08v0.94c7.74,0.94,12.26,4.72,12.26,14.72 c0,11.32-6.04,32.64-18.49,32.64c-9.25,0-11.89-11.51-7.74-21.7h-6.04C21.89,89.43,20.19,126.04,0,148.11v0.19 c4.72,1.32,9.81,1.7,13.77,1.7c22.08,0,32.64-9.25,41.13-31.51c1.53-4.05,3.12-9.13,4.69-14.69c-2.25,15.31-1.37,28.09,7.39,28.09 c11.13,0,18.87-19.43,25.66-35.09c-3.77,16.04-6.04,35.09,4.72,35.09c7.5,0,16.57-13.88,24.68-30.4c-2.65,16.04-2.26,30.4,7.4,30.4 c12.26,0,20.57-20.75,26.41-35.09c-4.15,16.98-7.36,35.09,2.64,35.09c14.72,0,33.58-46.23,42.45-70.75H194.91z M84.34,77.93 c-3.96,0-6.41-3.02-6.41-8.11c0-9.81,9.43-30.38,20.38-30.38c3.4,0,6.23,2.26,6.23,7.17C104.53,56.42,94.72,77.93,84.34,77.93z M146.42,77.93c-2.83,0-6.23-1.7-6.23-8.11c0-11.13,9.25-30,19.81-30c3.59,0,6.23,2.26,6.23,7.17 C166.23,56.98,156.23,77.93,146.42,77.93z"></path>
			</g>
			<g>
				<path d="M497.26,0h-0.94c-2.45,6.79-10,12.64-17.36,12.83v0.94c6.98,0.57,11.32,7.55,10.75,14.34h0.94 c2.64-7.36,10.94-13.02,17.36-13.77V13.4C501.79,13.02,496.51,6.6,497.26,0z"></path>
				<path d="M468.96,35.47c7.74,0.94,12.26,4.72,12.26,14.72c0,11.32-6.04,32.64-18.49,32.64c-7.18,0-10.38-6.95-9.5-14.83 c0.92-2.44,1.76-4.75,2.52-6.87H455h-5.28h-0.76c-0.77,2.13-1.48,4.3-2.16,6.51c-3.23,5.76-7.73,10.09-12.75,10.09 c-4.34,0-7.74-2.26-7.74-9.25c0-11.13,8.3-27.55,13.96-33.96H416.7v0.94c4.91,0,6.98,2.83,6.98,9.06 c0,14.15-10.19,33.77-21.13,33.77c-4.34,0-7.55-3.02-7.55-10.94c0-12.26,7.55-27.55,13.4-32.83h-22.08v0.94 c9.25,0,7.92,7.74,1.32,25.66c-0.02,0.06-0.04,0.12-0.06,0.17c-3.04,8.61-8.85,16.43-15.6,16.43c-3.96,0-6.98-2.83-6.98-8.11 c0-7.92,5.28-18.11,5.28-26.6c0-6.6-3.96-10.75-11.13-10.75c-9.43,0-16.79,7.17-20.57,12.64h-0.38 c4.91-14.15,13.21-33.77,19.25-42.45h-28.68v0.75c13.33,0,11,14.94,5.11,33.02c-0.67,0.14-1.34,0.19-2.09,0.19 c-6.23,0-12.64-4.15-20.38-4.15c-12.32,0-20.95,11.27-27.34,28.32c2.25-16.18-0.56-28.51-13.98-28.51 c-12.64,0-20.75,11.13-27.36,29.06c-3.02,8.68-8.87,16.6-15.66,16.6c-6.04,0-10.75-3.02-10.75-12.08c0-6.98,2.08-14.53,5.28-22.83 h13.96l3.21-8.3h-13.96l6.04-15.09h-1.13c-8.3,9.81-15.66,15.28-26.79,22.45v0.94h11.32c-1.7,5.09-3.96,11.51-6.41,18.3 c-11.51,32.26-19.25,70.75-0.57,70.75c7.62,0,16.91-14.37,25.13-31.24c-2.24,17.58,0.6,31.24,14.12,31.24 c12.64,0,20-15.28,27.55-35.28c1.16-3.06,2.27-6.18,3.32-9.31c-1.23,11.86,1.04,21.77,11.59,21.77c7.17,0,11.7-4.53,17.17-12.26 c-3.02,9.81-8.87,18.49-19.62,18.49c-5.85,0-10-2.64-11.7-6.23h-0.38c-3.02,13.58-10.75,30.57-22.45,38.87v0.38 c5.47,1.32,11.32,1.7,15.66,1.7c22.26,0,33.58-9.25,41.7-31.89c1.87-5.2,3.5-12.03,5.3-19.7c-3.47,19.5-2.07,33.48,6.21,33.48 c13.58,0,10.75-24.34,25.85-64.15h-0.94c-1.51,3.02-5.09,10.19-9.81,10.19c-3.58,0-4.53-3.02-4.53-6.23 c0-10.94,10.75-30.19,22.83-30.19c4.34,0,6.6,2.64,6.6,7.17c0,13.4-18.49,46.41-18.49,68.87c0,8.68,2.64,14.34,9.81,14.34 c7.34,0,16.23-13.34,24.22-29.4c-2.6,17.03-0.96,29.21,7.28,29.21c10.94,0,20-19.62,26.23-34.91c-4.15,17.74-5.66,35.09,4.34,35.09 c6.95,0,15.3-11.97,22.95-26.89c-4.3,16.16-9.79,31.61-20.31,43.11v0.19c4.72,1.32,9.81,1.7,13.77,1.7 c22.08,0,32.64-9.25,41.13-31.51c6.79-17.92,14.53-56.04,18.11-67.36c2.83-9.06,5.47-15.47,10.94-15.66v-0.94h-31.89V35.47z M261.23,77.74c-5.66,0-9.62-4.72-9.62-12.64c0-10.75,7.17-25.85,17.36-25.85c5.09,0,8.49,4.15,8.49,11.32 C277.45,61.89,271.98,77.74,261.23,77.74z M299.15,78.3c-3.96,0-6.6-3.21-6.6-8.87c0-10.57,9.43-30,20.57-30 c4.34,0,6.41,3.02,6.41,7.92C319.53,58.11,308.96,78.3,299.15,78.3z"></path>
			</g>
		</svg>
	`
	return data.settings.logo?.url ? eleventy.createSvgFromUrl(data.settings.logo?.url) : defaultLogo
}

const navButton = `
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<line x1="0" y1="0" x2="24" y2="0" />
		<line x1="0" y1="12" x2="24" y2="12" />
		<line x1="0" y1="24" x2="24" y2="24" />
	</svg>
`

const navExpand = `
	<svg width="24" height="12" viewBox="0 0 24 12" xmlns="http://www.w3.org/2000/svg">
		<polygon points="24,0 12,12 0,0" />
	</svg>
`

const nav = (data, eleventy) => {
	const navLink = (page, isSubgroup = false) => {
		const { type, address, title } = page
		const className = isSubgroup ? `class="nav-sublink"` : `class="nav-link"`
		const href = type === "page" ? `href="${(baseUrl(data) + "/" + address.replaceAll("/", "") + "/").replace("//", "/")}"` : (type === "external" ? `href="${address}"` : "")
		const rel = type === "external" ? `rel="noopener"` : ""
		const target = type === "external" ? `target="_blank"` : ""
		const ariaCurrent = data.page.url.replaceAll("/", "") === address.replaceAll("/", "") ? `aria-current="page"` : ""
		const ariaRole = isSubgroup ? `aria-role="menuitem"` : ""
		const options = [className, href, rel, target, ariaCurrent, ariaRole]
		return (`
			<a ${options?.filter(Boolean)?.join(" ")}>
				<span>
					${title}
				</span>
			</a>
		`).replace(/^\t\t\t/gm, "\t".repeat(4))
	}
	return data.settings.navigation?.groups?.map((group, index) => {
		const isTruncated = group.truncation?.isTruncated && group.pages?.length > group.truncation?.limit
		const limit = isTruncated ? group.truncation?.limit : group.pages?.length
		return `
			<div class="nav-group">
				${group.pages?.slice(0, limit)?.map(page => { return navLink(page, false) })?.join("")}
				${isTruncated
					? (`
						<div class="nav-link">
							<button id="group-${index}-button" class="nav-expand" aria-controls="group-${index}-menu" aria-haspopup="true" aria-expanded="false">
								<span>
									${ group.truncation?.label || "Menu" }
								</span>
								${eleventy.strip(navExpand)}
							</button>
							<div id="group-${index}-menu" class="nav-subgroup" aria-role="menu" aria-labelledby="group-${index}-button">
								${group.pages?.slice(limit, group.pages?.length)?.map(page => { return navLink(page, true) })?.join("").replace(/^\t\t/gm, "\t".repeat(6))}
							</div>
						</div>
					`).replace(/^\t\t/gm, "")
					: ""}
			</div>
		`
	})?.join("").replace(/^\t\t\t/gm, "\t".repeat(6))
}

const content = (data) => {
	return data.content
}

const footer = (data, eleventy) => {
	return eleventy.portableTextToHtml(data.settings.footer)
}

module.exports = Main