/* eslint-disable import/no-unresolved */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
import createFileList from 'create-file-list'

let fileList = { files: [] }
const fName = null
let mxSiz = null

function getFileSize(size) {
  const unt = ['Bytes', 'KB', 'MB', 'GB']
  let i = 0
  while (size > 900) {
    size /= 1024
    i += 1
  }
  return `${Math.round(size * 100) / 100} ${unt[i]}`
}

export function delItem(el) {
  fileList = { files: [] }
  const fInp = el.parentNode.parentNode.parentNode.querySelector('input[type="file"]')
  for (let i = 0; i < fInp.files.length; i += 1) {
    fileList.files.push(fInp.files[i])
  }
  fileList.files.splice(el.getAttribute('data-index'), 1)

  fInp.files = createFileList(...fileList.files)
  if (fInp.files.length > 0) {
    el.parentNode.parentNode.parentNode.querySelector('.btcd-f-title').innerHTML =
      `${fInp.files.length} File Selected`
  } else {
    el.parentNode.parentNode.parentNode.querySelector('.btcd-f-title').innerHTML = 'No File Chosen'
  }
  el.parentNode.remove()
}

function fade(element) {
  let op = 1
  const timer = setInterval(() => {
    if (op <= 0.1) {
      clearInterval(timer)
      element.style.display = 'none'
    }
    element.style.opacity = op
    element.style.filter = `alpha(opacity=${op * 100})`
    op -= op * 0.1
  }, 50)
}

function unfade(element) {
  let op = 0.01
  element.style.opacity = op
  element.style.display = 'flex'
  const timer = setInterval(() => {
    if (op >= 1) {
      clearInterval(timer)
    }
    element.style.opacity = op
    element.style.filter = `alpha(opacity=${op * 100})`
    op += op * 0.1
  }, 13)
}

export function setPrevData(e) {
  if (e.target.hasAttribute('multiple') && fName !== e.target.name) {
    fileList = { files: [] }
    if (e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i += 1) {
        fileList.files.push(e.target.files[i])
      }
    }
  }
}

