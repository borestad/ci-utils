#!/usr/bin/env -S deno run -A

import $ from 'https://deno.land/x/dax@0.31.0/mod.ts'
import { parse } from 'https://deno.land/std@0.182.0/path/mod.ts'
import { mapLimit } from 'promise-utils/map.ts'
import ky from 'https://esm.sh/ky'

const { log } = console
log()

let files = []

function readableBytes(bytes: number) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  return `${1 * ((bytes / 1024 ** i).toFixed(1) as any)} ${sizes[i]}`
}

/*
  Some magic to allow extremely simple input/renaming functinality like
  dl https://speedtest.tele2.net/100Mb.zip http://speedtest.tele2.net/10Mb.zip foobar.zip
    { url: "https://speedtest.tele2.net/100Mb.zip", output: "100Mb.zip" },
    { url: "http://speedtest.tele2.net/10Mb.zip", output: "foobar.zip" }
*/
for (let i = 0; i < Deno.args.length; i++) {
  const arg = Deno.args[i]
  const dl = { url: '', output: '' }

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
let totalFiles = 0

const result = await mapLimit(files, 4, async (dl, i) => {
  let res
  let prefix = ''
  let size = ''
  let percent = ''

  const tempFilePath = await Deno.makeTempFile()

  const pb = $.progress('').noClear()

  try {
    res = await ky.get(dl.url, {
      onDownloadProgress: (progress, _chunk) => {
        pb.message(dl.url)
        percent = `${(progress.percent * 100).toFixed(0)}%`
        size = `${readableBytes(progress.totalBytes).padStart(11)}`
        prefix = `${percent.padStart(4)} ${size.padStart(6)}`

        pb.prefix(prefix)
        pb.position(Math.round(progress.percent * 100))
        pbtotal.forceRender()
      },
    })

    pbtotal.finish()

    if (files.length >= 2)
      pbtotal = $.progress(`Downloaded files ...${++totalFiles} of ${files.length}`)

    pbtotal.forceRender()

    const blob = await res.blob()
    pbtotal.forceRender()
    await Deno.writeFile(tempFilePath, blob.stream())
    pbtotal.forceRender()
    await Deno.rename(tempFilePath, `./${dl.output}`)
    pbtotal.forceRender()

    pb.prefix(`✅ OK ${size?.padStart(12)}`)
  }
  catch (err) {
    pb.prefix('❌ ERR   '.padEnd(17))
    pb.message(`${dl.url} [${err}]`)
  }

  pb.finish()
  return res
})

pbtotal.noClear()
pbtotal?.finish()
