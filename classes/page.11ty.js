/** Class representing a document of type `Page`. */
class Page {
	/** Method to define the part of Eleventy's data cascade specific to this `Page`. */
	data() {
		return {
			pagination: {
				data: "pages",
				alias: "page",
				size: 1,
				addAllPagesToCollections: true,
				before: function(paginationData) {
					const addresses = paginationData.filter((page) => {
						return page.address
					})
					return addresses
				},
			},
			layout: "Main.11ty.js",
			tags: "pages",
			permalink: (data) => {
				if (data.page?.address === "/") {
					return "/"
				}
				return (data.settings?.basePath || "") + (data.page?.address || "") + "/"
			},
		}
	}
	/** Method to render this `Page`. */
	render(data) {
		const eleventy = this
		return Blocks(data, eleventy)
	}
}

/**
 * Initiates block generation.
 * Maps the blocks defined in `data.page.content` after checking their validity.
 * Passes valid blocks to `BlockSwitch`.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Page`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} An empty string if no valid blocks are found or a string containing HTML markup for all valid blocks received from `data.page.content`.
 */
const Blocks = (data, eleventy) => {
	// guard againts undefined if no blocks are found
	if (!data.page?.content || data.page?.content.length === 0) { return "" }
	// continue...
	return data.page?.content?.map(block => {
		// guard against text blocks with no text
		if (block?.type === "textBlock" && (!block?.text || block?.text?.length === 0)) { return "" }
		// guard against image blocks with no image
		if (block?.type === "imageBlock" && !block?.image) { return "" }
		// guard against page blocks with no pages or with one invalid page
		if (
			block?.type === "pageBlock"
			&& (
				!block?.pages
				|| block?.pages?.length === 0
				|| (block?.pages?.length === 1 && (!block?.pages[0]?.address || !block?.pages[0]?.title))
			)
		) { return "" }
		// guard against look blocks with no project or with no looks
		if (
			block?.type === "lookBlock"
			&& (
				!block?.projects
				|| block?.projects.length === 0
				|| !block?.projects[0]?.looks
				|| block?.projects[0].looks.length === 0
			)
		) { return "" }
		// guard against project or category blocks with one repeated project
		if (
			(block?.type === "projectBlock" || block?.type === "categoryBlock")
			&& block?.projects?.length === 1
			&& !block?.projects[0]?.image0?.url
			&& !block?.projects[0]?.video0?.url
			&& block?.projects[0]?.looks?.filter(look => look?.url)?.length === block?.projects[0]?.looks?.filter(look => look?.isRepeated)?.length
		) { return "" }
		// continue...
		const Class = `class="${eleventy.camelCaseToKebabCase(block?.type)}"`
		const Size = block?.type === "projectBlock" || block?.type === "categoryBlock"
			? `data-size="${block?.projects?.length || block?.looks?.length}"`
			: block?.type === "pageBlock"
				? `data-size="${block?.pages?.length}"`
				: ""
		const Options = [Class, Size]
		return (`
			<div ${Options?.filter(Boolean)?.join(" ")}>
				${BlockSwitch(block, data, eleventy)}
			</div>
		`)
	}).join("").replace(/^\t\t\t/mg, "\t".repeat(5))
}

/**
 * Functional switch to determine the type of block received.
 * Passes valid blocks to the appropriate generator.
 * @param {Object} block A valid block.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Page`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {(string | function)} An empty string if no valid block is received, or a callback to the block's appropriate generator.
 * @see {@link TextBlock}, {@link ImageBlock}, {@link PageBlock}, {@link LookBlock}, {@link ProjectBlock}, and {@link CategoryBlock}.
 */
const BlockSwitch = (block, data, eleventy) => {
	switch(block?.type) {
		case "textBlock": return TextBlock(block, eleventy)
		case "imageBlock": return ImageBlock(block, eleventy)
		case "pageBlock": return PageBlock(block, data, eleventy)
		case "lookBlock": return LookBlock(block, data, eleventy)
		case "projectBlock": return ProjectBlock(block, data, eleventy)
		case "categoryBlock": return CategoryBlock(block, data, eleventy)
		default: return ""
	}
}

