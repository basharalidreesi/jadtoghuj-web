import sanityClient from "../sanity/sanity.cli";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityAsset } from "@sanity/image-url/lib/types/types";

export const stripHtmlString = (htmlString: string) => {
	return htmlString?.replace(/<(\w+)([^>]*)\s(?:class|id|style)="[^"]*"([^>]*)>/g, "<$1$2$3>");
};

export const sanityImageBuilder = imageUrlBuilder(sanityClient);

export function urlForSanityImage(source: SanityAsset) {
	return sanityImageBuilder.image(source);
};