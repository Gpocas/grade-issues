import { Octokit } from "octokit";
import { ghResponse } from "./schema.ts";

const octokit = new Octokit({
  auth: Deno.env.get("GITHUB_TOKEN"),
});

const orgName = Deno.env.get("GITHUB_ORGNAME") ?? "";

const repos = await octokit.paginate("GET /orgs/{org}/repos", {
  org: orgName,
  sort: "updated",
  per_page: 100,
});

const arrData: ghResponse[] = [];
for (const data of repos) {
  const repoName = data.name;

  const issues = await octokit.paginate("GET /repos/{owner}/{repo}/issues", {
    owner: orgName,
    repo: repoName,
  });

  if (issues) {
    for (const data of issues) {
      const objData = {
        repo: repoName,
        title: data.title,
        username: data.user?.login ?? null,
        urlIssue: data.html_url,
        createdAt: data.created_at,
        updateddAt: data.updated_at,
      };
      arrData.push(objData);
    }
  }
}

arrData.sort((a, b) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

await Deno.writeTextFile("issues.json", JSON.stringify(arrData, null, 2));
