class Projects {
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
		<div ${options?.filter(Boolean).join(" ")}>
			${data.project?.lookbook?.map(entry => lookbookSwitch(entry, eleventy, data)).join("")}
			${lookbookControls(data)}
		</div>
	`)
}

const lookbookSwitch = (entry, eleventy, data) => {
	switch(entry?.type) {
		case "image": return imageEntry(entry, eleventy)
		case "video": return videoEntry(entry, eleventy)
		default: return ""
	}
}

const imageEntry = (entry, eleventy) => {
	const _class = `class="lookbook-entry"`
	const style = {
		"background-image": `url(${entry?.asset?.lqip})`,
		"background-repeat": "no-repeat",
		"background-size": "100% 100%",
	}
	const dataType = `data-type="image"`
	const options = [_class, `style="${eleventy.formatCss(style)}"`, dataType]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			${eleventy.sanityImage(entry.asset)}
		</div>
	`)
}

const videoEntry = (entry, eleventy) => {
	const _class = `class="lookbook-entry"`
	const dataType = `data-type="video"`
	const options = [_class, dataType]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			<div>
				${eleventy.createVideoFromUrl(eleventy.parseUrl(entry?.url))}
			</div>
		</div>
	`)
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
	`)
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
	`)
}

const projectDescription = (data, eleventy) => {
	if (!data.project?.description) { return "" }
	const _class = `class="project-description"`
	const options = [_class]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			${eleventy.portableTextToHtml(data.project?.description)}
		</div>
	`)
}

const projectStats = (data) => {
	if (!data.project?.year && !data.project?.categories) { return "" }
	const _class = `class="project-stats"`
	const options = [_class]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			<p class="text">${[data.project?.year, data.project?.categories?.filter(Boolean)?.join(", ")].filter(Boolean)?.join(" • ")}</p>
		</div>
	`)
}

const projectContributions = (data) => {
	if (!data.project?.contributors) { return "" }
	const _class = `class="project-contributions"`
	const options = [_class]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			<dl>
				${data.project?.contributors?.map(contribution => {
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
								`)
							}
							return (`
								<dd class="text">
									${person?.name}
								</dd>
							`)
						}).join("")}
					`)
				}).join("")}
			</dl>
		</div>
	`)
}

const projectLooks = (data, eleventy) => {
	if (!data.project?.looks) { return "" }
	const _class = `class="project-looks"`
	const options = [_class]
	return (`
		<div ${options?.filter(Boolean)?.join(" ")}>
			${data.project?.looks?.map(look => {
				const _class = `class="project-look"`
				const options = [_class]
				return (`
					<figure ${options?.filter(Boolean)?.join(" ")}>
						${look?.display ? eleventy.sanityImage(look?.display) : ""}
						${look?.title || look?.description ? lookDescription(look, eleventy) : ""}
					</figure>
				`)
			})}
		</div>
	`)
}

const lookDescription = (look, eleventy) => {
	return (`
		<figcaption>
			${look?.title ? (`
				<header>
					${look.title}
				</header>
			`) : ""}
			${look?.description ? eleventy.portableTextToHtml(look?.description) : ""}
		</figcaption>
	`)
}

module.exports = Projects