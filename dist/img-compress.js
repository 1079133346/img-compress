
'use strict'
/**
 * @param file   file Object must
 * @param quality  image quality { type: Number , default: 0.5 }
 * @param size compressed image size { type: Number, default: 1024kb}
 * @param width  compressed image width { type: Number, defualt: original}
 * @param callback async callback
 * @returns { file, baseUrl}
 */

export default class ImageCompress {
  constructor(file, quality = 0.5, size = 1024, w) {
    this.oldFile = file
    this.quality = quality
    this.size = size
    if (w) this.w = w
    this.checkFormat()
  }
  checkFormat() {
    if (typeof this.oldFile !== 'object' || !this.oldFile.type || this.oldFile.type.split('/')[0] !== 'image') {
      throw new Error(' file type  must be Image Object ')
    }
    if (typeof this.quality !== 'number' || this.quality > 1 || this.quality < 0) {
      throw new Error(' quality must be Number and lt 1 , gt 0 ')
    }
    if (typeof this.size !== 'number' || this.size < 0) {
      throw new Error(' size must be Number and gt 0')
    }
  }
  initCompress(callback) {
    let that = this
    let ready = new FileReader()
    ready.readAsDataURL(this.oldFile)
    ready.onload = function () {
      that.oldBaseUrl = this.result
      if (that.oldFile.size / 1024 > that.size) {
        that.canvasDataURL(callback)
        return
      }
      that.baseUrl = this.result
      that.file = that.oldFile
      callback(that)
    }
  }
  canvasDataURL(callback) {
    let that = this
    let img = new Image()
    img.src = this.oldBaseUrl
    img.onload = function () {
      // 默认按比例压缩
      let w = this.width
      let h = this.height
      let scale = w / h
      if (that.w) {
        w = that.w
        h = w / scale
      }
      let quality = that.quality
      // 生成canvas
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      // 创建属性节点
      let anw = document.createAttribute('width')
      anw.nodeValue = w
      let anh = document.createAttribute('height')
      anh.nodeValue = h
      canvas.setAttributeNode(anw)
      canvas.setAttributeNode(anh)
      ctx.drawImage(this, 0, 0, w, h)
      // The smaller the quality value, the more blurred the image is drawn
      let base64 = canvas.toDataURL('image/jpeg', quality)
      let arr = base64.split(',')
      let mime = arr[0].match(/:(.*?)/)[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      that.file = new Blob([u8arr], {
        type: mime
      })
      callback(that)
    }
  }
}