/**
 * Generates a text block.
 * @param {Object} block A block of type `textBlock`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for a text block.
 */
const TextBlock = (block, eleventy) => {
	return eleventy.portableTextToHtml(block?.text)
}

/**
 * Generates an image block.
 * @param {Object} block A block of type `imageBlock`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for an image block.
 */
const ImageBlock = (block, eleventy) => {
	return eleventy.sanityImage(block?.image, {
		element: "picture",
		className: "image",
	}).replace(/^\t\t\t/mg, "\t".repeat(4))
}

/**
 * Generates a page block.
 * @param {Object} block A block of type `pageBlock`.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Page`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for a page block.
 */
const PageBlock = (block, data, eleventy) => {
	return block?.pages?.map((page) => {
		if (!page?.address || !page?.title) { return "" }
		const Class = `class="page"`
		const Options = [Class]
		return (`
			<div ${Options?.filter(Boolean)?.join(" ")}>
				${eleventy.globe({
					url: "/" + (data.settings?.baseUrl || "") + (page?.address === "/" ? "" : (page?.address + "/")),
					title: page?.title,
					current: data.page?.url,
				})}
			</div>
		`)
	}).join("")
}

/**
 * Generates a look block.
 * @param {Object} block A block of type `lookBlock`.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Page`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for a look block.
 */
const LookBlock = (block, data, eleventy) => {
	return Projects(block, data, eleventy)
}

/**
 * Generates a project block.
 * @param {Object} block A block of type `projectBlock`.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Page`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for a project block.
 */
const ProjectBlock = (block, data, eleventy) => {
	return Projects(block, data, eleventy)
}

/**
 * Generates a category block.
 * @param {Object} block A block of type `categoryBlock`.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Page`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for a category block.
 */
const CategoryBlock = (block, data, eleventy) => {
	return Projects(block, data, eleventy)
}

/**
 * Renders views for all projects received from a valid block after checking their validity.
 * @param {Object} block A block containing valid projects.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Page`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for all projects received from a valid block. The markup consists of:
 * - a link component if the project is eligible for one,
 * - an image or video component if the project is eligible for either one, and
 * - a look component if the project is eligible for one.
 */
