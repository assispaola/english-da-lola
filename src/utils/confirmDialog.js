// Promise-based replacement for window.confirm()/alert(), so every "are you
// sure?" and notice in the app shares the same styled modal (ConfirmDialogHost.jsx)
// instead of the browser's unstyled native dialog. One host is mounted once
// (in App.jsx); call sites just `await confirmDialog(...)` like they used to
// read the return value of window.confirm(...) synchronously.
let listener = null

export function onConfirmRequest(cb) {
  listener = cb
  return () => { if (listener === cb) listener = null }
}

// opts: { variant: 'danger'|'info'|'success', confirmLabel, cancelLabel, alertOnly }
export function confirmDialog(message, opts) {
  return new Promise((resolve) => {
    if (!listener) { resolve(window.confirm(message)); return } // host not mounted yet — safe fallback
    listener({ message, opts, resolve })
  })
}

export function alertDialog(message, opts) {
  return confirmDialog(message, { variant: 'info', ...opts, alertOnly: true })
}
