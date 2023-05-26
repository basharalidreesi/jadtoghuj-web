/** Class representing a document of type `Project`. */
class Project {
	/** Method to define the part of Eleventy's data cascade specific to this `Project`. */
	data() {
		return {
			pagination: {
				data: "projects",
				alias: "project",
				size: 1,
				addAllPagesToCollections: true,
				before: function(paginationData) {
					const addresses = paginationData.filter(project => {
						return project.address
					})
					return addresses
				},
			},
			layout: "Main.11ty.js",
			tags: "projects",
			permalink: data => `${data.settings.baseUrl || ""}${data.settings.projectPath}/${data.project.address}/`,
		}
	}
	/** Method to render this `Project`. */
	render(data) {
		const eleventy = this
		return (`
			${Lookbook(data, eleventy)}
			${LookbookControlers(data)}
			${ProjectInfo(data, eleventy)}
		`)
	}
}

/**
 * Generates a lookbook.
 * Maps the entries defined in `data.project.lookbook` after checking their validity.
 * Passes valid blocks to `LookbookSwitch`.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Project`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} An empty string if no valid blocks are found or a string containing HTML markup for all valid entries received from `data.project.lookbook`.
 */
const Lookbook = (data, eleventy) => {
	// guard against undefined if no entries are found
	if (!data.project?.lookbook || data.project?.lookbook.length === 0) { return "" }
	// continue...
	const Class = `class="project-lookbook"`
	const Size = `data-size="${data.project?.lookbook?.length}"`
	const Options = [Class, Size]
	return (`
		<figure ${Options?.filter(Boolean).join(" ")}>
			${data.project?.lookbook?.map((entry) => {
				if (!entry?.asset?.url && !entry?.url) { return "" }
				return LookbookSwitch(entry, eleventy)
			}).join("")}
		</figure>
	`)
}

/**
 * Functional switch to determine the type of entry received.
 * Passes valid entries to the appropriate generator.
 * @param {Object} entry A valid entry.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Project`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} An empty string if no valid entry is received, or a callback to the entry's appropriate generator.
 * @see {@link ImageEntry} and {@link VideoEntry}.
 */
const LookbookSwitch = (entry, eleventy) => {
	switch(entry?.type) {
		case "image": return ImageEntry(entry, eleventy)
		case "video": return VideoEntry(entry, eleventy)
		default: return ""
	}
}

/**
 * Generates an image entry.
 * @param {Object} block An entry of type `image`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for an image entry.
 */
const ImageEntry = (entry, eleventy) => {
	return eleventy.sanityImage(entry?.asset, {
		element: "picture",
		className: "lookbook-entry",
		attributes: {
			"data-type": "image",
		},
	}).replace(/^\t\t\t/mg, "\t".repeat(6))
}

/**
 * Generates a video entry.
 * @param {Object} block An entry of type `video`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for a video entry.
 */
const VideoEntry = (entry, eleventy) => {
	return eleventy.oEmbed(entry?.url, {
		element: "div",
		className: "lookbook-entry",
		attributes: {
			"data-type": "video",
		},
	}).replace(/^\t\t\t/mg, "\t".repeat(6))
}

/**
 * Generates lookbook controlers.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Project`.
 * @returns {string} HTML markup for lookbook controlers.
 */
const LookbookControlers = (data) => {
	const Class = `class="lookbook-controlers"`
	const Hidden = `hidden="hidden"`
	const Options = [Class, data.project?.lookbook?.length <= 1 ? Hidden : ""]
	return (`
		<div ${Options?.filter(Boolean).join(" ")}>
			<button class="left" data-direction="previous">
				<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<line x1="24" y1="12" x2="0" y2="12" />
					<polyline points="8.49,3.51 0,12 8.49,20.49" />
				</svg>
			</button>
			<button class="right" data-direction="next">
				<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<line x1="0" y1="12" x2="24" y2="12" />
					<polyline points="15.51,20.49 24,12 15.51,3.51" />
				</svg>
			</button>
		</div>
	`).replace(/^\t\t/mg, "\t".repeat(5))
}

/**
 * Generates an info panel.
 * @param {Object} data The part of Eleventy's data cascade specific to this `Project`.
 * @param {Object} eleventy The global Eleventy configuration.
 * @returns {string} HTML markup for an info panel. The markup consists of:
 * - a title component,
 * - a description component if the project is eligible for one,
 * - a stats component if the project is eligible for one,
 * - a contributions component if the project is eligible for one,
 * - a looks component if the project is eligible for one, and
 * - a references component if the project is eligible for one.
 */
