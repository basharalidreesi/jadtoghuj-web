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
	return data.page?.content?.map((block) => {
		// guard against text blocks with no text
		if (block?.type === "textBlock" && (!block?.text || block?.text?.length === 0)) { return "" }
		// guard against image blocks with no image
		if (block?.type === "imageBlock" && !block?.image) { return "" }
		// guard against press blocks with no press entries
		if (
			block?.type === "pressBlock"
			&& (!block?.press || block?.press?.length === 0 || block?.press?.filter((entry) => entry?.url && entry?.title)?.length === 0)
		) { return "" }
		// guard against page blocks with no pages or with one invalid page
		if (
			block?.type === "pageBlock"
			&& (!block?.pages || block?.pages?.length === 0 || block?.pages?.filter((page) => page.title && (page?.address || page?.url))?.length === 0)
		) { return "" }
		// guard against look blocks with no project or with no looks
		if (
			block?.type === "lookBlock"
			&& (!block?.projects || block?.projects.length === 0 || !block?.projects[0]?.looks || block?.projects[0].looks.length === 0)
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
		const Size = block?.type === "projectBlock" || block?.type === "categoryBlock" || block?.type === "lookBlock"
			? `data-size="${block?.projects?.length || block?.looks?.length}"`
			: ""
		const Options = [Class, Size]
		return (`
			<div ${Options?.filter(Boolean)?.join(" ")}>
				${BlockSwitch(block, data, eleventy)}
			</div>
		`)
	}).join("")?.replace(/^\t\t\t/mg, "\t".repeat(5))
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
		case "pressBlock": return PressBlock(block, eleventy)
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
	})?.replace(/^\t\t\t/mg, "\t".repeat(4))
}

/**
 * Generates a press block.
 * @param {Object} block A block of type `pressBlock`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for a press block.
 */
const PressBlock = (block, eleventy) => {
	return block?.press?.map((entry) => Press(entry, eleventy))?.join("")?.replace(/^\t\t/mg, "\t".repeat(3))
}

/**
 * Generates a page block.
 * @param {Object} block A block of type `pageBlock`.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Page`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for a page block.
 */
