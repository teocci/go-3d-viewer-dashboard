/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-8월-23
 */
import BaseComponent from '../../base/base-component.js'

const EVENT_CAMERA_CONTROL_EVENT = 'on-cc-event'
const EVENT_FILE_CONTROL_OPEN_EVENT = 'on-open-event'

const CAMERA_CONTROL_ROTATE = 'rotate'
const CAMERA_CONTROL_PAN = 'pan'
const CAMERA_CONTROL_ZOOM = 'zoom'
const CAMERA_CONTROL_RESET = 'reset'
const FILE_CONTROL_OPEN = 'open'

const CAMERA_CONTROLS = {
    [CAMERA_CONTROL_ROTATE]: {
        id: CAMERA_CONTROL_ROTATE,
        name: '회전',
        icon: 'fa-arrows-rotate',
    },
    [CAMERA_CONTROL_PAN]: {
        id: CAMERA_CONTROL_PAN,
        name: '이동',
        icon: 'fa-arrow-right-arrow-left',
    },
    [CAMERA_CONTROL_ZOOM]: {
        id: CAMERA_CONTROL_ZOOM,
        name: '줌',
        icon: 'fa-magnifying-glass',
    },
    [CAMERA_CONTROL_RESET]: {
        id: CAMERA_CONTROL_RESET,
        name: '초기화',
        icon: 'fa-clock-rotate-left',
    },
    [FILE_CONTROL_OPEN]: {
        id: FILE_CONTROL_OPEN,
        name: '파일 열기',
        icon: 'fa-folder-open',
    },
}

export default class Toolbar extends BaseComponent {
    static TAG = 'toolbar'

    static EVENT_CAMERA_CONTROL_EVENT = EVENT_CAMERA_CONTROL_EVENT
    static EVENT_FILE_CONTROL_OPEN_EVENT = EVENT_FILE_CONTROL_OPEN_EVENT

    static CAMERA_CONTROL_ROTATE = CAMERA_CONTROL_ROTATE
    static CAMERA_CONTROL_PAN = CAMERA_CONTROL_PAN
    static CAMERA_CONTROL_ZOOM = CAMERA_CONTROL_ZOOM
    static CAMERA_CONTROL_RESET = CAMERA_CONTROL_RESET
    static FILE_CONTROL_OPEN = FILE_CONTROL_OPEN

    static CAMERA_CONTROLS = CAMERA_CONTROLS

    constructor(element) {
        super(element)

        this.controls = new Map()

        this.initElements()
        this.initListeners()
    }

    initElements() {
        this.dom.classList.add(Toolbar.TAG)

        const camControls = document.createElement('div')
        camControls.classList.add('camera-controls')

        const list = document.createElement('ul')
        list.classList.add('list-pain')

        const controls = Object.values(CAMERA_CONTROLS)
        for (const control of controls) {
            const li = document.createElement('li')
            const icon = document.createElement('i')
            icon.classList.add('fa-solid', control.icon, 'fa-fw')
            icon.dataset.cooltip = control.name

            li.appendChild(icon)
            list.appendChild(li)

            this.controls.set(control.id, icon)
        }

        camControls.appendChild(list)
        this.placeholder.appendChild(camControls)

        this.activateControlByKey(CAMERA_CONTROL_ROTATE)
    }

    initListeners() {
        const controls = this.controls.entries()
        for (const [key, control] of controls) {
            control.onclick = e => {
                if (key === FILE_CONTROL_OPEN) {
                    this.emit(EVENT_FILE_CONTROL_OPEN_EVENT, e)
                    return
                }
                this.updateControl(e, key)
            }
        }
    }

    updateControl(e, key) {
        const control = e.target
        if (this.isControlActive(control)) return

        this.deactivateControls()
        this.activateControlByKey(key === CAMERA_CONTROL_RESET ? CAMERA_CONTROL_ROTATE : key)

        this.emit(EVENT_CAMERA_CONTROL_EVENT, e, key)
    }

    activateControlByKey(key) {
        const $control = this.controls.get(key)
        this.activateControl($control)
    }

    activateControl($control) {
        $control.classList.add('active')
        $control.parentElement.classList.add('active')
    }

    deactivateControlByKey(key) {
        const $control = this.controls.get(key)
        this.deactivateControl($control)
    }

    deactivateControl($control) {
        $control.classList.remove('active')
        $control.parentElement.classList.remove('active')
    }

    deactivateControls() {
        this.controls.forEach($control => {
            this.deactivateControl($control)
        })
    }

    isControlActive($control) {
        return $control.classList.contains('active')
    }
}