//go:build !production || darwin

package main

// Development builds look for ydzs-worker-<plat>.zip or ydzs-worker-portable-<plat>-*.zip
// beside the executable. macOS production copies the zip into Resources as
// ydzs-worker-<plat>.zip.
var embeddedPortable []byte
