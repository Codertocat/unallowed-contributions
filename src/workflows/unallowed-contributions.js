#!/usr/bin/env node
const fs = require('fs')
const matter = require('gray-matter')
const yaml = require('js-yaml')
const path = require('path')

const { PR_NUMBER, ORGANIZATION, REPO, FILE_PATHS_NOT_ALLOWED, FILE_PATHS_CONTENT_TYPES } = process.env

const { notAllowed } = yaml.load(fs.readFileSync('./src/workflows/unallowed-contribution-filters.yml', 'utf8'))

main()
async function main() {
  const unallowedChangedFiles = [...JSON.parse(FILE_PATHS_NOT_ALLOWED)]
  for (const filePath of JSON.parse(FILE_PATHS_CONTENT_TYPES)) { 
    const { data } = matter(fs.readFileSync(`./${filePath}`, 'utf8'))
    if (data.type === 'rai') {
      unallowedChangedFiles.push(filePath)
    }
  }
  if (unallowedChangedFiles.length === 0) return

  const formattedUnallowedChangedFiles = `\n- ${unallowedChangedFiles.join('\n- ')}\n`
  const formattedNotAllowed = `\n - ${notAllowed.join('\n -')}\n`

  const reviewMessage = `👋 Hey there spelunker. It looks like you've modified some files that we can't accept as contributions:${formattedUnallowedChangedFiles}\n You'll need to revert all of the files you changed that match that list using [GitHub Desktop](https://docs.github.com/en/free-pro-team@latest/desktop/contributing-and-collaborating-using-github-desktop/managing-commits/reverting-a-commit-in-github-desktop) or \`git checkout origin/main <file name>\`. Once you get those files reverted, we can continue with the review process. :octocat:\n\nThe complete list of files we can't accept are:${formattedNotAllowed}\nWe also can't accept contributions to files in the content directory with frontmatter \`type: rai\`.`
  console.log('review message', reviewMessage)
}