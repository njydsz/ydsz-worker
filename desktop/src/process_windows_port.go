//go:build windows

package main

import "syscall"

// errAddrInUse is the platform-specific error for "address already in use".
// On Windows the bind() syscall returns WSAEADDRINUSE (10048), which Go's
// net package wraps differently from the POSIX path. We match it explicitly
// so listenProbe detects port-in-use correctly on Windows.
var errAddrInUse = syscall.Errno(10048)
