import { spawn } from 'child_process'
import { writeFileSync } from 'fs'

const PAW = process.env.USERPROFILE + '\\.meituan-catpaw\\bin\\paw.cmd'

function browserAction(action) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(action)
    const child = spawn(PAW, ['browser-action', json], {
      shell: false,
      env: process.env,
      windowsHide: true
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))
    child.on('close', (code) => {
      try {
        const idx = stdout.indexOf('{')
        const jsonStr = idx >= 0 ? stdout.slice(idx) : '{}'
        const data = JSON.parse(jsonStr)
        if (data.success) resolve(data.data)
        else reject(new Error(data.error + ' stderr: ' + stderr))
      } catch (e) {
        reject(new Error('Parse error: ' + stdout.slice(0, 300) + ' stderr: ' + stderr))
      }
    })
    child.on('error', reject)
  })
}

async function main() {
  console.log('Navigating to http://localhost:3000...')
  const nav = await browserAction({ action: 'navigate', url: 'http://localhost:3000' })
  console.log('Navigated:', nav.title)
  await new Promise((r) => setTimeout(r, 2000))
  console.log('Taking screenshot...')
  const result = await browserAction({ action: 'screenshot', fullPage: false })
  if (result.path) console.log('Screenshot saved to:', result.path)
  if (result.base64) {
    const outFile = 'D:/Code/open/ydsz-worker/website/screenshot-homepage.png'
    writeFileSync(outFile, Buffer.from(result.base64.replace(/^data:image\/\w+;base64,/, ''), 'base64'))
    console.log('Screenshot written to:', outFile)
  }
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1) })
