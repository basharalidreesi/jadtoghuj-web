"use strict";

const jad = {

	lexicon: {
		// nav
		navButtons: document.querySelectorAll(".nav-expand"),
		// lookbook
		lookbook: document.querySelector(".project-lookbook"),
		lookbookEntries: document.querySelectorAll(".lookbook-entry"),
		lookbookControls: document.querySelectorAll(".lookbook-controls > *"),
	},

	initAllScripts: function() {
		this.nav.initNavScripts();
		this.lookbook.initLookbookScripts();
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

}

jad.initAllScripts();