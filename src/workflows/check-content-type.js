#!/usr/bin/env node

import { readFileSync } from 'fs/promises'
import coreLib from '@actions/core'
import matter from 'gray-matter'

const { FILE_PATHS_CONTENT_TYPES, CONTENT_TYPE } = process.env

main()

async function main() {
  const filePaths = JSON.parse(FILE_PATHS_CONTENT_TYPES)
  const containsRai = await checkContentType(filePaths, CONTENT_TYPE)
  if (containsRai.length === 0) {
    coreLib.setOutput('contentType', false)
  } else {
    coreLib.setOutput('contentType', true)
  }
}

export async function checkContentType(filePaths, type) {
  const unallowedChangedFiles = []
  for (const filePath of filePaths) {
    const { data } = matter(readFileSync(`./${filePath}`, 'utf8'))
    if (data.type === type) {
      unallowedChangedFiles.push(filePath)
    }
  }
  return unallowedChangedFiles
}