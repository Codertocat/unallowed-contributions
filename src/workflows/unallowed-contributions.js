#!/usr/bin/env node
const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const { PR_NUMBER, ORGANIZATION, REPO, FILE_PATHS_NOT_ALLOWED, FILE_PATHS_CONTENT_TYPES } = process.env

console.log('not allowed', FILE_PATHS_NOT_ALLOWED)


const { notAllowed } = yaml.load(fs.readFileSync('./src/workflows/unallowed-contribution-filters.yml', 'utf8'))
console.log('cwd', process.cwd())

main()
async function main() {
  const unallowedFiles = [...JSON.parse(FILE_PATHS_NOT_ALLOWED)]
  for (const filePath of JSON.parse(FILE_PATHS_CONTENT_TYPES)) { 
    // read fm and add to array if type is rai
    const fileContent = fs.readFileSync(`./${filePath}`, 'utf8')
    const yam = yaml.load(fileContent)
    console.log('yaml', yam)
    // if (.data.type === 'rai') {
    //   unallowedFiles.push(filePath)
    // }
  }
  if (unallowedFiles.length === 0) return

  const reviewMessage = `👋 Hey there spelunker. It looks like you've modified some files that we can't accept as contributions:${unallowedFiles} You'll need to revert all of the files you changed that match that list using [GitHub Desktop](https://docs.github.com/en/free-pro-team@latest/desktop/contributing-and-collaborating-using-github-desktop/managing-commits/reverting-a-commit-in-github-desktop) or \`git checkout origin/main <file name>\`. Once you get those files reverted, we can continue with the review process. :octocat:\n\nThe complete list of files we can't accept are:\n${notAllowed}\n\nWe also can't accept contributions to files in the content directory with frontmatter \`type: rai\`.`
  console.log('review message', reviewMessage)
}