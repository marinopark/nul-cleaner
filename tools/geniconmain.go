// One-shot helper: PNG -> multi-resolution ICO. Run with:
//   go run ./tools/geniconmain.go build/appicon.png build/windows/icon.ico
package main

import (
	"fmt"
	"os"

	"github.com/leaanthony/winicon"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Println("usage: genicon <input.png> <output.ico>")
		os.Exit(1)
	}
	in, err := os.Open(os.Args[1])
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	defer in.Close()

	out, err := os.Create(os.Args[2])
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	defer out.Close()

	sizes := []int{16, 24, 32, 48, 64, 128, 256}
	if err := winicon.GenerateIcon(in, out, sizes); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	fmt.Println("ok")
}
