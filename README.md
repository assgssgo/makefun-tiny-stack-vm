# tiny-stack-vm

按 kit 的 ISA.md 与参考实现 vm.mjs 逐条实现的栈式虚拟机：32 位回绕整数、256 值栈、64 层调用栈、256 字内存、十种 trap 各自的退出码、步数与输出上限。

运行：`node main.ts`（读取 `/input/<id>/program.bin` 与 `input.bin`，写入 `/output/<id>/stdout.bin` 与 `exit.txt`）。