export function handleFile(e) {
  let err = []
  const fLen = e.target.files.length
  mxSiz = e.target.parentNode.querySelector('.f-max')
  mxSiz = mxSiz != null && Number(mxSiz.innerHTML.replace(/\D/g, '')) * 1024 ** 2
  if (e.target.hasAttribute('multiple')) {
    for (let i = 0; i < fLen; i += 1) {
      fileList.files.push(e.target.files[i])
    }
  } else {
    fileList.files.push(e.target.files[0])
  }

  if (e.target.hasAttribute('accept')) {
    const tmpf = []
    const type = new RegExp(`${e.target.getAttribute('accept').split(',').join('$|')}$`, 'gi')
    for (let i = 0; i < fileList.files.length; i += 1) {
      if (fileList.files[i].name.match(type)) {
        tmpf.push(fileList.files[i])
      } else {
        err.push('Wrong File Type Selected')
      }
    }
    fileList.files = tmpf
  }

  if (mxSiz > 0) {
    const tmpf = []
    for (let i = 0; i < fileList.files.length; i += 1) {
      if (fileList.files[i].size < mxSiz) {
        tmpf.push(fileList.files[i])
        mxSiz -= fileList.files[i].size
      } else {
        err.push('Max Upload Size Exceeded')
      }
    }
    fileList.files = tmpf
  }

  if (e.target.hasAttribute('multiple')) {
    e.target.files = createFileList(...fileList.files)
  } else {
    e.target.files = createFileList(fileList.files[fileList.files.length - 1])
    fileList = { files: [] }
  }

  if (e.target.files.length > 0) {
    e.target.parentNode.querySelector('.btcd-f-title').innerHTML =
      `${e.target.files.length} File Selected`
    e.target.parentNode.parentNode.querySelector('.btcd-files').innerHTML = ''
    for (let i = 0; i < e.target.files.length; i += 1) {
      let img = null
      if (e.target.files[i].type.match(/image-*/)) {
        img = window.URL.createObjectURL(e.target.files[i])
      } else {
        img =
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMi4wLjEsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCAzNTIgNDI5LjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM1MiA0MjkuMTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6IzAwNEJCNzt9DQo8L3N0eWxlPg0KPHBhdGggZD0iTTQwOC44LDY2Ljh2MzI3LjRjMCwyNy40LDIyLjgsNDkuOCw1MC4zLDQ5LjhoMjM5LjNjMjcuNSwwLDQ5LjgtMjIuMyw0OS44LTQ5LjhWMTE2Yy0wLjEtMi42LTEuMi01LjItMy4xLTdsLTg4LjktODkuMQ0KCWMtMS45LTEuOS00LjQtMi45LTcuMS0yLjloLTE5MEM0MzEuNiwxNyw0MDguOCwzOS40LDQwOC44LDY2Ljh6IE03MTMuOCwxMDUuOUg2ODNjLTYuMywwLTEyLjQtMi41LTE2LjgtNi45DQoJYy00LjUtNC41LTctMTAuNS02LjktMTYuOHYtMzFMNzEzLjgsMTA1Ljl6IE00MjguOCw2Ni44YzAtMTYuNSwxMy45LTI5LjgsMzAuMy0yOS44aDE4MC4ydjQ1LjFjMCwxMS42LDQuNiwyMi43LDEyLjgsMzENCgljOC4yLDguMiwxOS4zLDEyLjgsMzAuOSwxMi44aDQ1LjF2MjY4LjVjMCwxNi41LTEzLjksMjkuOC0zMC4zLDI5LjhINDU5LjFjLTE2LjYsMC0zMC4zLTEzLjQtMzAuMy0yOS44VjY2Ljh6Ii8+DQo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjc3LjIsMTY2LjlIMTMwLjZjLTUuMSwwLTkuMiw0LjEtOS4yLDkuMnM0LjEsOS4yLDkuMiw5LjJoMTQ2LjVjNS4xLDAsOS4yLTQuMSw5LjItOS4xDQoJQzI4Ni40LDE3MSwyODIuMywxNjYuOSwyNzcuMiwxNjYuOXoiLz4NCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik05My41LDE2Ni45SDY2LjRjLTUuMSwwLTkuMiw0LjEtOS4yLDkuMnM0LjEsOS4yLDkuMiw5LjJoMjcuMWM1LjEsMCw5LjItNC4xLDkuMi05LjJTOTguNiwxNjYuOSw5My41LDE2Ni45eiINCgkvPg0KPHBhdGggY2xhc3M9InN0MCIgZD0iTTI3Ny4yLDI0MC4zSDEzMC42Yy01LjEsMC05LjIsNC4xLTkuMiw5LjJjMCw1LjEsNC4xLDkuMiw5LjIsOS4yaDE0Ni41YzUuMSwwLDkuMi00LjEsOS4yLTkuMQ0KCVMyODIuMywyNDAuNCwyNzcuMiwyNDAuM3oiLz4NCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik05My41LDI0MC4zSDY2LjRjLTUuMSwwLTkuMiw0LjEtOS4yLDkuMmMwLDUuMSw0LjEsOS4yLDkuMiw5LjJoMjcuMWM1LjEsMCw5LjItNC4xLDkuMi05LjINCglDMTAyLjcsMjQ0LjQsOTguNiwyNDAuMyw5My41LDI0MC4zeiIvPg0KPHBhdGggY2xhc3M9InN0MCIgZD0iTTI3Ny4yLDMxMy44SDEzMC42Yy01LjEsMC05LjIsNC4xLTkuMiw5LjJjMCw1LjEsNC4xLDkuMiw5LjIsOS4yaDE0Ni41YzUuMSwwLDkuMi00LjEsOS4yLTkuMQ0KCUMyODYuNCwzMTgsMjgyLjMsMzEzLjgsMjc3LjIsMzEzLjh6Ii8+DQo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNOTMuNSwzMTMuOEg2Ni40Yy01LjEsMC05LjIsNC4xLTkuMiw5LjJjMCw1LjEsNC4xLDkuMiw5LjIsOS4yaDI3LjFjNS4xLDAsOS4yLTQuMSw5LjItOS4yDQoJQzEwMi43LDMxNy45LDk4LjYsMzEzLjgsOTMuNSwzMTMuOHoiLz4NCjxnPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNjMsNDEyLjFIODljLTQxLjQsMC03NS0zMy42LTc1LTc1di0yNDVjMC00MS40LDMzLjYtNzUsNzUtNzVoMTQ3LjVjOCwwLDE1LjcsMywyMS42LDguNWw2OSw2My42DQoJCWM2LjksNi4zLDEwLjgsMTUuMywxMC44LDI0Ljd2MjIzLjJDMzM4LDM3OC40LDMwNC40LDQxMi4xLDI2Myw0MTIuMXogTTg5LDM3LjNjLTMwLjIsMC01NC43LDI0LjYtNTQuNyw1NC43djI0NQ0KCQljMCwzMC4yLDI0LjYsNTQuNyw1NC43LDU0LjdoMTc0YzMwLjIsMCw1NC43LTI0LjYsNTQuNy01NC43VjExMy44YzAtMy43LTEuNi03LjMtNC4zLTkuOGwtNjktNjMuNmMtMi4yLTItNS0zLjEtNy45LTMuMUg4OXoiLz4NCjwvZz4NCjwvc3ZnPg0K'
      }
      e.target.parentNode.parentNode.querySelector('.btcd-files').insertAdjacentHTML(
        'beforeend',
        `<div>
                      <img src="${img}" alt="img"  title="${e.target.files[i].name}">
                      <div style="display:inherit">
                          <span title="${e.target.files[i].name}">${e.target.files[i].name}</span>
                          <br/>
                          <small>${getFileSize(e.target.files[i].size)}</small>
                      </div>
                      <button type="button" data-index="${i}" title="Remove This File"><span style="pointer-events:none">&times;</span></button>
                  </div>`
      )
    }
  }

  if (err.length > 0) {
    for (let i = 0; i < err.length; i += 1) {
      e.target.parentNode.parentNode.querySelector('.btcd-files').insertAdjacentHTML(
        'afterbegin',
        `
              <div style="background: #fff2f2;color: darkred;display:none" class="btcd-f-err">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg2LjA1NCIgaGVpZ2h0PSIyODYuMDU0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgoKIDxnPgogIDx0aXRsZT5iYWNrZ3JvdW5kPC90aXRsZT4KICA8cmVjdCBmaWxsPSJub25lIiBpZD0iY2FudmFzX2JhY2tncm91bmQiIGhlaWdodD0iNDAyIiB3aWR0aD0iNTgyIiB5PSItMSIgeD0iLTEiLz4KIDwvZz4KIDxnPgogIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICA8ZyBzdHJva2U9Im51bGwiIGlkPSJzdmdfMSI+CiAgIDxwYXRoIHN0cm9rZT0ibnVsbCIgaWQ9InN2Z18yIiBmaWxsPSIjOTEwNjAxIiBkPSJtMTQzLjAyNjk5Nyw1Ni4wMDAwMDVjLTQ4LjA2MDg2NSwwIC04Ny4wMjY5OTcsMzguOTY2MTMxIC04Ny4wMjY5OTcsODcuMDI2OTk3YzAsNDguMDY2MzQyIDM4Ljk2NjEzMSw4Ny4wMjY5OTcgODcuMDI2OTk3LDg3LjAyNjk5N2M0OC4wNjYzNDIsMCA4Ny4wMjY5OTcsLTM4Ljk1NTE3OSA4Ny4wMjY5OTcsLTg3LjAyNjk5N2MwLC00OC4wNjA4NjUgLTM4Ljk2MTI2NCwtODcuMDI2OTk3IC04Ny4wMjY5OTcsLTg3LjAyNjk5N3ptMCwxNTcuNzM2MTY2Yy0zOS4wNTMxNDIsMCAtNzAuNzA5MTY5LC0zMS42NTYwMjcgLTcwLjcwOTE2OSwtNzAuNzA5MTY5czMxLjY1NjAyNywtNzAuNzA5MTY5IDcwLjcwOTE2OSwtNzAuNzA5MTY5czcwLjcwOTE2OSwzMS42NTYwMjcgNzAuNzA5MTY5LDcwLjcwOTE2OXMtMzEuNjU2MDI3LDcwLjcwOTE2OSAtNzAuNzA5MTY5LDcwLjcwOTE2OXptMC4wMDU0NzYsLTExOS41Njk1NThjLTYuMjMzMTIxLDAgLTEwLjk0OTMzNywzLjI1Mjg1NyAtMTAuOTQ5MzM3LDguNTA2OTU2bDAsNDguMTkxMDc3YzAsNS4yNTk1NzYgNC43MTU2MDgsOC41MDE0OCAxMC45NDkzMzcsOC41MDE0OGM2LjA4MTAwNCwwIDEwLjk0OTMzNywtMy4zNzc1OTIgMTAuOTQ5MzM3LC04LjUwMTQ4bDAsLTQ4LjE5MTA3N2MtMC4wMDA2MDgsLTUuMTI5MzY0IC00Ljg2ODMzMywtOC41MDY5NTYgLTEwLjk0OTMzNywtOC41MDY5NTZ6bTAsNzYuMDU2MzY0Yy01Ljk4ODUxOCwwIC0xMC44NjIzMjYsNC44NzM4MDkgLTEwLjg2MjMyNiwxMC44NjcxOTRjMCw1Ljk4MzA0MSA0Ljg3MzgwOSwxMC44NTY4NSAxMC44NjIzMjYsMTAuODU2ODVzMTAuODU2ODUsLTQuODczODA5IDEwLjg1Njg1LC0xMC44NTY4NWMtMC4wMDA2MDgsLTUuOTkzOTk0IC00Ljg2ODMzMywtMTAuODY3MTk0IC0xMC44NTY4NSwtMTAuODY3MTk0eiIvPgogIDwvZz4KICA8ZyBpZD0ic3ZnXzMiLz4KICA8ZyBpZD0ic3ZnXzQiLz4KICA8ZyBpZD0ic3ZnXzUiLz4KICA8ZyBpZD0ic3ZnXzYiLz4KICA8ZyBpZD0ic3ZnXzciLz4KICA8ZyBpZD0ic3ZnXzgiLz4KICA8ZyBpZD0ic3ZnXzkiLz4KICA8ZyBpZD0ic3ZnXzEwIi8+CiAgPGcgaWQ9InN2Z18xMSIvPgogIDxnIGlkPSJzdmdfMTIiLz4KICA8ZyBpZD0ic3ZnXzEzIi8+CiAgPGcgaWQ9InN2Z18xNCIvPgogIDxnIGlkPSJzdmdfMTUiLz4KICA8ZyBpZD0ic3ZnXzE2Ii8+CiAgPGcgaWQ9InN2Z18xNyIvPgogPC9nPgo8L3N2Zz4=" alt="img">
                  <span>${err[i]}</span>
              </div>`
      )
    }
    const errNods = e.target.parentNode.parentNode.querySelec

    for (let i = 0; i < errNods.length; i += 1) {
      unfade(errNods[i])
      setTimeout(() => {
        fade(errNods[i])
      }, 3000)
      setTimeout(() => {
        errNods[i].remove()
      }, 4000)
    }
    err = []
  }
}
