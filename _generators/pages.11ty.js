class Pages {
	data() {
		return {
			pagination: {
				data: "pages",
				alias: "page",
				size: 1,
				addAllPagesToCollections: true,
				before: function(paginationData) {
					const addresses = paginationData.filter(page => {
						return page.address
					})
					return addresses
				},
			},
			layout: "main.11ty.js",
			tags: "page",
			permalink: data => `${data.settings?.baseUrl || ""}${data.page?.address}/`,
		}
	}
	render(data) {
		const eleventy = this
		return blocks(data, eleventy)
	}
}

const blocks = (data, eleventy) => {
	return data.page?.contents?.map(block => {
		const _class = `class="${eleventy.camelCaseToKebabCase(block?.type)}"`
		const dataSize = block?.type === "projectBlock" || block?.type === "categoryBlock" ? `data-size="${block?.projects?.length || block?.looks?.length}"` : ""
		const options = [_class, dataSize]
		return (`
			<div ${options?.filter(Boolean)?.join(" ")}>
				${blockSwitch(block, eleventy, data)}
			</div>
		`)
	})?.join("").replace(/^\t\t\t/gm, "\t".repeat(4))
}

const blockSwitch = (block, eleventy, data) => {
	switch(block?.type) {
		case "textBlock": return textBlock(block, eleventy)
		case "imageBlock": return imageBlock(block, eleventy)
		case "lookBlock": return lookBlock(block)
		case "projectBlock": return projectBlock(block, eleventy, data)
		case "categoryBlock": return categoryBlock(block, eleventy, data)
		case "campaignBlock": return campaignBlock(block)
		default: return ""
	}
}

const textBlock = (block, eleventy) => {
	return eleventy.portableTextToHtml(block?.text)
}

const imageBlock = (block, eleventy) => {
	return eleventy.sanityImage(block?.image)
}

const lookBlock = (block) => {
	return `look`
}

const projectBlock = (block, eleventy, data) => {
	const projectLink = (project) => {
		if (!project?.image0 && !project?.video0 ) { return "" }
		const _class = `class="project-link"`
		const href = `href="${data.settings?.baseUrl || ""}${data.settings?.projectPath || ""}/${project?.address}"`
		const options = [_class, href]
		return (`
			<a ${options?.filter(Boolean)?.join(" ")}>
				<span>
					${ project?.title }
				</span>
			</a>
		`).replace(/^\t\t\t/gm, "\t".repeat(4))
	}
	const projectImage = (project) => {
		if (!project.image0) { return "" }
		const _class = `class="project-image"`
		const style = {
			"background-image": `url(${project?.image1?.lqip || project?.image0?.lqip})`,
			"background-repeat": "no-repeat",
			"background-size": "auto 30rem",
			"background-position": "center",
		}
		const options = [_class, `style="${eleventy.formatCss(style)}"`]
		return (`
			<div ${options?.filter(Boolean)?.join(" ")}>
				${ project?.isRepeated && project?.image1 ? eleventy.sanityImage(project?.image1) : eleventy.sanityImage(project?.image0) }
			</div>
		`).replace(/^\t\t\t/gm, "\t".repeat(4))
	}
	const projectVideo = (project) => {
		if (!project.video0) { return "" }
		const _class = `class="project-video"`
		const options = [_class]
		return (`
			<div ${options?.filter(Boolean).join(" ")}>
				${ project?.isRepeated && project?.video1 ? eleventy.createVideoFromUrl(eleventy.parseUrl(project?.video1?.url)) : eleventy.createVideoFromUrl(eleventy.parseUrl(project?.video0?.url)) }
			</div>
		`).replace(/^\t\t\t/gm, "\t".repeat(4))
	}
	const projectLooks = (project) => {
		if (!project?.looks || project?.looks?.length <= 1) { return "" }
		const _class = `class="project-looks"`
		const dataSize = `data-size="${project?.looks?.length}"`
		const options = [_class, dataSize]
		return (`
			<div ${options?.filter(Boolean)?.join(" ")}>
				${project?.looks?.map(look => {
					const _class = `class="project-look"`
					const options = [_class]
					return (`
						<div ${options?.filter(Boolean)?.join(" ")}>
							${eleventy.sanityImage(look)}
						</div>
					`)
				}).join("").replace(/^\t\t\t/gm, "\t".repeat(1))}
			</div>
		`).replace(/^\t\t\t/gm, "\t".repeat(4))
	}
	return block?.projects?.map(project => {
		const _class = `class="project"`
		const dataIsRepeated = project?.isRepeated ? `data-is-repeated="true"` : ""
		const dataContents = `data-contents="${[project?.image0 ? "image" : "", project?.video0 ? "video" : "", project?.looks?.length > 1 ? "looks" : "", ]?.filter(Boolean)?.join(" ")}"`
		const style = {
			"--colour-dominant-background": project?.image1?.palette?.background || project?.image0?.palette?.background,
			"--colour-dominant-foreground": project?.image1?.palette?.foreground || project?.image0?.palette?.foreground,
		}
		const options = [_class, dataIsRepeated, dataContents, project?.image0 ? `style="${eleventy.formatCss(style)}"` : ""]
		return (`
			<article ${options?.filter(Boolean)?.join(" ")}>
				${projectLink(project)}
				${projectImage(project)}
				${projectVideo(project)}
				${projectLooks(project)}
			</article>
		`)
	})?.join("").replace(/^\t\t\t/gm, "\t".repeat(5))
}

const categoryBlock = (block, eleventy, data) => {
	return projectBlock(block, eleventy, data)
}

const campaignBlock = (block) => {
	return `campaign`
}

module.exports = Pages