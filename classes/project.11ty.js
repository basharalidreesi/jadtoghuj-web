class Project {
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
			layout: "main.11ty.js",
			tags: "project",
			permalink: data => `${data.settings.baseUrl || ""}${data.settings.projectPath}/${data.project.address}/`,
		}
	}
	render(data) {
		const eleventy = this
		return (`
			${lookbook(data, eleventy)}
			${projectInfo(data, eleventy)}
		`)
	}
}

const lookbook = (data, eleventy) => {
	const _class = `class="project-lookbook"`
	const dataSize = `data-size="${data.project?.lookbook?.length}"`
	const options = [_class, dataSize]
	return (`
		<figure ${options?.filter(Boolean).join(" ")}>
			${data.project?.lookbook?.map(entry => lookbookSwitch(entry, eleventy)).join("")}
			${lookbookControls(data)}
		</figure>
	`)
}

const lookbookSwitch = (entry, eleventy) => {
	switch(entry?.type) {
		case "image": return imageEntry(entry, eleventy)
		case "video": return videoEntry(entry, eleventy)
		default: return ""
	}
}

const imageEntry = (entry, eleventy) => {
	return eleventy.sanityImage(entry.asset, {
		element: "picture",
		className: "lookbook-entry",
		attributes: {
			"data-type": "image",
		},
	}).replace(/^\t\t\t/mg, "\t".repeat(6))
}

const videoEntry = (entry, eleventy) => {
	return eleventy.oEmbed(entry?.url, {
		element: "div",
		className: "lookbook-entry",
		attributes: {
			"data-type": "video",
		},
	}).replace(/^\t\t\t/mg, "\t".repeat(6))
}

const lookbookControls = (data) => {
	if (!data.project?.lookbook) { return "" }
	return (`
		<div class="lookbook-controls">
			<button class="left" data-direction="-1">
				<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<line x1="24" y1="12" x2="0" y2="12" />
					<polyline points="8.49,3.51 0,12 8.49,20.49" />
				</svg>
			</button>
			<button class="right" data-direction="1">
				<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<line x1="0" y1="12" x2="24" y2="12" />
					<polyline points="15.51,20.49 24,12 15.51,3.51" />
				</svg>
			</button>
		</div>
	`).replace(/^\t\t/mg, "\t".repeat(6))
}

const projectInfo = (data, eleventy) => {
	const _class = `class="project-info"`
	const dataContents = `data-contents="${[
		data.project?.description ? "description" : "",
		data.project?.year || data.project?.categories ? "stats" : "",
		data.project?.contributions ? "contributions" : "",
		data.project?.looks ? "looks" : ""
	]?.filter(Boolean)?.join(" ")}"`
	const options = [_class, dataContents]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			${projectTitle(data)}
			${projectDescription(data, eleventy)}
			${projectStats(data)}
			${projectContributions(data)}
			${projectLooks(data, eleventy)}
		</div>
	`)
}

const projectTitle = (data) => {
	const _class = `class="project-title"`
	const options = [_class]
	return (`
		<header ${options?.filter(Boolean)?.join(" ")}>
			<span>${data.project?.title}</span>
		</header>
	`).replace(/^\t\t/mg, "\t".repeat(6))
}

const projectDescription = (data, eleventy) => {
	if (!data.project?.description) { return "" }
	const _class = `class="project-description"`
	const options = [_class]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			${eleventy.portableTextToHtml(data.project?.description)}
		</div>
	`).replace(/^\t\t/mg, "\t".repeat(6))
}

