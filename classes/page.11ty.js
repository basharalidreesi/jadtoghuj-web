class Page {
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
		if (
			(block?.type === "projectBlock" || block?.type === "categoryBlock")
			&& block?.projects?.length === 1
			&& !block?.projects[0]?.image0?.url
			&& !block?.projects[0]?.video0?.url
			&& block?.projects[0]?.looks?.filter(look => look?.url)?.length === block?.projects[0]?.looks?.filter(look => look?.isRepeated)?.length
		) { return "" }
		const _class = `class="${eleventy.camelCaseToKebabCase(block?.type)}"`
		const dataSize = block?.type === "projectBlock" || block?.type === "categoryBlock"
			? `data-size="${block?.projects?.length || block?.looks?.length}"`
			: block?.type === "pageBlock"
				? `data-size="${block?.pages?.length}"`
				: ""
		const options = [_class, dataSize]
		return (`
			<div ${options?.filter(Boolean)?.join(" ")}>
				${blockSwitch(block, data, eleventy)}
			</div>
		`)
	}).join("").replace(/^\t\t\t/mg, "\t".repeat(5))
}

const blockSwitch = (block, data, eleventy) => {
	switch(block?.type) {
		case "textBlock": return textBlock(block, eleventy)
		case "imageBlock": return imageBlock(block, eleventy)
		case "lookBlock": return lookBlock(block, data, eleventy)
		case "projectBlock": return projectBlock(block, data, eleventy)
		case "categoryBlock": return categoryBlock(block, data, eleventy)
		case "pageBlock": return pageBlock(block, data, eleventy)
		case "campaignBlock": return campaignBlock(block)
		default: return ""
	}
}

const textBlock = (block, eleventy) => {
	return eleventy.portableTextToHtml(block?.text)
}

const imageBlock = (block, eleventy) => {
	return eleventy.sanityImage(block?.image, {
		element: "picture",
		className: "image",
	}).replace(/^\t\t\t/mg, "\t".repeat(4))
}

const lookBlock = (block, data, eleventy) => {
	return renderProject(block, data, eleventy)
}

const projectBlock = (block, data, eleventy) => {
	return renderProjects(block, data, eleventy)
}

const categoryBlock = (block, data, eleventy) => {
	return renderProjects(block, data, eleventy)
}

const pageBlock = (block, data, eleventy) => {
	if (!block?.pages) { return "" }
	return block?.pages?.map(page => {
		if (!page?.address || !page?.title) { return "" }
		const _class = `class="page"`
		const options = [_class]
		return (`
			<div ${options?.filter(Boolean)?.join(" ")}>
				${eleventy.globe({
					url: `${data.settings.baseUrl || ""}/${page.address}`,
					title: page.title,
					current: data.page.url,
				})}
			</div>
		`)
	}).join("")
}

const campaignBlock = (block) => {
	return `campaign`
}

const renderProject = (block, data, eleventy) => renderProjects(block, data, eleventy)

const renderProjects = (block, data, eleventy) => {
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
		`).replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	const projectImage = (project) => {
		if (!project.image0?.url) { return "" }
		const options = {
			element: "picture",
			className: "project-image",
			backgroundSize: "auto 30rem",
		}
		return project?.isRepeated && project?.image1
			? eleventy.sanityImage(project?.image1, options).replace(/^\t\t\t/mg, "\t".repeat(4))
			: eleventy.sanityImage(project?.image0, options).replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	const projectVideo = (project) => {
		if (!project.video0?.url) { return "" }
		const options = {
			element: "div",
			className: "project-video",
		}
		return project?.isRepeated && project?.video1?.url
			? eleventy.oEmbed(project?.video1?.url, options).replace(/^\t\t\t/mg, "\t".repeat(4))
			: eleventy.oEmbed(project?.video0?.url, options).replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	const projectLooks = (project, blockType) => {
		if (
			!project?.looks
			|| (project?.looks?.filter(look => look?.url)?.length <= 1 && blockType !== "lookBlock")
			|| project?.looks?.filter(look => look?.url)?.length === project?.looks?.filter(look => look?.isRepeated)?.length
		) { return "" }
		const _class = `class="project-looks"`
		const dataSize = `data-size="${project?.looks?.filter(look => look?.url)?.length}"`
		const options = [_class, dataSize]
		return (`
			<div ${options?.filter(Boolean)?.join(" ")}>
				${project?.looks?.filter(look => look?.url)?.map(look => {
					return eleventy.sanityImage(look, {
						element: "picture",
						className: "project-look",
						attributes: {
							"data-is-repeated": look?.isRepeated ? "true" : "",
						}
					})
				}).join("").replace(/^\t\t\t/mg, "\t".repeat(4))}
			</div>
		`).replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	return block?.projects?.map(project => {
		if (
			!project?.image0?.url
			&& !project?.video0?.url
			&& project?.looks?.filter(look => look?.url)?.length === project?.looks?.filter(look => look?.isRepeated)?.length
		) { return "" }
		const _class = `class="project"`
		const dataIsRepeated = project?.isRepeated ? `data-is-repeated="true"` : ""
		const dataContents = `data-contents="${[
			project?.image0?.url ? "image" : "",
			project?.video0?.url ? "video" : "",
			(project?.looks?.length > 1 || block?.type === "lookBlock") ? "looks" : "",
		]?.filter(Boolean)?.join(" ")}"`
		const style = {
			"--colour-dominant-background": project?.image1?.palette?.background || project?.image0?.palette?.background,
			"--colour-dominant-foreground": project?.image1?.palette?.foreground || project?.image0?.palette?.foreground,
		}
		const options = [
			_class,
			dataIsRepeated,
			dataContents,
			(project?.image0?.palette?.background && project?.image0?.palette?.foreground) ? `style="${eleventy.formatCss(style)}"` : ""
		]
		return (`
			<article ${options?.filter(Boolean)?.join(" ")}>
				${projectLink(project)}
				${projectImage(project)}
				${projectVideo(project)}
				${projectLooks(project, block?.type)}
			</article>
		`).replace(/^\t\t\t/mg, "\t".repeat(4))
	}).join("")
}

module.exports = Page