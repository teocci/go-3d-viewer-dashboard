/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-9월-01
 */
import BaseComponent from '../../base/base-component.js'
import Widget from './widget.js'
import WidgetManager from '../../managers/widget-manager.js'

const NUMBER_WIDGETS = 2
export default class Dashboard extends BaseComponent {
    static TAG = 'dashboard'

    constructor(element) {
        super(element)

        this.widgetManager = new WidgetManager()

        this.initElements()
        this.initListeners()

        this.addWidgets()
    }

    initElements() {
        const $main = document.getElementById('main')

        const $dashboard = document.createElement('section')
        $dashboard.classList.add('wrapper', 'dashboard-panel')

        const $title = document.createElement('div')
        $title.classList.add('title', 'widget-title')

        const $h2 = document.createElement('h2')
        $h2.textContent = '대시보드'

        $title.appendChild($h2)
        $dashboard.appendChild($title)

        this.dom = $dashboard
        this.holder = $main
        if (!isNil(this.holder)) this.holder.appendChild($dashboard)
    }

    initListeners() {
        const widgets = this.widgetManager.values()
        for (const widget of widgets ) {
            widget.state.onchange = v => {
                this.onWidgetStateChange(widget, v)
            }
        }
    }

    addWidgets() {
        for (let i = 0; i < NUMBER_WIDGETS; i++) {
            this.addWidget()
        }
    }

    addWidget() {
        const $dashboard = this.dom
        const widget = new Widget($dashboard)
        this.widgetManager.add(widget.id, widget)

        $dashboard.appendChild(widget.dom)
    }

    onWidgetStateChange(widget, v) {
        if (v === Widget.STATE_DATA_RENDERED) {

        }
    }
}