// green color
function ok(msg) {
    console.log('\x1b[32m%s\x1b[0m', msg)
}

function err(msg) {
    console.log('\x1b[31m%s\x1b[0m', msg)
}

function warn(msg) {
    console.log('\x1b[33m%s\x1b[0m', msg)
}

function dim(msg) {
    console.log('\x1b[2m%s\x1b[0m', msg)
}

export default {
    ok,
    err,
    warn,
    dim
}