const projectStats = (data) => {
	if (!data.project?.year && !data.project?.categories) { return "" }
	const _class = `class="project-stats"`
	const options = [_class]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			<p class="text">${[data.project?.year, data.project?.categories?.filter(Boolean)?.join(", ")].filter(Boolean)?.join(" • ")}</p>
		</div>
	`).replace(/^\t\t/mg, "\t".repeat(6))
}

const projectContributions = (data) => {
	if (!data.project?.contributions) { return "" }
	const _class = `class="project-contributions"`
	const options = [_class]
	return (`
		<dl ${options?.filter(Boolean)?.join(" ")}>
			${data.project?.contributions?.map(contribution => {
				return (`
					<dt class="text">
						<span>
							${contribution?.role}
						</span>
					</dt>
					${contribution?.persons?.map(person => {
						if (person?.url) {
							return (`
								<dd class="text">
									<a class="link" href="${person?.url}" rel="noopener" target="_blank">
										${person?.name}
									</a>
								</dd>
							`).replace(/^\t\t\t/mg, "\t".repeat(0))
						}
						return (`
							<dd class="text">
								<span>
									${person?.name}
								</span>
							</dd>
						`).replace(/^\t\t\t/mg, "\t".repeat(1))
					}).join("")}
				`).replace(/^\t\t\t/mg, "\t".repeat(1))
			}).join("")}
		</dl>
	`).replace(/^\t\t/mg, "\t".repeat(6))
}

const projectLooks = (data, eleventy) => {
	if (!data.project?.looks) { return "" }
	const _class = `class="project-looks"`
	const options = [_class]
	return (`
		<table ${options?.filter(Boolean)?.join(" ")}>
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
			${data.project?.looks?.map(look => {
				return projectLook(look, eleventy)
			}).join("")}
		</table>
	`).replace(/^\t\t/mg, "\t".repeat(6))
}

const projectLook = (look, eleventy) => {
	if (!look?.title && !look?.image && !look?.description) { return "" }
	const lookTitle = () => {
		const _class = `class="look-title"`
		const scope = `scope="row"`
		const options = [_class, scope]
		return (`
			<th ${options?.filter(Boolean)?.join(" ")}>
				<p class="text" dir="auto">
					${look.title || "Untitled"}
				</p>
			</th>
		`)
	}
	const lookImage = () => {
		const _class = `class="look-image"`
		const options = [_class]
		if (!look?.image) {
			return (`
				<td ${options?.filter(Boolean)?.join(" ")}>
					<svg width="24" height="24" viewBox="0 0 24 24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M0,12c1.6,0,3.14-0.31,4.6-0.92C6,10.52,7.29,9.64,8.47,8.46c1.16-1.14,2.04-2.43,2.64-3.87c0.59-1.4,0.88-2.93,0.88-4.6c0,1.62,0.3,3.15,0.9,4.6c0.54,1.36,1.42,2.65,2.64,3.87c1.12,1.14,2.41,2.01,3.87,2.62C20.85,11.69,22.38,12,24,12c-1.62,0-3.15,0.31-4.6,0.92c-1.46,0.61-2.76,1.48-3.87,2.62c-1.21,1.23-2.09,2.52-2.64,3.87c-0.6,1.46-0.9,2.99-0.9,4.6c0-1.65-0.29-3.18-0.88-4.6c-0.6-1.43-1.48-2.72-2.64-3.87C7.29,14.36,6,13.48,4.6,12.91C3.14,12.3,1.6,12,0,12z" />
					</svg>
				</td>
			`).replace(/^\t\t\t/mg, "\t".repeat(2))
		}
		return (`
			<td ${options?.filter(Boolean)?.join(" ")}>
				${eleventy.sanityImage(look?.image, {
					element: "picture",
					className: "look",
					backgroundSize: "auto 100%",
				}).replace(/^\t\t\t/mg, "\t".repeat(4))}
			</td>
		`)
	}
	const lookDescription = () => {
		const _class = `class="look-description"`
		const options = [_class]
		return (`
			<td ${options?.filter(Boolean)?.join(" ")}>
				${eleventy.portableTextToHtml(look?.description)}
			</td>
		`)
	}
	const id = `id="${look?.id}"`
	const _class = `class="project-look"`
	const dataContents = `data-contents="${[
		look?.image ? "image" : "",
		look?.description ? "description" : "",
	]?.filter(Boolean)?.join(" ")}"`
	const options = [
		id,
		_class,
		dataContents,
	]
	return (`
		<tr ${options?.filter(Boolean)?.join(" ")}>
			${lookTitle()}
			${lookImage()}
			${lookDescription()}
		</tr>
	`).replace(/^\t\t/mg, "\t".repeat(3))
}

module.exports = Project