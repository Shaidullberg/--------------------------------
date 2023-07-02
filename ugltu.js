const color = '0123456789abcdef'
let newColor = ''

const newRandomColor = () => {
    const index = Math.floor(Math.random() * (15 - 0) + 1)
    newColor = newColor + color[index]
    return newColor.length < 6 ? newRandomColor() : newColor
}

window.onload = () => {
    let dvd = document.getElementById('dvd')
    let toBottom = true
    let toRight = true
    setInterval(() => {
        let height = window.innerHeight - dvd.clientHeight
        let width = window.innerWidth - dvd.clientWidth
        let top = dvd.offsetTop
        let left = dvd.offsetLeft
        if (!toBottom && top > 0 && top < height) {

        } else if (top >= height) {
            toBottom = false
            newColor = ''
            newRandomColor()
        } else if (top <= 0) {
            toBottom = true
            newColor = ''
            newRandomColor()
        }

        if (!toRight && left > 0 && left < width) {

        } else if (left >= width) {
            toRight = false
            newColor = ''
            newRandomColor()
        } else if (left <= 0) {
            toRight = true
            newColor = ''
            newRandomColor()
        }

        if (toBottom) {
            top = top + 2
        } else top = top - 2
        if (toRight) {
            left = left + 2
        } else left = left - 2

        dvd.style.top = `${top}px`
        dvd.style.left = `${left}px`
        document.getElementsByTagName('body')[0].style.backgroundColor = `#${newColor}`
    }, 10)
}