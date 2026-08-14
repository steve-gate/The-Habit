THE HABIT MOSAIC V23.2 — CLEAN INSTALL

Bản này sửa 7 lỗi TypeScript xuất hiện khi cài sạch V23.1:
- App.tsx: loại 2 tab legacy library/ebook khỏi union hiện tại.
- CommunityWorld.tsx: typing rõ NpcState cho Object.values.
- RewardRouteHost.tsx: khai báo props rõ cho Error Boundary.
- RewardWorld.tsx: typing assignments là Record<string, number>.

Cài:
1. Giải nén vào thư mục mới.
2. Chạy 00-CAI-MOI-HOAN-TOAN.cmd.
3. Khi PASS, mở release-local\win-unpacked\The Habit Mosaic.exe.
