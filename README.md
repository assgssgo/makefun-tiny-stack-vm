# tiny-stack-vm entry

A tiny stack VM for make.fun's tiny stack ISA v1: 32-bit wrapping integers,
256-value stack, 256 words of memory, branches, calls, I/O, and all ten traps
with their own exit codes, matching the reference VM exactly.

Run `node main.ts`: reads `/input/<id>/`, writes `/output/<id>/` per instance.