const ProjectInfo = (data, eleventy) => {
	/**
	 * Generates the project's title component after checking its eligibility for one.
	 * @returns {string} An empty string if the project is not eligible for a title component, or HTML markup for the project's title component.
	 */
	const ProjectTitle = () => {
		// guard against projects with no title
		if (!data.project?.title) { return "" }
		// continue...
		const Class = `class="project-title"`
		const Options = [Class]
		return (`
			<header ${Options?.filter(Boolean)?.join(" ")}>
				<span>${data.project?.title}</span>
			</header>
		`).replace(/^\t\t\t/mg, "\t".repeat(6))
	}
	/**
	 * Generates the project's description component after checking its eligibility for one.
	 * @returns {string} An empty string if the project is not eligible for a description component, or HTML markup for the project's description component.
	 */
	const ProjectDescription = () => {
		// guard against projects with no description
		if (!data.project?.description || data.project?.description?.length === 0) { return "" }
		// continue...
		const Class = `class="project-description"`
		const Options = [Class]
		return (`
			<div ${Options?.filter(Boolean)?.join(" ")}>
				${eleventy.portableTextToHtml(data.project?.description)}
			</div>
		`).replace(/^\t\t\t/mg, "\t".repeat(6))
	}
	/**
	 * Generates the project's stats component after checking its eligibility for one.
	 * @returns {string} An empty string if the project is not eligible for a stats component, or HTML markup for the project's stats component.
	 */
	const ProjectStats = () => {
		// guard against projects with no defined year and categories
		if (!data.project?.year && (!data.project?.categories || data.project?.categories?.length === 0)) { return "" }
		// continue...
		const Class = `class="project-stats"`
		const Options = [Class]
		return (`
			<div ${Options?.filter(Boolean)?.join(" ")}>
				<p class="text">${[data.project?.year, data.project?.categories?.filter(Boolean)?.join(", ")].filter(Boolean)?.join(" • ")}</p>
			</div>
		`).replace(/^\t\t\t/mg, "\t".repeat(6))
	}
	/**
	 * Generates the project's contributions component after checking its eligibility for one.
	 * @returns {string} An empty string if the project is not eligible for a contributions component, or HTML markup for the project's contributions component.
	 */
	const ProjectContributions = () => {
		// guard against projects with no contributions
		if (!data.project?.contributions || data.project?.contributions.length === 0) { return "" }
		// continue...
		const Class = `class="project-contributions"`
		const Options = [Class]
		return (`
			<dl ${Options?.filter(Boolean)?.join(" ")}>
				${data.project?.contributions?.map((entry) => {
					return (`
						<dt class="text">
							<span>
								${entry?.contribution}
							</span>
						</dt>
						${entry?.contributors?.map((contributor) => {
							if (contributor?.url) {
								return (`
									<dd class="text">
										<a class="link" href="${contributor?.url}" rel="noopener" target="_blank">
											${contributor?.name}
										</a>
									</dd>
								`).replace(/^\t\t\t/mg, "\t".repeat(0))
							}
							return (`
								<dd class="text">
									<span>
										${contributor?.name}
									</span>
								</dd>
							`).replace(/^\t\t\t/mg, "\t".repeat(1))
						}).join("")}
					`).replace(/^\t\t\t/mg, "\t".repeat(1))
				}).join("")}
			</dl>
		`).replace(/^\t\t\t/mg, "\t".repeat(6))
	}
	/**
	 * Generates the project's looks component after checking its eligibility for one.
	 * @returns {string} An empty string if the project is not eligible for a looks component, or HTML markup for the project's looks component.
	 */
	const ProjectLooks = () => {
		// guard against projects whose looks have no images and no descriptions
		if (
			!data.project?.looks
			|| data.project?.looks.length === 0
			|| (data.project?.looks?.filter((look) => !look?.image?.url && (!look?.description || look?.description.length === 0))?.length === data.project?.looks.length)
		) { return "" }
		// continue...
		const Class = `class="project-looks"`
		const Options = [Class]
		return (`
			<table ${Options?.filter(Boolean)?.join(" ")}>
				<tr class="table-header">
					<th scope="col">
						Title
					</th>
					<th scope="col">
						Image
					</th>
					<th scope="col">
						Description
					</th>
				</tr>
				${data.project?.looks?.map((look) => {
					return Look(look)
				}).join("")}
			</table>
		`).replace(/^\t\t\t/mg, "\t".repeat(6))
	}
	/**
	 * Generates a look within the project's looks component after checking its eligibility for one.
	 * @returns {string} An empty string if the look is invalid, or HTML markup for a look component. The markup consists of:
	 * - a title component
	 * - an image component, and
	 * - a description component.
	 */
	const Look = (look) => {
		// guard against looks with no image and no description
		if (!look?.image?.url && (!look?.description || look?.description?.length === 0)) { return "" }
		// continue...
		/**
		 * Generates a look's title component.
		 * @returns {string} HTML markup for the look's title component. The markup consists of:
		 * - "Untitled" if no title is found, or
		 * - the look's title if otherwise.
		 */
		const LookTitle = () => {
			const Class = `class="look-title"`
			const Scope = `scope="row"`
			const Options = [Class, Scope]
			return (`
				<th ${Options?.filter(Boolean)?.join(" ")}>
					<p class="text" dir="auto">
						${look?.title || "Untitled"}
					</p>
				</th>
			`)
		}
		/**
		 * Generates a look's image component.
		 * @returns {string} HTML markup for the look's image component. The markup consists of:
		 * - an SVG placeholder if no image is found, or
		 * - an image if otherwise.
		 */
		const LookImage = () => {
			const Class = `class="look-image"`
			const Options = [Class]
			if (!look?.image?.url) {
				return (`
					<td ${Options?.filter(Boolean)?.join(" ")}>
						<svg width="24" height="24" viewBox="0 0 24 24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-role="presentation">
							<path d="M0,12c1.6,0,3.14-0.31,4.6-0.92C6,10.52,7.29,9.64,8.47,8.46c1.16-1.14,2.04-2.43,2.64-3.87c0.59-1.4,0.88-2.93,0.88-4.6c0,1.62,0.3,3.15,0.9,4.6c0.54,1.36,1.42,2.65,2.64,3.87c1.12,1.14,2.41,2.01,3.87,2.62C20.85,11.69,22.38,12,24,12c-1.62,0-3.15,0.31-4.6,0.92c-1.46,0.61-2.76,1.48-3.87,2.62c-1.21,1.23-2.09,2.52-2.64,3.87c-0.6,1.46-0.9,2.99-0.9,4.6c0-1.65-0.29-3.18-0.88-4.6c-0.6-1.43-1.48-2.72-2.64-3.87C7.29,14.36,6,13.48,4.6,12.91C3.14,12.3,1.6,12,0,12z" />
						</svg>
					</td>
				`).replace(/^\t\t\t/mg, "\t".repeat(2))
			}
			return (`
				<td ${Options?.filter(Boolean)?.join(" ")}>
					${eleventy.sanityImage(look?.image, {
						element: "picture",
						className: "look",
						backgroundSize: "auto 100%",
					}).replace(/^\t\t\t/mg, "\t".repeat(4))}
				</td>
			`)
		}
		/**
		 * Generates a look's description component.
		 * @returns {string} HTML markup for the look's description component. The markup consists of:
		 * - an empty placeholder if no description is found, or
		 * - the description if otherwise.
		 */
		const LookDescription = () => {
			const Class = `class="look-description"`
			const Options = [Class]
			return (`
				<td ${Options?.filter(Boolean)?.join(" ")}>
					${eleventy.portableTextToHtml(look?.description) || ""}
				</td>
			`)
		}
		const Class = `class="project-look"`
		const Content = `data-content="${[
			look?.image?.url ? "image" : "",
			look?.description && look?.description?.length !== 0 ? "description" : "",
		]?.filter(Boolean)?.join(" ")}"`
		const Options = [Class, Content]
		return (`
			<tr ${Options?.filter(Boolean)?.join(" ")}>
				${LookTitle()}
				${LookImage()}
				${LookDescription()}
			</tr>
		`).replace(/^\t\t\t/mg, "\t".repeat(4))
	}
	const ProjectReferences = () => {
		// guard against projects with no references
		if (
			!data.project?.references
			|| data.project?.references?.length === 0
			|| data.project?.reference?.filter((reference) => reference?.url)?.length === 0
		) { return "" }
		// continue...
		const Class = `class="project-references"`
		const Options = [Class]
		return (`
			<div ${Options?.filter(Boolean)?.join(" ")}>
				${data.project?.references?.map((reference) => Reference(reference))?.join("")}
			</div>
		`)
	}
	const Reference = (reference) => {
		// guard against references with no url
		if (!reference || !reference?.url) { return "" }
		// continue...
		const ReferenceSwitch = () => {
			try {
				const hostname = new URL(reference?.url).hostname.replace("www.", "")
				switch (hostname) {
					case "instagram.com": return InstagramReference()
					default: return DefaultReference()
				}
			} catch {
				return ""
			}
		}
		const InstagramReference = () => {}
		const DefaultReference = () => {}
		return (`
			<div>
				${ReferenceSwitch()}
			</div>
		`)
	}
	const Class = `class="project-info"`
	const Options = [Class]
	return (`
		<div ${Options?.filter(Boolean)?.join(" ")}>
			${ProjectTitle()}
			${ProjectDescription()}
			${ProjectStats()}
			${ProjectLooks()}
			${ProjectContributions()}
		</div>
	`)
}

module.exports = Project