const Projects = (block, data, eleventy) => {
	/**
	 * Generates a project's link component after checking its eligibility for one.
	 * @param {Object} project A project.
	 * @returns {string} An empty string if the project is not eligible for a link component, or HTML markup for the project's link component.
	 */
	const ProjectLink = (project) => {
		// guard against projects with no address or with neither of image0 or video0
		if (!project?.address || (!project?.image0 && !project?.video0)) { return "" }
		// continue...
		const Class = `class="project-link"`
		const HRef = `href="/${(data.settings?.baseUrl || "") + (data.settings?.projectPath || "") + project?.address}"`
		const Options = [Class, HRef]
		return (`
			<a ${Options?.filter(Boolean)?.join(" ")}>
				<span>
					${ project?.title }
				</span>
			</a>
		`).replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	/**
	 * Generates a project's image or video component after checking its eligibility for either one.
	 * @param {Object} project A project.
	 * @returns {string} HTML markup for the project's
	 * - `image0` component if `image0` exists and `isRepeated` is `false`,
	 * - `video0` component if `video0` exists and `isRepeated` is `false`,
	 * - `image1` component if `image1` exists and `isRepeated` is `true`,
	 * - `video1` component if `video1` exists and `isRepeated` is `true`,
	 * 
	 * or an empty string if no matches are found.
	 */
	const ProjectImageOrVideo = (project) => {
		// guard against projects with neither of image0 or video0
		if (!project?.image0?.url && !project?.video0?.url) { return "" }
		// continue...
		const imageOptions = {
			element: "picture",
			className: "project-image",
			backgroundSize: "auto 30rem",
		}
		const videoOptions = {
			element: "div",
			className: "project-video",
		}
		if (!project?.isRepeated) {
			if (project?.image0) {
				return eleventy.sanityImage(project?.image0, imageOptions).replace(/^\t\t\t/mg, "\t".repeat(4))
			}
			if (project?.video0) {
				return eleventy.oEmbed(project?.video0?.url, videoOptions).replace(/^\t\t\t/mg, "\t".repeat(4))
			}
		}
		if (project?.isRepeated) {
			if (project?.image1) {
				return eleventy.sanityImage(project?.image1, imageOptions).replace(/^\t\t\t/mg, "\t".repeat(4))
			}
			if (project?.video1) {
				return eleventy.oEmbed(project?.video1?.url, videoOptions).replace(/^\t\t\t/mg, "\t".repeat(4))
			}
		}
		return ""
	}
	/**
	 * Generates a project's look component after checking its eligibility for one.
	 * @param {Object} project A project.
	 * @param {string} blockType The type of the project's containing block.
	 * @returns {string} An empty string if the project is not eligible for a look component, or HTML markup for the project's look component.
	 */
	const ProjectLooks = (project, blockType) => {
		// guard against projects with no looks, projects not in a lookBlock and with only one look, and projects with looks that are all repeated
		if (
			!project?.looks
			|| (blockType !== "lookBlock" && project?.looks?.filter((look) => look?.url)?.length <= 1)
			|| project?.looks?.filter((look) => look?.url)?.length === project?.looks?.filter((look) => look?.isRepeated)?.length
		) { return "" }
		// continue...
		const Class = `class="project-looks"`
		const Size = `data-size="${project?.looks?.filter((look) => look?.url)?.length}"`
		const Options = [Class, Size]
		return (`
			<div ${Options?.filter(Boolean)?.join(" ")}>
				${project?.looks?.filter((look) => look?.url)?.map((look) => {
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
	return block?.projects?.map((project) => {
		// guard against projects with neither of image0 or video0, and projects with looks that are all repeated
		if (
			!project?.image0?.url
			&& !project?.video0?.url
			&& (
				project?.isRepeated
				|| project?.looks?.filter((look) => look?.url)?.length === project?.looks?.filter((look) => look?.isRepeated)?.length
			)
		) { return "" }
		// continue...
		const Class = `class="project"`
		const IsRepeated = project?.isRepeated ? `data-is-repeated="true"` : ""
		const Content = `data-content="${[
			!project?.isRepeated && project?.image0?.url ? "image" : "",
			!project?.isRepeated && project?.video0?.url ? "video" : "",
			project?.isRepeated && project?.image1?.url ? "image" : "",
			project?.isRepeated && project?.video1?.url ? "video" : "",
			(project?.looks?.filter((look) => look?.url).length > 1 || block?.type === "lookBlock") ? "looks" : "",
		]?.filter(Boolean)?.join(" ")}"`
		const Style = () => {
			if (!data.page?.doesAllowTinting) {
				return `style="${eleventy.formatCss({
					"--colour-dominant-background": "var(--colour-background-bottom)",
					"--colour-dominant-foreground": "var(--colour-text)",
				})}"`
			}
			if (!project?.hasCustomColour) {
				if (!project.isRepeated && project?.image0?.palette?.background) {
					return `style="${eleventy.formatCss({
						"--colour-dominant-background": project?.image0?.palette?.background,
						"--colour-dominant-foreground": project?.image0?.palette?.foreground,
					})}"`
				}
				if (project.isRepeated && project?.image1?.palette?.background) {
					return `style="${eleventy.formatCss({
						"--colour-dominant-background": project?.image1?.palette?.background,
						"--colour-dominant-foreground": project?.image1?.palette?.foreground,
					})}"`
				}
			}
			if (project?.hasCustomColour && project?.colour) {
				return `style="${eleventy.formatCss({
					"--colour-dominant-background": project?.colour,
					"--colour-dominant-foreground": eleventy.calculateForegroundColour(project?.colour),
				})}"`
			}
			return null
		}
		const Options = [
			Class,
			IsRepeated,
			Content,
			Style(),
		]
		return (`
			<article ${Options?.filter(Boolean)?.join(" ")}>
				${ProjectLink(project)}
				${ProjectImageOrVideo(project)}
				${ProjectLooks(project, block?.type)}
			</article>
		`).replace(/^\t\t\t/mg, "\t".repeat(4))
	}).join("")
}

module.exports = Page