import { program } from 'commander'

program
  .description('Check if file paths match the exclude list and comment with a message if they do')
  .option('--paths', 'Paths to check for changes')
  .option('--pr', "Pull request number to post a comment on")
  .parse(process.argv)

const { paths, pr } = program.opts()

console.log('paths', paths)
console.log('pr number', pr)