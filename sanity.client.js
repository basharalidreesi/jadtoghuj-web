const { createClient } = require("@sanity/client")

const projectId = "nhelboup"
const dataset = "production"
const useCdn = false
const apiVersion = "2023-04-16"

module.exports = createClient({
	projectId,
	dataset,
	useCdn,
	apiVersion,
})