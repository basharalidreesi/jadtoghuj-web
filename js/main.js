"use strict";

const jad = {

	lexicon: {
		// nav
		navButtons: document.querySelectorAll(".nav-expand"),
		// pages
		pageBody: document.querySelector(`body[data-layout="page"]`),
		pressTitles: document.querySelectorAll(".press-title"),
		// projects
		header: document.querySelector(".header"),
		projectBody: document.querySelector(`body[data-layout="project"]`),
		projectTitle: document.querySelector(".project-info .project-title"),
		lookbook: document.querySelector(".project-lookbook"),
		lookbookEntries: document.querySelectorAll(".lookbook-entry"),
		lookbookControlers: document.querySelectorAll(".lookbook-controlers > *"),
		// oEmbeds
		oEmbeds: document.querySelectorAll(`[data-oembed="true"]`),
	},

	initAllScripts: function() {
		this.nav.initNavScripts();
		this.pages.initPageScripts();
		this.projects.initProjectScripts();
		this.oEmbeds.initOEmbedScripts();
	},

	nav: {
		initNavScripts: function() {
			if (!jad.lexicon.navButtons) { return; }
			this.enableNavButtons();
		},
		enableNavButtons: function() {
			jad.lexicon.navButtons.forEach((button) => {
				button.addEventListener("click", () => {
					const menu = document.getElementById(button.getAttribute("aria-controls"));
					if (button.getAttribute("aria-expanded") === "false") {
						button.setAttribute("aria-expanded", "true");
						menu.classList.add("active");
						return;
					}
					button.setAttribute("aria-expanded", "false");
					menu.classList.remove("active");
				});
			});
			window.addEventListener("click", (event) => {
				if (!event.target.closest(".nav.active") && !event.target.closest(".nav-subgroup.active") && !event.target.closest('.nav-expand[aria-expanded="true"]')) {
					const activeNav = document.querySelector(".nav.active");
					const activeMenus = document.querySelectorAll(".nav-subgroup.active");
					const activeButtons = document.querySelectorAll('.nav-expand[aria-expanded="true"]');
					activeNav?.classList.remove("active");
					activeMenus?.forEach((menu) => {
						menu?.classList.remove("active");
					});
					activeButtons?.forEach((button) => {
						button?.setAttribute("aria-expanded", "false");
					});
				}
			});
		},
	},

	pages: {
		initPageScripts: function() {
			if (!jad.lexicon.pageBody) { return; }
			this.resolvePressDirs();
		},
		resolvePressDirs: function() {
			if (!jad.lexicon.pressTitles) { return; }
			jad.lexicon.pressTitles.forEach((title) => {
				const computedDir = window.getComputedStyle(title, null).direction;
				if (computedDir === "rtl") {
					const publisher = title.parentElement.querySelector(".press-publisher");
					if (!publisher) { return; }
					publisher.setAttribute("dir", "rtl");
				}
			});
		}
	},

	projects: {
		initProjectScripts: function() {
			if (!jad.lexicon.projectBody) { return; }
			this.observeIntersections();
			this.observeResizes();
			this.enableTitleScroll();
			this.enableControlers();
		},
		currentIntersection: null,
		observeIntersections: function() {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.currentIntersection = entry.target;
					}
				});
			}, {
				root: jad.lexicon.lookbook,
				rootMargin: "0px -50% 0px -50%",
			});
			jad.lexicon.lookbookEntries.forEach((entry) => {
				observer.observe(entry);
			});
		},
		observeResizes: function() {
			const toleranceAmount = 100;
			const observer = new ResizeObserver((entries) => {
				entries.forEach((entry) => {
					if (Math.abs(entry.target.scrollWidth - window.innerWidth) >= toleranceAmount) {
						jad.lexicon.lookbookControlers[0].parentElement.removeAttribute("hidden");
					} else {
						jad.lexicon.lookbookControlers[0].parentElement.setAttribute("hidden", "hidden");
					}
				});
			});
			observer.observe(jad.lexicon.lookbook);
		},
		enableTitleScroll: function() {
			jad.lexicon.projectTitle.addEventListener("click", () => {
				const offsetTop = jad.lexicon.projectTitle.parentElement.offsetTop;
				const offsetHeight = jad.lexicon.header.offsetHeight;
				const padding = 16;
				const scrollTop = offsetTop - offsetHeight - padding;
				if (Math.round(window.scrollY) >= scrollTop || window.scrollY === document.body.scrollHeight - window.innerHeight) {
					window.scrollTo(0, 0);
					return;
				}
				window.scrollTo(0, scrollTop);
			});
		},
		enableControlers: function() {
			jad.lexicon.lookbookControlers.forEach((controler) => {
				controler.addEventListener("click", () => {
					const direction = this.resolveDirection(controler.getAttribute("data-direction"));
					this.seek(direction);
				});
			});
		},
		resolveDirection: function(request) {
			const toleranceAmount = 50;
			const delta = this.currentIntersection.offsetLeft - jad.lexicon.lookbook.scrollLeft + (this.currentIntersection.offsetWidth / 2) - (window.innerWidth / 2);
			if (request === "previous" && jad.lexicon.lookbook.scrollLeft <= toleranceAmount) {
				return "end";
			}
			if (request === "next" && Math.abs(jad.lexicon.lookbook.scrollLeft - (jad.lexicon.lookbook.scrollWidth - window.innerWidth)) <= toleranceAmount) {
				return "start";
			}
			if (request === "previous" && delta < toleranceAmount * -1) {
				return "current";
			}
			if (request === "next" && delta > toleranceAmount) {
				return "current";
			}
			return request;
		},
		seek: function(direction) {
			switch(direction) {
				case "start": {
					jad.lexicon.lookbook.scrollLeft = 0;
					break;
				}
				case "previous": {
					const previous = this.currentIntersection.previousElementSibling;
					previous ? jad.lexicon.lookbook.scrollLeft = this.getScrollLeftFor(previous) : this.seek("start");
					break;
				}
				case "current": {
					const current = this.currentIntersection;
					jad.lexicon.lookbook.scrollLeft = this.getScrollLeftFor(current);
					break;
				}
				case "next": {
					const next = this.currentIntersection.nextElementSibling;
					next ? jad.lexicon.lookbook.scrollLeft = this.getScrollLeftFor(next) : this.seek("end");
					break;
				}
				case "end": {
					jad.lexicon.lookbook.scrollLeft = jad.lexicon.lookbook.scrollWidth - window.innerWidth;
					break;
				}
				default: break;
			}
		},
		getScrollLeftFor: function(target) {
			return target.offsetLeft - (window.innerWidth / 2) + (target.offsetWidth / 2);
		},
	},

	oEmbeds: {
		initOEmbedScripts: function() {
			if (!jad.lexicon.oEmbeds) { return; }
			this.enableOEmbeds();
		},
		enableOEmbeds: function() {
			jad.lexicon.oEmbeds.forEach(async (target) => {
				const params = this.parseOEmbedTarget(target);
				const query = this.resolveOEmbedTarget(params);
				const oEmbed = await this.getOEmbed(query);
				this.createOEmbed(target, oEmbed?.html);
			});
		},
		parseOEmbedTarget: function(target) {
			const url = target.getAttribute("data-oembed-url");
			const hostname = target.getAttribute("data-oembed-hostname");
			return {
				url: url,
				hostname: hostname,
			}
		},
		resolveOEmbedTarget: function({ url, hostname }) {
			switch(hostname) {
				case "youtube.com": return this.formatOEmbedQuery("youtube", url);
				case "youtu.be": return this.formatOEmbedQuery("youtube", url);
				case "vimeo.com": return this.formatOEmbedQuery("vimeo", url);
			}
		},
		formatOEmbedQuery: function(service, url) {
			const uri = encodeURIComponent(url)
			switch(service) {
				case "youtube": return (`https://youtube.com/oembed?url=${uri}&format=json`);
				case "vimeo": return (`https://vimeo.com/api/oembed.json?url=${uri}`);
			}
		},
		getOEmbed: async function(query) {
			return await fetch(query).then(async function (response) {
				return response.json().then(function (data) {
					return data;
				});
			});
		},
		createOEmbed: function(target, html) {
			if (!html) { return; }
			const div = document.createElement("div");
			div.classList.add("oembed");
			div.innerHTML = html;
			this.modifyOEmbed(Array.from(div.children));
			target.appendChild(div);
		},
		modifyOEmbed: function(targets) {
			const addLazyLoading = (target) => {
				target.setAttribute("loading", "lazy");
			}
			const addYouTubeNoCookie = (target) => {
				target.setAttribute("src", target.getAttribute("src").replace("youtube.com", "youtube-nocookie.com"));
			}
			targets.forEach((target) => {
				const tagName = target.tagName.toLowerCase();
				if (tagName === "iframe" && target.getAttribute("loading") !== "lazy") {
					addLazyLoading(target);
				}
				if (tagName === "iframe" && target.getAttribute("src").includes("youtube.com")) {
					addYouTubeNoCookie(target);
				}
			});
		},
	},

	// scrapes: {
	// 	initScrapeScripts: function() {},
	// 	scrape: async function(value) {
	// 		// https://stackoverflow.com/questions/72916900/integrating-a-link-preview-image-scraper-into-link-and-tab-generation
	// 		if (!value) { return }
	// 		const response = await fetch(value)
	// 		const text = await response.text()
	// 		const scrape = function(target) {
	// 			switch(target) {
	// 				case "title": {
	// 					const title = text.match(/<title>(.*?)<\/title>/)[1]
	// 					return title
	// 				}
	// 				case "ogImage": {
	// 					const tokens = text.split(" ")
	// 					const ogImageIndex = (tokens.indexOf(`property="og:image"`) + 1)
	// 					const ogImageUrl = tokens[ogImageIndex];
	// 					if (ogImageUrl.match(/\"(.*?)\"/mg) !== null) {
	// 						return ogImageUrl.match(/\"(.*?)\"/mg).toString()
	// 					} else {
	// 						return null
	// 					}
	// 				}
	// 			}
	// 		}
	// 		const finds = {
	// 			title: scrape("title"),
	// 			image: scrape("ogImage"),
	// 		}
	// 		return finds.image
	// 	},
	// },

}

jad.initAllScripts();