/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-8월-22
 */
import BaseComponent from '../../base/base-component.js'

export default class Spinner extends BaseComponent {
    static TAG = 'spinner'

    constructor(element) {
        super(element)

        this.initElements()
    }

    initElements() {
        this.dom.classList.add(Spinner.TAG)
        this.hide()
    }
}