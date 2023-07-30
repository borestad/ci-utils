#!/usr/bin/env -S deno run --unstable -A

import $ from 'https://deno.land/x/dax@0.31.0/mod.ts'
import { parse } from 'https://deno.land/std@0.182.0/path/mod.ts'
import { mapLimit } from 'https://cdn.jsdelivr.net/gh/blend/promise-utils/src/map.ts'
import ky from 'https://esm.sh/ky@0.33.3'
import throttle from 'https://deno.land/x/froebel@v0.23.2/throttle.ts'

const { log } = console
log()

let files = []
function readableBytes(bytes: number) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  // deno-lint-ignore no-explicit-any
  return `${1 * ((bytes / 1024 ** i).toFixed(1) as any)} ${sizes[i]}`
}

interface Download {
  url: string
  output: string
}

/*
  Some magic to allow extremely simple input/renaming functinality like
  dl https://speedtest.tele2.net/100Mb.zip http://speedtest.tele2.net/10Mb.zip foobar.zip
    { url: "https://speedtest.tele2.net/100Mb.zip", output: "100Mb.zip" },
    { url: "http://speedtest.tele2.net/10Mb.zip", output: "foobar.zip" }
*/
for (let i = 0; i < Deno.args.length; i++) {
  const arg = Deno.args[i]
  const dl: Download = { url: '', output: '' }

  if (/http(s?):/.test(arg)) {
    dl.url = arg
    dl.output = parse(dl.url).base
  }
  else {
    (files[i - 1]).output = arg
  }
  files.push(dl)
}
files = files.filter(dl => dl.url)

let pbtotal = $.progress('').noClear()

const state = {
  totalFiles: 0,
  totalSize: 0,
  files: new Map(),
}

await mapLimit(files, 8, async (dl: Download) => {
  let res
  let prefix = ''
  let size = ''
  let percent = ''
  const start = Date.now()
  let benchmark

  const tempFilePath = await Deno.makeTempFile()
  const pb = $.progress('').noClear()
  pbtotal.finish()

  if (files.length >= 2)
    pbtotal = $.progress(`Downloading... ${++state.totalFiles} of ${files.length} files`)

  try {
    res = await ky.get(dl.url, {
      onDownloadProgress: throttle((progress, _chunk) => {
        pb.message(`${dl.url} → (${dl.output})`)

        percent = `${(progress.percent * 100).toFixed(0)}%`
        size = `${readableBytes(progress.totalBytes)}`
        benchmark = `${((Date.now() - start) / 1000).toFixed(1).toString()}s`
        prefix = ` ${benchmark.padEnd(6)} ${percent.padEnd(4)} ${size.padStart(8)}`

        pb.prefix(prefix)
      }, 50),
    })

    const blob = await res.blob()
    await Deno.writeFile(tempFilePath, blob.stream())
    await Deno.rename(tempFilePath, `./${dl.output}`)

    benchmark = `${((Date.now() - start) / 1000).toFixed(1).toString()}s`

    pb.prefix(`✅ ${benchmark.padEnd(11)} ${size?.padStart(8)}`)
  }
  catch (err) {
    pb.prefix('❌ ERR   '.padEnd(22))
    pb.message(`${dl.url} [${err}]`)
  }

  pb.finish()
  return res
})

pbtotal.prefix('Downloaded...')
pbtotal.noClear()
pbtotal?.finish()
