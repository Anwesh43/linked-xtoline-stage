const w : number = window.innerWidth, h : number = window.innerHeight, nodes : number = 5
class LinkedXToLineStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    linkedXTL : LinkedXTL = new LinkedXTL()
    animator : Animator = new Animator()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.linkedXTL.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedXTL.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedXTL.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage = new LinkedXToLineStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }

    update(cb : Function) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale + this.dir
            cb()
        }
    }
}

class Animator {
    interval : number
    animated : boolean = false

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class XTLNode {
    state : State = new State()
    prev : XTLNode
    next : XTLNode
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new XTLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const sc1 : number = Math.min(0.5, this.state.scale) * 2
        const sc2 : number = Math.min(0.5, Math.max(this.state.scale - 0.5, 0)) * 2
        const gap = w / (nodes + 1)
        const size = gap/2
        context.lineWidth = Math.min(w, h) / 50
        context.lineCap = 'round'
        context.strokeStyle = 'white'
        context.save()
        context.translate(this.i * gap + gap, h/2 - (h/2 - size) * sc2)
        for(var i = 0; i < 2; i++) {
            context.save()
            context.rotate(Math.PI/4 * (1 - 2 * i) * (1 - sc1))
            context.beginPath()
            context.moveTo(0, -size/2)
            context.lineTo(0, size/2)
            context.stroke()
            context.restore()
        }
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : XTLNode {
        var curr : XTLNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedXTL {
    root : XTLNode = new XTLNode(0)
    curr : XTLNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
