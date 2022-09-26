/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-8월-29
 */
import BaseComponent from './base/base-component.js'
import ViewerModule from './viewer-module.js'

export default class MainModule extends BaseComponent {
    static get instance() {
        this._instance = this._instance ?? new MainModule()

        return this._instance
    }

    constructor() {
        super()

        this.initElement()
        this.initListeners()
    }

    initElement() {
        this.dom = document.getElementById('main')
        viewerModule = ViewerModule.instance

        const $dashboard = document.createElement('div')
        $dashboard.id = 'dashboard'
        $dashboard.textContent = 'Dashboard Area'

        this.dom.appendChild($dashboard)
    }

    initListeners() {}
}