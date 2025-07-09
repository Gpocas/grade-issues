import { Octokit } from "octokit";

const octokit = new Octokit({
	auth: Deno.env.get("GITHUB_TOKEN"),
});

const orgName = Deno.env.get("GITHUB_ORGNAME") ?? ''

const repos = await octokit.request("GET /orgs/{org}/repos", {
	org: orgName,
	sort: "updated",
	per_page: 100,
});

const arrData: object[] = [];
for (const data of repos.data) {
	const repoName = data.name;

	const issues = await octokit.request("GET /repos/{owner}/{repo}/issues", {
		owner: orgName,
		repo: repoName,
	});

	if (issues.data) {
		const allIssues = issues.data;
		for (const data of allIssues) {
			const objData = {
				repo: repoName,
				title: data.title,
				username: data.user?.login,
				url: data.html_url,
				createdAt: data.created_at,
				updateddAt: data.updated_at,
			};
			arrData.push(objData);
		}
	}
}

arrData.sort((a, b) => new Date(b.updateddAt) - new Date(a.updateddAt))

await Deno.writeTextFile("issues.json", JSON.stringify(arrData));
