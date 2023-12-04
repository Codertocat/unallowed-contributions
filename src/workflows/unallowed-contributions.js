#!/usr/bin/env node

console.log('not allowed', process.env.FILE_PATHS_NOTALLOWED)
console.log('content types', process.env.FILE_PATHS_CONTENTTYPES)
console.log('pr number', process.env.PR_NUMBER)