import Dropdown from './dropdown.js'
import Line from '../../charts/line.js'
import Bar from '../../charts/bar.js'
import Scatter from '../../charts/scatter.js'
import Bubble from '../../charts/bubble.js'
import LineSeries from '../../charts/line-series.js'
import Downloader from '../../utils/downloader.js'

/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-10월-04
 */
export default class ChartPanel {
    constructor(element) {
        this.holder = element

        this.menuHandler = null
        this.initPanel()
        this.initListeners()
    }

    set title(title) {
        const $title = this.$header.querySelector('h2')
        $title.textContent = title
    }

    initPanel() {
        const $panel = document.createElement('div')
        $panel.classList.add('panel-holder')

        const $header = document.createElement('div')
        $header.classList.add('panel-header')

        const $title = document.createElement('h2')

        const $headerMenu = document.createElement('div')
        $headerMenu.classList.add('header-menu')

        const $menuToggle = document.createElement('div')
        $menuToggle.classList.add('header-menu-item', 'toggle')

        const $icon = document.createElement('i')
        $icon.classList.add('fa-solid', 'fa-caret-down')

        const $menuContent = document.createElement('div')
        $menuContent.classList.add('header-menu-item', 'content')

        const $content = document.createElement('div')
        $content.classList.add('panel-content')

        const $canvas = document.createElement('canvas')

        $menuToggle.append($icon)
        $headerMenu.append($menuToggle, $menuContent)
        $header.append($title, $headerMenu)
        $content.appendChild($canvas)

        $panel.append($header, $content)

        this.menu = new Dropdown($menuContent)

        this.$header = $header
        this.$canvas = $canvas
        this.dom = $panel
        this.holder.appendChild($panel)
    }

    initListeners() {
        const $header = this.$header
        $header.onclick = e => this.toggleMenu(e)

        const menu = this.menu
        menu.onclick = e => this.menuHandler(e)
    }

    load(config) {
        if (isNil(config)) throw new Error('InvalidParameter: null config')

        this.title = toPascalCase(config.chart.title)

        this.chart = this.createChart(config.chart.type, config.input.mode)
        this.chart.init(config)
    }

    /**
     *
     * @param type
     * @param mode
     * @returns {Line|LineSeries|Scatter|Bar|Bubble}
     */
    createChart(type, mode) {
        const $canvas = this.$canvas
        switch (type) {
            case Line.TAG:
                switch (mode) {
                    case INPUT_MODE_FILE:
                        return new LineSeries($canvas)
                    case INPUT_MODE_RT:
                        return new Line($canvas)
                    default:
                        throw new Error(`InvalidMode: ${mode} not supported.`)
                }
            case Scatter.TAG:
                return new Scatter($canvas)
            case Bar.TAG:
                return new Bar($canvas)
            case Bubble.TAG:
                return new Bubble($canvas)
            default:
                throw new Error(`InvalidType: ${type} not supported.`)
        }
    }

    render() {
        if (this.chart) {
            this.chart.render()
            this.chart.resize()
        }
    }

    update(data) {
        if (this.chart) {
            this.chart.addData(data)
        }
    }

    downloadAs(type, fn) {
        switch (type) {
            case Dropdown.MENU_ITEM_CSV:
                console.log({type})
                this.downloadCSV(fn)
                break
            case Dropdown.SUBMENU_ITEM_PNG:
            case Dropdown.SUBMENU_ITEM_JPEG:
                this.downloadImage(type)
                break
            default:
                throw new Error(`InvalidAction: ${type} file not supported.`)
        }
    }

    downloadCSV(fn) {
        const filename = fn ?? `csv-${new Date().toJSON().slice(0, 10)}.csv`

        const rows = this.chart.asData()
        console.log({rows})
        if (isNil(rows)) throw new Error(`InvalidValue: null rows`)
        Downloader.exportToCSV(filename, rows)
    }

    downloadImage(type, fn) {
        const ext = type ?? 'png'
        const filename = fn ?? `img-${new Date().toJSON().slice(0, 10)}.${ext}`

        const url = this.$canvas.toDataURL(`image/${ext}`, 1.0)
        if (isNil(url)) throw new Error(`InvalidValue: null url`)
        Downloader.downloadDataURL(url, filename)
    }

    toggleMenu() {
        this.menu.toggle()
    }

    clear() {
        if (this.chart) this.chart.destroy()
    }
}