import { createClient } from "@sanity/client";

const sanityClient = createClient({
	projectId: "r5iw9ewg",
	dataset: "production",
	useCdn: false,
	apiVersion: "2024-10-07",
});

export default sanityClient;