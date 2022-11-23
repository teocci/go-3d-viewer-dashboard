/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-8월-29
 */
import BaseComponent from './base/base-component.js'
import ViewerModule from './viewer-module.js'
import Dashboard from './components/dasboard/dashboard.js'

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
        const $main = document.getElementById('main')
        viewerModule = ViewerModule.instance
        
        this.dashboard = new Dashboard($main)
        this.dom = $main
    }

    initListeners() {}
}