//go:build !windows

package main

import "syscall"

// errAddrInUse is the platform-specific error for "address already in use".
// On non-Windows platforms this is the standard POSIX EADDRINUSE, which
// is already handled by errors.Is against syscall.EADDRINUSE in listenProbe.
// Defined for parity so the Windows build can use a distinct constant.
var errAddrInUse = syscall.EADDRINUSE
