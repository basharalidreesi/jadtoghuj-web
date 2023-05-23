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
		if (!data.project?.references || data.project?.references?.length === 0) { return "" }
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
					// case "instagram.com": return InstagramReference()
					default: return DefaultReference(hostname)
				}
			} catch {
				return ""
			}
		}
		const InstagramReference = () => {
			// return (`
			// 	<iframe src="${reference?.url?.split("?")?.[0] + "embed/captioned/"}" frameborder="0" allowtransparency="true" allowfullscreen="true" scrolling="no" style="background: white; max-width: 540px; width: calc(100% - 2px); border-radius: 3px; border: 1px solid rgb(219, 219, 219); box-shadow: none; display: block; margin: 0px 0px 12px; min-width: 326px; padding: 0px; overscroll-behavior: contain;"></iframe>
			// `)
			return (`
				<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${reference?.url}" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
					<div style="padding:16px;">
						<a href="${reference?.url}" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
							<div style=" display: flex; flex-direction: row; align-items: center;">
								<div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
								<div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
									<div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
									<div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
								</div>
							</div>
							<div style="padding: 19% 0;"></div>
							<div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
								<svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">
									<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
										<g transform="translate(-511.000000, -20.000000)" fill="#000000">
											<g>
												<path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
											</g>
										</g>
									</g>
								</svg>
							</div>
							<div style="padding-top: 8px;">
								<div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">
									View this post on Instagram
								</div>
							</div>
							<div style="padding: 12.5% 0;"></div>
							<div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;">
								<div>
									<div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div>
									<div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div>
									<div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div>
								</div>
								<div style="margin-left: 8px;">
									<div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div>
									<div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div>
								</div>
								<div style="margin-left: auto;">
									<div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div>
									<div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div>
									<div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div>
								</div>
							</div>
							<div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;">
								<div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div>
								<div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div>
							</div>
						</a>
					</div>
				</blockquote>
				<script async src="//www.instagram.com/embed.js"></script>
			`)
		}
		const DefaultReference = (hostname) => {
			return (`
				<a href="${reference?.url}">
					${reference?.title} → ${reference?.source?.toUpperCase() || hostname?.toUpperCase()}
				</a>
			`)
		}
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
			${ProjectContributions()}
			${ProjectLooks()}
		</div>
	`)
}

module.exports = Project