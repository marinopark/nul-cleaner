package main

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context

	watcherCancel context.CancelFunc
	watcherWG     sync.WaitGroup
	isWatching    atomic.Bool
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) shutdown(ctx context.Context) {
	if a.isWatching.Load() {
		a.watcherCancel()
		a.watcherWG.Wait()
	}
}

type FileEntry struct {
	Path string `json:"path"`
	Size int64  `json:"size"`
}

type DeleteResult struct {
	Deleted    int      `json:"deleted"`
	Failed     int      `json:"failed"`
	BytesFreed int64    `json:"bytesFreed"`
	Errors     []string `json:"errors"`
}

func (a *App) PickFolder() string {
	path, err := wruntime.OpenDirectoryDialog(a.ctx, wruntime.OpenDialogOptions{
		Title: "Select folder",
	})
	if err != nil {
		return ""
	}
	return path
}

func (a *App) DefaultFolder() string {
	if h, err := os.UserHomeDir(); err == nil {
		return h
	}
	return `C:\`
}

func (a *App) Scan(root string, recursive bool) []FileEntry {
	root = absDir(root)
	if info, err := os.Stat(root); err != nil || !info.IsDir() {
		return []FileEntry{}
	}
	files := findNulFiles(root, recursive)
	if files == nil {
		files = []FileEntry{}
	}
	return files
}

func (a *App) Delete(entries []FileEntry) DeleteResult {
	res := DeleteResult{Errors: []string{}}
	for _, e := range entries {
		if err := deleteNulFile(e.Path); err == nil {
			res.Deleted++
			res.BytesFreed += e.Size
		} else {
			res.Failed++
			res.Errors = append(res.Errors, e.Path+": "+err.Error())
		}
	}
	return res
}

func (a *App) StartWatch(root string, recursive bool) bool {
	if a.isWatching.Load() {
		return true
	}
	root = absDir(root)
	if info, err := os.Stat(root); err != nil || !info.IsDir() {
		return false
	}
	ctx, cancel := context.WithCancel(a.ctx)
	a.watcherCancel = cancel
	a.isWatching.Store(true)
	a.watcherWG.Add(1)
	go a.watchLoop(ctx, root, recursive)
	return true
}

func (a *App) StopWatch() {
	if !a.isWatching.Load() {
		return
	}
	a.watcherCancel()
	a.watcherWG.Wait()
	a.isWatching.Store(false)
}

func (a *App) IsWatching() bool {
	return a.isWatching.Load()
}

func (a *App) MinimiseWindow() { wruntime.WindowMinimise(a.ctx) }
func (a *App) MaximiseWindow() { wruntime.WindowToggleMaximise(a.ctx) }
func (a *App) CloseWindow()    { wruntime.Quit(a.ctx) }

func (a *App) watchLoop(ctx context.Context, root string, recursive bool) {
	defer a.watcherWG.Done()
	ticker := time.NewTicker(1500 * time.Millisecond)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			for _, f := range findNulFilesCtx(ctx, root, recursive) {
				if ctx.Err() != nil {
					return
				}
				if err := deleteNulFile(f.Path); err == nil {
					wruntime.EventsEmit(a.ctx, "watch:deleted",
						map[string]any{"path": f.Path, "size": f.Size})
				} else {
					wruntime.EventsEmit(a.ctx, "watch:failed",
						map[string]any{"path": f.Path, "error": err.Error()})
				}
			}
		}
	}
}

func findNulFiles(root string, recursive bool) []FileEntry {
	return findNulFilesCtx(context.Background(), root, recursive)
}

// findNulFilesCtx walks root and aborts immediately if ctx is cancelled — so
// a watcher mid-scan can be stopped without waiting for the entire walk.
func findNulFilesCtx(ctx context.Context, root string, recursive bool) []FileEntry {
	var out []FileEntry
	// Check ctx only every Nth directory entry to keep walk overhead minimal.
	tick := 0
	walkFn := func(path string, d os.DirEntry, err error) error {
		tick++
		if tick&0x3F == 0 && ctx.Err() != nil {
			return filepath.SkipAll
		}
		if err != nil {
			return nil
		}
		if d.IsDir() {
			if !recursive && path != root {
				return filepath.SkipDir
			}
			return nil
		}
		if strings.EqualFold(d.Name(), "nul") {
			var size int64
			if info, err := d.Info(); err == nil {
				size = info.Size()
			}
			out = append(out, FileEntry{Path: path, Size: size})
		}
		return nil
	}
	_ = filepath.WalkDir(root, walkFn)
	return out
}

// absDir is safe to apply to directory inputs but NOT to a file path whose
// final component is a reserved name like "nul" — GetFullPathNameW (which
// filepath.Abs uses on Windows) rewrites "nul" to "\\.\nul" and corrupts it.
func absDir(p string) string {
	if abs, err := filepath.Abs(p); err == nil {
		return abs
	}
	return p
}

// deleteNulFile uses the \\?\ Win32 namespace prefix so files literally named
// "nul" can be removed despite Windows' reserved-name parsing. The input must
// already be absolute with backslashes; running it through filepath.Abs would
// defeat the purpose.
func deleteNulFile(path string) error {
	path = filepath.FromSlash(path)
	if !strings.HasPrefix(path, `\\?\`) {
		path = `\\?\` + path
	}
	p, err := syscall.UTF16PtrFromString(path)
	if err != nil {
		return err
	}
	return syscall.DeleteFile(p)
}
