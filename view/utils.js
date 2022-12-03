export const getTime = (length) => {
    const second = length % 60
    const minute = Math.floor(length / 60)
    if (minute > 0) {
        return `${minute}m ${second}s`
    } else {
        return `${second}s`
    }
}