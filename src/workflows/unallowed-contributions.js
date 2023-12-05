#!/usr/bin/env node

import coreLib from '@actions/core'
import { readFileSync } from 'fs'
import yaml from 'js-yaml'

import { checkContentType } from '#src/workflows/check-content-type.js'
import github from '#src/workflows/github.js'

const core = coreLib
const octokit = github()

const { PR_NUMBER, REPO_OWNER_AND_NAME, FILE_PATHS_NOT_ALLOWED, FILE_PATHS_CONTENT_TYPES } =
  process.env
const [owner, repo] = REPO_OWNER_AND_NAME.split('/')
const { unallowedFiles } = yaml.load(
  readFileSync('./src/workflows/unallowed-contribution-filters.yml', 'utf8'),
)

main()

async function main() {
  // Files in the diff that match specific paths we don't allow
  const unallowedChangedFiles = [...JSON.parse(FILE_PATHS_NOT_ALLOWED)]
  // Any changes to a file in the content directory could potentially
  // have `type: rai` so each changed content file's frontmatter needs
  // to be checked.
  unallowedChangedFiles.push(...await checkContentType(JSON.parse(FILE_PATHS_CONTENT_TYPES), 'rai'))

  if (unallowedChangedFiles.length === 0) return

  // Formatted list of files to use in the PR comment
  const listUnallowedChangedFiles = `\n- ${unallowedChangedFiles.join('\n- ')}\n`
  const listunallowedFiles = `\n - ${unallowedFiles.join('\n -')}\n`

  const reviewMessage = `👋 Hey there spelunker. It looks like you've modified some files that we can't accept as contributions:${listUnallowedChangedFiles}\n You'll need to revert all of the files you changed that match that list using [GitHub Desktop](https://docs.github.com/en/free-pro-team@latest/desktop/contributing-and-collaborating-using-github-desktop/managing-commits/reverting-a-commit-in-github-desktop) or \`git checkout origin/main <file name>\`. Once you get those files reverted, we can continue with the review process. :octocat:\n\nThe complete list of files we can't accept are:${listunallowedFiles}\nWe also can't accept contributions to files in the content directory with frontmatter \`type: rai\`.`

  let workflowFailMessage =
    "It looks like you've modified some files that we can't accept as contributions."
  let createdComment

  try {
    createdComment = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: PR_NUMBER,
      body: reviewMessage,
    })

    workflowFailMessage = `${workflowFailMessage} Please see ${createdComment.data.html_url} for details.`
  } catch (err) {
    console.log('Error creating comment.', err)
  }

  core.setFailed(workflowFailMessage)
}
