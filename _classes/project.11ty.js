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
	async render(data) {
		const eleventy = this
		return (`
			${await lookbook(data, eleventy)}
			${projectInfo(data, eleventy)}
		`)
	}
}

const lookbook = async (data, eleventy) => {
	const _class = `class="project-lookbook"`
	const dataSize = `data-size="${data.project?.lookbook?.length}"`
	const options = [_class, dataSize]
	return (`
		<figure ${options?.filter(Boolean).join(" ")}>
			${await Promise.all(data.project?.lookbook?.map(async entry => await lookbookSwitch(entry, eleventy))).then(result => result.join(""))}
			${lookbookControls(data)}
		</figure>
	`)
}

const lookbookSwitch = async (entry, eleventy) => {
	switch(entry?.type) {
		case "image": return imageEntry(entry, eleventy)
		case "video": return await videoEntry(entry, eleventy)
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

const videoEntry = async (entry, eleventy) => {
	const _class = `class="lookbook-entry"`
	const dataType = `data-type="video"`
	const options = [_class, dataType]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			<div>
				${await eleventy.createVideoFromUrl(eleventy.parseUrl(entry?.url))}
			</div>
		</div>
	`).replace(/^\t\t\t/mg, "\t".repeat(6))
}

const lookbookControls = (data) => {
	if (!data.project?.lookbook || data.project?.lookbook?.length <= 1) { return "" }
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
	const options = [_class]
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
						${contribution?.role}
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
								${person?.name}
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
	if (!look?.title && !look?.display && !look?.description) { return "" }
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
		`).replace(/^\t\t/mg, "\t".repeat(3))
	}
	const lookImage = () => {
		const element = "td"
		const className = "look-image"
		if (!look?.display) {
			return (`
				<${element} class="${className}">
					<svg width="24" height="24" viewBox="0 0 24 24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
						<line x1="0" y1="0" x2="24" y2="24" />
						<line x1="0" y1="24" x2="24" y2="0" />
					</svg>
				</${element}>
			`)
		}
		return eleventy.sanityImage(look?.display, {
			element: element,
			className: className,
		})
	}
	const lookDescription = () => {
		const _class = `class="look-description"`
		const options = [_class]
		return (`
			<td ${options?.filter(Boolean)?.join(" ")}>
				${eleventy.portableTextToHtml(look?.description)}
			</td>
		`).replace(/^\t\t/mg, "\t".repeat(3))
	}
	const id = `id="${look?.id}"`
	const _class = `class="project-look"`
	const dataContents = `data-contents="${[
		look?.display ? "image" : "",
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