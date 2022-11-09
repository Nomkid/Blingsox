export default defineEventHandler(async event => {
    const boxes = $fetch('/api/boxes/scan', {
        baseURL: 'http://localhost:8080'
    })

    return boxes
})