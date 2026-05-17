/**
 * Resizes resources/icon.png and generates resources/icon.ico for Windows.
 * Run: node scripts/build-icons.mjs
 */
import { readFile, writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const pngPath = resolve(root, 'resources/icon.png')
const icoPath = resolve(root, 'resources/icon.ico')

const SIZE = 512

const input = await readFile(pngPath)
const resized = await sharp(input)
  .resize(SIZE, SIZE, { fit: 'contain', background: { r: 15, g: 20, b: 25, alpha: 0 } })
  .png({ compressionLevel: 9, palette: true })
  .toBuffer()

await writeFile(pngPath, resized)
const ico = await pngToIco(resized)
await writeFile(icoPath, ico)

console.log(`Wrote ${pngPath} (${resized.length} bytes)`)
console.log(`Wrote ${icoPath} (${ico.length} bytes)`)
