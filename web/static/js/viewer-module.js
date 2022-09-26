import STLLoader from './loaders/stl-loader.js'
import FBXLoader from './loaders/fbx-loader.js'
import Viewer from './components/viewer.js'
import DropZoner from './components/drop-zoner.js'
import Spinner from './components/spinner.js'
import Notifier from './components/notifier.js'
import Toolbar from './components/toolbar.js'

/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-7월-14
 */
export default class ViewerModule {
    static FORMAT_LIST = [
        {type: STLLoader.TAG, url: STL_FILE},
        {type: FBXLoader.TAG, url: FBX_FILE},
    ]

    static get instance() {
        this._instance = this._instance ?? new ViewerModule()

        return this._instance
    }

    constructor() {
        this.viewers = new Map()

        this.initElement()
        this.initListeners()
        // this.initViewers()

        console.log({viewers: this.viewers})
    }

    initElement() {
        const $main = document.getElementById('main')

        const $model = document.createElement('div')
        $model.classList.add('model')

        const $dropZoner = document.getElementById('file-loader')
        const $spinner = document.getElementById('spinner')
        const $notifier = document.getElementById('notifier')

        this.dropZoner = new DropZoner($dropZoner)
        this.spinner = new Spinner($spinner)
        this.notifier = new Notifier($notifier)

        const $viewers = document.getElementById('viewers')
        $viewers.classList.add('hidden')

        $model.append($dropZoner, $viewers)

        this.placeholder = $main
        this.placeholder.appendChild($model)
    }

    initViewers() {
        ViewerModule.FORMAT_LIST.forEach(f => {
            const element = document.createElement('div')
            element.classList.add('view-holder')
            this.placeholder.appendChild(element)

            const viewer = new Viewer(element)
            this.viewers.set(f.type, viewer)
        })
    }

    initListeners() {
        this.dropZoner.on('drop', ({files}) => this.loadFile(files))
        this.dropZoner.on('dropstart', () => this.showSpinner())
        this.dropZoner.on('droperror', e => this.onError(e))
    }

    initViewer(type) {
        const ctx = this
        const $viewers = document.getElementById('viewers')
        $viewers.classList.remove('hidden')

        const viewer = new Viewer($viewers)
        viewer.toolbar.addListener(Toolbar.LISTENER_FILE_CONTROL_OPEN_EVENT, () => {
            ctx.reset()
        })

        this.viewer = viewer
        this.viewers.set(type, viewer)
    }

    /**
     * Loads a fileset provided by user action.
     * @param  {Map<string, File>} fileMap
     */
    loadFile(fileMap) {
        console.log({fileMap})
        let fileInfo = null
        Array.from(fileMap).forEach(([path, file]) => {
            console.log({file})
            const name = file.name
            if (name.match(/\.(stl|fbx)$/)) {
                const lastDot = name.lastIndexOf('.')
                fileInfo = {
                    file,
                    name: name.substring(0, lastDot),
                    ext: name.substring(lastDot + 1),
                    path: path.replace(name, ''),
                }
            }
        })

        if (fileInfo == null) {
            this.onError(new Error('No .stl or .fbx asset found.'))
            return
        }

        this.loadModel(fileInfo, fileMap)
    }

    /**
     * Passes a model to the viewer, given file and resources.
     * @param  {Object} fileInfo
     * @param  {Map<string, File>} fileMap
     */
    loadModel(fileInfo, fileMap) {
        console.log({fileInfo})
        const type = fileInfo.ext

        this.dropZoner.hide()
        this.initViewer(type)

        const viewer = this.viewer

        const fileURL = typeof fileInfo.file === 'string' ? fileInfo.file : URL.createObjectURL(fileInfo.file)

        const cleanup = () => {
            this.hideSpinner()
            if (typeof fileInfo.file === 'object') URL.revokeObjectURL(fileURL)
        }

        viewer.addListener(Viewer.LISTENER_LOADED, () => {
            this.notifier.success('Model loaded!')
            cleanup()
        })
        viewer.addListener(Viewer.LISTENER_ERROR, cleanup)

        viewer.loadModel(type, fileURL)
        viewer.onResize()
        viewer.animate()
    }

    /**
     * @param  {Error|string} error
     */
    onError(error) {
        let message = (error ?? {}).message || error.toString()
        if (message.match(/ProgressEvent/)) {
            message = 'Unable to retrieve this file. Check JS console and browser network tab.'
        } else if (message.match(/Unexpected token/)) {
            message = `Unable to parse file content. Verify that this file is valid. Error: "${message}"`
        } else if (error && error.target && error.target instanceof Image) {
            message = `Missing texture: ${error.target.src.split('/').pop()}`
        }

        this.notifier.failure(message)
        // console.error(error)

        this.dropZoner.show()
        this.hideSpinner()
    }

    showViewers() {
        const $viewers = document.getElementById('viewers')
        $viewers.classList.remove('hidden')
    }

    hideViewers() {
        const $viewers = document.getElementById('viewers')
        $viewers.classList.add('hidden')
    }

    destroyViewers() {
        const $viewers = document.getElementById('viewers')
        while ($viewers.firstChild) {
            const lastChild = $viewers.lastChild ?? false
            if (lastChild) $viewers.removeChild(lastChild)
        }
    }

    showSpinner() {
        this.spinner.show()
    }

    hideSpinner() {
        this.spinner.hide()
    }

    loadViewers() {
        ViewerModule.FORMAT_LIST.forEach(f => {
            const viewer = this.viewers.get(f.type)
            viewer.loadModel(f.type, f.url)
            if (f.type !== FBXLoader.TAG) viewer.onResize()
            viewer.animate()
        })
    }

    reset() {
        this.showSpinner()
        setTimeout(() => {
            location.reload()
        }, 500)
    }
}