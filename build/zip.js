import { execFile } from 'child_process'
import advzip from 'advzip-bin'

export function zip (inFile, outFile) {
  return new Promise((resolve, reject) => {
    execFile(advzip, ['-4', '-i', 2000, '-a', outFile, inFile], err => {
      if (err) { return reject(err) }
      resolve()
    })
  })
}