const PageBlock = (block, data, eleventy) => {
	const pages = block?.pages?.filter((page) => page?.title && (page?.address || page?.url))
	const Class = `class="globe"`
	const Size = `data-size="${pages?.length}"`
	const GlobeOptions = [Class, Size]
	const ButtonsBaseRotation = () => {
		switch (pages?.length) {
			case 1: return "0deg"
			case 2: return "-180deg"
			case 3: return "-30deg"
			case 4: return "0deg"
			case 5: return "18deg"
			case 6: return "30deg"
			case 7: return "38.5deg"
			case 8: return "45deg"
			case 9: return "50deg"
			case 10: return "54deg"
			default: return "180deg"
		}
	}
	return (`
		<div ${GlobeOptions?.filter(Boolean)?.join(" ")}>
			<div class="globe-background"></div>
			<div class="globe-longitude">
				${(`<div></div>`).repeat(5)}
			</div>
			<div class="globe-latitude">
				${(`<div></div>`).repeat(5)}
			</div>
			<div class="globe-logo">
				<div>
					<svg width="14.58" height="24" viewBox="0 0 14.58 24" xmlns="http://www.w3.org/2000/svg">
						<path d="m12.68 0.07c-0.04 0.1-0.12 0.27-0.2 0.4-0.26 0.44-0.68 0.86-1.15 1.14-0.41 0.25-0.84 0.39-1.26 0.43-0.05 0-0.1 0.01-0.11 0.01h-0.03v0.15l0.1 0.01c0.19 0.03 0.33 0.07 0.5 0.15 0.19 0.09 0.33 0.19 0.48 0.34 0.42 0.41 0.66 1.02 0.65 1.66v0.14h0.08 0.08l0.04-0.09c0.11-0.27 0.28-0.54 0.5-0.81 0.08-0.1 0.31-0.33 0.42-0.42 0.53-0.45 1.16-0.77 1.72-0.86l0.11-0.02v-0.16h-0.02c-0.01 0-0.06-0.01-0.1-0.01-0.34-0.04-0.7-0.22-0.99-0.5-0.34-0.33-0.55-0.75-0.61-1.21-0.01-0.08-0.01-0.34 0-0.39l-0.03-0.03h-0.16l-0.02 0.07z" />
						<path d="m8.33 5.6v0.08h0.03c0.01 0 0.07 0.01 0.13 0.02 0.77 0.12 1.28 0.45 1.55 1 0.19 0.38 0.26 0.82 0.25 1.43-0.02 1.34-0.48 2.94-1.12 3.92-0.32 0.49-0.67 0.83-1.06 1.02-0.24 0.12-0.46 0.17-0.71 0.18-0.21 0.01-0.37-0.01-0.54-0.07-0.6-0.2-0.98-0.79-1.05-1.63-0.01-0.14 0-0.52 0.01-0.66 0.04-0.36 0.13-0.71 0.28-1.09 0-0.02-0.03-0.02-0.48-0.02h-0.49l-0.02 0.06c-0.04 0.12-0.21 0.61-0.27 0.8-0.29 0.91-0.54 1.85-1 3.77-0.43 1.78-0.62 2.53-0.87 3.38-0.71 2.42-1.52 4.12-2.59 5.45-0.1 0.13-0.26 0.32-0.33 0.39-0.06 0.06-0.06 0.08-0.02 0.09 0.87 0.23 1.9 0.31 2.97 0.23 1.9-0.14 3.23-0.8 4.27-2.14 0.44-0.57 0.84-1.27 1.23-2.17 0.44-1.01 0.84-2.26 1.36-4.26 0.26-1.01 0.44-1.7 0.95-3.81 0.54-2.24 0.7-2.85 0.89-3.46 0.31-1 0.55-1.55 0.83-1.93 0.09-0.12 0.25-0.28 0.35-0.35 0.16-0.11 0.32-0.17 0.5-0.18l0.06-0.01v-0.12h-5.11v0.08z" />
					</svg>
				</div>
			</div>
			<div class="globe-buttons" style="--_size: ${pages?.length}; --_baseRotation: ${ButtonsBaseRotation()}">
				${pages?.map((page, index) => {
					const AnchorClass = `class="globe-bubble"`
					const AnchorHref = `href="${page?.address ? ("/" + (data.settings?.baseUrl || "") + (page?.address === "/" ? "" : (page?.address + "/"))) : page?.url}"`
					const AnchorAriaCurrent = () => {
						if (
							(data.page?.url === "/" && page?.address === "/")
							|| (data.page?.url?.replaceAll("/", "") === page?.address)
							) {
							return `aria-current="page"`
						}
						return ""
					}
					const AnchorOptions = [AnchorClass, AnchorHref, AnchorAriaCurrent()]
					return (`
						<div class="globe-button" style="--_index: ${index + 1};">
							<a ${AnchorOptions?.filter(Boolean)?.join(" ")}>
								<span>
									${page?.title}
								</span>
							</a>
						</div>
					`)
				})?.join("")}
			</div>
		</div>
	`)
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
 * - an image or video component if the project is eligible for either one,
 * - a look component if the project is eligible for one, and
 * - a press component if the project is eligible for one.
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
		`)?.replace(/^\t\t\t/mg, "\t".repeat(4))
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
			backgroundSize: "contain",
		}
		const videoOptions = {
			element: "div",
			className: "project-video",
		}
		if (!project?.isRepeated) {
			if (project?.image0) {
				return eleventy.sanityImage(project?.image0, imageOptions)?.replace(/^\t\t\t/mg, "\t".repeat(4))
			}
			if (project?.video0) {
				return eleventy.oEmbed(project?.video0?.url, videoOptions)?.replace(/^\t\t\t/mg, "\t".repeat(4))
			}
		}
		if (project?.isRepeated) {
			if (project?.image1) {
				return eleventy.sanityImage(project?.image1, imageOptions)?.replace(/^\t\t\t/mg, "\t".repeat(4))
			}
			if (project?.video1) {
				return eleventy.oEmbed(project?.video1?.url, videoOptions)?.replace(/^\t\t\t/mg, "\t".repeat(4))
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
				}).join("")?.replace(/^\t\t\t/mg, "\t".repeat(4))}
			</div>
		`)?.replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	/**
	 * Generates a project's press component after checking its eligibility for one.
	 * @param {Object} project A project.
	 * @returns {string} An empty string if the project is not eligible for a press component, or HTML markup for the project's press component.
	 */
	const ProjectPress = (project) => {
		// guard against projects with no press0
		if (
			!project?.press0
			|| project?.press0?.length === 0
			|| project?.press0?.filter((entry) => entry?.url && entry?.title)?.length === 0
			|| project?.press0?.filter((entry) => entry?.isRepeated)?.length === project?.press0?.filter((entry) => entry?.url)?.length
		) { return "" }
		// guard against repeated projects with no press1
		if (
			project?.isRepeated
			&& (!project?.press1
			|| project?.press1?.length === 0
			|| project?.press1?.filter((entry) => entry?.url && entry?.title)?.length === 0
			|| project?.press1?.filter((entry) => entry?.isRepeated)?.length === project?.press1?.filter((entry) => entry?.url)?.length)
		) { return "" }
		// continue...
		if (!project?.isRepeated) {
			return project?.press0?.map((entry) => Press(entry, eleventy))?.join("")
		}
		if (project?.isRepeated
			&& project?.press1
			&& project?.press1?.length > 0
			&& project?.press1?.filter((entry) => entry?.url && entry?.title)?.length > 0
		) {
			return project?.press1?.map((entry) => Press(entry, eleventy))?.join("")
		}
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
				return null
			}
			if (!project?.hasCustomColour) {
				if (!project.isRepeated && project?.image0?.palette?.background) {
					return `style="${eleventy.formatCss({
						"--colour-dominant-background": project?.image0?.palette?.background,
						"--colour-dominant-foreground": project?.image0?.palette?.foreground,
					})}"`
				}
				if (project.isRepeated && project?.image0?.palette?.background) {
					return `style="${eleventy.formatCss({
						"--colour-dominant-background": project?.image0?.palette?.background,
						"--colour-dominant-foreground": project?.image0?.palette?.foreground,
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
			${ProjectPress(project)}
		`)?.replace(/^\t\t\t/mg, "\t".repeat(4))
	}).join("")
}

