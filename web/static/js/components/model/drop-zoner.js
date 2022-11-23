/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-8월-17
 */
import ZipFSManager from '../../utils/zip-fs-manager.js'
import BaseComponent from '../../base/base-component.js'
import zip from '../../libs/zip/zip.js'

export default class DropZoner extends BaseComponent {
    /**
     * @param  {Element} holder
     */
    constructor(holder) {
        super(holder)

        this.enableMultiFiles = false

        this.dropper = null
        this.input = null

        this.initElements()

        this.listeners = {
            drop: [],
            dropstart: [],
            droperror: [],
        }

        this.onDrag = this.onDrag.bind(this)
        this.onDragEnd = this.onDragEnd.bind(this)
        this.onDragEnter = this.onDragEnter.bind(this)
        this.onDragLeave = this.onDragLeave.bind(this)
        this.onDragOver = this.onDragOver.bind(this)
        this.onDragStart = this.onDragStart.bind(this)
        this.onDrop = this.onDrop.bind(this)

        this.onSelect = this.onSelect.bind(this)

        this.placeholder.drag = this.onDrag
        this.placeholder.dragend = this.onDragEnd
        this.placeholder.dragenter = this.onDragEnter
        this.placeholder.dragleave = this.onDragLeave
        this.placeholder.ondragover = this.onDragOver
        this.placeholder.ondragstart = this.onDragStart
        this.placeholder.ondrop = this.onDrop

        this.input.onchange = this.onSelect
    }

    initElements() {
        const $dropper = document.createElement('div')
        $dropper.classList.add('dropper')

        const p = document.createElement('p')
        p.textContent = '이 곳으로 stl 또는 fbx 파일을 드래그하세요.'

        const $fileSelector = document.createElement('div')
        $fileSelector.classList.add('file-selector')

        const input = document.createElement('input')
        input.id = 'file-input'
        input.type = 'file'
        input.name = 'model'
        input.accept = '.fbx,.stl'
        input.hidden = true

        const label = document.createElement('label')
        label.htmlFor = 'file-input'

        // const icon = document.createElement('img')
        // icon.src = './img/upload-btn.svg'
        // icon.alt = 'upload-btn'
        const icon = document.createElement('i')
        icon.classList.add('fa-solid', 'fa-upload')

        const span = document.createElement('span')
        span.textContent = '파일 열기'

        $dropper.appendChild(p)
        label.append(icon, span)
        $fileSelector.append(input, label)

        this.dom.append($dropper, $fileSelector)

        this.dropper = $dropper
        this.input = input
    }

    /**
     * @param  {string}   type
     * @param  {Function} callback
     * @return {DropZoner}
     */
    on(type, callback) {
        this.listeners[type].push(callback)
        return this
    }

    /**
     * @param  {string} type
     * @param  {Object} data
     * @return {DropZoner}
     */
    emit(type, data) {
        this.listeners[type].forEach(callback => callback(data))
        return this
    }

    /**
     * Destroys the instance.
     */
    destroy() {
        const dom = this.dom
        const $input = this.input

        dom.drag = this.onDrag
        dom.dragend = this.onDragEnd
        dom.dragenter = this.onDragEnter
        dom.dragleave = this.onDragLeave
        dom.ondragover = this.onDragOver
        dom.ondragstart = this.onDragStart
        dom.ondrop = this.onDrop

        $input.removeEventListener('change', this.onSelect)

        delete this.placeholder
        delete this.input
        delete this.listeners
    }

    /**
     *
     * @param {Event} e
     */
    preventDefaults(e) {
        e.stopPropagation()
        e.preventDefault()
    }

    /**
     *
     * @param {DragEvent} event
     */
    onDrag(event) {
        this.preventDefaults(event)
    }

    /**
     *
     * @param {DragEvent} event
     */
    onDragEnd(event) {
        this.preventDefaults(event)
    }

    /**
     *
     * @param {DragEvent} event
     */
    onDragEnter(event) {
        this.preventDefaults(event)

        this.placeholder.textContent = ''
    }

    /**
     *
     * @param {DragEvent} event
     */
    onDragLeave(event) {
        this.preventDefaults(event)
    }

    /**
     *
     * @param {DragEvent} event
     */
    onDragOver(event) {
        this.preventDefaults(event)

        event.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy.
    }

    /**
     *
     * @param {DragEvent} event
     */
    onDragStart(event) {
        this.preventDefaults(event)
    }

