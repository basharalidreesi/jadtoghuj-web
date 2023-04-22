"use strict";

const jad = {

	lexicon: {
		// nav
		navButtons: document.querySelectorAll(".nav-expand"),
		// lookbook
		lookbook: document.querySelector(".project-lookbook"),
		lookbookEntries: document.querySelectorAll(".lookbook-entry"),
		lookbookControls: document.querySelectorAll(".lookbook-controls > *"),
		// oEmbed
		oEmbeds: document.querySelectorAll(`[data-oembed="true"]`),
	},

	initAllScripts: function() {
		this.nav.initNavScripts();
		this.lookbook.initLookbookScripts();
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

	lookbook: {
		initLookbookScripts: function() {
			if (!jad.lexicon.lookbookControls) { return; }
			this.observeIntersections();
			this.enableControls();
		},
		currentIntersection: null,
		observeIntersections: function() {
			let observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.currentIntersection = entry.target;
						entry.target.classList.add("active");
					} else {
						entry.target.classList.remove("active");
					}
				});
			}, {
				root: jad.lexicon.lookbook,
				rootMargin: "0px -50% 0px -50%",
			});
			jad.lexicon.lookbookEntries.forEach((image) => {
				observer.observe(image);
			});
		},
		enableControls: function() {
			jad.lexicon.lookbookControls.forEach((control) => {
				const direction = parseInt(control.getAttribute("data-direction"));
				control.addEventListener("click", () => {
					this.seek(direction);
				});
			});
		},
		seek: function(direction) {
			console.log(direction);
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
			switch (service) {
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

}

jad.initAllScripts();