/**
 * Generates a press entry after checking its validity.
 * @param {Object} entry A press entry.
 * @returns {string} An empty string if the entry is not valid, or HTML markup for a press entry.
 */
const Press = (entry, eleventy = null) => {
	// guard against press entries with no url or title
	if (!entry || !entry?.url || !entry?.title || entry?.isRepeated) { return "" }
	// continue...
	/**
	 * Generates a press entry's title component.
	 * @returns {string} HTML markup for the press entry's title component.
	 */
	const PressTitle = () => {
		const Class = `class="text press-title"`
		const Dir = `dir="auto"`
		const Options = [Class, Dir]
		return (`
			<p ${Options?.filter(Boolean)?.join(" ")}>
				<span>
					${entry?.title?.replace(/ (?=[^ ]*$)/i, "&nbsp;")}
				</span>
			</p>
		`)?.replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	/**
	 * Generates a press entry's publisher component.
	 * @returns {string} HTML markup for the press entry's publisher component.
	 */
	const PressPublisher = () => {
		var hostname = ""
		if (!entry?.publisher) {
			try {
				hostname = new URL(entry?.url)?.hostname
			} catch {}
		}
		const Class = `class="text press-publisher"`
		const Dir = `dir="auto"`
		const Options = [Class, Dir]
		return (`
			<p ${Options?.filter(Boolean)?.join(" ")}>
				<span>
					<bdi>${entry?.publisher?.toUpperCase()?.replace(/ (?=[^ ]*$)/i, "&nbsp;") || hostname}</bdi>
				</span>
			</p>
		`)?.replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	/**
	 * Generates a press entry's image component after checking its eligibility for one.
	 * @returns {string} An empty string if the press entry is not eligible for an image component, or HTML markup for the press entry's image component.
	 */
	const PressImage = () => {
		if (!eleventy || !entry?.image || !entry?.image?.url) { return "" }
		return eleventy.sanityImage(entry?.image, {
			element: "picture",
			className: "press-image",
			backgroundSize: "cover",
		})?.replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	const ArticleClass = `class="press"`
	const ArticleOptions = [ArticleClass]
	const AnchorHref = `href="${entry?.url}"`
	const AnchorClass = `class="press-link"`
	const AnchorRel = `rel="noopener"`
	const AnchorTarget = `target="_blank"`
	const AnchorOptions = [AnchorHref, AnchorClass, AnchorRel, AnchorTarget]
	return (`
		<article ${ArticleOptions?.filter(Boolean)?.join(" ")}>
			<a ${AnchorOptions?.filter(Boolean)?.join(" ")}>
				${PressTitle()}
				${PressPublisher()}
				${PressImage()}
			</a>
		</article>
	`)?.replace(/^\t\t/mg, "\t".repeat(3))
}

module.exports = Page