// One-shot helper: rasterise an SVG into a square PNG, centred with padding.
// Usage: go run ./tools/svg2pngmain.go <input.svg> <output.png> <size>
package main

import (
	"fmt"
	"image"
	"image/png"
	"os"
	"strconv"

	"github.com/srwiley/oksvg"
	"github.com/srwiley/rasterx"
)

func main() {
	if len(os.Args) < 4 {
		fmt.Println("usage: svg2png <input.svg> <output.png> <size>")
		os.Exit(1)
	}
	size, err := strconv.Atoi(os.Args[3])
	if err != nil || size <= 0 {
		fmt.Println("size must be a positive int")
		os.Exit(1)
	}

	icon, err := oksvg.ReadIcon(os.Args[1], oksvg.StrictErrorMode)
	if err != nil {
		fmt.Println("read svg:", err)
		os.Exit(1)
	}

	srcW := icon.ViewBox.W
	srcH := icon.ViewBox.H

	// Fit the SVG into a square canvas with 8% padding all round.
	pad := float64(size) * 0.08
	avail := float64(size) - 2*pad
	scale := avail / max(srcW, srcH)
	drawW := srcW * scale
	drawH := srcH * scale
	offsetX := (float64(size) - drawW) / 2
	offsetY := (float64(size) - drawH) / 2

	icon.SetTarget(offsetX, offsetY, drawW, drawH)

	rgba := image.NewRGBA(image.Rect(0, 0, size, size))
	scanner := rasterx.NewScannerGV(size, size, rgba, rgba.Bounds())
	raster := rasterx.NewDasher(size, size, scanner)
	icon.Draw(raster, 1.0)

	out, err := os.Create(os.Args[2])
	if err != nil {
		fmt.Println("create:", err)
		os.Exit(1)
	}
	defer out.Close()
	if err := png.Encode(out, rgba); err != nil {
		fmt.Println("encode:", err)
		os.Exit(1)
	}
	fmt.Printf("wrote %s (%dx%d)\n", os.Args[2], size, size)
}

func max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}