    /**
     * References:
     * - https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items
     * - https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/files
     * - https://code.flickr.net/2012/12/10/drag-n-drop/
     * - https://stackoverflow.com/q/44842247/1314762
     *
     * @param {DragEvent} event
     */
    onDrop(event) {
        this.preventDefaults(event)

        this.emit('dropstart')

        const files = Array.from(event.dataTransfer.files ?? [])
        const items = Array.from(event.dataTransfer.items ?? [])

        const filesCount = files.length
        const itemsCount = items.length

        console.log(`File Count: ${filesCount}\n`)
        console.log(`Items Count: ${itemsCount}\n`)

        if (filesCount === 0 && itemsCount === 0) {
            this.fail('Required drag-and-drop APIs are not supported in this browser.')
            return
        }

        const fileMap = new Map()
        // Prefer .items, which allow folder traversal if necessary.
        if (itemsCount > 0) {
            const entries = items.map(item => item.webkitGetAsEntry())
            // const [firstEntry] = entries
            // if (firstEntry.name.match(/\.zip$/)) {
            //     this.loadZip(items[0].getAsFile())
            // }
            //
            // this.loadNextEntry(new Map(), entries)
            let index = 0
            for (const entry of entries) {
                if (entry) this.scanFiles(entry, fileMap)
                index++
            }
            return
        }

        const [firstFile] = files
        // Fall back to .files, since folders can't be traversed.
        if (filesCount === 1 && firstFile.name.match(/\.zip$/)) {
            this.loadZip(files[0])
        }

        this.emit('drop', {files: new Map(files.map(file => [file.name, file]))})
    }

    /**
     *
     * @param {FileSystemEntry} entry
     * @param {Map<string, File>} fileMap
     */
    scanFiles(entry, fileMap) {
        const ctx = this
        console.log({entry})
        if (entry.isFile) {
            const onSuccess = file => {
                fileMap.set(entry.fullPath, file)
                ctx.emit('drop', {files: fileMap})
            }
            const onError = () => console.error(`Could not load file: ${entry.fullPath}`)
            entry.file(onSuccess, onError)
        } else if (entry.isDirectory) {
            const readerCallback = entries => {
                entries.forEach((item) => {
                    this.scanFiles(item, fileMap)
                })
            }
            const reader = entry.createReader()
            reader.readEntries(readerCallback)
        } else {
            console.warn(`Unknown asset type: ${entry.fullPath}`)
        }
    }

    /**
     *
     * @param  {Event} e
     */
    onSelect(e) {
        this.emit('dropstart')

        // HTML file inputs do not seem to support folders, so assume this is a flat file list.
        const files = [].slice.call(this.input.files)

        // Automatically decompress a zip archive if it is the only file given.
        if (files.length === 1 && this.isZip(files[0])) {
            this.loadZip(files[0])
            return
        }

        const fileMap = new Map()
        files.forEach(file => fileMap.set(file.webkitRelativePath ?? file.name, file))
        this.emit('drop', {files: fileMap})
    }

    /**
     * Iterates through a list of FileSystemEntry objects, creates the fileMap
     * tree, and emits the result.
     *
     * @param  {Map<string, File>} fileMap
     * @param  {Array<FileSystemEntry>} entries
     */
    loadNextEntry(fileMap, entries) {
        const entry = entries.pop()
        if (!entry) {
            this.emit('drop', {files: fileMap})
            return
        }

        if (entry.isFile) {
            const onSuccess = file => {
                fileMap.set(entry.fullPath, file)
                this.loadNextEntry(fileMap, entries)
            }
            const onError = () => console.error(`Could not load file: ${entry.fullPath}`)
            entry.file(onSuccess, onError)
        } else if (entry.isDirectory) {
            // readEntries() must be called repeatedly until it stops returning results.
            // https://www.w3.org/TR/2012/WD-file-system-api-20120417/#the-directoryreader-interface
            // https://bugs.chromium.org/p/chromium/issues/detail?id=378883
            const reader = entry.createReader()
            const readerCallback = newEntries => {
                if (newEntries.length) {
                    entries = entries.concat(newEntries)
                    reader.readEntries(readerCallback)
                } else {
                    this.loadNextEntry(fileMap, entries)
                }
            }
            reader.readEntries(readerCallback)
        } else {
            console.warn(`Unknown asset type: ${entry.fullPath}`)
            this.loadNextEntry(fileMap, entries)
        }
    }

    /**
     * Inflates a File in .ZIP format, creates the fileMap tree, and emits the
     * result.
     * @param  {File} file
     */
    loadZip(file) {
        const pending = []
        const fileMap = new Map()
        const archive = new ZipFSManager()

        /**
         *
         * @param {ZipDirectoryEntry|ZipEntry} node
         */
        const traverse = node => {
            if (node.directory) {
                node.children.forEach(traverse)
            } else if (node.name[0] !== '.') {
                pending.push(new Promise(resolve => {
                    node.getData(new zip.BlobWriter(), blob => {
                        blob.name = node.name
                        fileMap.set(node.getFullPath(), blob)
                        resolve()
                    })
                }))
            }
        }

        archive.importBlob(file, () => {
            traverse(archive.root)
            Promise.all(pending).then(() => {
                this.emit('drop', {files: fileMap, archive: file})
            })
        })
    }

    /**
     * @param  {File} file
     * @return {Boolean}
     */
    isZip(file) {
        return file.type === 'application/zip' || file.name.match(/\.zip$/)
    }

    /**
     * @param {Error|string} error
     * @throws
     */
    fail(error) {
        const message = isString(error) ? error : (error && error.toString())
        this.emit('droperror', {message})
    }
}